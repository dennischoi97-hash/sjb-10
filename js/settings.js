// 설정 — 이용화면과 분리된 보호자·직원용 화면
import * as state from './state.js';
import { BOARDS, PROTECTED_LIST } from './data.js';
import { speak, koreanVoices, testCloudKey } from './speech.js';

const CLOUD_VOICES = [
  { id: 'ko-KR-Neural2-A', label: '여성 1 (Neural2-A)' },
  { id: 'ko-KR-Neural2-B', label: '여성 2 (Neural2-B)' },
  { id: 'ko-KR-Neural2-C', label: '남성 1 (Neural2-C)' },
  { id: 'ko-KR-Wavenet-A', label: '여성 3 (Wavenet-A)' },
  { id: 'ko-KR-Wavenet-C', label: '남성 2 (Wavenet-C)' },
  { id: 'ko-KR-Wavenet-D', label: '남성 3 (Wavenet-D)' },
];

let ctx = null;

function h(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}

// 구분 버튼 묶음 — 현재 값이 표시되고 누르면 즉시 저장됩니다.
function segmented(labelText, options, getValue, onChange, help) {
  const row = h('div', 'setting-row');
  row.appendChild(h('div', 'setting-label', labelText));
  const group = h('div', 'segmented');
  const render = () => {
    group.innerHTML = '';
    const current = getValue();
    for (const opt of options) {
      const btn = h('button', 'seg-btn' + (opt.value === current ? ' active' : ''), opt.label);
      btn.type = 'button';
      btn.addEventListener('click', () => { onChange(opt.value); render(); });
      group.appendChild(btn);
    }
  };
  render();
  row.appendChild(group);
  if (help) row.appendChild(h('p', 'setting-help', help));
  return row;
}

function section(title, desc) {
  const sec = h('section', 'settings-section');
  sec.appendChild(h('h2', 'settings-section-title', title));
  if (desc) sec.appendChild(h('p', 'settings-section-desc', desc));
  return sec;
}

function update(patch) {
  state.updateSettings(patch);
  ctx.onAppearanceChange();
}

