// 말빛 AAC 웹앱 — 관장님 보고용 시연 설명 자료
const path = require('path');
const DIR = '/tmp/claude-0/-home-user-sjb-10/c3f0fc35-f5a3-507c-9774-103256d9050f/scratchpad';
const pptxgen = require(path.join(DIR, 'node_modules/pptxgenjs'));
const S = f => path.join(DIR, 'shots', f);

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';           // 13.333 x 7.5
pres.author = '말빛 시연 제안';
pres.title = '말빛 — 뇌병변장애인 개인맞춤형 의사소통 AAC 웹앱';

// ---------- 색 (앱 자체의 색에서 그대로 가져옴) ----------
const DEEP  = '0F3D26';   // 짙은 숲 — 어두운 슬라이드
const GREEN = '0F5132';   // 앱 강조색
const PALE  = 'E9F0EA';   // 앱의 연한 강조 배경
const RED   = 'B3261E';   // 긴급 (아껴서 사용)
const REDPL = 'FBEAE8';
const INK   = '1C2420';
const MUTE  = '6B7671';
const WHITE = 'FFFFFF';
const LINE  = 'D8DED8';

const F = '맑은 고딕';

// PNG 머리말에서 실제 크기를 읽어 이미지마다 정확한 비율을 쓴다
const fs = require('fs');
const dimCache = {};
function png(file) {
  if (!dimCache[file]) {
    const b = fs.readFileSync(S(file));
    dimCache[file] = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  }
  return dimCache[file];
}
const ih = (file, w) => w * png(file).h / png(file).w;   // 폭 → 높이

// ---------- 공통 조각 ----------
function shot(sl, file, x, y, w, opts) {
  opts = opts || {};
  const h = ih(file, w);
  sl.addImage({
    path: S(file), x, y, w, h,
    shadow: { type: 'outer', color: '0A1F14', blur: 14, offset: 3, angle: 90, opacity: 0.22 }
  });
  if (opts.cap) {
    sl.addText(opts.cap, {
      x, y: y + h + 0.09, w, h: 0.3, margin: 0,
      fontFace: F, fontSize: 11, color: opts.capColor || MUTE, align: 'center'
    });
  }
  return h;
}

function lightSlide(kicker, title) {
  const sl = pres.addSlide();
  sl.background = { color: WHITE };
  sl.addText(kicker, {
    x: 0.62, y: 0.52, w: 8, h: 0.28, margin: 0,
    fontFace: F, fontSize: 12, bold: true, color: GREEN, charSpacing: 2
  });
  sl.addText(title, {
    x: 0.6, y: 0.82, w: 12.2, h: 0.72, margin: 0,
    fontFace: F, fontSize: 32, bold: true, color: INK
  });
  return sl;
}

function darkSlide() {
  const sl = pres.addSlide();
  sl.background = { color: DEEP };
  return sl;
}

// 번호가 든 초록 원 (반복 모티프)
function stepCircle(sl, n, x, y, d, color) {
  sl.addShape(pres.ShapeType.ellipse, {
    x, y, w: d, h: d, fill: { color: color || GREEN }
  });
  sl.addText(String(n), {
    x, y, w: d, h: d, margin: 0,
    fontFace: F, fontSize: Math.round(d * 30), bold: true,
    color: WHITE, align: 'center', valign: 'middle'
  });
}

function card(sl, x, y, w, h, fill) {
  sl.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.09,
    fill: { color: fill || PALE }, line: { color: fill ? fill : PALE, width: 0 }
  });
}

// =====================================================================
// 1. 표지
// =====================================================================
{
  const sl = darkSlide();
  sl.addText('복지관 기여 방안 제안서 10 · 시연 보고', {
    x: 0.85, y: 1.05, w: 7.4, h: 0.32, margin: 0,
    fontFace: F, fontSize: 13, bold: true, color: '9DBFA9', charSpacing: 2
  });
  sl.addText('말빛', {
    x: 0.8, y: 1.5, w: 7.4, h: 1.62, margin: 0,
    fontFace: F, fontSize: 78, bold: true, color: WHITE
  });
  sl.addText('뇌병변장애인을 위한\n개인맞춤형 의사소통 AAC 웹앱', {
    x: 0.85, y: 3.05, w: 7.2, h: 1.1, margin: 0,
    fontFace: F, fontSize: 21, color: 'D8E6DC', lineSpacing: 32
  });
  sl.addText('이용인이 큰 버튼을 한 번 눌러 자신의 의사를 문장과 음성으로 표현합니다.', {
    x: 0.85, y: 4.35, w: 7.2, h: 0.4, margin: 0,
    fontFace: F, fontSize: 14, color: '9DBFA9'
  });
  sl.addShape(pres.ShapeType.roundRect, {
    x: 0.85, y: 5.15, w: 7.2, h: 1.1, rectRadius: 0.08,
    fill: { color: '17472F' }, line: { color: '2E6B4A', width: 1 }
  });
  sl.addText('시연판입니다. 모든 이용인과 표현은 가상의 예시이며, 실제 이용인 정보·음성자료·예산·인력은 사용하지 않습니다.', {
    x: 1.05, y: 5.3, w: 6.8, h: 0.8, margin: 0,
    fontFace: F, fontSize: 12.5, color: 'C7DACD', lineSpacing: 20
  });
  sl.addText('2026. 08', {
    x: 0.85, y: 6.5, w: 3, h: 0.3, margin: 0,
    fontFace: F, fontSize: 12, bold: true, color: '7FA791', charSpacing: 2
  });
  const ch = shot(sl, '01-basic.png', 8.35, 1.62, 4.4);
  sl.addText('실제 시연 화면 — 기본 표현판', {
    x: 8.35, y: 1.62 + ch + 0.18, w: 4.4, h: 0.3, margin: 0,
    fontFace: F, fontSize: 11.5, color: '7FA791', align: 'center'
  });
  sl.addNotes('말빛은 뇌병변장애인이 큰 버튼을 눌러 의사를 문장과 음성으로 표현하는 AAC 웹앱입니다. 오늘은 시연판을 보여드립니다. 실제 이용인 정보는 일절 사용하지 않았습니다.');
}

