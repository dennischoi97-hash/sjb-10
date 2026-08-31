// 표현판 데이터 — 말빛
// protected: true 인 표현은 어떤 화면에서도 삭제·숨김이 불가능합니다. (순응 유도 방지 원칙)

export const TABS = [
  { id: 'basic', label: '기본' },
  { id: 'life', label: '생활' },
  { id: 'activity', label: '활동' },
  { id: 'mine', label: '내 표현' },
  { id: 'sentence', label: '문장' },
];

export const BOARDS = {
  basic: [
    { id: 'b-yes', emoji: '🙆', text: '예' },
    { id: 'b-no', emoji: '🙅', text: '아니요', protected: true },
    { id: 'b-like', emoji: '😊', text: '좋아요' },
    { id: 'b-dislike', emoji: '😣', text: '싫어요', protected: true },
    { id: 'b-unsure', emoji: '🤔', text: '잘 모르겠어요' },
    { id: 'b-again', emoji: '🔁', text: '다시 말해주세요' },
  ],
  life: [
    { id: 'l-water', emoji: '💧', text: '물 주세요' },
    { id: 'l-meal', emoji: '🍚', text: '식사하고 싶어요' },
    { id: 'l-toilet', emoji: '🚻', text: '화장실 가고 싶어요' },
    { id: 'l-rest', emoji: '🛏️', text: '쉬고 싶어요' },
    { id: 'l-hot', emoji: '🥵', text: '더워요' },
    { id: 'l-cold', emoji: '🥶', text: '추워요' },
  ],
  activity: [
    { id: 'a-join', emoji: '🙋', text: '참여하고 싶어요' },
    { id: 'a-restday', emoji: '🙇', text: '오늘은 쉬고 싶어요', protected: true },
    { id: 'a-start', emoji: '▶️', text: '시작할게요' },
    { id: 'a-stop', emoji: '✋', text: '중단하고 싶어요', protected: true },
    { id: 'a-slow', emoji: '🐢', text: '천천히 해주세요' },
    { id: 'a-staff', emoji: '📣', text: '담당자를 불러주세요' },
  ],
  // '내 표현' 기본 항목 — 보호 표현은 삭제 불가, 이용인이 추가한 표현이 이 뒤에 붙습니다.
  mine: [
    { id: 'm-self', emoji: '🙋', text: '제가 직접 선택하겠습니다', protected: true },
    { id: 'm-alone', emoji: '🧘', text: '혼자 있고 싶어요', protected: true },
    { id: 'm-wrong', emoji: '🤦', text: '잘못 이해하셨어요', protected: true },
  ],
};

// 긴급 표현 — 항상 최대 음량, 확인 단계 없음, 삭제 불가
export const EMERGENCY = [
  { id: 'e-help', emoji: '🆘', text: '도와주세요', protected: true },
  { id: 'e-pain', emoji: '😣', text: '아파요', protected: true },
  { id: 'e-breath', emoji: '😮‍💨', text: '숨이 차요', protected: true },
  { id: 'e-dizzy', emoji: '💫', text: '어지러워요', protected: true },
  { id: 'e-stop', emoji: '✋', text: '지금 중단해주세요', protected: true },
  { id: 'e-staff', emoji: '📣', text: '담당자를 불러주세요', protected: true },
];

// 문장 만들기 단어 — 카테고리: 누가 · 언제 · 어디 · 행동 · 마음
export const SENTENCE_CATEGORIES = [
  { id: 'who', label: '누가' },
  { id: 'when', label: '언제' },
  { id: 'where', label: '어디' },
  { id: 'action', label: '행동' },
  { id: 'feel', label: '마음' },
];

