// 말빛 — 앱 본체
import { TABS, BOARDS, EMERGENCY, SENTENCE_CATEGORIES, SENTENCE_WORDS, PRESETS } from './data.js';
import * as state from './state.js';
import { speak, stop as stopSpeech, alertTone } from './speech.js';
import { bindPress, startScan, stopScan, initScanGlobalHandlers } from './input.js';
import { openSettings } from './settings.js';

const $ = (sel) => document.querySelector(sel);

const screens = {
  profiles: $('#screen-profiles'),
  main: $('#screen-main'),
  emergency: $('#screen-emergency'),
  display: $('#screen-display'),
  settings: $('#screen-settings'),
};

let currentTab = 'basic';
let sentenceWords = []; // 문장 만들기에서 조합 중인 단어들
let sentenceCategory = 'action';
let displayReturnTo = 'main';

// ── 화면 전환 ──────────────────────────────────────────────
function showScreen(name) {
  stopScan();
  Object.entries(screens).forEach(([key, el]) => { el.hidden = key !== name; });
  window.scrollTo(0, 0);
  // 스캔 입력이 켜져 있으면 새 화면에서 다시 시작
  requestAnimationFrame(() => {
    if (!screens[name].hidden && name !== 'settings' && name !== 'profiles') {
      startScan(screens[name]);
    }
  });
}

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2200);
}

// ── 화면 설정(모양) 적용 ───────────────────────────────────
export function applyAppearance() {
  const s = state.getSettings();
  const root = document.documentElement;
  root.style.setProperty('--font-scale', s.fontScale);
  root.style.setProperty('--per-row', s.buttonsPerRow);
  document.body.classList.toggle('high-contrast', s.highContrast);
  document.body.classList.toggle('hide-emoji', !s.showEmoji);
}

// ── 선택 후 확인 ───────────────────────────────────────────
function confirmSentence(text) {
  return new Promise((resolve) => {
    const modal = $('#confirm-modal');
    $('#confirm-text').textContent = text;
    modal.hidden = false;
    const yes = $('#btn-confirm-yes');
    const no = $('#btn-confirm-no');
    const onYesScan = () => cleanup(true);
    const onNoScan = () => cleanup(false);
    const cleanup = (result) => {
      modal.hidden = true;
      yes.onclick = no.onclick = null;
      yes.removeEventListener('scan-activate', onYesScan);
      no.removeEventListener('scan-activate', onNoScan);
      resolve(result);
    };
    yes.onclick = () => cleanup(true);
    no.onclick = () => cleanup(false);
    yes.addEventListener('scan-activate', onYesScan);
    no.addEventListener('scan-activate', onNoScan);
    // 스캔 이용인을 위해 확인 창에서도 스캔 재시작
    requestAnimationFrame(() => startScan(modal));
  });
}

// ── 말하기 공통 흐름 ───────────────────────────────────────
async function speakExpression(text, { skipConfirm = false } = {}) {
  const s = state.getSettings();
  if (s.confirmBeforeSpeak && !skipConfirm) {
    const ok = await confirmSentence(text);
    const visible = Object.entries(screens).find(([, el]) => !el.hidden);
    if (visible) startScan(visible[1]);
    if (!ok) return;
  }
  speak(text);
  if (s.displayAfterSpeak) openDisplay(text, { autoSpoken: true });
}

// ── 상대방에게 보여주는 화면 ───────────────────────────────
function openDisplay(text, { emergency = false } = {}) {
  displayReturnTo = screens.emergency.hidden ? 'main' : 'emergency';
  $('#display-text').textContent = text;
  screens.display.classList.toggle('emergency-display', emergency);
  const actions = $('#display-actions');
  actions.innerHTML = '';
  const buttons = [
    { label: '🔊 다시 듣기', cls: 'primary', fn: () => speak(text, { emergency }) },
    { label: '⏳ 잠시 기다려주세요', fn: () => speak('잠시 기다려주세요. 다음 문장을 만들고 있습니다.') },
    { label: '✅ 맞아요', fn: () => speak('맞아요') },
    { label: '✏️ 수정할게요', fn: () => { speak('수정할게요'); closeDisplay(); } },
  ];
  for (const b of buttons) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'display-action' + (b.cls ? ' ' + b.cls : '');
    btn.textContent = b.label;
    btn.dataset.scan = '';
    bindPress(btn, b.fn);
    actions.appendChild(btn);
  }
  showScreen('display');
}

function closeDisplay() {
  showScreen(displayReturnTo);
}

// ── 표현판 버튼 생성 ───────────────────────────────────────
function makeTile(item, onPress, { emergency = false, guardKey } = {}) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tile' + (emergency ? ' tile-emergency' : '');
  btn.dataset.scan = '';
  btn.dataset.guardKey = guardKey || item.id || item.text;
  btn.innerHTML = `<span class="tile-emoji" aria-hidden="true">${item.emoji || '💬'}</span><span class="tile-text"></span>`;
  btn.querySelector('.tile-text').textContent = item.text;
  bindPress(btn, onPress);
  return btn;
}