// =====================================================================
// 2. 한 장 요약
// =====================================================================
{
  const sl = lightSlide('SUMMARY', '한 장으로 보는 요약');
  const stats = [
    ['1회', '클릭이면 음성이 나갑니다', '버튼을 누르는 즉시 문장이 음성으로 출력됩니다.'],
    ['3명', '서로 다른 필요의 가상 이용인', '손떨림·스캔입력·기본 사용 예시를 각각 담았습니다.'],
    ['2단계', '까지만 구현했습니다', '음성인식·발화 통역은 범위에 넣지 않았습니다.']
  ];
  stats.forEach(([big, lab, desc], i) => {
    const x = 0.6 + i * 4.15;
    card(sl, x, 1.75, 3.85, 2.05);
    sl.addText(big, {
      x: x + 0.3, y: 1.9, w: 3.25, h: 0.82, margin: 0,
      fontFace: F, fontSize: 40, bold: true, color: GREEN
    });
    sl.addText(lab, {
      x: x + 0.3, y: 2.66, w: 3.25, h: 0.3, margin: 0,
      fontFace: F, fontSize: 14, bold: true, color: INK
    });
    sl.addText(desc, {
      x: x + 0.3, y: 3.0, w: 3.25, h: 0.65, margin: 0,
      fontFace: F, fontSize: 11.5, color: MUTE, lineSpacing: 17
    });
  });

  sl.addText('복지관에 요청드리는 것', {
    x: 0.62, y: 4.25, w: 6, h: 0.34, margin: 0,
    fontFace: F, fontSize: 17, bold: true, color: INK
  });
  const asks = [
    '가상 이용인·가상 표현자료로 제안자가 개인적으로 제작하는 것',
    '버튼형 기본 의사표시와 개인맞춤형 표현판을 시연하는 것',
    '제작된 시연물을 관장님과 희망하는 직원에게 보여드리는 것'
  ];
  asks.forEach((t, i) => {
    const y = 4.75 + i * 0.56;
    stepCircle(sl, i + 1, 0.62, y, 0.36);
    sl.addText(t, {
      x: 1.12, y: y - 0.02, w: 5.6, h: 0.42, margin: 0,
      fontFace: F, fontSize: 13, color: INK, valign: 'middle'
    });
  });

  card(sl, 7.05, 4.05, 5.7, 2.4, REDPL);
  sl.addText('요청드리지 않는 것', {
    x: 7.35, y: 4.25, w: 5.1, h: 0.34, margin: 0,
    fontFace: F, fontSize: 17, bold: true, color: RED
  });
  sl.addText(
    ['예산 편성과 사업 추진', '개발인력·장비·유료서비스',
     '실제 이용인 정보와 음성자료', '기존 시스템 접근권한'].map((t, i, a) => ({
      text: t, options: { bullet: true, breakLine: i !== a.length - 1 }
    })), {
      x: 7.35, y: 4.72, w: 5.1, h: 1.5, margin: 0,
      fontFace: F, fontSize: 13, color: '7C3B34', paraSpaceAfter: 6
    });
  sl.addNotes('요약: 한 번 누르면 바로 말합니다. 가상 이용인 세 명으로 개인맞춤을 보여드립니다. 제안서의 1·2단계까지만 구현했습니다. 예산·인력·실제 이용인 정보는 요청드리지 않습니다.');
}

