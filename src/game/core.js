/* WORD TD 핵심 데이터·규칙 (원본: 난독화 전) */
var PT = {A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10};
function pts(w){ var s = 0; for (var i = 0; i < w.length; i++) s += PT[w[i]] || 0; return s; }
var EL = {
  fire:{n:"불",m:"#f08a24",l:"#ffd34d",d:"#b8471a"}, ice:{n:"얼음",m:"#8fd8ff",l:"#e8f8ff",d:"#3a8fc7"}, storm:{n:"번개",m:"#ffd84a",l:"#fff6c2",d:"#c79a12"},
  poison:{n:"독",m:"#9be64a",l:"#e0ffb0",d:"#4f8a1c"}, earth:{n:"대지",m:"#b9824e",l:"#e0b583",d:"#6b4a2a"}, water:{n:"물",m:"#3f8cff",l:"#a9d0ff",d:"#1d4fa8"},
  wind:{n:"바람",m:"#6fe3c8",l:"#d4fff4",d:"#2a9c84"}, light:{n:"빛",m:"#ffe680",l:"#fffbe0",d:"#d8a520"}, dark:{n:"어둠",m:"#a77bff",l:"#ece2ff",d:"#4a2a7a"},
  steel:{n:"강철",m:"#c9d2de",l:"#f4f7fb",d:"#6d7a8c"}, arcane:{n:"비전",m:"#e060d8",l:"#ffc2f8",d:"#8a2a8a"}, nature:{n:"자연",m:"#4cc35a",l:"#b6f58a",d:"#23763a"},
  support:{n:"지원",m:"#ffcf3d",l:"#fff3b0",d:"#c08a12"}, beast:{n:"야수",m:"#d08a4a",l:"#f2c48a",d:"#7a4a22"}, food:{n:"음식",m:"#ff7a8a",l:"#ffd1d8",d:"#b83a50"},
  gear:{n:"기계",m:"#5fb8c8",l:"#c8f0f6",d:"#2a6a78"}
};
/* 테스터 제작 타워의 직접 그린 그림 */
var TCUSTOM = {}; WORDS.forEach(function(w){ if (!w.px) return; var A = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", n = [16,24,32].indexOf(+w.px.n) >= 0 ? +w.px.n : 16, g = [];
  for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++){ var ch = w.px.idx[Math.floor(y * n / 16) * n + Math.floor(x * n / 16)], c = ch && ch !== "." ? w.px.pal[A.indexOf(ch)] : null; g.push(typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c) ? c : null); }
  TCUSTOM[w.w] = g; delete w.px; });
/* ---------- 단어 사전 ---------- */
var WMAP = {}, KMAP = {}, ROOTS = [];
WORDS.forEach(function(w){ WMAP[w.w] = w; if (w.ko) KMAP[w.ko] = w; });
var EGG = {w:"GRD", k:"food", m:3.33, p:2.1, ko:"", a:"제작자 서명 타워", v:"화면에 MADE BY GRD", egg:1,
  s:{mode:"aoe", dmg:50, dtype:"physical", interval:4, range:3.75, radius:3, fx:{buff:12, gold:10, stun:5, execute:1}}};
