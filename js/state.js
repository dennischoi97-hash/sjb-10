// 저장소 — 모든 자료는 이 기기(localStorage)에만 저장됩니다. 서버로 전송하지 않습니다.
import { DEFAULT_SETTINGS } from './data.js';

const KEY = 'malbit.v1';

function uid() {
  return 'p' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* 손상된 저장소는 초기화 */ }
  return { profiles: [], activeProfileId: null };
}

let db = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch (e) {
    console.warn('저장 실패:', e);
  }
}

export function listProfiles() {
  return db.profiles;
}

export function activeProfile() {
  return db.profiles.find((p) => p.id === db.activeProfileId) || null;
}

export function createProfile(name, presetSettings = {}) {
  const profile = {
    id: uid(),
    name: name.trim(),
    settings: { ...DEFAULT_SETTINGS, ...presetSettings },
    customExpressions: [],   // { id, emoji, text } — 이용인이 추가한 내 표현
    createdAt: new Date().toISOString(),
  };
  db.profiles.push(profile);
  db.activeProfileId = profile.id;
  save();
  return profile;
}

export function selectProfile(id) {
  if (db.profiles.some((p) => p.id === id)) {
    db.activeProfileId = id;
    save();
  }
  return activeProfile();
}

export function deselectProfile() {
  db.activeProfileId = null;
  save();
}

export function renameProfile(id, name) {
  const p = db.profiles.find((x) => x.id === id);
  if (p && name.trim()) { p.name = name.trim(); save(); }
}

export function deleteProfile(id) {
  db.profiles = db.profiles.filter((p) => p.id !== id);
  if (db.activeProfileId === id) db.activeProfileId = null;
  save();
}

export function getSettings() {
  const p = activeProfile();
  return p ? { ...DEFAULT_SETTINGS, ...p.settings } : { ...DEFAULT_SETTINGS };
}

export function updateSettings(patch) {
  const p = activeProfile();
  if (!p) return;
  p.settings = { ...DEFAULT_SETTINGS, ...p.settings, ...patch };
  save();
}

export function customExpressions() {
  const p = activeProfile();
  return p ? p.customExpressions : [];
}

export function addExpression(emoji, text) {
  const p = activeProfile();
  if (!p || !text.trim()) return;
  p.customExpressions.push({ id: uid(), emoji: emoji || '💬', text: text.trim() });
  save();
}

export function removeExpression(id) {
  const p = activeProfile();
  if (!p) return;
  p.customExpressions = p.customExpressions.filter((e) => e.id !== id);
  save();
}

// 설정 내보내기 — 프로필 전체를 JSON 파일로 (기기 이동·백업용)
export function exportData() {
  return JSON.stringify({ app: 'malbit', version: 1, exportedAt: new Date().toISOString(), data: db }, null, 2);
}

export function importData(json) {
  const parsed = JSON.parse(json);
  if (parsed.app !== 'malbit' || !parsed.data || !Array.isArray(parsed.data.profiles)) {
    throw new Error('말빛 설정 파일이 아닙니다.');
  }
  // 기존 프로필과 합칩니다. 같은 id는 가져온 쪽으로 교체.
  const incoming = parsed.data.profiles;
  const existingIds = new Set(db.profiles.map((p) => p.id));
  for (const p of incoming) {
    if (existingIds.has(p.id)) {
      db.profiles = db.profiles.map((x) => (x.id === p.id ? p : x));
    } else {
      db.profiles.push(p);
    }
  }
  if (!db.activeProfileId && parsed.data.activeProfileId) {
    db.activeProfileId = parsed.data.activeProfileId;
  }
  save();
  return incoming.length;
}