// =====================================================================
// 3. 왜 필요한가
// =====================================================================
{
  const sl = lightSlide('BACKGROUND', '말이 전달되지 않을 때 생기는 일');
  sl.addText('뇌병변장애인은 하고 싶은 말이 분명해도 발음이 상대방에게 명확히 전달되지 않을 수 있습니다. 이때 다음과 같은 상황이 생깁니다.', {
    x: 0.6, y: 1.55, w: 12.15, h: 0.4, margin: 0,
    fontFace: F, fontSize: 14, color: MUTE
  });
  const probs = [
    ['같은 말을 여러 번 반복', '한 번에 전달되지 않아 이용인이 같은 표현을 되풀이해야 합니다.'],
    ['상대방이 의도를 추측', '직원이 의미를 짐작하는 과정에서 실제 의도와 달라질 수 있습니다.'],
    ['거부·중단 의사가 늦게 전달', '싫다는 뜻, 그만하고 싶다는 뜻이 제때 닿지 않습니다.'],
    ['의사소통 실패가 오해로', '전달되지 않은 것이 비협조나 문제행동으로 잘못 읽힐 수 있습니다.']
  ];
  probs.forEach(([t, d], i) => {
    const x = 0.6 + (i % 2) * 6.28;
    const y = 2.25 + Math.floor(i / 2) * 1.92;
    card(sl, x, y, 5.87, 1.68, 'F4F6F4');
    sl.addShape(pres.ShapeType.ellipse, { x: x + 0.32, y: y + 0.5, w: 0.66, h: 0.66, fill: { color: RED } });
    sl.addText('✕', {
      x: x + 0.32, y: y + 0.5, w: 0.66, h: 0.66, margin: 0,
      fontFace: F, fontSize: 21, bold: true, color: WHITE, align: 'center', valign: 'middle'
    });
    sl.addText(t, {
      x: x + 1.18, y: y + 0.36, w: 4.5, h: 0.38, margin: 0,
      fontFace: F, fontSize: 16, bold: true, color: INK
    });
    sl.addText(d, {
      x: x + 1.18, y: y + 0.78, w: 4.5, h: 0.72, margin: 0,
      fontFace: F, fontSize: 12.5, color: MUTE, lineSpacing: 18
    });
  });
  card(sl, 0.6, 6.28, 12.15, 0.72, PALE);
  sl.addText('핵심은 이용인이 자신의 의사를 직접 선택하고 확인해 상대방에게 전달할 수 있는 수단을 갖는 것입니다.', {
    x: 0.95, y: 6.28, w: 11.5, h: 0.72, margin: 0,
    fontFace: F, fontSize: 15, bold: true, color: GREEN, valign: 'middle'
  });
  sl.addNotes('의사소통이 막히면 반복, 추측, 거부 의사의 지연, 그리고 오해가 생깁니다. 필요한 것은 이용인이 직접 고르고 확인해서 전달하는 수단입니다.');
}

// =====================================================================
// 4. 화면 흐름 한눈에  ★
// =====================================================================
{
  const sl = lightSlide('HOW IT WORKS', '화면 흐름 — 누르면 바로 말합니다');
  const w = 3.5, y0 = 2.05;
  const steps = [
    ['01-basic.png', '표현 버튼을 누릅니다', '이용인이 하고 싶은 말을 직접 고릅니다.'],
    ['05-spoken.png', '즉시 음성이 나갑니다', '확인 팝업 없이 곧바로 소리가 납니다.'],
    ['08-partner.png', '필요하면 크게 보여줍니다', '소리가 잘 안 들리는 곳에서 화면으로 전달합니다.']
  ];
  const maxH = Math.max(...steps.map(s => ih(s[0], w)));   // 캡션 기준선을 통일
  steps.forEach(([file, t, d], i) => {
    const x = 0.62 + i * 4.24;
    shot(sl, file, x, y0 + 0.5, w);
    const h = maxH;
    stepCircle(sl, i + 1, x, y0 - 0.06, 0.5);
    sl.addText(t, {
      x: x + 0.62, y: y0 - 0.03, w: 2.9, h: 0.44, margin: 0,
      fontFace: F, fontSize: 15, bold: true, color: INK, valign: 'middle'
    });
    sl.addText(d, {
      x, y: y0 + 0.62 + h, w, h: 0.42, margin: 0,
      fontFace: F, fontSize: 12, color: MUTE, align: 'center'
    });
    if (i < 2) {
      sl.addText('▶', {
        x: x + w + 0.06, y: y0 + 0.5 + h / 2 - 0.25, w: 0.62, h: 0.5, margin: 0,
        fontFace: F, fontSize: 20, bold: true, color: GREEN, align: 'center', valign: 'middle'
      });
    }
  });
  sl.addText('확인 단계를 거치도록 바꿀 수도 있습니다. 손떨림이 있는 이용인은 〈이 문장이 맞습니까?〉를 켜서 오작동을 막습니다.', {
    x: 0.62, y: 6.42, w: 12.1, h: 0.42, margin: 0,
    fontFace: F, fontSize: 12.5, color: MUTE
  });
  sl.addNotes('가장 중요한 부분입니다. 버튼 한 번이면 소리가 납니다. 중간 단계가 없습니다. 다만 확인 단계가 필요한 이용인은 설정에서 켤 수 있습니다.');
}

// =====================================================================
// 5. 기본 표현판
// =====================================================================
{
  const sl = lightSlide('SCREEN ①', '기본 표현판 — 자주 쓰는 말을 한 번에');
  shot(sl, '01-basic.png', 0.62, 1.72, 5.5);
  const items = [
    ['예 / 아니요를 즉시', '가장 기본이 되는 응답을 첫 화면 맨 위에 둡니다.'],
    ['한 화면에 6개만', '버튼을 크게 하고 수를 줄여 고르기 쉽게 했습니다.'],
    ['그림과 글자를 함께', '글자를 읽기 어려운 이용인도 그림으로 찾을 수 있습니다.'],
    ['탭 한 줄로 이동', '기본·생활·활동·내 표현·문장을 한 번에 오갑니다.']
  ];
  items.forEach(([t, d], i) => {
    const y = 1.9 + i * 1.12;
    stepCircle(sl, i + 1, 6.6, y, 0.42);
    sl.addText(t, {
      x: 7.2, y: y - 0.03, w: 5.5, h: 0.4, margin: 0,
      fontFace: F, fontSize: 16, bold: true, color: INK, valign: 'middle'
    });
    sl.addText(d, {
      x: 7.2, y: y + 0.38, w: 5.5, h: 0.52, margin: 0,
      fontFace: F, fontSize: 12.5, color: MUTE, lineSpacing: 18
    });
  });
  card(sl, 6.6, 6.05, 6.12, 0.82, PALE);
  sl.addText('아래 〈도움 요청〉 버튼은 어느 화면에서나 항상 보입니다.', {
    x: 6.9, y: 6.05, w: 5.5, h: 0.82, margin: 0,
    fontFace: F, fontSize: 13, bold: true, color: GREEN, valign: 'middle'
  });
  sl.addNotes('첫 화면입니다. 예, 아니요부터 시작합니다. 한 화면에 여섯 개만 두어 고르기 쉽게 했습니다.');
}