var SUF = ["ING","ES","ED","ER","LY","S","D","R","Y"];
/* 입력 → {w(단어 데이터), typed, deriv} 또는 null */
function lookup(raw){
  if (!raw) return null;
  if (Hangul.isKo(raw)){ var k = KMAP[raw]; return k ? {w:k, typed:raw, label:raw, ko:true} : null; }
  var s = raw.toUpperCase().replace(/[^A-Z]/g, "");
  if (s.length < 3) return null;
  if (s === "GRD") return {w:EGG, typed:s, label:s};
  if (WMAP[s]) return {w:WMAP[s], typed:s, label:s};
  for (var i = 0; i < SUF.length; i++){ var z = SUF[i]; if (s.length > z.length + 2 && s.slice(-z.length) === z){ var r = s.slice(0, -z.length);
    var cands = [r, r + "E"]; if (r.length > 3 && r[r.length-1] === r[r.length-2]) cands.push(r.slice(0, -1)); if (z === "ES" || z === "ED" || z === "ER") cands.push(r.replace(/I$/, "Y"));
    for (var j = 0; j < cands.length; j++) if (WMAP[cands[j]] && !WMAP[cands[j]].L) return {w:WMAP[cands[j]], typed:s, label:s, deriv:true}; } }
  return null;
}
function suggest(raw){
  var ko = Hangul.isKo(raw), q = ko ? Hangul.decompose(raw) : raw.toUpperCase();
  function ed(a, b){ var m = a.length, n = b.length, d = []; for (var i = 0; i <= m; i++){ d[i] = [i]; } for (var j = 1; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)); return d[m][n]; }
  return WORDS.filter(function(w){ return ko ? w.ko : true; }).map(function(w){ var t = ko ? Hangul.decompose(w.ko) : w.w; return {w:w, d:ed(q, t)}; })
    .sort(function(a, b){ return a.d - b.d; }).slice(0, 3).filter(function(x){ return x.d <= Math.max(2, q.length / 2); }).map(function(x){ return ko ? x.w.ko : x.w.w; });
}
/* ---------- 타워 수치 ---------- */
function baseOf(word){ var P = pts(word), L = word.length, V = (word.match(/[AEIOU]/g) || []).length / Math.max(1, L);
  return {atk: P * 3 * (1 + 0.15 * (L - 3)), interval: +(1.3 - 0.6 * V).toFixed(2), range: +Math.min(4, 2 + 0.25 * (L - 3)).toFixed(2)}; }