// ── 탭 · 표현판 렌더 ───────────────────────────────────────
function renderTabs() {
  const nav = $('#tabs');
  nav.innerHTML = '';
  for (const tab of TABS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tab' + (tab.id === currentTab ? ' active' : '') + (tab.id === 'sentence' ? ' tab-sentence' : '');
    btn.textContent = tab.id === 'sentence' ? '🧩 ' + tab.label : tab.label;
    btn.dataset.scan = '';
    btn.dataset.guardKey = 'tab-' + tab.id;
    bindPress(btn, () => {
      currentTab = tab.id;
      renderTabs();
      renderBoard();
    });
    nav.appendChild(btn);
  }
}

function renderBoard() {
  const board = $('#board');
  board.innerHTML = '';
  board.classList.toggle('sentence-mode', currentTab === 'sentence');

  if (currentTab === 'sentence') {
    renderSentenceBuilder(board);
  } else {
    let items = BOARDS[currentTab] || [];
    if (currentTab === 'mine') items = [...items, ...state.customExpressions()];
    const grid = document.createElement('div');
    grid.className = 'tile-grid';
    for (const item of items) {
      grid.appendChild(makeTile(item, () => speakExpression(item.text)));
    }
    board.appendChild(grid);
  }
  startScan(screens.main);
}

// ── 문장 만들기 ────────────────────────────────────────────
function renderSentenceBuilder(board) {
  const wrap = document.createElement('div');
  wrap.className = 'sentence-builder';

  // 조합 중인 문장 — 단어를 누르면 그 단어만 빠집니다.
  const line = document.createElement('div');
  line.className = 'sentence-line';
  if (sentenceWords.length === 0) {
    const hint = document.createElement('span');
    hint.className = 'sentence-hint';
    hint.textContent = '아래 단어를 누르면 문장에 붙습니다';
    line.appendChild(hint);
  } else {
    sentenceWords.forEach((w, i) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'word-chip';
      chip.dataset.scan = '';
      chip.dataset.guardKey = 'chip-' + i + '-' + w;
      chip.textContent = w;
      bindPress(chip, () => {
        sentenceWords.splice(i, 1);
        renderBoard();
      });
      line.appendChild(chip);
    });
  }
  wrap.appendChild(line);

  // 말하기 · 크게 보기 · 지우기
  const actions = document.createElement('div');
  actions.className = 'sentence-actions';
  const mkAction = (label, cls, fn) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'sentence-action ' + cls;
    b.textContent = label;
    b.dataset.scan = '';
    b.dataset.guardKey = 'sa-' + cls;
    bindPress(b, fn);
    return b;
  };
  actions.appendChild(mkAction('🔊 말하기', 'speak-btn', () => {
    if (!sentenceWords.length) { toast('먼저 단어를 골라 주세요'); return; }
    speakExpression(sentenceWords.join(' '));
  }));
  actions.appendChild(mkAction('👁 크게 보기', 'show-btn', () => {
    if (!sentenceWords.length) { toast('먼저 단어를 골라 주세요'); return; }
    openDisplay(sentenceWords.join(' '));
  }));
  actions.appendChild(mkAction('🧹 지우기', 'clear-btn', () => {
    sentenceWords = [];
    renderBoard();
  }));
  wrap.appendChild(actions);

  // 카테고리 — 누가 · 언제 · 어디 · 행동 · 마음
  const cats = document.createElement('div');
  cats.className = 'category-chips';
  for (const cat of SENTENCE_CATEGORIES) {
    const c = document.createElement('button');
    c.type = 'button';
    c.className = 'category-chip' + (cat.id === sentenceCategory ? ' active' : '');
    c.textContent = cat.label;
    c.dataset.scan = '';
    c.dataset.guardKey = 'cat-' + cat.id;
    bindPress(c, () => {
      sentenceCategory = cat.id;
      renderBoard();
    });
    cats.appendChild(c);
  }
  wrap.appendChild(cats);

  // 단어 그리드
  const grid = document.createElement('div');
  grid.className = 'tile-grid word-grid';
  for (const word of SENTENCE_WORDS[sentenceCategory]) {
    grid.appendChild(
      makeTile(word, () => {
        sentenceWords.push(word.text);
        renderBoard();
      }, { guardKey: 'w-' + word.text })
    );
  }
  wrap.appendChild(grid);

  board.appendChild(wrap);
}

// ── 긴급 (도움 요청) ───────────────────────────────────────
async function triggerEmergency() {
  showScreen('emergency');
  await alertTone();
  speak('도와주세요', { emergency: true });
}