// =====================================================================
// 6. 상황별 표현판
// =====================================================================
{
  const sl = lightSlide('SCREEN ②', '상황별 표현판 — 생활과 활동');
  sl.addText('복지관에서 자주 쓰이는 표현을 상황별로 나누되, 화면 이동이 복잡해지지 않도록 단계를 얕게 유지했습니다.', {
    x: 0.6, y: 1.62, w: 12.15, h: 0.4, margin: 0, fontFace: F, fontSize: 14, color: MUTE
  });
  card(sl, 0.62, 2.08, 12.1, 0.66, PALE);
  sl.addText('〈오늘은 쉬고 싶어요〉, 〈중단하고 싶어요〉처럼 거부와 중단을 나타내는 표현을 참여 표현과 같은 크기로 함께 둡니다.', {
    x: 0.95, y: 2.08, w: 11.5, h: 0.66, margin: 0,
    fontFace: F, fontSize: 13, bold: true, color: GREEN, valign: 'middle'
  });
  shot(sl, '02-life.png', 1.57, 2.95, 4.6, { cap: '생활 — 물, 식사, 화장실, 휴식, 더위와 추위' });
  shot(sl, '03-act.png', 7.17, 2.95, 4.6, { cap: '활동 — 참여, 휴식, 시작, 중단, 속도, 담당자 호출' });
  sl.addNotes('생활과 활동 표현판입니다. 참여하겠다는 표현과 거부하겠다는 표현을 같은 비중으로 둔 것이 중요합니다.');
}

// =====================================================================
// 7. 문장 만들기
// =====================================================================
{
  const sl = lightSlide('SCREEN ③', '문장 만들기 — 없는 말을 직접 조합');
  shot(sl, '06-builder.png', 0.62, 1.7, 5.3);
  sl.addText('준비된 표현에 없는 말은 이용인이 단어를 이어 직접 만듭니다.', {
    x: 6.35, y: 1.76, w: 6.4, h: 0.4, margin: 0,
    fontFace: F, fontSize: 14, color: MUTE
  });
  card(sl, 6.35, 2.28, 6.4, 0.85, PALE);
  sl.addText('저는  +  지금  +  헬스장에  +  가고 싶어요', {
    x: 6.55, y: 2.28, w: 6.0, h: 0.85, margin: 0,
    fontFace: F, fontSize: 16, bold: true, color: GREEN, valign: 'middle', align: 'center'
  });
  const bs = [
    ['누가 · 언제 · 어디 · 행동 · 마음', '단어를 뜻에 따라 나누어 찾기 쉽게 했습니다.'],
    ['문장 속 단어를 누르면 빠집니다', '틀린 단어만 골라 지울 수 있어 처음부터 다시 하지 않습니다.'],
    ['다 만든 뒤 〈말하기〉', '문장이 완성되기 전에는 소리가 나가지 않습니다.']
  ];
  bs.forEach(([t, d], i) => {
    const y = 3.55 + i * 1.08;
    stepCircle(sl, i + 1, 6.35, y, 0.42);
    sl.addText(t, {
      x: 6.95, y: y - 0.03, w: 5.8, h: 0.4, margin: 0,
      fontFace: F, fontSize: 15, bold: true, color: INK, valign: 'middle'
    });
    sl.addText(d, {
      x: 6.95, y: y + 0.36, w: 5.8, h: 0.52, margin: 0,
      fontFace: F, fontSize: 12, color: MUTE, lineSpacing: 17
    });
  });
  sl.addNotes('준비된 표현에 없는 말은 단어를 이어서 만듭니다. 잘못 넣은 단어는 그 단어만 눌러서 뺄 수 있습니다.');
}