export const SENTENCE_WORDS = {
  who: [
    { emoji: '🙋', text: '저는' },
    { emoji: '👨‍👩‍👧', text: '가족이' },
    { emoji: '🧑‍🤝‍🧑', text: '친구가' },
    { emoji: '🧑‍💼', text: '담당자가' },
    { emoji: '👥', text: '우리가' },
    { emoji: '🤷', text: '누가' },
  ],
  when: [
    { emoji: '⏰', text: '지금' },
    { emoji: '☀️', text: '오늘' },
    { emoji: '🌙', text: '내일' },
    { emoji: '⏳', text: '이따가' },
    { emoji: '🍚', text: '식사 후에' },
    { emoji: '🏁', text: '끝나고' },
  ],
  where: [
    { emoji: '🏋️', text: '헬스장에' },
    { emoji: '🏠', text: '집에' },
    { emoji: '🚻', text: '화장실에' },
    { emoji: '🏢', text: '프로그램실에' },
    { emoji: '🍽️', text: '식당에' },
    { emoji: '🌳', text: '밖에' },
  ],
  action: [
    { emoji: '➡️', text: '가고 싶어요' },
    { emoji: '✨', text: '하고 싶어요' },
    { emoji: '🍚', text: '먹고 싶어요' },
    { emoji: '🛏️', text: '쉬고 싶어요' },
    { emoji: '🆘', text: '도와주세요', protected: true },
    { emoji: '✋', text: '그만하고 싶어요', protected: true },
  ],
  feel: [
    { emoji: '😊', text: '좋아요' },
    { emoji: '😣', text: '싫어요', protected: true },
    { emoji: '😮‍💨', text: '힘들어요' },
    { emoji: '🤕', text: '아파요' },
    { emoji: '😆', text: '재미있어요' },
    { emoji: '😢', text: '슬퍼요' },
  ],
};

// 삭제·숨김이 불가능한 보호 표현 목록 (설정 화면 안내용)
export const PROTECTED_LIST = [
  '아니요',
  '싫어요',
  '중단하고 싶어요',
  '지금 중단해주세요',
  '도와주세요',
  '제가 직접 선택하겠습니다',
  '혼자 있고 싶어요',
  '잘못 이해하셨어요',
];

// 프로필 프리셋 — 신체기능·의사소통 방식에 따른 시작 설정
export const PRESETS = [
  {
    id: 'standard',
    label: '기본 설정',
    desc: '손으로 직접 눌러 사용합니다. 누르면 한 번에 말합니다.',
    emoji: '👆',
    settings: {},
  },
  {
    id: 'tremor',
    label: '큰 버튼 · 고대비',
    desc: '손떨림이 있는 분. 버튼을 더 크게, 대비를 높이고 확인 단계를 켭니다.',
    emoji: '🔲',
    settings: {
      buttonsPerRow: 1,
      highContrast: true,
      confirmBeforeSpeak: true,
      holdDuration: 600,
      fontScale: 1.2,
    },
  },
  {
    id: 'scan',
    label: '스캔 입력',
    desc: '직접 누르기 어려운 분. 항목이 차례로 강조되면 스위치나 화면 탭으로 선택합니다.',
    emoji: '🔄',
    settings: {
      scanEnabled: true,
      confirmBeforeSpeak: true,
    },
  },
];

export const DEFAULT_SETTINGS = {
  buttonsPerRow: 2,      // 1 | 2 | 3
  fontScale: 1,          // 0.85 | 1 | 1.2 | 1.4
  highContrast: false,
  showEmoji: true,
  confirmBeforeSpeak: false,
  displayAfterSpeak: false,   // 말한 뒤 자동으로 상대방 화면 열기
  holdDuration: 0,            // 0 | 400 | 600 | 1000 (ms) 누르기 유지시간
  scanEnabled: false,
  scanSpeed: 'normal',        // slow | normal | fast
  speechRate: 1,              // 0.8 | 1 | 1.2
  speechVolume: 1,            // 0.5 | 0.75 | 1
  voiceURI: '',               // 기기 내장 음성 선택
  engine: 'device',           // device(기기 내장) | cloud(클라우드 API)
  cloudApiKey: '',
  cloudVoice: 'ko-KR-Neural2-A',
};

export const SCAN_INTERVALS = { slow: 2000, normal: 1300, fast: 850 };

// 연속입력 방지 — 같은 버튼이 이 시간 안에 두 번 눌리지 않습니다.
export const REPEAT_GUARD_MS = 900;
