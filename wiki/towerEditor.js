/* ---------- 타워 에디터 ---------- */
var TE_MODES = [["single","단일 탄환",1.0],["pierce","관통",1.5],["aoe","범위",0],["rapid","연사",0.9],["beam","지속 광선",1.2],["trap","설치 함정",0.8],["aura","오라 (공격 없음)",0]];
var TE_FX = [
  ["burn","화상","%",0,60,5,"초당 공격력 대비 화상 피해"],["slow","둔화","%",0,70,5,"이동 속도 감소"],["stun","기절 확률","%",0,60,5,"0.5초 기절"],
  ["chain","연쇄","회",0,8,1,"다음 적에게 튐"],["poison","독 중첩","중첩",0,10,1,"중첩당 초당 8%"],["knock","넉백","칸",0,2,0.1,"맞은 적을 뒤로 밀어냄"],
  ["execute","즉사 기준","%",0,30,1,"체력 이하 즉사 (보스 제외)"],["pierceArmor","방어 무시","%",0,100,10,"방어력 무시 비율"],["crit","치명타","%",0,60,5,"피해 ×2"],
  ["buff","주변 강화","%",0,40,1,"주변 1칸 타워 공격력"],["gold","골드 생산","G",0,60,5,"웨이브마다"],["heal","생명 회복","",0,3,1,"웨이브마다"]
];
var TE_PRESET = {
  fire:{mode:"single",fx:{burn:20}}, ice:{mode:"single",fx:{slow:30}}, storm:{mode:"single",fx:{chain:2}}, poison:{mode:"single",fx:{poison:3}},
  earth:{mode:"aoe",radius:0.8,fx:{stun:15}}, water:{mode:"single",fx:{knock:0.3,slow:10}}, wind:{mode:"rapid",fx:{crit:10}}, light:{mode:"pierce",fx:{crit:10}},
  dark:{mode:"single",fx:{execute:10}}, steel:{mode:"single",fx:{pierceArmor:50}}, arcane:{mode:"aoe",radius:0.6,fx:{stun:10}}, nature:{mode:"single",fx:{stun:10,poison:1}},
  support:{mode:"aura",fx:{buff:15}}, beast:{mode:"rapid",fx:{burn:10,crit:10}}, food:{mode:"single",fx:{slow:25,heal:0}}, gear:{mode:"single",fx:{pierceArmor:30,crit:5}}
};
var KW = {burn:["화상","불씨","화염","용암","산불","불"],slow:["둔화","감속"],freeze:["빙결","얼","정지"],stun:["기절","수면","정지"],chain:["연쇄","튐"],poison:["독"],
  knock:["넉백","후퇴","되돌","날림","밀"],execute:["즉사"],pierce:["관통","광선","레이저"],aoe:["범위","폭발","장판","광역","전체"],buff:["주변","오라","+"],gold:["골드","이자"],
  heal:["생명","회복"],range:["사거리"],crit:["치명타"],summon:["분신","소환","구체","촉수","까마귀"],trap:["함정","설치","웅덩이","묘비"],armor:["방어력","방어","실드","보호막"],air:["비행"],reveal:["투명"],bind:["속박","덩굴","거미줄"]};
var KW_KEYS = Object.keys(KW);
function kwVec(text){ var v = {}; KW_KEYS.forEach(function(k){ v[k] = KW[k].some(function(t){ return text.indexOf(t) >= 0; }) ? 1 : 0; }); return v; }
function cosine(a, b){ var d = 0, x = 0, y = 0; KW_KEYS.forEach(function(k){ d += a[k]*b[k]; x += a[k]; y += b[k]; }); return x && y ? d / Math.sqrt(x*y) : 0; }
function teVec(t){
  var v = kwVec(t.concept + " " + t.lv5); var f = t.fx;
  if (f.burn) v.burn = 1; if (f.slow) v.slow = 1; if (f.stun) v.stun = 1; if (f.chain) v.chain = 1; if (f.poison) v.poison = 1; if (f.knock) v.knock = 1; if (f.execute) v.execute = 1;
  if (f.pierceArmor) v.armor = 1; if (f.crit) v.crit = 1; if (f.buff) v.buff = 1; if (f.gold) v.gold = 1; if (f.heal) v.heal = 1;
  if (t.mode === "pierce" || t.mode === "beam") v.pierce = 1; if (t.mode === "aoe") v.aoe = 1; if (t.mode === "trap") v.trap = 1; if (t.mode === "aura") v.buff = 1;
  return v;
}
function teBase(word){ var P = pts(word), L = word.length, V = (word.match(/[AEIOU]/g) || []).length / Math.max(1, L);
  return {atk: P * 3 * (1 + 0.15 * (L - 3)), interval: +(1.3 - 0.6 * V).toFixed(2), range: +Math.min(4, 2 + 0.25 * (L - 3)).toFixed(2)}; }