var FXK = [["burn",/화상|불태|불씨|태우/],["slow",/둔화|감속|느리|이동 속도 ?-/],["stun",/기절|멈춤|정지|얼려/],["chain",/연쇄|튕|번져|옮겨/],["poison",/독|중독/],["knock",/넉백|밀어|밀쳐|후퇴/],["execute",/즉사|처형/],["pierceArmor",/방어(력)? ?무시|방어 관통/],["crit",/치명/],["buff",/공격력 \+|공격 속도 \+|강화/],["gold",/골드|G /],["heal",/회복|생명/]];
var FXDEF = {burn:20, slow:30, stun:15, chain:2, poison:2, knock:0.3, execute:10, pierceArmor:50, crit:15, buff:10, gold:10, heal:1};
var FXMAX = {burn:60, slow:70, stun:60, chain:8, poison:10, knock:2, execute:30, pierceArmor:100, crit:60, buff:40, gold:60, heal:3};
var FXN = {burn:"화상",slow:"둔화",stun:"기절",chain:"연쇄",poison:"독",knock:"넉백",execute:"즉사",pierceArmor:"방어 무시",crit:"치명타",buff:"주변 강화",gold:"골드",heal:"회복"};
var MODEN = {single:"단일 탄환", pierce:"관통", aoe:"범위", rapid:"연사", beam:"지속 광선", trap:"설치 함정", aura:"오라"};
var _stc = {};
function wordStats(w, typed){
  var key = w.w + "|" + (typed || w.w); if (_stc[key]) return _stc[key];
  var r;
  if (w.s){ var s = w.s; r = {mode:s.mode, dmg:s.dmg, dtype:s.dtype, interval:s.interval, range:s.range, radius:s.radius || 0, fx:JSON.parse(JSON.stringify(s.fx || {}))}; }
  else {
    var b = baseOf(w.w), a = (w.a || "") + " " + (w.e || ""), m = w.m == null ? 1 : w.m, mode = "single", fx = {}, radius = 0;
    if (w.k === "support" || w.m == null) mode = "aura";
    else if (/광선|빔|레이저/.test(a)) mode = "beam";
    else if (/관통|일직선|꿰뚫|직선/.test(a) || w.k === "light") mode = "pierce";
    else if (/범위|폭발|주변 적|광역|전체|지진|폭풍|쓸어/.test(a) || w.k === "earth"){ mode = "aoe"; var rr = a.match(/(\d(?:\.\d)?)칸/); radius = rr ? Math.min(2.5, +rr[1]) : 1.2; }
    else if (/함정|설치|덫|지뢰|압정/.test(a)) mode = "trap";
    else if (/연사|연타|빠르게|난사|2연|3연/.test(a) || w.k === "wind") mode = "rapid";
    var UNIT = {chain:"회", poison:"중첩", knock:"칸", gold:"G", heal:"__"};
    FXK.forEach(function(f){ if (!f[1].test(a)) return; var u = UNIT[f[0]] || "%", re = new RegExp("(?:" + f[1].source + ")[^\\d]{0,10}[+-]?(\\d+(?:\\.\\d+)?) ?" + u), mm = a.match(re); fx[f[0]] = Math.min(FXMAX[f[0]], mm ? +mm[1] : FXDEF[f[0]]); });
    var dt = /마법/.test(a) || ["arcane","light","dark","storm"].indexOf(w.k) >= 0 ? "magic" : /고정 피해/.test(a) ? "true" : "physical";
    var iv = b.interval, mi = a.match(/공격 간격 (\d+(?:\.\d+)?)초/); if (mi) iv = Math.max(0.3, +mi[1]);
    var gm = a.match(/\+?(\d+)G/); if (fx.gold && gm) fx.gold = Math.min(60, +gm[1]);
    var rg = b.range, mr = a.match(/사거리 (\d+(?:\.\d+)?)(?!초)/); if (mr) rg = Math.min(6, +mr[1]);
    r = {mode:mode, dmg:+(b.atk * m).toFixed(1), dtype:dt, interval:iv, range:rg, radius:radius, fx:fx};
    if (w.L){ r.dmg *= 1.4; r.range = Math.max(r.range, 3); }
    if (mode === "aura" && !fx.buff && !fx.gold && !fx.heal) fx.buff = 10;
  }
  /* 속성 기본 효과 */
  var F = r.fx, k = w.k;
  if (k === "fire" && !F.burn) F.burn = 20; if (k === "ice" && !F.slow) F.slow = 30; if (k === "storm" && !F.chain) F.chain = 2;
  if (k === "poison" && !F.poison) F.poison = 1; if (k === "earth" && !F.stun) F.stun = 15; if (k === "water" && !F.knock) F.knock = 0.3;
  if (k === "steel" && !F.pierceArmor) F.pierceArmor = 50; if (k === "dark" && !F.execute) F.execute = 10;
  /* 파생어: 늘어난 글자만큼 기본 스탯 증가 */
  if (typed && typed !== w.w && !w.s){ var b2 = baseOf(typed), b1 = baseOf(w.w); r.dmg = +(r.dmg * Math.max(1, b2.atk / Math.max(1, b1.atk))).toFixed(1); r.range = Math.min(6, r.range + Math.max(0, b2.range - b1.range)); }
  _stc[key] = r; return r;
}
function baseCost(w, typed){ var m = w.m == null ? 1.5 : w.m; return (10 + pts(typed || w.w) * 4) * m * (w.p || 1); }
/* ---------- 적 ---------- */
var ENEMY = {
  blob:{n:"블롭", hp:40, sp:1.0, ar:0, mr:0, g:3, col:"#3b3f4e"},
  runner:{n:"러너", hp:25, sp:2.0, ar:0, mr:0, g:3, col:"#4a6e5a", fast:1},
  shell:{n:"셸", hp:70, sp:0.7, ar:5, mr:0, g:5, col:"#c86e8a"},
  splitter:{n:"스플리터", hp:60, sp:0.9, ar:0, mr:0, g:4, col:"#2d3140", split:1},
  bat:{n:"배트", hp:35, sp:1.4, ar:0, mr:0, g:4, col:"#5a4a6e", fly:1, fast:1},
  medic:{n:"메딕", hp:50, sp:0.9, ar:0, mr:20, g:6, col:"#f2c48a", heal:1},
  ghost:{n:"고스트", hp:45, sp:1.1, ar:0, mr:50, g:6, col:"#8c909b", ghost:1},
  shield:{n:"실드", hp:90, sp:0.8, ar:3, mr:0, g:7, col:"#6d7a8c", shield:1},
  burrow:{n:"버로우", hp:60, sp:1.0, ar:2, mr:0, g:6, col:"#b9824e", burrow:1},
  mimic:{n:"미믹", hp:80, sp:0.9, ar:2, mr:20, g:10, col:"#5fb8c8", mimic:1}
};
var BOSS = [
  {n:"이끼 버섯왕", hp:3000, sp:0.45, ar:3, mr:10, col:"#4cc35a", weak:"MUSHROOM", ko:"버섯", pat:"spore"},
  {n:"모래 지렁이", hp:6500, sp:0.5, ar:5, mr:10, col:"#e0b583", weak:"EARTHWORM", ko:"지렁이", pat:"dive"},
  {n:"서리 골렘", hp:11000, sp:0.38, ar:8, mr:20, col:"#e8f8ff", weak:"GLACIER", ko:"빙하", pat:"freeze"},
  {n:"마그마 드레이크", hp:17000, sp:0.5, ar:5, mr:30, col:"#e0483e", weak:"DRAGONFIRE", ko:"용암", pat:"breath", fly:1},
  {n:"렉시콘", hp:26000, sp:0.42, ar:6, mr:40, col:"#a77bff", weak:"DICTIONARY", ko:"사전", pat:"seal"}
];
var NOTEBOOKS = [
  {n:"챕터 1", m:"속삭이는 숲", tile:["#c9d3c4","#bfcab9"], path:"#8f9a86", cover:"#5c9a5a", pool:["blob","runner","splitter","medic"],
   path:[[0,1],[10,1],[10,4],[2,4],[2,7],[12,7]]},
  {n:"챕터 2", m:"글자 사막", tile:["#d6cfbf","#ccc4b3"], path:"#a3967c", cover:"#c8964e", pool:["blob","runner","shell","burrow","mimic","splitter"],
   path:[[12,0],[12,2],[1,2],[1,6],[6,6],[6,4],[11,4],[11,8]]},
  {n:"챕터 3", m:"침묵의 설원", tile:["#d3d9e0","#c8cfd8"], path:"#8f9aa8", cover:"#5a8fc7", pool:["blob","runner","shell","bat","shield","medic"],
   path:[[0,4],[3,4],[3,1],[9,1],[9,7],[12,7]]},
  {n:"챕터 4", m:"잿빛 화산", tile:["#c9c4c6","#bfb9bc"], path:"#8a7f82", cover:"#c0505a", pool:["runner","shell","bat","ghost","shield","splitter","burrow"],
   path:[[6,0],[6,2],[1,2],[1,6],[11,6],[11,2],[9,2],[9,4],[3,4]]},
  {n:"챕터 5", m:"금지된 도서관", tile:["#ccc8d6","#c2bdce"], path:"#8c86a0", cover:"#6a4a8a", pool:["blob","runner","shell","splitter","bat","medic","ghost","shield","burrow","mimic"],
   path:[[0,0],[12,0],[12,2],[0,2],[0,4],[12,4],[12,6],[0,6],[0,8],[6,8]]}
];
var COLS = 13, ROWS = 9;
function pathCells(nb){ var p = NOTEBOOKS[nb].path, cells = [], set = {};
  for (var i = 0; i < p.length - 1; i++){ var a = p[i], b = p[i+1], dx = Math.sign(b[0] - a[0]), dy = Math.sign(b[1] - a[1]), x = a[0], y = a[1];
    while (true){ var k = x + "," + y; if (!set[k]){ set[k] = 1; cells.push([x, y]); } if (x === b[0] && y === b[1]) break; x += dx; y += dy; } }
  return {cells:cells, set:set}; }