function renderEmergencyBoard() {
  const board = $('#emergency-board');
  board.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'tile-grid';
  for (const item of EMERGENCY) {
    grid.appendChild(
      makeTile(item, async () => {
        await alertTone();
        speak(item.text, { emergency: true });
        openDisplay(item.text, { emergency: true });
      }, { emergency: true })
    );
  }
  board.appendChild(grid);
}

// ── 프로필 화면 ────────────────────────────────────────────
function renderProfiles() {
  const el = screens.profiles;
  const profiles = state.listProfiles();
  el.innerHTML = `
    <div class="profiles-wrap">
      <h1 class="profiles-logo">말빛</h1>
      <p class="profiles-sub">뇌병변장애인을 위한 개인맞춤형 의사소통 웹앱</p>
      <div id="profile-list" class="profile-list"></div>
      <div id="profile-new" class="profile-new" hidden>
        <h2 class="profile-new-title">새 이용인 등록</h2>
        <label class="field-label" for="profile-name">이름 또는 별명</label>
        <input id="profile-name" class="text-input" type="text" maxlength="20" autocomplete="off" placeholder="예: 김민수" />
        <p class="field-label" style="margin-top:1.2rem">시작 설정 — 나중에 설정에서 세부 조정할 수 있습니다</p>
        <div id="preset-list" class="preset-list"></div>
        <div class="profile-new-actions">
          <button id="btn-profile-cancel" class="ghost-btn" type="button">취소</button>
        </div>
      </div>
      <p class="privacy-note">모든 자료는 이 기기에만 저장됩니다 · 서버로 전송하지 않습니다</p>
    </div>`;

  const list = $('#profile-list');
  for (const p of profiles) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'profile-card';
    btn.innerHTML = `<span class="profile-avatar">🙂</span><span class="profile-name"></span><span class="profile-enter">시작 →</span>`;
    btn.querySelector('.profile-name').textContent = p.name;
    btn.addEventListener('click', () => {
      state.selectProfile(p.id);
      enterMain();
    });
    list.appendChild(btn);
  }
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'profile-card profile-add';
  addBtn.innerHTML = `<span class="profile-avatar">＋</span><span class="profile-name">새 이용인 등록</span><span class="profile-enter"></span>`;
  addBtn.addEventListener('click', () => {
    $('#profile-new').hidden = false;
    addBtn.hidden = true;
    $('#profile-name').focus();
  });
  list.appendChild(addBtn);

  const presetList = $('#preset-list');
  for (const preset of PRESETS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'preset-card';
    b.innerHTML = `<span class="preset-emoji">${preset.emoji}</span><span class="preset-label"></span><span class="preset-desc"></span>`;
    b.querySelector('.preset-label').textContent = preset.label;
    b.querySelector('.preset-desc').textContent = preset.desc;
    b.addEventListener('click', () => {
      const name = $('#profile-name').value.trim();
      if (!name) {
        toast('이름을 먼저 입력해 주세요');
        $('#profile-name').focus();
        return;
      }
      state.createProfile(name, preset.settings);
      enterMain();
    });
    presetList.appendChild(b);
  }
  $('#btn-profile-cancel').addEventListener('click', () => renderProfiles());
}

function enterMain() {
  const p = state.activeProfile();
  if (!p) { renderProfiles(); showScreen('profiles'); return; }
  applyAppearance();
  $('#btn-profile').textContent = '🙂 ' + p.name;
  currentTab = 'basic';
  sentenceWords = [];
  renderTabs();
  renderBoard();
  showScreen('main');
}

// ── 초기화 ─────────────────────────────────────────────────
function init() {
  initScanGlobalHandlers();
  renderEmergencyBoard();

  $('#btn-settings').addEventListener('click', () => {
    stopScan();
    stopSpeech();
    openSettings(screens.settings, {
      onClose: () => enterMain(),
      onAppearanceChange: () => applyAppearance(),
    });
    showScreen('settings');
  });

  $('#btn-profile').addEventListener('click', () => {
    stopSpeech();
    state.deselectProfile();
    renderProfiles();
    showScreen('profiles');
  });

  bindPress($('#btn-emergency'), triggerEmergency);
  $('#btn-emergency').dataset.scan = '';
  $('#btn-emergency').dataset.guardKey = 'emergency-open';

  bindPress($('#btn-emergency-back'), () => showScreen('main'));
  $('#btn-emergency-back').dataset.scan = '';
  $('#btn-emergency-back').dataset.guardKey = 'emergency-back';

  bindPress($('#btn-display-close'), closeDisplay);
  $('#btn-display-close').dataset.scan = '';
  $('#btn-display-close').dataset.guardKey = 'display-close';

  // 시작 화면 결정
  if (state.activeProfile()) {
    enterMain();
  } else {
    renderProfiles();
    showScreen('profiles');
  }

  // 오프라인 동작 (PWA)
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

init();