// =====================================================================
// 8. 상대방에게 보여주는 화면
// =====================================================================
{
  const sl = lightSlide('SCREEN ④', '상대방에게 보여주는 화면');
  shot(sl, '08-partner.png', 0.62, 1.75, 6.5);
  sl.addText('소리가 잘 들리지 않는 곳에서도 문장이 전달되도록, 확정된 문장을 화면 전체에 큰 글씨로 보여줍니다.', {
    x: 7.5, y: 1.82, w: 5.25, h: 0.7, margin: 0,
    fontFace: F, fontSize: 14, color: MUTE, lineSpacing: 22
  });
  const rows = [
    ['다시 듣기', '상대방이 못 들었을 때 이용인이 다시 재생합니다.'],
    ['잠시 기다려주세요', '이용인이 다음 문장을 만드는 동안 상대방에게 알립니다.'],
    ['맞아요 / 수정할게요', '전달이 제대로 되었는지 이용인이 직접 확인합니다.'],
    ['의사소통 안내문', '이용인이 정한 대화 방법을 화면 아래에 함께 띄웁니다.']
  ];
  rows.forEach(([t, d], i) => {
    const y = 2.72 + i * 0.92;
    sl.addShape(pres.ShapeType.ellipse, { x: 7.5, y: y + 0.09, w: 0.2, h: 0.2, fill: { color: GREEN } });
    sl.addText(t, {
      x: 7.85, y, w: 4.9, h: 0.34, margin: 0,
      fontFace: F, fontSize: 14.5, bold: true, color: INK
    });
    sl.addText(d, {
      x: 7.85, y: y + 0.34, w: 4.9, h: 0.46, margin: 0,
      fontFace: F, fontSize: 12, color: MUTE, lineSpacing: 17
    });
  });
  card(sl, 7.5, 6.32, 5.25, 0.66, REDPL);
  sl.addText('상대방은 확인만 합니다. 대신 확정하지 않습니다.', {
    x: 7.75, y: 6.32, w: 4.85, h: 0.66, margin: 0,
    fontFace: F, fontSize: 13, bold: true, color: RED, valign: 'middle'
  });
  sl.addNotes('상대방용 큰 화면입니다. 다시 듣기, 기다려달라는 표시, 맞는지 확인하는 버튼이 있습니다. 확정은 언제나 이용인이 합니다.');
}

// =====================================================================
// 9. 도움 요청 (긴급)
// =====================================================================
{
  const sl = pres.addSlide();
  sl.background = { color: WHITE };
  sl.addText('EMERGENCY', {
    x: 0.62, y: 0.52, w: 8, h: 0.28, margin: 0,
    fontFace: F, fontSize: 12, bold: true, color: RED, charSpacing: 2
  });
  sl.addText('도움 요청 — 한 번 누르면 최대 음량으로', {
    x: 0.6, y: 0.82, w: 12.2, h: 0.72, margin: 0,
    fontFace: F, fontSize: 32, bold: true, color: INK
  });
  // 두 화면의 높이가 달라 아래쪽 선을 맞춘다
  const pw = 4.4, gap = 1.0;
  const px1 = (13.333 - (pw * 2 + gap)) / 2, px2 = px1 + pw + gap;
  const ph1 = ih('07-help.png', pw), ph2 = ih('09-partner-em.png', pw);
  const baseY = 1.85, bottom = baseY + Math.max(ph1, ph2);
  shot(sl, '07-help.png', px1, bottom - ph1, pw);
  shot(sl, '09-partner-em.png', px2, bottom - ph2, pw);
  sl.addText('긴급 표현은 일반 표현과 화면을 분리했습니다', {
    x: px1, y: bottom + 0.09, w: pw, h: 0.3, margin: 0,
    fontFace: F, fontSize: 11, color: MUTE, align: 'center'
  });
  sl.addText('누르는 즉시 상대방 화면에도 크게 표시됩니다', {
    x: px2, y: bottom + 0.09, w: pw, h: 0.3, margin: 0,
    fontFace: F, fontSize: 11, color: RED, align: 'center'
  });
  const notes = [
    ['알림음이 먼저', '음성이 나오기 전에 경보음을 울려 주변의 주의를 끕니다.'],
    ['음량 설정 무시', '평소 음량을 낮춰 두었어도 긴급 표현은 항상 최대로 나갑니다.'],
    ['확인 단계 없음', '급한 상황에서 한 단계라도 늦어지지 않게 했습니다.']
  ];
  notes.forEach(([t, d], i) => {
    const x = 0.62 + i * 4.06;
    card(sl, x, 5.92, 3.78, 1.05, REDPL);
    sl.addText(t, {
      x: x + 0.25, y: 6.04, w: 3.3, h: 0.3, margin: 0,
      fontFace: F, fontSize: 14, bold: true, color: RED
    });
    sl.addText(d, {
      x: x + 0.25, y: 6.36, w: 3.3, h: 0.52, margin: 0,
      fontFace: F, fontSize: 11, color: '7C3B34', lineSpacing: 15
    });
  });
  sl.addNotes('도움 요청은 화면 어디에서나 아래에 고정되어 있습니다. 한 번 누르면 알림음과 함께 도와주세요가 최대 음량으로 나갑니다.');
}