/* ---------- 난이도 ---------- */
var DIFF = [
  {n:"쉬움", hp:0.7, sp:0.9, gold:1.3, start:150, life:30, cost:0.8},
  {n:"보통", hp:1.0, sp:1.0, gold:1.0, start:100, life:20, cost:1.0},
  {n:"어려움", hp:1.4, sp:1.1, gold:0.9, start:80, life:15, cost:1.15},
  {n:"지옥", hp:2.0, sp:1.2, gold:0.8, start:60, life:10, cost:1.3}
];
/* ---------- 펜 ---------- */
var PENS = [
  {id:"pencil", n:"견습생", d:"균형형. 판마다 환불권 2장 (판매할 때 100% 환불)", unlock:null},
  {id:"ball", n:"타자수", d:"적 단어 타격 피해 +60%, 콤보 유지 +0.5초, 타워 공격력 −10%", unlock:null},
  {id:"hl", n:"연금술사", d:"모든 효과 수치 +25%, 1회 피해 −10%", unlock:{clear:1, t:"챕터 1 클리어"}},
  {id:"fountain", n:"학자", d:"6글자 이상 공격력 +25%, 4글자 이하 비용 +20%", unlock:{stars:10, t:"별 10개"}},
  {id:"crayon", n:"상인", d:"지원 단어 비용 −30%, 시작 골드 +30, 타워 공격력 −5%", unlock:{stars:20, t:"별 20개"}},
  {id:"brush", n:"포병", d:"범위 공격 반경 +0.5칸, 공격 간격 +10%", unlock:{clear:3, t:"챕터 3 클리어"}}
];
/* ---------- 주문 ---------- */
var SPELLS = [
  {id:"STOP", ko:"멈춰", ink:40, d:"모든 적 2초 정지 (보스 1초)"},
  {id:"RUSH", ko:"서둘러", ink:30, d:"모든 타워 공격 속도 +50%, 5초"},
  {id:"BOOM", ko:"펑", ink:50, d:"적이 가장 많은 곳에 반경 2칸 폭발"},
  {id:"GOLD", ko:"황금", ink:40, d:"즉시 골드 +40"},
  {id:"HEAL", ko:"회복", ink:60, d:"생명 +3"},
  {id:"ERASE", ko:"삭제", ink:70, d:"일반 적 1마리를 없앤다 (보스·엘리트 제외)"}
];
/* ---------- 스테이지 규칙 ---------- */
var RULES = [
  {id:"vowel", n:"모음 축제", d:"모음이 3개 이상인 단어 공격력 +30%"},
  {id:"fresh", n:"새 얼굴", d:"이번 판에서 처음 쓰는 단어 비용 −40%"},
  {id:"dict", n:"받아쓰기", d:"적 단어 타격 피해 ×2, 오답 시 생명 −1"},
  {id:"dark", n:"정전", d:"모든 사거리 −20%, 빛 단어 공격력 +50%"},
  {id:"letter", n:"○ 주간", d:"글자 ○가 든 단어 공격 속도 +40%"},
  {id:"short", n:"짧게 말해요", d:"4글자 이하 단어 비용 −30%"},
  {id:"long", n:"긴 글짓기", d:"7글자 이상 단어 공격력 +40%"},
  {id:"picky", n:"편식 금지", d:"같은 속성 타워가 3기 이상이면 그 속성 공격력 −20%"},
  {id:"lunch", n:"잔칫날", d:"음식 단어 효과 수치 ×2"},
  {id:"rain", n:"비 오는 날", d:"물·번개 공격력 +30%, 불 공격력 −20%"},
  {id:"quiet", n:"조용히!", d:"주문 사용 불가, 콤보 배율 상한 ×2.5"},
  {id:"late", n:"늦은 행군", d:"적이 2초 늦게 나오지만 이동 속도 +15%"}
];
/* ---------- 유물 ---------- */
var STICKERS = [
  {id:"ember", n:"불씨 심장", r:0, d:"불 속성 공격력 +25%"},
  {id:"frost", n:"영구 동토", r:0, d:"둔화 효과 +15%p"},
  {id:"rod", n:"피뢰침", r:0, d:"연쇄 +1"},
  {id:"venom", n:"맹독 주머니", r:0, d:"독 최대 중첩 +3"},
  {id:"vowelc", n:"모음 부적", r:1, d:"모음(A, E, I, O, U) 글자 비용 0"},
  {id:"rare", n:"희귀 활자", r:0, d:"Q, Z, X, J, K 글자 비용 절반"},
  {id:"longs", n:"긴 문장", r:0, d:"6글자 이상 단어 공격력 +20%"},
  {id:"shout", n:"짧은 외침", r:0, d:"3~4글자 단어 공격 속도 +25%"},
  {id:"interest", n:"이자 계약", r:1, d:"스테이지가 끝날 때 보유 골드 5% 이자 (최대 50G)"},
  {id:"freepen", n:"만능 펜", r:1, d:"무료 건설권 2장 (어떤 단어든 0G)"},
  {id:"scythe", n:"처형인의 낫", r:0, d:"즉사 기준 +5%p"},
  {id:"sand", n:"시간 모래", r:1, d:"웨이브 시작 후 5초간 모든 적 50% 둔화"},
  {id:"wall", n:"견고한 성벽", r:0, d:"생명 +5"},
  {id:"scholar", n:"원소 학자", r:1, d:"원소 반응 피해 +50%"},
  {id:"ency", n:"백과사전", r:0, d:"모든 단어 공격력 +10%"},
  {id:"resonance", n:"공명 증폭기", r:1, d:"인접 공명 보너스 2배"},
  {id:"redpen", n:"명사수의 눈", r:0, d:"적 단어 타격 피해 +50%"},
  {id:"wrongnote", n:"실수 방지", r:0, d:"오답을 내도 콤보가 절반만 깎인다"},
  {id:"practice", n:"집중력", r:0, d:"콤보 유지 시간 +1초"},
  {id:"inkup", n:"마나 샘", r:0, d:"마나 획득량 +30%"},
  {id:"card", n:"단어 카드", r:0, d:"적 단어로 처음 본 단어를 지으면 비용 −50% (단어마다 1회)"},
  {id:"pedestal", n:"강화 받침대", r:0, d:"합성·업그레이드 비용 −25%"},
  {id:"hlband", n:"광속 연타", r:1, d:"콤보 10 이상이면 모든 타워 공격 속도 +15%"},
  {id:"stamp", n:"머리글자 인장", r:1, d:"같은 첫 글자 타워가 3기 이상이면 그 타워들 공격력 +25%"},
  {id:"chainw", n:"끝말잇기", r:1, d:"직전에 지은 단어의 마지막 글자로 시작하면 공격력 +35%, 비용 −15%"},
  {id:"double", n:"이중 주문", r:1, d:"주문 효과 시간 +50%"},
  {id:"blank", n:"무료 설계도", r:1, d:"스테이지마다 무료 건설 1회 (6글자 이하)"},
  {id:"perfect", n:"완벽주의", r:2, d:"오답 없이 스테이지를 끝내면 골드 +60, 다음 스테이지 콤보 10부터"},
  {id:"sentence", n:"문장 완성", r:2, d:"가로로 붙은 타워 3기: 셋의 글자 수 × 3% 공격력 (최대 +45%)"},
  {id:"dict2", n:"사전 위의 사전", r:2, d:"전설 단어 비용 −30%"}
];
var RARN = ["일반", "희귀", "전설"];
/* ---------- 이벤트 ---------- */
var EVENTS = [
  {id:"eraser", n:"주인 없는 상자", d:"길가에 작은 상자가 떨어져 있다.", o:[["연다","보통 유물 1개"],["그냥 지나간다","생명 +3 (마음이 편하다)"]]},
  {id:"quiz", n:"단어 시험", d:"수수께끼 석상이 시험을 낸다. 15초 안에 목록 단어 5개를 쳐라!", o:[["도전한다","성공하면 희귀 유물"],["건너뛴다","아무 일도 없다"]]},
  {id:"lunch", n:"야영지", d:"따뜻한 모닥불과 음식이 있다.", o:[["든든히 먹는다","생명 +5"],["음식을 판다","골드 +60"]]},
  {id:"pencase", n:"장비 정리", d:"짐이 너무 무겁다.", o:[["정리한다","가장 비싼 타워 Lv +1, 가장 싼 타워 판매"],["그냥 둔다","아무 일도 없다"]]},
  {id:"nodoodle", n:"어려운 도전", d:"다음 스테이지 적이 긴 단어를 단다.", o:[["받아들인다","다음 스테이지 적 단어 길이 +2, 보상 ×2"],["거절한다","아무 일도 없다"]]},
  {id:"mate", n:"떠돌이 상인", d:"상인이 유물을 바꾸자고 한다.", o:[["바꾼다","내 유물 1개를 주고 50% 확률로 홀로그램"],["거절한다","아무 일도 없다"]]},
  {id:"library", n:"고대 서고", d:"먼지 쌓인 서고에서 사전을 찾았다.", o:[["사전을 읽는다","이번 판 무작위 단어 3개 비용 −50%"],["낮잠을 잔다","생명 +2"]]},
  {id:"nap", n:"휴식", d:"모두 지쳤다.", o:[["푹 쉰다","다음 스테이지 웨이브 1개 건너뛰기 (보상 없음)"],["참는다","골드 +25"]]}
];
/* ---------- 저장 ---------- */
var SAVE_KEY = "wordtd.save.v1";
var SAVE = (function(){ var d = {settings:{kb:"qwerty", lang:"both", sfx:0.7, bgm:0.4, vib:true, slow:false, wait:800, shake:true, nums:true, speed:1}, stars:{}, clear:{}, seen:{}, used:{}, best:{}, tut:false};
  try { var s = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); if (s){ for (var k in s) d[k] = s[k]; for (var k2 in d.settings) if (s.settings && s.settings[k2] == null) s.settings[k2] = d.settings[k2]; } } catch (e){}
  return d; })();