export function openSettings(container, callbacks) {
  ctx = callbacks;
  container.innerHTML = '';
  const s = () => state.getSettings();
  const profile = state.activeProfile();

  // 헤더
  const header = h('header', 'settings-header');
  const backBtn = h('button', 'back-btn', '← 표현판으로 돌아가기');
  backBtn.type = 'button';
  backBtn.addEventListener('click', () => ctx.onClose());
  header.appendChild(backBtn);
  header.appendChild(h('h1', 'settings-title', '설정 — ' + profile.name));
  container.appendChild(header);

  const body = h('div', 'settings-body');
  container.appendChild(body);

  // ── 화면 ──
  const secScreen = section('화면', '버튼과 글자가 클수록 정확히 누르기 쉽습니다.');
  secScreen.appendChild(segmented('한 줄의 버튼 수', [
    { value: 1, label: '1개 (가장 큼)' }, { value: 2, label: '2개' }, { value: 3, label: '3개' },
  ], () => s().buttonsPerRow, (v) => update({ buttonsPerRow: v })));
  secScreen.appendChild(segmented('글자 크기', [
    { value: 1, label: '보통' }, { value: 1.2, label: '크게' }, { value: 1.4, label: '더 크게' }, { value: 1.6, label: '최대' },
  ], () => s().fontScale, (v) => update({ fontScale: v })));
  secScreen.appendChild(segmented('고대비 화면', [
    { value: false, label: '끔' }, { value: true, label: '켬 (검정·노랑)' },
  ], () => s().highContrast, (v) => update({ highContrast: v })));
  secScreen.appendChild(segmented('그림 표시', [
    { value: true, label: '켬' }, { value: false, label: '끔 (글자만)' },
  ], () => s().showEmoji, (v) => update({ showEmoji: v })));
  body.appendChild(secScreen);

  // ── 입력과 확인 ──
  const secInput = section('입력과 확인', '오선택을 예방합니다. 모든 확인을 강제하면 느려질 수 있어 이용인별로 조정합니다.');
  secInput.appendChild(segmented('선택 후 확인', [
    { value: false, label: '끔 (한 번에 말하기)' }, { value: true, label: '켬' },
  ], () => s().confirmBeforeSpeak, (v) => update({ confirmBeforeSpeak: v }),
  '켜면 〈이 문장이 맞습니까?〉 를 거쳐 확정합니다. 긴급 표현에는 적용되지 않습니다.'));
  secInput.appendChild(segmented('말한 뒤 크게 보기', [
    { value: false, label: '끔' }, { value: true, label: '켬 (자동으로 상대방 화면)' },
  ], () => s().displayAfterSpeak, (v) => update({ displayAfterSpeak: v })));
  secInput.appendChild(segmented('누르기 유지시간', [
    { value: 0, label: '없음' }, { value: 400, label: '0.4초' }, { value: 600, label: '0.6초' }, { value: 1000, label: '1초' },
  ], () => s().holdDuration, (v) => update({ holdDuration: v }),
  '정한 시간만큼 누르고 있어야 선택됩니다. 스치듯 닿는 것은 무시합니다.'));
  body.appendChild(secInput);

  // ── 스캔 입력 ──
  const secScan = section('스캔 입력', '항목이 차례로 강조되며, 원하는 순간 스페이스·엔터 키나 화면 탭으로 선택합니다. 외부 스위치는 스페이스 키로 연동됩니다.');
  secScan.appendChild(segmented('스캔 방식', [
    { value: false, label: '끔' }, { value: true, label: '켬' },
  ], () => s().scanEnabled, (v) => update({ scanEnabled: v })));
  secScan.appendChild(segmented('스캔 속도', [
    { value: 'slow', label: '느리게' }, { value: 'normal', label: '보통' }, { value: 'fast', label: '빠르게' },
  ], () => s().scanSpeed, (v) => update({ scanSpeed: v })));
  body.appendChild(secScan);

  // ── 음성 ──
  const secVoice = section('음성', '기기 내장 음성은 인터넷 없이 항상 동작합니다. 클라우드 음성은 더 자연스럽지만 인터넷과 API 키가 필요하며, 연결이 안 되면 자동으로 기기 내장 음성으로 대체됩니다.');
  secVoice.appendChild(segmented('음성 엔진', [
    { value: 'device', label: '기기 내장 (권장)' }, { value: 'cloud', label: '클라우드 API' },
  ], () => s().engine, (v) => { update({ engine: v }); openSettings(container, ctx); }));

  if (s().engine === 'device') {
    const voices = koreanVoices();
    if (voices.length > 1) {
      const row = h('div', 'setting-row');
      row.appendChild(h('div', 'setting-label', '목소리'));
      const select = h('select', 'select-input');
      const auto = h('option', null, '자동 (한국어 기본)');
      auto.value = '';
      select.appendChild(auto);
      for (const v of voices) {
        const opt = h('option', null, v.name);
        opt.value = v.voiceURI;
        select.appendChild(opt);
      }
      select.value = s().voiceURI;
      select.addEventListener('change', () => update({ voiceURI: select.value }));
      row.appendChild(select);
      secVoice.appendChild(row);
    }
  } else {
    // 클라우드 API 설정
    const row = h('div', 'setting-row');
    row.appendChild(h('div', 'setting-label', 'Google Cloud TTS API 키'));
    const keyInput = h('input', 'text-input');
    keyInput.type = 'password';
    keyInput.placeholder = 'API 키를 붙여넣으세요';
    keyInput.value = s().cloudApiKey;
    keyInput.autocomplete = 'off';
    keyInput.addEventListener('change', () => update({ cloudApiKey: keyInput.value.trim() }));
    row.appendChild(keyInput);
    row.appendChild(h('p', 'setting-help',
      '키는 이 기기에만 저장됩니다. Google Cloud 콘솔에서 Text-to-Speech API를 켜고 API 키를 발급한 뒤, 키에 HTTP 리퍼러(웹사이트) 제한으로 이 앱의 주소를 등록해 주세요.'));
    secVoice.appendChild(row);

    const voiceRow = h('div', 'setting-row');
    voiceRow.appendChild(h('div', 'setting-label', '클라우드 목소리'));
    const select = h('select', 'select-input');
    for (const v of CLOUD_VOICES) {
      const opt = h('option', null, v.label);
      opt.value = v.id;
      select.appendChild(opt);
    }
    select.value = s().cloudVoice;
    select.addEventListener('change', () => update({ cloudVoice: select.value }));
    voiceRow.appendChild(select);
    secVoice.appendChild(voiceRow);

    const testRow = h('div', 'setting-row');
    const testBtn = h('button', 'ghost-btn', '🔌 연결 확인');
    testBtn.type = 'button';
    const testResult = h('p', 'setting-help', '');
    testBtn.addEventListener('click', async () => {
      testResult.textContent = '확인 중…';
      try {
        await testCloudKey(s().cloudApiKey, s().cloudVoice);
        testResult.textContent = '✅ 연결되었습니다. 클라우드 음성을 사용합니다.';
      } catch (e) {
        testResult.textContent = '❌ 연결 실패: ' + e.message + ' — 기기 내장 음성으로 대체됩니다.';
      }
    });
    testRow.appendChild(testBtn);
    testRow.appendChild(testResult);
    secVoice.appendChild(testRow);
  }

  secVoice.appendChild(segmented('빠르기', [
    { value: 0.8, label: '느리게' }, { value: 1, label: '보통' }, { value: 1.2, label: '빠르게' },
  ], () => s().speechRate, (v) => update({ speechRate: v })));
  secVoice.appendChild(segmented('음량', [
    { value: 0.5, label: '작게' }, { value: 0.75, label: '보통' }, { value: 1, label: '최대' },
  ], () => s().speechVolume, (v) => update({ speechVolume: v }),
  '긴급 표현은 이 설정과 관계없이 항상 최대 음량으로 나갑니다.'));

  const tryRow = h('div', 'setting-row');
  const tryBtn = h('button', 'ghost-btn', '🔊 들어보기');
  tryBtn.type = 'button';
  tryBtn.addEventListener('click', () => speak('안녕하세요. 지금 목소리는 이렇게 들립니다.'));
  tryRow.appendChild(tryBtn);
  secVoice.appendChild(tryRow);
  body.appendChild(secVoice);

  // ── 내 표현 ──
  const secMine = section('내 표현', '이용인이 자주 쓰는 말을 추가합니다. 잠금(🔒) 표시된 보호 표현은 삭제하거나 숨길 수 없습니다.');
  const list = h('div', 'expr-list');
  const renderExprList = () => {
    list.innerHTML = '';
    for (const item of BOARDS.mine) {
      const row = h('div', 'expr-row');
      row.appendChild(h('span', 'expr-emoji', item.emoji));
      row.appendChild(h('span', 'expr-text', item.text));
      row.appendChild(h('span', 'expr-lock', '🔒 보호 표현'));
      list.appendChild(row);
    }
    for (const item of state.customExpressions()) {
      const row = h('div', 'expr-row');
      row.appendChild(h('span', 'expr-emoji', item.emoji));
      row.appendChild(h('span', 'expr-text', item.text));
      const del = h('button', 'expr-del', '삭제');
      del.type = 'button';
      del.addEventListener('click', () => {
        if (confirm(`〈${item.text}〉 표현을 삭제할까요?`)) {
          state.removeExpression(item.id);
          renderExprList();
        }
      });
      row.appendChild(del);
      list.appendChild(row);
    }
  };
  renderExprList();
  secMine.appendChild(list);

  const addForm = h('div', 'expr-add');
  const emojiInput = h('input', 'text-input expr-emoji-input');
  emojiInput.type = 'text';
  emojiInput.placeholder = '💬';
  emojiInput.maxLength = 4;
  const textInput = h('input', 'text-input expr-text-input');
  textInput.type = 'text';
  textInput.placeholder = '예: 텔레비전 켜 주세요';
  textInput.maxLength = 40;
  const addBtn = h('button', 'ghost-btn', '＋ 추가');
  addBtn.type = 'button';
  addBtn.addEventListener('click', () => {
    if (!textInput.value.trim()) { textInput.focus(); return; }
    state.addExpression(emojiInput.value.trim(), textInput.value);
    emojiInput.value = '';
    textInput.value = '';
    renderExprList();
  });
  addForm.appendChild(emojiInput);
  addForm.appendChild(textInput);
  addForm.appendChild(addBtn);
  secMine.appendChild(addForm);
  body.appendChild(secMine);

  // ── 자료 관리 ──
  const secData = section('자료 관리', '모든 자료는 이 기기에만 저장됩니다. 다른 기기로 옮기려면 파일로 내보내세요.');
  const dataRow = h('div', 'setting-row data-actions');
  const exportBtn = h('button', 'ghost-btn', '⬇️ 설정 내보내기');
  exportBtn.type = 'button';
  exportBtn.addEventListener('click', () => {
    const blob = new Blob([state.exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `말빛-설정-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
  const importBtn = h('button', 'ghost-btn', '⬆️ 설정 가져오기');
  importBtn.type = 'button';
  const fileInput = h('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json,.json';
  fileInput.hidden = true;
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      const count = state.importData(await file.text());
      alert(`프로필 ${count}개를 가져왔습니다.`);
      openSettings(container, ctx);
    } catch (e) {
      alert('가져오기 실패: ' + e.message);
    }
    fileInput.value = '';
  });
  importBtn.addEventListener('click', () => fileInput.click());
  dataRow.appendChild(exportBtn);
  dataRow.appendChild(importBtn);
  dataRow.appendChild(fileInput);
  secData.appendChild(dataRow);
  body.appendChild(secData);

  // ── 프로필 관리 ──
  const secProfile = section('프로필 관리');
  const nameRow = h('div', 'setting-row');
  nameRow.appendChild(h('div', 'setting-label', '이름'));
  const nameInput = h('input', 'text-input');
  nameInput.type = 'text';
  nameInput.value = profile.name;
  nameInput.maxLength = 20;
  nameInput.addEventListener('change', () => {
    state.renameProfile(profile.id, nameInput.value);
    header.querySelector('.settings-title').textContent = '설정 — ' + nameInput.value;
  });
  nameRow.appendChild(nameInput);
  secProfile.appendChild(nameRow);

  const delRow = h('div', 'setting-row');
  const delBtn = h('button', 'danger-btn', '프로필 삭제');
  delBtn.type = 'button';
  delBtn.addEventListener('click', () => {
    if (confirm(`〈${profile.name}〉 프로필과 저장된 표현·설정을 모두 삭제할까요?\n삭제하면 되돌릴 수 없습니다.`)
      && confirm('정말 삭제합니다. 계속할까요?')) {
      state.deleteProfile(profile.id);
      ctx.onClose();
    }
  });
  delRow.appendChild(delBtn);
  secProfile.appendChild(delRow);
  body.appendChild(secProfile);

  // ── 원칙 안내 ──
  const secPrinciple = section('지워지지 않는 표현', '의사소통 도구가 순응을 유도하는 수단이 되지 않도록, 다음 표현은 어떤 화면에서도 삭제·숨김이 불가능합니다.');
  const tags = h('div', 'principle-tags');
  for (const t of PROTECTED_LIST) tags.appendChild(h('span', 'principle-tag', '🔒 ' + t));
  secPrinciple.appendChild(tags);
  secPrinciple.appendChild(h('p', 'setting-help', '말빛은 이용인의 의사를 대신 판단하지 않습니다. 이용인이 선택한 내용을 전달하는 보조수단으로만 씁니다.'));
  body.appendChild(secPrinciple);

  // ── 정보 ──
  const secInfo = section('정보');
  secInfo.appendChild(h('p', 'setting-help', '말빛 1.0 · 모든 자료(프로필·표현·설정·API 키)는 이 기기의 브라우저에만 저장되며 외부 서버로 전송되지 않습니다. 클라우드 음성을 켠 경우에만 말할 문장이 음성 합성을 위해 Google 서버로 전송됩니다.'));
  body.appendChild(secInfo);
}