var TE_MODE_D = {single:"적 1마리를 쏜다. 가장 기본적인 형태.",pierce:"일직선으로 날아가 최대 3마리를 꿰뚫는다. 줄 선 적에게 강하다.",aoe:"맞은 지점 반경 안의 적 모두에게 피해. 무리에 강하다.",rapid:"공격 간격이 절반, 대신 한 발 피해 45%. 적중 효과가 자주 터진다.",beam:"끊기지 않는 광선. 같은 적을 오래 맞출수록 유리하다.",trap:"길 위에 함정을 깔아 밟으면 터진다. 길 가까이 지어야 한다.",aura:"직접 공격하지 않는다. 주변 강화, 골드, 회복 같은 지원 효과만 쓴다."};
function teBaseAtk(t){ return teBase(t.word && t.word.length >= 3 ? t.word : "TOWER").atk; }
function teSetMult(t, m){ t.mult = +m.toFixed(2); t.dmg = +(teBaseAtk(t) * t.mult).toFixed(1); }
function teCost(t){ return Math.round((10 + pts(t.word) * 4) * t.mult); }
function tePower(t){
  var b = teBase(t.word), atk = t.dmg != null ? t.dmg : b.atk * t.mult, f = t.fx, mode = t.mode;
  var mf = mode === "aoe" ? 1 + 2.5 * t.radius * 0.6 : (TE_MODES.filter(function(m){ return m[0] === mode; })[0] || [0,0,1])[2];
  var interval = mode === "rapid" ? t.interval * 0.5 : t.interval;
  var dps = mode === "aura" ? 0 : atk / Math.max(0.1, interval) * (mode === "rapid" ? 0.45 : 1) * mf * Math.sqrt(t.range / 2.5);
  var util = (f.burn||0)/100*3 + (f.slow||0)/100*1.2 + (f.stun||0)/100*1.0 + (f.chain||0)*0.45 + (f.poison||0)*0.15 + (f.knock||0)*0.8 + (f.execute||0)/100*3 + (f.pierceArmor||0)/100*0.4 + (f.crit||0)/100;
  var sup = (f.buff||0) * 3.2 * Math.sqrt(t.mult) + (f.gold||0) * 5 + (f.heal||0) * 55;
  return {dps: dps, util: util, sup: sup, total: dps * (1 + util) + sup};
}
function teRatio(t){ return tePower(t).total / Math.max(1, teCost(t)); }
function teBalance(t){
  var before = JSON.parse(JSON.stringify(t)), cur = JSON.parse(JSON.stringify(t));
  function ok(x){ var r = teRatio(x); return r >= 0.92 && r <= 1.08; }
  function clone(x){ return JSON.parse(JSON.stringify(x)); }
  if (cur.mode === "aura"){
    var best = cur; for (var m = 0.4; m <= 2.501; m += 0.05){ var c = clone(cur); teSetMult(c, m); if (Math.abs(Math.log(teRatio(c))) < Math.abs(Math.log(teRatio(best)))) best = c; } cur = best;
  } else if (!ok(cur)){
    var lo = 0.2, hi = 3.5;
    for (var k = 0; k < 40; k++){ var mid = (lo + hi) / 2, c1 = clone(cur); c1.interval = mid; if (teRatio(c1) > 1) lo = mid; else hi = mid; }
    cur.interval = Math.round(((lo + hi) / 2) / 0.05) * 0.05; cur.interval = +Math.min(3.5, Math.max(0.2, cur.interval)).toFixed(2);
  }
  if (!ok(cur)){
    var keys = Object.keys(cur.fx).filter(function(k){ return cur.fx[k] > 0; });
    if (keys.length){ var a = 0.1, b = 3, base = clone(cur), cand = cur;
      for (var it = 0; it < 30; it++){ var md = (a + b) / 2, c2 = clone(base); keys.forEach(function(k){ var d = TE_FX.filter(function(x){ return x[0] === k; })[0]; c2.fx[k] = +Math.min(d[4], Math.max(d[5], Math.round(base.fx[k] * md / d[5]) * d[5])).toFixed(2); }); if (teRatio(c2) > 1) b = md; else a = md; cand = c2; }
      cur = cand; }
  }
  if (!ok(cur) && cur.mode !== "aura"){
    var bm = cur; for (var m2 = 0.4; m2 <= 2.501; m2 += 0.05){ var c3 = clone(cur); teSetMult(c3, m2); if (Math.abs(Math.log(teRatio(c3))) < Math.abs(Math.log(teRatio(bm)))) bm = c3; } cur = bm;
  }
  return {before: before, after: cur};
}
function teEncode(px){ var pal = [], idx = ""; px.forEach(function(c){ if (!c){ idx += "."; return; } var i = pal.indexOf(c); if (i < 0){ pal.push(c); i = pal.length - 1; } idx += "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[i]; }); return {pal: pal, idx: idx}; }
function teDecode(o){ var A = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", px = []; for (var i = 0; i < 256; i++){ var ch = (o.idx || "")[i]; var c = ch && ch !== "." ? o.pal[A.indexOf(ch)] : null; px.push(typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c) ? c : null); } return px; }
function pxCanvas(px, scale){ var c = document.createElement("canvas"); c.width = c.height = 16 * scale; var x = c.getContext("2d"); for (var i = 0; i < 256; i++) if (px[i]){ x.fillStyle = px[i]; x.fillRect((i % 16) * scale, Math.floor(i / 16) * scale, scale, scale); } return c; }
function designSim(a, b){ var both = 0, either = 0, same = 0; for (var i = 0; i < 256; i++){ var p = !!a[i], q = !!b[i]; if (p || q) either++; if (p && q){ both++; if (a[i].toLowerCase() === b[i].toLowerCase()) same++; } } return either ? 0.5 * both / either + 0.5 * same / either : 0; }

PAGES.toweredit = {cats:["제작"], html:function(){
  var modes = TE_MODES.map(function(m){ return '<option value="' + m[0] + '">' + m[1] + '</option>'; }).join("");
  var els = EL_ORDER.map(function(k){ return '<option value="' + k + '">' + EL[k].n + '</option>'; }).join("");
  var fx = TE_FX.map(function(f){ return '<label class="fx"><span>' + f[1] + ' <small>' + f[6] + '</small></span><span class="fxi"><input type="number" id="fx-' + f[0] + '" min="' + f[3] + '" max="' + f[4] + '" step="' + f[5] + '" inputmode="decimal"><em>' + f[2] + '</em></span></label>'; }).join("");
  return '<p>새 특수 단어 타워의 컨셉과 픽셀 디자인을 만드는 도구다. 저장한 타워는 Claude가 읽어 게임과 도감에 넣는다. 저장한 뒤 채팅에서 "타워 저장했어"라고 알려 주면 된다.</p>' +
  '<div class="te">' +
  '<section class="te-col"><h3 class="te-h">픽셀 디자인 <small>16 × 16</small></h3><p class="te-desc">타워의 생김새를 한 칸씩 칠한다. 게임에서는 작게 보이므로 굵은 실루엣과 속성 색 한두 가지가 눈에 잘 띈다. 아래쪽 두세 줄은 받침대로 남겨 두면 단어 띠와 잘 어울린다.</p>' +
  '<canvas id="tec" width="320" height="320" aria-label="타워 픽셀 편집 격자"></canvas>' +
  '<div class="row te-tools" id="tetools"><button class="btn on" data-t="pen">펜</button><button class="btn" data-t="erase">지우개</button><button class="btn" data-t="fill">채우기</button><button class="btn" data-t="pick">스포이드</button><button class="btn" id="temir" aria-pressed="false">좌우 대칭</button></div>' +
  '<p class="te-desc"><b>펜</b> 한 칸씩 칠하기 · <b>지우개</b> 칸 비우기 · <b>채우기</b> 같은 색으로 이어진 영역 한 번에 칠하기 · <b>스포이드</b> 격자에서 색 집어 오기 · <b>좌우 대칭</b> 한쪽을 칠하면 반대쪽도 똑같이 칠해짐</p><div class="swatches" id="tesw"></div><p class="te-desc">앞의 세 색은 고른 속성의 기본·밝은·어두운 색이고, 그 뒤는 돌, 먹, 포인트 색이다.</p>' +
  '<div class="row" style="gap:6px"><label class="field" style="flex-direction:row;align-items:center;gap:8px">직접 고르기<input type="color" id="tecol" value="#f08a24" style="width:48px;min-height:36px;padding:2px"></label><button class="btn" id="teundo">되돌리기</button><button class="btn" id="teclear">비우기</button></div>' +
  '<h3 class="te-h">인게임 미리보기</h3><p class="te-desc">왼쪽은 실제 게임 칸 크기, 오른쪽은 크게 본 모습이다. 칸 크기에서도 무슨 타워인지 알아볼 수 있는지 확인하자. 단어 띠의 아래 테두리 색은 속성 색이다.</p><div class="te-prev"><div class="board" style="aspect-ratio:3/2;max-width:200px"><canvas id="teprevbg"></canvas><div class="bt" style="left:33.33%;top:0;width:33.33%;height:50%"><img id="teprev" alt="미리보기"><span class="plate" id="teplate">WORD</span></div></div><div class="tcell" id="tebig"></div></div>' +
  '<h3 class="te-h">디자인 자동 추천</h3><p class="te-desc">고른 속성의 기존 단어 아이콘 8개를 후보로 보여 준다 (단어가 이미 목록에 있으면 그 아이콘이 첫 번째). 마음에 드는 것을 눌러 불러온 뒤, 새 단어 뜻에 맞게 고쳐 그리면 된다. 아래 네 줄은 공통 받침대이니 그대로 두고 위쪽 아이콘만 고치면 된다. ‘다른 후보 보기’로 계속 넘겨 볼 수 있다.</p><div class="recs" id="terecs"></div><button class="btn" id="temore">다른 후보 보기</button>' +
  '</section>' +
  '<section class="te-col"><h3 class="te-h">컨셉</h3><p class="te-desc">타워의 정체성. 단어 뜻과 능력이 바로 이어질수록 좋다. 예: ANCHOR(닻)는 적을 붙잡아 멈추게 한다.</p>' +
  '<div class="row" style="gap:8px"><label class="field" style="flex:1 1 150px">단어 (영문 3~12자)<input id="teword" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false"><small class="hint">실존하는 영단어. 글자 점수가 공격력과 비용의 기준이 된다</small></label><label class="field" style="flex:1 1 120px">속성<select id="teel">' + els + '</select><small class="hint"><span id="teelhint"></span></small></label></div>' +
  '<label class="field">컨셉 설명<textarea id="teconcept" rows="2" maxlength="300" placeholder="예: 별의 핵이 폭발하듯 일직선을 꿰뚫는 광선"></textarea><small class="hint">한두 문장으로 어떤 타워인지 적는다. 겹침 분석에도 쓰인다</small></label>' +
  '<div class="row" style="gap:8px"><label class="field" style="flex:1 1 140px">공격 방식<select id="temode">' + modes + '</select><small class="hint"><span id="temodehint"></span></small></label><label class="field" style="flex:1 1 90px">범위 반경 (칸)<input type="number" id="teradius" min="0" max="3" step="0.1" inputmode="decimal"><small class="hint">범위 공격일 때만 쓴다. 맞은 지점에서 이 거리 안의 적이 모두 맞는다</small></label></div>' +
  '<div class="row" style="gap:8px"><label class="field" style="flex:1 1 110px">공격력 (1회 피해)<input type="number" id="tedmg" min="1" max="2000" step="0.5" inputmode="decimal"><small class="hint">한 번 맞힐 때 주는 피해. 올리면 비용도 같이 오른다</small></label><label class="field" style="flex:1 1 110px">피해 종류<select id="tedtype"><option value="physical">물리 (방어력 영향)</option><option value="magic">마법 (마법 저항 영향)</option><option value="true">고정 (저항 무시)</option></select><small class="hint">셸처럼 단단한 적은 물리에, 고스트는 마법에 강하다</small></label></div><div class="row" style="gap:8px"><label class="field" style="flex:1 1 90px">배율 (= 비용 배율)<input type="number" id="temult" min="0.1" max="5" step="0.05" inputmode="decimal"><small class="hint">단어 공식 공격력 대비 비율. 이 값이 비용에 곱해진다</small></label><label class="field" style="flex:1 1 90px">공격 간격 (초)<input type="number" id="teint" min="0.1" max="4" step="0.05" inputmode="decimal"><small class="hint">공격과 공격 사이 시간. 작을수록 빠르다</small></label><label class="field" style="flex:1 1 90px">사거리 (칸)<input type="number" id="terange" min="1" max="7" step="0.25" inputmode="decimal"><small class="hint">타워 중심에서 공격이 닿는 거리 (1칸 = 격자 한 칸)</small></label></div>' +
  '<p class="count" id="tebase" style="margin:0"></p>' +
  '<details class="fold" open><summary>효과</summary><p class="te-desc" style="padding-top:8px">공격에 붙는 추가 능력. 비워 두면 없음. 숫자가 클수록 전투력이 오르니 밸런스 칸을 보며 조절하자. 여러 개를 섞으면 원소 반응과 어울리는 개성 있는 타워가 된다.</p><div class="fxs">' + fx + '</div></details>' +
  '<label class="field">★Lv5 강화<input id="telv5" maxlength="120" placeholder="예: 광선 2줄"><small class="hint">같은 단어를 합성해 5레벨이 되면 얻는 추가 효과</small></label>' +
  '<div class="row" style="gap:6px"><button class="btn" id="tepreset">속성 기본 컨셉 추천</button></div><p class="te-desc">고른 속성의 대표적인 공격 방식과 효과를 채우고 밸런스까지 맞춘다. 희귀 글자(K, J, X, Q, Z)가 들어가면 치명타를, 7글자 이상이면 사거리를 더 준다.</p>' +
  '<h3 class="te-h">밸런스</h3><p class="te-desc">전투력(초당 피해 × 공격 방식 × 사거리 × 효과 + 지원 효과)을 건설 비용과 비교한다. 0.85~1.15가 <b>적정</b>, 낮으면 <b>약함</b>, 높으면 <b>강함</b>. 자동 조정은 공격 간격 → 효과 수치 → 배율 순서로 고치고 무엇이 바뀌었는지 표로 보여 준다.</p><div class="bal" id="tebal"></div><div class="row" style="gap:6px"><button class="btn pri" id="teauto">밸런스 자동 조정</button></div><div id="tebaldiff"></div>' +
  '<h3 class="te-h">겹침 분석</h3><p class="te-desc">기존 타워와 세 가지를 비교한다. <b>단어</b>: 이미 있는 단어나 파생어(FIRE → FIRED)인지. <b>디자인</b>: 픽셀 모양과 색이 비슷한 타워. <b>능력</b>: 효과와 속성이 비슷한 타워. 60~70% 이상이면 차별점을 하나 더 넣는 걸 권한다.</p><div class="row" style="gap:6px"><button class="btn" id="teov">기존 타워와 비교</button></div><div id="teovout"><p class="count">단어, 디자인, 능력이 기존 ' + WORDS.length + '개 타워와 얼마나 겹치는지 검사한다.</p></div>' +
  '<h3 class="te-h">저장</h3><p class="te-desc">저장하면 위키 저장소에 들어가 Claude가 읽을 수 있다. 같은 단어로 다시 저장하면 덮어쓴다.</p><div class="row" style="gap:6px"><button class="btn pri" id="tesave">타워 저장</button><button class="btn" id="tenew">새 타워</button></div><p class="count" id="tedb" style="margin:0"></p>' +
  '</section></div>' +
  '<h2>테스터 제출 코드 불러오기</h2><p>크리에이터 페이지에서 받은 WTDT1. 코드를 붙여 넣으면 편집기로 불러온다. 확인한 뒤 타워 저장을 누르면 저장소에 들어간다.</p><div class="row"><input class="inp" id="teimp" placeholder="WTDT1.…" style="flex:1 1 260px" aria-label="타워 제출 코드"><button class="btn" id="teimpb">불러오기</button></div>' +
  '<h2>저장된 타워</h2><div class="saved" id="tesaved"><p class="count">저장된 타워를 불러오는 중입니다.</p></div>' +
  '<h2>밸런스 계산 방식</h2><ul><li><b>공격력</b>은 직접 정한다. 단어의 공식 공격력(글자 점수 합 × 3 × (1 + 0.15 × (글자 수 − 3)))과 비교한 비율이 <b>배율</b>이 되고, 배율이 곧 비용 배율이다. 공격력을 올리면 비용도 오른다. 배율 칸을 고치면 공격력이 거꾸로 맞춰진다. 공격 간격과 사거리 기본값은 ' + link("words","기본 스탯 공식") + '을 따른다.</li><li><b>전투력</b> = 초당 피해 × 공격 방식 계수 × √(사거리 / 2.5) × (1 + 효과 가치) + 지원 가치.</li><li>효과 가치: 화상 1%당 0.03, 둔화 0.012, 기절 0.01, 연쇄 1회 0.45, 독 1중첩 0.15, 넉백 1칸 0.8, 즉사 1%당 0.03, 방어 무시 0.004, 치명타 0.01.</li><li>지원 가치: 주변 강화 1%당 3.2 × √배율, 골드 1G당 5, 생명 회복 1당 55 (KING, COIN, HEAL 기준으로 맞춤).</li><li><b>적정 기준</b>: 전투력 ÷ 건설 비용이 0.85~1.15. 기존 타워 FIRE가 약 0.96이다.</li><li>자동 조정 순서: ① 공격 간격(0.2~3.5초)으로 맞춘다 ② 그래도 벗어나면 효과 수치를 같은 비율로 줄이거나 늘린다 ③ 마지막으로 배율(= 비용)을 0.4~2.5 안에서 고친다. 지원(오라) 타워는 배율부터 맞춘다. 목표는 0.92~1.08.</li></ul>';
}, after:function(){ teInit(); }};

var TE = null, teDb = null, teDocs = null, teTried = false, teRecSalt = 0;
function teDefault(){ return {word:"QUASAR", kind:"light", concept:"별의 핵이 폭발하듯 일직선을 꿰뚫는 광선", mode:"pierce", radius:0, mult:1.2, dmg:+(teBase("QUASAR").atk * 1.2).toFixed(1), dtype:"magic", interval:1.8, range:teBase("QUASAR").range, fx:{crit:10, slow:10}, lv5:"광선 2줄", px:(TG.icon("NOVA","light",false) || TG.make("QUASAR","light",false,0)).slice(), undo:[], tool:"pen", color:"#ffe680", mirror:false}; }
function teInit(){
  if (!TE) TE = teDefault();
  var cv = document.getElementById("tec"), ctx = cv.getContext("2d");
  var $ = function(id){ return document.getElementById(id); };
  function grid(){ ctx.clearRect(0,0,320,320); for (var y = 0; y < 16; y++) for (var x = 0; x < 16; x++){ ctx.fillStyle = (x + y) % 2 ? "#c9ccd3" : "#bfc2ca"; ctx.fillRect(x*20, y*20, 20, 20); if (TE.px[y*16+x]){ ctx.fillStyle = TE.px[y*16+x]; ctx.fillRect(x*20, y*20, 20, 20); } }
    if (TE.mirror){ ctx.fillStyle = "rgba(53,82,201,.6)"; ctx.fillRect(159, 0, 2, 320); } }
  function preview(){
    grid();
    var url = pxCanvas(TE.px, 4).toDataURL(); $("teprev").src = url; $("teplate").textContent = TE.word || "WORD"; $("teplate").style.borderColor = EL[TE.kind].m;
    $("tebig").innerHTML = '<img src="' + url + '" width="96" height="96" alt="" style="image-rendering:pixelated;width:96px;height:96px"><span class="plate" style="border-color:' + EL[TE.kind].m + '">' + esc(TE.word || "WORD") + '</span>';
  }
  drawMap($("teprevbg"), ["...","..."], 32, 0);
  function swatches(){
    var e = EL[TE.kind], cols = [e.m, e.l, e.d, "#a7acb8", "#7d8392", "#555a68", "#262a36", "#ffffff", "#f0c14a", "#e8504a", "#3fc8e0", "#a77bff", "#4cc35a", "#7a4a2a", "#f4ead2"];
    $("tesw").innerHTML = cols.map(function(c){ return '<button class="sw' + (c === TE.color ? ' on' : '') + '" data-c="' + c + '" style="background:' + c + '" aria-label="색 ' + c + '"></button>'; }).join("");
  }
  function snap(){ TE.undo.push(TE.px.slice()); if (TE.undo.length > 80) TE.undo.shift(); }
  function setPx(i, c){ TE.px[i] = c; if (TE.mirror){ var x = i % 16, y = Math.floor(i / 16); TE.px[y*16 + 15 - x] = c; } }
  function fill(i, c){ var t = TE.px[i]; if (t === c) return; var st = [i], seen = {}; while (st.length){ var k = st.pop(); if (seen[k] || TE.px[k] !== t) continue; seen[k] = 1; TE.px[k] = c; var x = k % 16, y = Math.floor(k / 16); if (x > 0) st.push(k-1); if (x < 15) st.push(k+1); if (y > 0) st.push(k-16); if (y < 15) st.push(k+16); } }
  function at(e){ var r = cv.getBoundingClientRect(); var x = Math.floor((e.clientX - r.left) / r.width * 16), y = Math.floor((e.clientY - r.top) / r.height * 16); return x < 0 || y < 0 || x > 15 || y > 15 ? -1 : y * 16 + x; }
  var down = false;
  function act(e, first){ var i = at(e); if (i < 0) return;
    if (TE.tool === "pick"){ if (TE.px[i]){ TE.color = TE.px[i]; $("tecol").value = TE.color; swatches(); TE.tool = "pen"; tools(); } return; }
    if (TE.tool === "fill"){ if (first) fill(i, TE.color); }
    else setPx(i, TE.tool === "erase" ? null : TE.color);
    preview(); }
  cv.addEventListener("pointerdown", function(e){ e.preventDefault(); cv.setPointerCapture(e.pointerId); if (TE.tool !== "pick") snap(); down = true; act(e, true); });
  cv.addEventListener("pointermove", function(e){ if (down && (TE.tool === "pen" || TE.tool === "erase")) act(e, false); });
  cv.addEventListener("pointerup", function(){ down = false; }); cv.addEventListener("pointercancel", function(){ down = false; });
  function tools(){ [].forEach.call(document.querySelectorAll("#tetools [data-t]"), function(b){ b.classList.toggle("on", b.getAttribute("data-t") === TE.tool); }); $("temir").classList.toggle("on", TE.mirror); $("temir").setAttribute("aria-pressed", TE.mirror); }
  $("tetools").addEventListener("click", function(e){ var b = e.target.closest("[data-t]"); if (b){ TE.tool = b.getAttribute("data-t"); tools(); } });
  $("temir").onclick = function(){ TE.mirror = !TE.mirror; tools(); grid(); };
  $("tesw").addEventListener("click", function(e){ var b = e.target.closest("[data-c]"); if (!b) return; TE.color = b.getAttribute("data-c"); $("tecol").value = TE.color; if (TE.tool === "erase" || TE.tool === "pick") TE.tool = "pen"; tools(); swatches(); });
  $("tecol").oninput = function(){ TE.color = this.value; if (TE.tool !== "fill") TE.tool = "pen"; tools(); swatches(); };
  $("teundo").onclick = function(){ if (TE.undo.length){ TE.px = TE.undo.pop(); preview(); } };
  var clr = 0; $("teclear").onclick = function(){ var b = this; if (Date.now() - clr > 3000){ clr = Date.now(); b.textContent = "한 번 더 누르면 비움"; setTimeout(function(){ b.textContent = "비우기"; }, 3000); return; } snap(); TE.px = TE.px.map(function(){ return null; }); b.textContent = "비우기"; clr = 0; preview(); };
  function recs(){
    var w = TE.word.length >= 3 ? TE.word : "TOWER", box = $("terecs"); box.innerHTML = "";
    var cands = [], own = TG.icon(w, TE.kind, false);
    if (own) cands.push({w: w, g: own});
    var pool = WORDS.filter(function(x){ return x.k === TE.kind && !x.L && x.w !== w; });
    var h = 0; for (var i = 0; i < w.length; i++) h = (h * 31 + w.charCodeAt(i)) >>> 0;
    var start = (h + teRecSalt * 8) % Math.max(1, pool.length);
    for (var j = 0; cands.length < 8 && j < pool.length; j++){ var p = pool[(start + j * 7) % pool.length]; if (!cands.some(function(c){ return c.w === p.w; })) cands.push({w: p.w, g: TG.icon(p.w, TE.kind, false)}); }
    cands.forEach(function(c, s){ if (!c.g) return; var b = document.createElement("button"); b.className = "rec"; b.title = c.w + " 아이콘에서 시작"; b.setAttribute("aria-label", c.w + " 아이콘을 바탕으로 시작"); b.appendChild(pxCanvas(c.g, 3)); var sm = document.createElement("small"); sm.textContent = c.w; b.appendChild(sm); b.onclick = function(){ snap(); TE.px = c.g.slice(); preview(); toast(c.w + " 아이콘을 불러왔습니다. 단어에 맞게 고쳐 보세요."); }; box.appendChild(b); });
  }
  $("temore").onclick = function(){ teRecSalt++; recs(); };
  /* 컨셉 폼 */
  function form(){
    $("teword").value = TE.word; $("teel").value = TE.kind; $("teconcept").value = TE.concept; $("temode").value = TE.mode; $("teradius").value = TE.radius;
    $("temult").value = TE.mult; $("tedmg").value = TE.dmg; $("tedtype").value = TE.dtype || "physical"; $("teint").value = TE.interval; $("terange").value = TE.range; $("telv5").value = TE.lv5;
    TE_FX.forEach(function(f){ $("fx-" + f[0]).value = TE.fx[f[0]] || ""; });
    $("teradius").disabled = TE.mode !== "aoe"; hints();
  }
  function hints(){ $("temodehint").textContent = TE_MODE_D[TE.mode] || ""; $("teelhint").textContent = "기본 효과: " + EL[TE.kind].e; }
  function read(){
    TE.word = $("teword").value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12); $("teword").value = TE.word;
    TE.kind = $("teel").value; TE.concept = $("teconcept").value; TE.mode = $("temode").value; TE.radius = +$("teradius").value || 0;
    TE.dtype = $("tedtype").value; TE.dmg = Math.min(2000, Math.max(1, +$("tedmg").value || 1)); TE.mult = +(TE.dmg / teBaseAtk(TE)).toFixed(2); if (document.activeElement !== $("temult")) $("temult").value = TE.mult; TE.interval = Math.min(4, Math.max(0.1, +$("teint").value || 1)); TE.range = Math.min(7, Math.max(1, +$("terange").value || 2)); TE.lv5 = $("telv5").value;
    TE.fx = {}; TE_FX.forEach(function(f){ var v = +$("fx-" + f[0]).value; if (v > 0) TE.fx[f[0]] = Math.min(f[4], v); });
    $("teradius").disabled = TE.mode !== "aoe"; hints();
  }
  function bal(){
    var p = tePower(TE), c = teCost(TE), r = p.total / Math.max(1, c), b = teBase(TE.word.length >= 3 ? TE.word : "TOWER");
    $("tebase").textContent = TE.word.length >= 3 ? "공식 기본값: 공격 간격 " + b.interval + "초, 사거리 " + b.range + "칸, 배율 1.0일 때 공격력 " + b.atk.toFixed(1) : "단어를 3글자 이상 적어 주세요.";
    var st = r < 0.85 ? ["약함", "var(--warn)"] : r > 1.15 ? ["강함", "var(--bad)"] : ["적정", "var(--ok)"];
    var pos = Math.max(0, Math.min(100, (Math.log(r) / Math.log(2) + 1) * 50));
    $("tebal").innerHTML = '<div class="row" style="justify-content:space-between"><b style="color:' + st[1] + '">' + st[0] + '</b><span class="count">전투력 ' + p.total.toFixed(1) + ' ÷ 비용 ' + c + 'G = ' + r.toFixed(2) + '</span></div>' +
      '<div class="gauge"><i style="left:' + pos + '%"></i><span style="left:' + ((Math.log(0.85)/Math.log(2)+1)*50) + '%;width:' + ((Math.log(1.15)-Math.log(0.85))/Math.log(2)*50) + '%"></span></div>' +
      '<div class="count">1회 피해 ' + TE.dmg + ' · 초당 피해 ' + p.dps.toFixed(1) + ' · 효과 가치 +' + Math.round(p.util * 100) + '% · 지원 가치 ' + p.sup.toFixed(1) + '</div>';
  }
  function update(){ read(); bal(); preview(); }
  ["teword","teel","teconcept","temode","teradius","tedmg","tedtype","teint","terange","telv5"].forEach(function(id){ $(id).addEventListener("input", update); $(id).addEventListener("change", update); });
  TE_FX.forEach(function(f){ $("fx-" + f[0]).addEventListener("input", update); });
  $("temult").addEventListener("input", function(){ var m = Math.min(5, Math.max(0.1, +this.value || 1)); $("tedmg").value = +(teBaseAtk({word:$("teword").value.toUpperCase().replace(/[^A-Z]/g, "")}) * m).toFixed(1); update(); });
  $("teel").addEventListener("change", function(){ swatches(); recs(); });
  $("teword").addEventListener("change", function(){ recs(); });
  $("tepreset").onclick = function(){
    read(); var pr = TE_PRESET[TE.kind], b = teBase(TE.word.length >= 3 ? TE.word : "TOWER");
    teSetMult(TE, 1); TE.mode = pr.mode; TE.radius = pr.radius || 0; TE.fx = JSON.parse(JSON.stringify(pr.fx)); TE.interval = b.interval; TE.range = b.range;
    var rare = (TE.word.match(/[KJXQZ]/g) || []).length; if (rare) TE.fx.crit = (TE.fx.crit || 0) + 10 * rare;
    if (TE.word.length >= 7) TE.range = Math.min(4.5, TE.range + 0.5);
    if (!TE.concept) TE.concept = EL[TE.kind].n + " 속성 " + (TE_MODES.filter(function(m){ return m[0] === TE.mode; })[0][1]) + " 타워";
    var r = teBalance(TE).after; TE.mult = r.mult; TE.dmg = r.dmg; TE.fx = r.fx; TE.interval = r.interval;
    form(); bal(); toast("속성 기본 컨셉을 넣고 밸런스를 맞췄습니다.");
  };
  $("teauto").onclick = function(){
    read(); var res = teBalance(TE), a = res.before, z = res.after, rows = [];
    if (a.dmg !== z.dmg) rows.push(["공격력", a.dmg, z.dmg]); if (a.mult !== z.mult) rows.push(["배율", a.mult, z.mult]); if (teCost(a) !== teCost(z)) rows.push(["비용", teCost(a) + "G", teCost(z) + "G"]); if (a.interval !== z.interval) rows.push(["공격 간격", a.interval + "초", z.interval + "초"]);
    TE_FX.forEach(function(f){ var x = a.fx[f[0]] || 0, y = z.fx[f[0]] || 0; if (x !== y) rows.push([f[1], x + f[2], y + f[2]]); });
    rows.push(["전투력 ÷ 비용", teRatio(a).toFixed(2), teRatio(z).toFixed(2)]);
    TE.mult = z.mult; TE.dmg = z.dmg; TE.fx = z.fx; TE.interval = z.interval; form(); bal();
    $("tebaldiff").innerHTML = table(["항목","조정 전","조정 후"], rows.map(function(r){ return [r[0], String(r[1]), "<b>" + r[2] + "</b>"]; }));
  };
  /* 겹침 분석 */
  $("teov").onclick = function(){
    read(); var out = [], w = TE.word;
    var exact = WORDS.filter(function(x){ return x.w === w; })[0];
    var root = WORDS.filter(function(x){ return w !== x.w && w.indexOf(x.w) === 0 && /^(S|ES|ED|D|ING|ER|R|Y|LY|IER|IEST|EST)$/.test(w.slice(x.w.length)); })[0];
    var custom = (teDocs || []).filter(function(d){ return d.id === w; })[0];
    var wordMsg = exact ? '<span class="bad">이미 있는 특수 단어</span>입니다: <span class="word">' + exact.w + '</span> (' + EL[exact.k].n + '). 저장하면 기존 능력을 덮어쓰는 제안으로 처리됩니다.' :
      root ? '<span class="warn">파생어 규칙과 겹칩니다.</span> <span class="word">' + w + '</span>는 지금 <span class="word">' + root.w + '</span>의 능력을 물려받습니다. 별도 타워로 만들면 파생어 예외로 등록됩니다.' :
      custom ? '<span class="warn">이미 저장된 사용자 타워</span>와 같은 단어입니다. 저장하면 덮어씁니다.' : '<span class="ok">겹치는 단어가 없습니다.</span>';
    out.push('<h4>단어</h4><p>' + wordMsg + '</p>');
    var ds = WORDS.map(function(x){ return {w:x, s:designSim(TE.px, TG.get(x.w, x.k, x.L))}; }).sort(function(a,b){ return b.s - a.s; }).slice(0, 5);
    var top = ds[0].s;
    out.push('<h4>디자인 <span class="count">가장 비슷한 5개</span></h4><p>' + (top >= 0.8 ? '<span class="bad">거의 같은 디자인이 있습니다.</span> 모양이나 색을 더 바꿔 주세요.' : top >= 0.6 ? '<span class="warn">비슷한 디자인이 있습니다.</span> 구분되도록 특징을 하나 더 넣는 걸 권합니다.' : '<span class="ok">충분히 구분되는 디자인입니다.</span>') + '</p><div class="ovl">' + ds.map(function(d){ return '<figure>' + '<img src="' + towerURL(d.w.k, 3, d.w.w, d.w.L) + '" width="48" height="48" alt=""><figcaption><span class="word">' + d.w.w + '</span><br>' + Math.round(d.s * 100) + '%</figcaption></figure>'; }).join("") + '</div>');
    var mv = teVec(TE);
    var cs = WORDS.map(function(x){ var v = kwVec(x.a + " " + x.v); var s = cosine(mv, v) * 0.75 + (x.k === TE.kind ? 0.25 : 0); return {w:x, s:s}; }).sort(function(a,b){ return b.s - a.s; }).slice(0, 5);
    var ct = cs[0].s;
    out.push('<h4>능력 <span class="count">가장 비슷한 5개</span></h4><p>' + (ct >= 0.9 ? '<span class="bad">능력이 거의 같은 타워가 있습니다.</span> 고유 효과를 하나 더하거나 공격 방식을 바꿔 보세요.' : ct >= 0.7 ? '<span class="warn">비슷한 능력의 타워가 있습니다.</span>' : '<span class="ok">능력이 충분히 새롭습니다.</span>') + '</p>' +
      table(["단어","속성","능력","겹침"], cs.map(function(c){ return ['<span class="word">' + c.w.w + '</span>', chip(c.w.k), esc(c.w.a), Math.round(c.s * 100) + "%"]; })));
    var same = WORDS.filter(function(x){ return x.k === TE.kind; }).length;
    out.push('<p class="count">' + EL[TE.kind].n + ' 속성에는 지금 ' + same + '개 타워가 있습니다. 속성별 평균은 약 ' + Math.round(WORDS.length / 13) + '개입니다.</p>');
    $("teovout").innerHTML = out.join("");
  };
  /* 저장 */
  $("tenew").onclick = function(){ TE = teDefault(); TE.word = ""; TE.concept = ""; TE.px = TE.px.map(function(){ return null; }); form(); swatches(); recs(); bal(); preview(); $("tebaldiff").innerHTML = ""; toast("빈 타워로 시작합니다."); };
  $("tesave").onclick = async function(){
    read();
    if (TE.word.length < 3){ toast("단어를 영문 3글자 이상 적어 주세요."); $("teword").focus(); return; }
    if (!TE.px.some(Boolean)){ toast("디자인이 비어 있습니다. 그리거나 추천 디자인을 불러와 주세요."); return; }
    if (!teDb){ toast("이 화면에서는 저장할 수 없습니다."); return; }
    var body = {word:TE.word, kind:TE.kind, concept:TE.concept, mode:TE.mode, radius:TE.radius, dmg:TE.dmg, dtype:TE.dtype, mult:TE.mult, interval:TE.interval, range:TE.range, fx:TE.fx, lv5:TE.lv5, pixels:teEncode(TE.px), cost:teCost(TE), ratio:+teRatio(TE).toFixed(3), updatedAt:Date.now()};
    try { await teDb.collection("towers").doc(TE.word).set(body); toast("‘" + TE.word + "’ 타워를 저장했습니다."); }
    catch (e){ toast(e && e.code === "quota_exceeded" ? "저장 공간이 가득 찼습니다. 안 쓰는 타워를 지워 주세요." : "저장하지 못했습니다. 잠시 뒤 다시 눌러 주세요."); }
  };
  if ($("teimpb")) $("teimpb").onclick = function(){ var c = $("teimp").value.trim(); if (c.indexOf("WTDT1.") !== 0){ toast("WTDT1. 으로 시작하는 타워 코드가 아닙니다."); return; } try { var d = b64d(c.slice(6)); TE = towerFromData(d); render("toweredit"); window.scrollTo(0, 0); toast("‘" + TE.word + "’ 타워를 불러왔습니다" + (d.author ? " (만든 사람: " + String(d.author).slice(0, 20) + ")" : "") + ". 확인 후 저장해 주세요."); } catch (e){ toast("코드가 깨져 있어 읽을 수 없습니다."); } };
  form(); swatches(); tools(); recs(); bal(); preview();
  teConnect();
}
function teRenderSaved(){
  var box = document.getElementById("tesaved"); if (!box || !teDocs) return; box.innerHTML = "";
  if (!teDocs.length){ box.innerHTML = '<p class="count">아직 저장된 타워가 없습니다.</p>'; return; }
  teDocs.forEach(function(d){
    var t = d.data(); if (!t || !t.pixels) return;
    var px = teDecode(t.pixels), kind = EL[t.kind] ? t.kind : "plain";
    var el = document.createElement("div"); el.className = "sv";
    var c = pxCanvas(px, 4); c.style.cssText = "width:64px;height:64px;align-self:center;image-rendering:pixelated";
    var b = document.createElement("b"); b.className = "word"; b.textContent = String(t.word || d.id);
    var s = document.createElement("small"); var r = +t.ratio || 0; s.textContent = EL[kind].n + " · 비용 " + (+t.cost || 0) + "G · 밸런스 " + r.toFixed(2);
    var p = document.createElement("small"); p.textContent = String(t.concept || "");
    var row = document.createElement("div"); row.className = "row";
    var lo = document.createElement("button"); lo.className = "btn"; lo.textContent = "불러오기";
    lo.onclick = function(){ var fx = {}; if (t.fx && typeof t.fx === "object") TE_FX.forEach(function(f){ var v = +t.fx[f[0]]; if (v > 0) fx[f[0]] = Math.min(f[4], v); });
      TE = teDefault(); TE.word = String(t.word || d.id).toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12); TE.kind = kind; TE.concept = String(t.concept || ""); TE.mode = TE_MODES.some(function(m){ return m[0] === t.mode; }) ? t.mode : "single";
      TE.radius = +t.radius || 0; TE.mult = +t.mult || 1; TE.dmg = +t.dmg > 0 ? Math.min(2000, +t.dmg) : +(teBaseAtk(TE) * TE.mult).toFixed(1); TE.dtype = ["physical","magic","true"].indexOf(t.dtype) >= 0 ? t.dtype : "physical"; TE.interval = +t.interval || 1; TE.range = +t.range || 2; TE.fx = fx; TE.lv5 = String(t.lv5 || ""); TE.px = px; TE.color = EL[kind].m;
      render("toweredit"); window.scrollTo(0, 0); toast("‘" + TE.word + "’ 타워를 불러왔습니다."); };
    var del = document.createElement("button"); del.className = "btn dan"; del.textContent = "삭제"; var armed = 0;
    del.onclick = async function(){ if (Date.now() - armed > 3000){ armed = Date.now(); del.textContent = "한 번 더"; setTimeout(function(){ del.textContent = "삭제"; }, 3000); return; } try { await teDb.collection("towers").doc(d.id).delete(); toast("타워를 삭제했습니다."); } catch (e){ toast("삭제하지 못했습니다. 잠시 뒤 다시 눌러 주세요."); } };
    row.appendChild(lo); row.appendChild(del); el.appendChild(c); el.appendChild(b); el.appendChild(s); if (t.concept) el.appendChild(p); el.appendChild(row); box.appendChild(el);
  });
}
function teConnect(){
  var st = document.getElementById("tedb");
  if (teDb){ if (st) st.textContent = "저장소에 연결됨. 저장한 타워는 이 위키를 여는 사람 모두와 Claude가 볼 수 있습니다."; teRenderSaved(); return; }
  function none(){ var s = document.getElementById("tedb"), b = document.getElementById("tesaved"); if (s) s.textContent = "이 화면에서는 저장소를 쓸 수 없습니다. 디자인과 수치를 화면에 남겨 두고 채팅으로 알려 주세요."; if (b) b.innerHTML = '<p class="count">저장소에 연결되지 않아 목록을 보여 줄 수 없습니다.</p>'; }
  if (teTried){ none(); return; } teTried = true;
  if (!window.claude || !window.claude.use){ none(); return; }
  window.claude.use("db").then(function(db){
    if (!db){ none(); return; } teDb = db;
    var s = document.getElementById("tedb"); if (s) s.textContent = "저장소에 연결됨. 저장한 타워는 이 위키를 여는 사람 모두와 Claude가 볼 수 있습니다.";
    try { db.collection("towers").orderBy("updatedAt", "desc").limit(200).onSnapshot(function(snap){ teDocs = snap.docs; teRenderSaved(); }, function(){ var b = document.getElementById("tesaved"); if (b) b.innerHTML = '<p class="count">저장된 타워 목록을 불러오지 못했습니다. 페이지를 새로 고쳐 주세요.</p>'; }); } catch (e){ none(); }
  }, none);
}

function b64e(o){ return btoa(unescape(encodeURIComponent(JSON.stringify(o)))); }
function b64d(s){ return JSON.parse(decodeURIComponent(escape(atob(s)))); }
/* ---------- 타워 불러오기 ---------- */
function towerFromData(t){
  var kind = EL[t.kind] ? t.kind : "fire", fx = {};
  if (t.fx && typeof t.fx === "object") TE_FX.forEach(function(f){ var v = +t.fx[f[0]]; if (v > 0) fx[f[0]] = Math.min(f[4], v); });
  var x = teDefault();
  x.word = String(t.word || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12); x.kind = kind; x.concept = String(t.concept || "").slice(0, 300);
  x.mode = TE_MODES.some(function(m){ return m[0] === t.mode; }) ? t.mode : "single"; x.radius = Math.min(3, Math.max(0, +t.radius || 0));
  x.mult = Math.min(5, Math.max(0.1, +t.mult || 1)); x.interval = Math.min(4, Math.max(0.1, +t.interval || 1)); x.range = Math.min(7, Math.max(1, +t.range || 2));
  x.dmg = +t.dmg > 0 ? Math.min(2000, +t.dmg) : +(teBaseAtk(x) * x.mult).toFixed(1); x.dtype = ["physical","magic","true"].indexOf(t.dtype) >= 0 ? t.dtype : "physical";
  x.fx = fx; x.lv5 = String(t.lv5 || "").slice(0, 120); x.px = t.pixels ? teDecode(t.pixels) : x.px; x.color = EL[kind].m;
  return x;
}
