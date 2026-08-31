// 음성 출력 — 기기 내장(Web Speech)이 기본이며 항상 동작합니다.
// 설정에서 클라우드 API 키를 넣으면 고품질 음성(Google Cloud TTS)을 쓰고,
// 네트워크·키 오류 시 자동으로 기기 내장 음성으로 폴백합니다.
import { getSettings } from './state.js';

const synth = window.speechSynthesis;
let cachedVoices = [];
const audioCache = new Map(); // 클라우드 음성 캐시: key → objectURL
let currentAudio = null;

function refreshVoices() {
  const v = synth ? synth.getVoices() : [];
  if (v.length) cachedVoices = v;
  return cachedVoices;
}
if (synth) {
  refreshVoices();
  synth.addEventListener?.('voiceschanged', refreshVoices);
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = refreshVoices;
}

export function koreanVoices() {
  return refreshVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('ko'));
}

function pickVoice(settings) {
  const voices = refreshVoices();
  if (settings.voiceURI) {
    const chosen = voices.find((v) => v.voiceURI === settings.voiceURI);
    if (chosen) return chosen;
  }
  return koreanVoices()[0] || null;
}

export function stop() {
  if (synth) synth.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

function speakDevice(text, { rate, volume }) {
  return new Promise((resolve) => {
    if (!synth) { resolve(false); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ko-KR';
    const voice = pickVoice(getSettings());
    if (voice) u.voice = voice;
    u.rate = rate;
    u.volume = volume;
    u.onend = () => resolve(true);
    u.onerror = () => resolve(false);
    synth.speak(u);
    // 일부 브라우저에서 onend가 오지 않는 경우 대비
    const guard = Math.max(3000, text.length * 350);
    setTimeout(() => resolve(true), guard + 2000);
  });
}

async function speakCloud(text, { rate, volume, apiKey, cloudVoice }) {
  const key = `${cloudVoice}|${rate}|${text}`;
  let url = audioCache.get(key);
  if (!url) {
    const res = await fetch(
      'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + encodeURIComponent(apiKey),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: 'ko-KR', name: cloudVoice },
          audioConfig: { audioEncoding: 'MP3', speakingRate: rate },
        }),
      }
    );
    if (!res.ok) throw new Error('TTS API ' + res.status);
    const data = await res.json();
    const bin = atob(data.audioContent);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    url = URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
    audioCache.set(key, url);
  }
  return new Promise((resolve, reject) => {
    stop();
    const audio = new Audio(url);
    audio.volume = volume;
    currentAudio = audio;
    audio.onended = () => { currentAudio = null; resolve(true); };
    audio.onerror = () => { currentAudio = null; reject(new Error('재생 실패')); };
    audio.play().catch(reject);
  });
}

// 문장 말하기. emergency=true 이면 음량 설정을 무시하고 항상 최대로 나갑니다.
export async function speak(text, { emergency = false } = {}) {
  const s = getSettings();
  const rate = emergency ? 1 : s.speechRate;
  const volume = emergency ? 1 : s.speechVolume;

  if (s.engine === 'cloud' && s.cloudApiKey && navigator.onLine) {
    try {
      return await speakCloud(text, { rate, volume, apiKey: s.cloudApiKey, cloudVoice: s.cloudVoice });
    } catch (e) {
      console.warn('클라우드 음성 실패, 기기 내장 음성으로 대체:', e);
    }
  }
  return speakDevice(text, { rate, volume });
}

// 긴급 알림음 — 음성이 나가기 전에 주변의 주의를 끕니다. 항상 최대 음량.
let audioCtx = null;
export function alertTone() {
  return new Promise((resolve) => {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      [0, 0.28, 0.56].forEach((t) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now + t);
        osc.frequency.setValueAtTime(1174, now + t + 0.12);
        gain.gain.setValueAtTime(0.0001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.9, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.24);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.26);
      });
      setTimeout(resolve, 900);
    } catch (e) {
      resolve(); // 알림음 실패가 음성 출력을 막지 않도록
    }
  });
}

// 클라우드 키 검사 — 설정 화면의 〈연결 확인〉 버튼용
export async function testCloudKey(apiKey, cloudVoice) {
  const res = await fetch(
    'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + encodeURIComponent(apiKey),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: '연결되었습니다' },
        voice: { languageCode: 'ko-KR', name: cloudVoice },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    }
  );
  if (!res.ok) {
    let msg = 'HTTP ' + res.status;
    try { msg = (await res.json()).error?.message || msg; } catch (e) { /* ignore */ }
    throw new Error(msg);
  }
  return true;
}
