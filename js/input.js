// 입력 처리 — 잘못 눌리는 것을 막는 장치들
//  · 누르기 유지시간: 정한 시간만큼 누르고 있어야 선택. 스치듯 닿는 것은 무시.
//  · 연속입력 방지: 같은 버튼이 짧은 시간에 두 번 눌리지 않음.
//  · 스캔 입력: 항목이 차례로 강조되고, 스페이스·엔터 키나 화면 탭으로 선택.
import { getSettings } from './state.js';
import { REPEAT_GUARD_MS, SCAN_INTERVALS } from './data.js';

const lastFired = new Map(); // 버튼별 마지막 실행 시각

function fireGuarded(el, handler) {
  const key = el.dataset.guardKey || el.textContent;
  const now = Date.now();
  if (now - (lastFired.get(key) || 0) < REPEAT_GUARD_MS) return;
  lastFired.set(key, now);
  if (navigator.vibrate) navigator.vibrate(30);
  handler();
}

// 버튼에 누르기 동작을 연결합니다. holdDuration 설정을 매번 읽어 반영합니다.
export function bindPress(el, handler) {
  let holdTimer = null;
  let pressed = false;
  let done = false;

  const cancel = () => {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    pressed = false;
    el.classList.remove('holding');
    el.style.removeProperty('--hold-ms');
  };

  el.addEventListener('pointerdown', (ev) => {
    if (ev.button !== undefined && ev.button !== 0) return;
    const hold = getSettings().holdDuration;
    pressed = true;
    done = false;
    if (hold > 0) {
      el.style.setProperty('--hold-ms', hold + 'ms');
      el.classList.add('holding');
      holdTimer = setTimeout(() => {
        done = true;
        cancel();
        fireGuarded(el, handler);
      }, hold);
    }
  });

  el.addEventListener('pointerup', () => {
    const hold = getSettings().holdDuration;
    const wasPressed = pressed;
    cancel();
    if (hold === 0 && wasPressed && !done) fireGuarded(el, handler);
  });

  el.addEventListener('pointerleave', cancel);
  el.addEventListener('pointercancel', cancel);

  // 키보드 접근성 (탭 이동 후 엔터/스페이스)
  el.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      fireGuarded(el, handler);
    }
  });

  // 스캔 입력에서 선택되었을 때 (연속입력 방지는 scanSelect 쪽에서 이미 적용됨)
  el.addEventListener('scan-activate', () => handler());
}

// ── 스캔 입력 ──────────────────────────────────────────────
let scanState = null; // { items, index, timer }

export function stopScan() {
  if (!scanState) return;
  clearInterval(scanState.timer);
  scanState.items.forEach((el) => el.classList.remove('scan-focus'));
  document.body.classList.remove('scanning');
  scanState = null;
}

// 현재 화면의 선택 가능한 요소들을 차례로 강조합니다.
export function startScan(container) {
  stopScan();
  const s = getSettings();
  if (!s.scanEnabled) return;
  const items = Array.from(container.querySelectorAll('[data-scan]')).filter(
    (el) => el.offsetParent !== null && !el.disabled
  );
  if (!items.length) return;
  const interval = SCAN_INTERVALS[s.scanSpeed] || SCAN_INTERVALS.normal;
  let index = -1;
  const step = () => {
    items.forEach((el) => el.classList.remove('scan-focus'));
    index = (index + 1) % items.length;
    const el = items[index];
    el.classList.add('scan-focus');
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
  step();
  scanState = { items, get index() { return index; }, timer: setInterval(step, interval) };
  document.body.classList.add('scanning');
}

export function scanning() {
  return !!scanState;
}

// 스캔 중 선택 — 스위치(스페이스·엔터 키) 또는 화면 아무 곳 탭
export function scanSelect() {
  if (!scanState) return false;
  const el = scanState.items[scanState.index];
  if (el) {
    stopScan();
    fireGuarded(el, () => el.dispatchEvent(new CustomEvent('scan-activate')));
  }
  return true;
}

export function initScanGlobalHandlers() {
  document.addEventListener('keydown', (ev) => {
    if (!scanState) return;
    if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      scanSelect();
    }
  });
  // 화면 아무 곳이나 탭 = 선택 (스위치가 없는 이용인용)
  document.addEventListener('pointerdown', (ev) => {
    if (!scanState) return;
    ev.preventDefault();
    ev.stopPropagation();
    scanSelect();
  }, { capture: true });
}