// =====================================================================
// 10. 개인맞춤 ★
// =====================================================================
{
  const sl = lightSlide('PERSONALIZATION', '같은 앱, 이용인마다 다른 화면');
  sl.addText('모든 이용인에게 같은 화면을 주지 않습니다. 신체기능과 의사소통 방식에 따라 버튼 크기, 색 대비, 입력 방식을 다르게 설정합니다.', {
    x: 0.6, y: 1.55, w: 12.15, h: 0.4, margin: 0, fontFace: F, fontSize: 14, color: MUTE
  });
  const profs = [
    ['11-highcontrast.png', '가상 이용인 A', '고대비 · 큰 버튼', '손떨림이 있어 버튼을 크게, 대비를 높이고 확인 단계를 켰습니다.'],
    ['12-scan.png', '가상 이용인 B', '스캔 입력', '직접 누르기 어려워 항목이 강조될 때 확인키를 누릅니다.'],
    ['01-basic.png', '가상 이용인 C', '기본 설정', '직접 손으로 눌러 사용합니다. 한 번에 말하기가 켜져 있습니다.']
  ];
  profs.forEach(([file, name, mode, desc], i) => {
    const x = 0.62 + i * 4.37;
    const h = shot(sl, file, x, 2.12, 3.35);
    const base = 2.12 + h;
    sl.addText(name, {
      x, y: base + 0.14, w: 3.35, h: 0.3, margin: 0,
      fontFace: F, fontSize: 15, bold: true, color: INK, align: 'center'
    });
    sl.addText(mode, {
      x, y: base + 0.44, w: 3.35, h: 0.28, margin: 0,
      fontFace: F, fontSize: 12.5, bold: true, color: GREEN, align: 'center'
    });
    sl.addText(desc, {
      x, y: base + 0.74, w: 3.35, h: 0.7, margin: 0,
      fontFace: F, fontSize: 11, color: MUTE, align: 'center', lineSpacing: 16
    });
  });
  card(sl, 0.62, 6.4, 12.1, 0.6, PALE);
  sl.addText('시연 자리에서 설정을 눌러 세 화면을 즉시 바꿔 보여드릴 수 있습니다. 실제 이용인에게 적용할 때도 같은 방식으로 맞춥니다.', {
    x: 0.95, y: 6.4, w: 11.5, h: 0.6, margin: 0,
    fontFace: F, fontSize: 13, bold: true, color: GREEN, valign: 'middle'
  });
  sl.addNotes('가장 보여드리고 싶은 부분입니다. 같은 앱인데 이용인마다 화면이 다릅니다. 설정에서 즉시 바꿔 보여드릴 수 있습니다.');
}

// =====================================================================
// 11. 오선택 예방과 접근성
// =====================================================================
{
  const sl = lightSlide('ACCESSIBILITY', '잘못 눌리는 것을 막는 장치');
  shot(sl, '10-confirm.png', 7.55, 1.78, 5.2, { cap: '확인 단계를 켠 가상 이용인 A의 화면' });
  const guards = [
    ['버튼을 크게, 사이를 넓게', '반대되는 기능을 가까이 두지 않습니다.'],
    ['누르기 유지', '정한 시간만큼 누르고 있어야 선택됩니다. 스치듯 닿는 것은 무시합니다.'],
    ['선택 후 확인', '〈이 문장이 맞습니까?〉를 거쳐 확정합니다.'],
    ['연속입력 방지', '같은 버튼이 짧은 시간에 두 번 눌리지 않습니다.'],
    ['긴급 표현 분리', '급한 표현은 일반 표현과 다른 화면에 둡니다.']
  ];
  guards.forEach(([t, d], i) => {
    const y = 1.72 + i * 0.94;
    stepCircle(sl, i + 1, 0.62, y, 0.42);
    sl.addText(t, {
      x: 1.22, y: y - 0.03, w: 5.9, h: 0.38, margin: 0,
      fontFace: F, fontSize: 15, bold: true, color: INK, valign: 'middle'
    });
    sl.addText(d, {
      x: 1.22, y: y + 0.35, w: 5.9, h: 0.46, margin: 0,
      fontFace: F, fontSize: 12, color: MUTE, lineSpacing: 17
    });
  });
  card(sl, 0.62, 6.36, 6.5, 0.64, PALE);
  sl.addText('모든 기능에 확인을 강제하면 대화가 느려집니다. 그래서 이용인별로 켜고 끕니다.', {
    x: 0.92, y: 6.36, w: 6.0, h: 0.64, margin: 0,
    fontFace: F, fontSize: 12.5, bold: true, color: GREEN, valign: 'middle'
  });
  sl.addNotes('오선택 예방 장치입니다. 다만 모두에게 강제하면 대화가 느려지므로 이용인별로 조정합니다.');
}

// =====================================================================
// 12. 설정 화면
// =====================================================================
{
  const sl = lightSlide('SETTINGS', '설정 — 이용화면과 분리되어 있습니다');
  sl.addText('이용인이 쓰다가 실수로 바꾸지 않도록 설정은 이용화면과 분리했습니다. 아래는 〈입력과 확인〉 설정 화면입니다.', {
    x: 0.6, y: 1.62, w: 12.15, h: 0.4, margin: 0, fontFace: F, fontSize: 14, color: MUTE
  });
  shot(sl, '15-inputcard.png', 0.62, 2.15, 7.3,
       { cap: '이 설정을 바꾸면 앞서 보신 세 이용인의 화면이 서로 달라집니다' });

  sl.addText('설정할 수 있는 것', {
    x: 8.25, y: 2.15, w: 4.5, h: 0.36, margin: 0,
    fontFace: F, fontSize: 17, bold: true, color: INK
  });
  const conf = [
    '한 줄의 버튼 수와 버튼 크기', '글자 크기와 고대비 화면', '그림 표시 여부',
    '선택 후 확인, 누르기 유지시간', '스캔 방식과 스캔 속도', '음성의 빠르기와 음량',
    '내 표현 추가 · 삭제', '설정 내보내기 · 가져오기'
  ];
  sl.addText(conf.map((t, i, a) => ({ text: t, options: { bullet: true, breakLine: i !== a.length - 1 } })), {
    x: 8.25, y: 2.62, w: 4.5, h: 3.0, margin: 0, valign: 'top',
    fontFace: F, fontSize: 13, color: INK, paraSpaceAfter: 7
  });
  card(sl, 0.62, 6.35, 12.1, 0.64, PALE);
  sl.addText('시연판에는 실제 이용인 계정이 없습니다. 〈가상 이용인 A·B·C〉만 제공하며, 자료는 시연 기기 안에만 저장됩니다.', {
    x: 0.95, y: 6.35, w: 11.5, h: 0.64, margin: 0,
    fontFace: F, fontSize: 13, bold: true, color: GREEN, valign: 'middle'
  });
  sl.addNotes('설정은 이용화면과 분리되어 있습니다. 이용인이 쓰다가 실수로 설정을 바꾸지 않도록 했습니다.');
}