function save(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e){} }
function totalStars(){ var t = 0; for (var k in SAVE.stars) t += SAVE.stars[k]; return t; }
function clearedCount(){ var c = 0; for (var k in SAVE.clear) if (SAVE.clear[k]) c++; return c; }
function penUnlocked(p){ if (!p.unlock) return true; if (p.unlock.clear) return clearedCount() >= p.unlock.clear; return totalStars() >= p.unlock.stars; }
/* ---------- 소리 (Web Audio 합성) ---------- */
var SFX = (function(){
  var ac = null, master = null, bgmG = null, bgmOn = false, bgmT = null;
  function init(){ if (ac) return; try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.connect(ac.destination); bgmG = ac.createGain(); bgmG.connect(ac.destination); vol(); } catch (e){ ac = null; } }
  function vol(){ if (!ac) return; master.gain.value = SAVE.settings.sfx; bgmG.gain.value = SAVE.settings.bgm * 0.25; }
  function tone(f, d, type, v, slide, dest){ if (!ac) return; var t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = type || "square"; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + d);
    g.gain.setValueAtTime(v || 0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + d); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + d + 0.02); }
  function noise(d, v, hp){ if (!ac) return; var t = ac.currentTime, n = Math.floor(ac.sampleRate * d), b = ac.createBuffer(1, n, ac.sampleRate), ch = b.getChannelData(0); for (var i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp || 800; s.buffer = b; g.gain.value = v || 0.1; s.connect(f); f.connect(g); g.connect(master); s.start(t); }
  var P = {
    key:function(){ tone(900, 0.03, "square", 0.04); }, back:function(){ tone(400, 0.04, "square", 0.04); },
    build:function(){ tone(330, 0.08, "square", 0.1); setTimeout(function(){ tone(495, 0.1, "square", 0.1); }, 60); },
    err:function(){ tone(180, 0.18, "sawtooth", 0.08, 120); },
    hit:function(){ noise(0.04, 0.05, 2000); }, strike:function(){ tone(700, 0.08, "square", 0.1, 1200); noise(0.05, 0.08, 1500); },
    kill:function(){ noise(0.12, 0.07, 3000); }, gold:function(){ tone(1200, 0.05, "square", 0.05); setTimeout(function(){ tone(1600, 0.07, "square", 0.05); }, 50); },
    boom:function(){ tone(120, 0.3, "sawtooth", 0.15, 40); noise(0.3, 0.12, 200); }, stamp:function(){ tone(90, 0.2, "square", 0.18, 50); noise(0.1, 0.1, 300); },
    wave:function(){ [523, 659, 784].forEach(function(f, i){ setTimeout(function(){ tone(f, 0.12, "square", 0.08); }, i * 90); }); },
    boss:function(){ [220, 207, 196, 185].forEach(function(f, i){ setTimeout(function(){ tone(f, 0.3, "sawtooth", 0.1); }, i * 220); }); },
    spell:function(){ tone(400, 0.25, "triangle", 0.12, 1600); }, combo:function(){ tone(1046, 0.08, "square", 0.06); },
    win:function(){ [523, 659, 784, 1046].forEach(function(f, i){ setTimeout(function(){ tone(f, 0.18, "square", 0.1); }, i * 120); }); },
    lose:function(){ [392, 330, 262].forEach(function(f, i){ setTimeout(function(){ tone(f, 0.3, "triangle", 0.12); }, i * 200); }); },
    page:function(){ noise(0.18, 0.06, 1200); }, leak:function(){ tone(150, 0.2, "square", 0.12, 90); }
  };
  var MEL = [0, 4, 7, 12, 7, 4, 2, 5, 9, 12, 9, 5, -1, 3, 7, 10, 7, 3, 0, 4, 7, 11, 7, 4];
  function bgm(on){ init(); if (!ac) return; bgmOn = on; clearInterval(bgmT); if (!on) return; var i = 0;
    bgmT = setInterval(function(){ if (!bgmOn || SAVE.settings.bgm <= 0) return; var n = MEL[i % MEL.length]; tone(262 * Math.pow(2, n / 12), 0.22, "triangle", 0.07, 0, bgmG); if (i % 4 === 0) tone(131 * Math.pow(2, MEL[i % MEL.length] / 12) / 2, 0.4, "square", 0.04, 0, bgmG); i++; }, 260); }
  return {init:init, vol:vol, play:function(k){ init(); if (ac && ac.state === "suspended") ac.resume(); if (P[k]) P[k](); }, bgm:bgm};
})();
function vib(ms){ if (SAVE.settings.vib && navigator.vibrate) try { navigator.vibrate(ms); } catch (e){} }
/* 무작위 (시드) */
function RNG(seed){ var s = seed >>> 0 || 1; return function(){ s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function pick(a, r){ return a[Math.floor((r || Math.random)() * a.length)]; }
function shuffle(a, r){ a = a.slice(); for (var i = a.length - 1; i > 0; i--){ var j = Math.floor((r || Math.random)() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