// =====================================================================
// 13. 표현권 보장 (어두운 슬라이드)
// =====================================================================
{
  const sl = darkSlide();
  sl.addText('PRINCIPLE', {
    x: 0.85, y: 0.85, w: 8, h: 0.3, margin: 0,
    fontFace: F, fontSize: 12, bold: true, color: '9DBFA9', charSpacing: 2
  });
  sl.addText('의사소통 도구가 순응을 유도하는\n수단이 되지 않도록', {
    x: 0.8, y: 1.3, w: 11.8, h: 1.5, margin: 0,
    fontFace: F, fontSize: 33, bold: true, color: WHITE, lineSpacing: 46
  });
  sl.addText('다음 표현은 특별한 이유 없이 삭제하거나 숨기지 않습니다. 시연판에서도 설정 화면에 잠금 표시로 안내됩니다.', {
    x: 0.85, y: 3.0, w: 11.7, h: 0.4, margin: 0,
    fontFace: F, fontSize: 14, color: 'C7DACD'
  });
  const chips = ['아니요', '싫어요', '중단하고 싶어요', '지금 중단해주세요', '도와주세요',
                 '제가 직접 선택하겠습니다', '혼자 있고 싶어요', '잘못 이해하셨어요'];
  let cx = 0.85, cy = 3.85;
  chips.forEach(t => {
    const w = 0.5 + t.length * 0.26;
    if (cx + w > 12.62) { cx = 0.85; cy += 0.97; }
    sl.addShape(pres.ShapeType.roundRect, {
      x: cx, y: cy, w, h: 0.72, rectRadius: 0.36,
      fill: { color: '17472F' }, line: { color: '4E8B68', width: 1.2 }
    });
    sl.addText(t, {
      x: cx, y: cy, w, h: 0.72, margin: 0,
      fontFace: F, fontSize: 14, bold: true, color: 'E4F0E8', align: 'center', valign: 'middle'
    });
    cx += w + 0.24;
  });
  sl.addText('웹앱은 이용인의 의사를 대신 판단하지 않습니다. 이용인이 선택한 내용을 전달하는 보조수단으로만 씁니다.', {
    x: 0.85, y: 6.2, w: 11.7, h: 0.5, margin: 0,
    fontFace: F, fontSize: 15, bold: true, color: '9DBFA9', valign: 'middle'
  });
  sl.addNotes('가장 중요한 원칙입니다. 거부하고 항의하고 대화를 끝내는 표현을 항상 함께 제공합니다. 도구가 순응을 유도하면 안 됩니다.');
}

// =====================================================================
// 14. 구현 범위와 한계
// =====================================================================
{
  const sl = lightSlide('SCOPE', '구현 범위와 하지 않은 것');
  card(sl, 0.62, 1.68, 6.0, 2.15, PALE);
  sl.addText('구현했습니다', {
    x: 0.92, y: 1.85, w: 5.4, h: 0.36, margin: 0,
    fontFace: F, fontSize: 18, bold: true, color: GREEN
  });
  sl.addText([
    { text: '1단계 — 버튼으로 의사를 표현', options: { bullet: true, breakLine: true } },
    { text: '2단계 — 이용인별 표현·화면·음성·입력 맞춤', options: { bullet: true } }
  ], {
    x: 0.92, y: 2.32, w: 5.4, h: 1.3, margin: 0,
    fontFace: F, fontSize: 13.5, color: INK, paraSpaceAfter: 6, lineSpacing: 20
  });

  card(sl, 6.9, 1.68, 5.82, 2.15, REDPL);
  sl.addText('구현하지 않았습니다', {
    x: 7.2, y: 1.85, w: 5.2, h: 0.36, margin: 0,
    fontFace: F, fontSize: 18, bold: true, color: RED
  });
  sl.addText([
    { text: '3단계 — 등록한 개인 발화를 인식', options: { bullet: true, breakLine: true } },
    { text: '4단계 — 등록되지 않은 발화의 의미 추정', options: { bullet: true, breakLine: true } },
    { text: '5단계 — 자유로운 발화의 실시간 통역', options: { bullet: true } }
  ], {
    x: 7.2, y: 2.32, w: 5.2, h: 1.3, margin: 0,
    fontFace: F, fontSize: 13.5, color: '7C3B34', paraSpaceAfter: 6, lineSpacing: 20
  });

  sl.addText('왜 3단계 이상을 넣지 않았는가', {
    x: 0.62, y: 4.15, w: 8, h: 0.36, margin: 0,
    fontFace: F, fontSize: 18, bold: true, color: INK
  });
  const why = [
    ['발화 특성의 개인차', '뇌병변장애인의 발화는 사람마다 크게 다릅니다.'],
    ['한국어 학습자료 부족', '비정형 발화를 학습할 자료가 제한적입니다.'],
    ['오류가 숨겨집니다', '잘못 인식해도 자연스러운 문장이 되어 실제 의도처럼 보입니다.'],
    ['음성은 민감정보', '음성에는 개인식별정보와 건강상태가 드러날 수 있습니다.']
  ];
  why.forEach(([t, d], i) => {
    const x = 0.62 + (i % 4) * 3.06;
    card(sl, x, 4.68, 2.9, 1.66, 'F4F6F4');
    sl.addText(t, {
      x: x + 0.2, y: 4.85, w: 2.5, h: 0.5, margin: 0,
      fontFace: F, fontSize: 13.5, bold: true, color: INK
    });
    sl.addText(d, {
      x: x + 0.2, y: 5.35, w: 2.5, h: 0.86, margin: 0,
      fontFace: F, fontSize: 11, color: MUTE, lineSpacing: 15
    });
  });
  sl.addText('3단계 이상은 기술 발전, 이용인 참여연구, 개인정보 보호체계, 전문가 검토가 확보된 뒤의 장기 검토과제로 둡니다.', {
    x: 0.62, y: 6.5, w: 12.1, h: 0.4, margin: 0,
    fontFace: F, fontSize: 12.5, color: MUTE
  });
  sl.addNotes('개인이 안전하게 시연할 수 있는 범위까지만 만들었습니다. 음성인식은 잘못 인식해도 자연스러운 문장으로 보이기 때문에 위험합니다.');
}

// =====================================================================
// 15. 시연 방법과 요청사항 (마무리, 어두운 슬라이드)
// =====================================================================
{
  const sl = darkSlide();
  sl.addText('DEMO', {
    x: 0.85, y: 0.72, w: 8, h: 0.3, margin: 0,
    fontFace: F, fontSize: 12, bold: true, color: '9DBFA9', charSpacing: 2
  });
  sl.addText('직접 눌러 보실 수 있습니다', {
    x: 0.8, y: 1.1, w: 11.8, h: 0.8, margin: 0,
    fontFace: F, fontSize: 34, bold: true, color: WHITE
  });

  sl.addImage({ path: path.join(DIR, 'qr.png'), x: 1.15, y: 2.2, w: 2.25, h: 2.25 });
  sl.addText('휴대전화 카메라로 비추면 열립니다', {
    x: 0.85, y: 4.58, w: 2.85, h: 0.3, margin: 0,
    fontFace: F, fontSize: 11, color: '9DBFA9', align: 'center'
  });
  sl.addText('claude.ai/code/artifact/\n854d6b86-b713-4531-9542-f29f86568e14', {
    x: 0.85, y: 4.92, w: 2.85, h: 0.7, margin: 0,
    fontFace: 'Consolas', fontSize: 9, color: '7FA791', align: 'center', lineSpacing: 13
  });

  const ways = [
    ['① 인터넷이 없어도 — 파일 하나로', '〈말빛_시연판_오프라인.html〉을 USB로 옮겨 두 번 누르면 열립니다. 글씨체까지 그대로 나오며 설치가 필요 없습니다. 가장 확실한 방법입니다.'],
    ['② 인터넷이 되면 — 주소로', '왼쪽 QR이나 주소를 열면 바로 실행됩니다. 크롬 또는 사파리를 권합니다.'],
    ['③ 시연 전 확인', '기기 음량을 올리고 무음 모드를 꺼 주십시오. 소리가 나가는 것이 이 앱의 핵심입니다.']
  ];
  ways.forEach(([t, d], i) => {
    const y = 2.2 + i * 1.3;
    sl.addShape(pres.ShapeType.roundRect, {
      x: 4.05, y, w: 8.55, h: 1.12, rectRadius: 0.08,
      fill: { color: '17472F' }, line: { color: '2E6B4A', width: 1 }
    });
    sl.addText(t, {
      x: 4.35, y: y + 0.14, w: 8.0, h: 0.32, margin: 0,
      fontFace: F, fontSize: 14.5, bold: true, color: WHITE
    });
    sl.addText(d, {
      x: 4.35, y: y + 0.48, w: 8.0, h: 0.54, margin: 0,
      fontFace: F, fontSize: 11.5, color: 'C7DACD', lineSpacing: 16
    });
  });

  sl.addText('허락해 주시기를 요청드립니다', {
    x: 0.85, y: 6.15, w: 5.2, h: 0.34, margin: 0,
    fontFace: F, fontSize: 15, bold: true, color: WHITE
  });
  sl.addText('가상 자료로 제작 · 시연 · 관장님과 희망 직원께 보여드리는 것', {
    x: 0.85, y: 6.52, w: 7.6, h: 0.34, margin: 0,
    fontFace: F, fontSize: 12.5, color: '9DBFA9'
  });
  sl.addText('말빛 · 복지관 기여 방안 제안서 10 · 2026. 08', {
    x: 8.6, y: 6.52, w: 4.0, h: 0.34, margin: 0,
    fontFace: F, fontSize: 11, color: '9DBFA9', align: 'right'
  });
  sl.addNotes('QR을 비추면 바로 열립니다. 인터넷이 안 되는 자리에서는 오프라인 파일 하나만 USB로 옮기면 됩니다. 시연 전 음량을 꼭 올려 주십시오.');
}

const OUT = '/home/user/sjb-10/말빛_AAC_웹앱_시연설명.pptx';
pres.writeFile({ fileName: OUT }).then(() => console.log('생성 완료:', OUT));
