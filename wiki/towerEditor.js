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
function teCost(t){ return Math.round((10 + pts(t.word) * 4) * t.mult * (+t.price > 0 ? +t.price : 1)); }
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
/* 밸런스 자동 조정: 고정하지 않은 항목만 조금씩 나눠서 움직여 전투력 ÷ 비용을 1.0 근처로 맞춘다 */
var TE_LOCKS = [["interval","공격 간격"],["fx","효과"],["radius","범위 반경"],["range","사거리"]];
function teBalance(t, how){
  function clone(x){ return JSON.parse(JSON.stringify(x)); }
  var before = clone(t), cur = clone(t), lock = t.lock || {}, note = "";
  if (!(+cur.price > 0)) cur.price = 1;
  if (how === "price"){
    var p = tePower(cur).total / Math.max(1, (10 + pts(cur.word) * 4) * cur.mult);
    cur.price = +Math.min(10, Math.max(0.3, Math.round(p * 20) / 20)).toFixed(2);
    if (p > 10 || p < 0.3) note = "가격 배율 한도(0.3~10)에 걸려 완전히 맞추지 못했다.";
    return {before: before, after: cur, note: note};
  }
  var fxKeys = Object.keys(cur.fx || {}).filter(function(k){ return cur.fx[k] > 0 && ["buff","gold","heal"].indexOf(k) < 0; });
  var levers = [];
  if (cur.mode !== "aura" && !lock.interval) levers.push("interval");
  if (!lock.fx && fxKeys.length) levers.push("fx");
  if (cur.mode === "aoe" && !lock.radius) levers.push("radius");
  if (cur.mode !== "aura" && !lock.range) levers.push("range");
  if (cur.mode === "aura") levers.push("support");
  var fx0 = clone(cur.fx || {});
  for (var it = 0; it < 80 && levers.length; it++){
    var r = teRatio(cur); if (r > 0.97 && r < 1.03) break;
    var g = Math.pow(1 / r, 0.5 / levers.length);
    levers.forEach(function(L){
      if (L === "interval") cur.interval = Math.min(15, Math.max(0.15, cur.interval / g));
      if (L === "radius") cur.radius = Math.min(3, Math.max(0.3, ((1 + 1.5 * cur.radius) * g - 1) / 1.5));
      if (L === "range") cur.range = Math.min(5, Math.max(1.5, cur.range * g));
      if (L === "fx") fxKeys.forEach(function(k){ var d = TE_FX.filter(function(x){ return x[0] === k; })[0]; cur.fx[k] = Math.min(d[4], Math.max(d[5], cur.fx[k] * g)); });
      if (L === "support") ["buff","gold","heal"].forEach(function(k){ if (cur.fx[k] > 0){ var d = TE_FX.filter(function(x){ return x[0] === k; })[0]; cur.fx[k] = Math.min(d[4], Math.max(d[5], cur.fx[k] * g)); } });
    });
  }
  cur.interval = +Math.max(0.15, Math.round(cur.interval * 20) / 20).toFixed(2);
  cur.range = +(Math.round(cur.range * 4) / 4).toFixed(2);
  cur.radius = +(Math.round(cur.radius * 10) / 10).toFixed(1);
  Object.keys(cur.fx || {}).forEach(function(k){ var d = TE_FX.filter(function(x){ return x[0] === k; })[0]; if (d && cur.fx[k] > 0) cur.fx[k] = +Math.max(d[5], Math.round(cur.fx[k] / d[5]) * d[5]).toFixed(2); });
  var rr = teRatio(cur);
  if (!levers.length) note = "움직일 수 있는 항목이 없다. 고정을 풀거나 ‘가격으로 맞추기’를 써 보자.";
  else if (rr < 0.85 || rr > 1.15) note = "고정한 항목과 한도(공격 간격 0.15~15초, 사거리 1.5~6칸, 범위 0.3~3칸) 안에서는 여기까지 맞출 수 있다. 남은 차이는 ‘가격으로 맞추기’로 메우거나 고정을 풀어 보자.";
  return {before: before, after: cur, note: note};
}
function pxN(px){ return Math.round(Math.sqrt(px.length)) || 16; }
function pxResample(px, to){ var n = pxN(px); if (n === to) return px.slice(); var out = []; for (var y = 0; y < to; y++) for (var x = 0; x < to; x++) out.push(px[Math.floor(y * n / to) * n + Math.floor(x * n / to)] || null); return out; }
function teNear(pal, c){ function h(x){ return [parseInt(x.slice(1,3),16), parseInt(x.slice(3,5),16), parseInt(x.slice(5,7),16)]; } var a = h(c), bi = 0, bd = 1e9; pal.forEach(function(p, i){ var b = h(p), d = (a[0]-b[0])*(a[0]-b[0]) + (a[1]-b[1])*(a[1]-b[1]) + (a[2]-b[2])*(a[2]-b[2]); if (d < bd){ bd = d; bi = i; } }); return bi; }
function teEncode(px){ var pal = [], idx = ""; px.forEach(function(c){ if (!c){ idx += "."; return; } var i = pal.indexOf(c); if (i < 0){ if (pal.length < 62){ pal.push(c); i = pal.length - 1; } else i = teNear(pal, c); } idx += "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"[i]; }); return {pal: pal, idx: idx, n: pxN(px)}; }
function teDecode(o){ var A = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", px = [], n = [16,24,32].indexOf(+o.n) >= 0 ? +o.n : 16; for (var i = 0; i < n * n; i++){ var ch = (o.idx || "")[i]; var c = ch && ch !== "." ? o.pal[A.indexOf(ch)] : null; px.push(typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c) ? c : null); } return px; }
function pxCanvas(px, scale){ var n = pxN(px), c = document.createElement("canvas"); c.width = c.height = n * scale; var x = c.getContext("2d"); for (var i = 0; i < n * n; i++) if (px[i]){ x.fillStyle = px[i]; x.fillRect((i % n) * scale, Math.floor(i / n) * scale, scale, scale); } return c; }
function designSim(a, b){ a = pxResample(a, 16); b = pxResample(b, 16); var both = 0, either = 0, same = 0; for (var i = 0; i < 256; i++){ var p = !!a[i], q = !!b[i]; if (p || q) either++; if (p && q){ both++; if (a[i].toLowerCase() === b[i].toLowerCase()) same++; } } return either ? 0.5 * both / either + 0.5 * same / either : 0; }

PAGES.toweredit = {cats:["제작"], html:function(){
  var modes = TE_MODES.map(function(m){ return '<option value="' + m[0] + '">' + m[1] + '</option>'; }).join("");
  var els = EL_ORDER.map(function(k){ return '<option value="' + k + '">' + EL[k].n + '</option>'; }).join("");
  var fx = TE_FX.map(function(f){ return '<label class="fx"><span>' + f[1] + ' <small>' + f[6] + '</small></span><span class="fxi"><input type="number" id="fx-' + f[0] + '" min="' + f[3] + '" max="' + f[4] + '" step="' + f[5] + '" inputmode="decimal"><em>' + f[2] + '</em></span></label>'; }).join("");
  return '<p>새 특수 단어 타워의 컨셉과 픽셀 디자인을 만드는 도구다. 저장한 타워는 Claude가 읽어 게임과 도감에 넣는다. 저장한 뒤 채팅에서 "타워 저장했어"라고 알려 주면 된다.</p>' +
  '<div class="te">' +
  '<section class="te-col"><h3 class="te-h">픽셀 디자인 <small id="tesizelbl">16 × 16</small></h3><p class="te-desc">타워의 생김새를 한 칸씩 칠한다. 게임에서는 작게 보이므로 굵은 실루엣과 속성 색 한두 가지가 눈에 잘 띈다. 아래쪽 두세 줄은 받침대로 남겨 두면 단어 띠와 잘 어울린다.</p>' +
  '<div class="row" style="gap:8px"><label class="field" style="flex:1 1 120px">해상도 (칸 수)<select id="tes"><option value="16">16 × 16 (기본)</option><option value="24">24 × 24</option><option value="32">32 × 32 (세밀)</option></select><small class="hint">칸이 많을수록 세밀하지만 게임 안에서는 같은 크기로 줄어든다</small></label><label class="field" style="flex:1 1 120px">칸 크기 (확대)<select id="tez"><option value="240">작게</option><option value="320">보통</option><option value="420">크게</option><option value="560">아주 크게</option></select><small class="hint">그리기 편하게 격자 화면만 키운다</small></label></div><div class="tecwrap"><canvas id="tec" width="384" height="384" aria-label="타워 픽셀 편집 격자"></canvas></div>' +
  '<div class="row te-tools" id="tetools"><button class="btn on" data-t="pen">펜</button><button class="btn" data-t="erase">지우개</button><button class="btn" data-t="fill">채우기</button><button class="btn" data-t="pick">스포이드</button><button class="btn" id="temir" aria-pressed="false">좌우 대칭</button></div>' +
  '<p class="te-desc"><b>펜</b> 한 칸씩 칠하기 · <b>지우개</b> 칸 비우기 · <b>채우기</b> 같은 색으로 이어진 영역 한 번에 칠하기 · <b>스포이드</b> 칠한 칸이나 밑그림에서 색 집어 오기 · <b>좌우 대칭</b> 한쪽을 칠하면 반대쪽도 똑같이 칠해짐</p><div class="swatches" id="tesw"></div><p class="te-desc">앞의 세 색은 고른 속성의 기본·밝은·어두운 색이고, 그 뒤는 돌, 먹, 포인트 색이다.</p><h3 class="te-h">이미지에서 색 가져오기</h3><p class="te-desc">참고할 그림을 올리면 격자 뒤에 <b>밑그림</b>으로 깔리고, 그림에 쓰인 색을 뽑아 <b>팔레트</b>로 만들어 준다. 밑그림을 따라 펜으로 칠하고, <b>스포이드</b>로 밑그림을 누르면 그 자리 색을 바로 집는다.</p><label class="drop" id="tedrop"><input type="file" id="tefile" accept="image/*" hidden><b>이미지를 여기에 끌어다 놓거나 눌러서 고르기</b><small>PNG·JPG·GIF·WEBP · 휴대폰은 눌러서 사진첩에서 고르기</small></label><div class="row" style="gap:6px"><button class="btn" id="tepaste" type="button">복사한 이미지 붙여넣기</button><span class="count" id="teimgst"></span></div><div class="pastebox" id="tepastebox" contenteditable="true" hidden aria-label="이미지 붙여넣기 칸">이 칸을 길게 누르고 ‘붙여넣기’를 고르세요</div><div id="terefbox" hidden><div class="row" style="gap:8px;align-items:flex-end"><label class="chk"><input type="checkbox" id="teref" checked> 밑그림 보이기</label><label class="field" style="flex:1 1 120px">밑그림 진하기<input type="range" id="terefo" min="10" max="90" value="45"></label><label class="field" style="flex:1 1 120px">밑그림 크기<input type="range" id="terefs" min="40" max="250" value="100"></label></div><div class="row" style="gap:8px;align-items:flex-end"><label class="field" style="flex:1 1 120px">좌우 위치<input type="range" id="terefx" min="-50" max="50" value="0"></label><label class="field" style="flex:1 1 120px">위아래 위치<input type="range" id="terefy" min="-50" max="50" value="0"></label></div><div class="row" style="gap:8px;align-items:flex-end"><label class="field" style="flex:0 1 110px">뽑을 색 수<select id="tecols"><option>6</option><option selected>10</option><option>16</option><option>24</option></select></label><label class="chk"><input type="checkbox" id="tenobg" checked> 배경색 빼기</label><button class="btn" id="terefclr" type="button">밑그림 치우기</button></div><b style="font-size:13px">그림에서 뽑은 색</b><div class="swatches" id="teimgpal"></div><p class="te-desc">색을 누르면 그 색으로 펜이 바뀐다. 이미 칠한 칸에서 스포이드를 쓰면 칠한 색을, 빈 칸에서 쓰면 밑그림 색을 집는다.</p></div>' +
  '<div class="row" style="gap:6px"><label class="field" style="flex-direction:row;align-items:center;gap:8px">직접 고르기<input type="color" id="tecol" value="#f08a24" style="width:48px;min-height:36px;padding:2px"></label><button class="btn" id="teundo">되돌리기</button><button class="btn" id="teclear">비우기</button></div>' +
  '<h3 class="te-h">인게임 미리보기</h3><p class="te-desc">왼쪽은 실제 게임 칸 크기, 오른쪽은 크게 본 모습이다. 칸 크기에서도 무슨 타워인지 알아볼 수 있는지 확인하자. 단어 띠의 아래 테두리 색은 속성 색이다.</p><div class="te-prev"><div class="board" style="aspect-ratio:3/2;max-width:200px"><canvas id="teprevbg"></canvas><div class="bt" style="left:33.33%;top:0;width:33.33%;height:50%"><img id="teprev" alt="미리보기"><span class="plate" id="teplate">WORD</span></div></div><div class="tcell" id="tebig"></div></div>' +
  '<h3 class="te-h">디자인 자동 추천</h3><p class="te-desc">고른 속성의 기존 단어 아이콘 8개를 후보로 보여 준다 (단어가 이미 목록에 있으면 그 아이콘이 첫 번째). 마음에 드는 것을 눌러 불러온 뒤, 새 단어 뜻에 맞게 고쳐 그리면 된다. 아래 네 줄은 공통 받침대이니 그대로 두고 위쪽 아이콘만 고치면 된다. ‘다른 후보 보기’로 계속 넘겨 볼 수 있다.</p><div class="recs" id="terecs"></div><button class="btn" id="temore">다른 후보 보기</button>' +
  '</section>' +
  '<section class="te-col"><h3 class="te-h">컨셉</h3><p class="te-desc">타워의 정체성. 단어 뜻과 능력이 바로 이어질수록 좋다. 예: ANCHOR(닻)는 적을 붙잡아 멈추게 한다.</p>' +
  '<div class="row" style="gap:8px"><label class="field" style="flex:1 1 150px">단어 (영문 3~12자)<input id="teword" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false"><small class="hint">실존하는 영단어. 글자 점수가 공격력과 비용의 기준이 된다</small></label><label class="field" style="flex:1 1 130px">한글 이름 (1~8자)<input id="teko" maxlength="8" autocomplete="off" spellcheck="false" lang="ko"><small class="hint">한글 모드에서 이 단어를 치면 같은 타워가 된다. 예: ANCHOR → 닻</small></label><label class="field" style="flex:1 1 120px">속성<select id="teel">' + els + '</select><small class="hint"><span id="teelhint"></span></small></label></div>' +
  '<label class="field">컨셉 설명<textarea id="teconcept" rows="2" maxlength="300" placeholder="예: 별의 핵이 폭발하듯 일직선을 꿰뚫는 광선"></textarea><small class="hint">한두 문장으로 어떤 타워인지 적는다. 겹침 분석에도 쓰인다</small></label>' +
  '<div class="row" style="gap:8px"><label class="field" style="flex:1 1 140px">공격 방식<select id="temode">' + modes + '</select><small class="hint"><span id="temodehint"></span></small></label><label class="field" style="flex:1 1 90px">범위 반경 (칸)<input type="number" id="teradius" min="0" max="3" step="0.1" inputmode="decimal"><small class="hint">범위 공격일 때만 쓴다. 맞은 지점에서 이 거리 안의 적이 모두 맞는다</small></label></div>' +
  '<div class="row" style="gap:8px"><label class="field" style="flex:1 1 110px">공격력 (1회 피해)<input type="number" id="tedmg" min="1" max="2000" step="0.5" inputmode="decimal"><small class="hint">한 번 맞힐 때 주는 피해. 올리면 비용도 같이 오른다</small></label><label class="field" style="flex:1 1 110px">피해 종류<select id="tedtype"><option value="physical">물리 (방어력 영향)</option><option value="magic">마법 (마법 저항 영향)</option><option value="true">고정 (저항 무시)</option></select><small class="hint">셸처럼 단단한 적은 물리에, 고스트는 마법에 강하다</small></label></div><div class="row" style="gap:8px"><label class="field" style="flex:1 1 90px">배율 (= 비용 배율)<input type="number" id="temult" min="0.1" max="5" step="0.05" inputmode="decimal"><small class="hint">단어 공식 공격력 대비 비율. 이 값이 비용에 곱해진다</small></label><label class="field" style="flex:1 1 90px">공격 간격 (초)<input type="number" id="teint" min="0.1" max="15" step="0.05" inputmode="decimal"><small class="hint">공격과 공격 사이 시간. 작을수록 빠르다</small></label><label class="field" style="flex:1 1 90px">사거리 (칸)<input type="number" id="terange" min="1" max="7" step="0.25" inputmode="decimal"><small class="hint">타워 중심에서 공격이 닿는 거리 (1칸 = 격자 한 칸)</small></label></div>' +
  '<p class="count" id="tebase" style="margin:0"></p>' +
  '<details class="fold" open><summary>효과</summary><p class="te-desc" style="padding-top:8px">공격에 붙는 추가 능력. 비워 두면 없음. 숫자가 클수록 전투력이 오르니 밸런스 칸을 보며 조절하자. 여러 개를 섞으면 원소 반응과 어울리는 개성 있는 타워가 된다.</p><div class="fxs">' + fx + '</div></details>' +
  '<label class="field">★Lv5 강화<input id="telv5" maxlength="120" placeholder="예: 광선 2줄"><small class="hint">같은 단어를 합성해 5레벨이 되면 얻는 추가 효과</small></label>' +
  '<div class="row" style="gap:6px"><button class="btn" id="tepreset">속성 기본 컨셉 추천</button></div><p class="te-desc">고른 속성의 대표적인 공격 방식과 효과를 채우고 밸런스까지 맞춘다. 희귀 글자(K, J, X, Q, Z)가 들어가면 치명타를, 7글자 이상이면 사거리를 더 준다.</p>' +
  '<h3 class="te-h">밸런스</h3><p class="te-desc">전투력(초당 피해 × 공격 방식 × 사거리 × 효과 + 지원 효과)을 건설 비용과 비교한다. 0.85~1.15가 <b>적정</b>, 낮으면 <b>약함</b>, 높으면 <b>강함</b>. <b>능력으로 맞추기</b>는 고정하지 않은 항목(공격 간격, 효과, 범위, 사거리)을 조금씩 나눠 움직이고, <b>가격으로 맞추기</b>는 능력은 그대로 두고 비용만 바꾼다. 무엇이 바뀌었는지 표로 보여 준다.</p><div class="bal" id="tebal"></div><div class="row locks" id="telocks"><b style="font-size:13px">자동 조정에서 고정:</b>' + TE_LOCKS.map(function(l){ return '<label class="chk"><input type="checkbox" data-lock="' + l[0] + '"> ' + l[1] + '</label>'; }).join("") + '</div><p class="te-desc">컨셉에 꼭 필요한 값은 체크해서 고정하자. 예: 미니건처럼 연사가 핵심이면 ‘공격 간격’ 고정. 공격력은 비용과 함께 오르내리므로 밸런스 판정에는 영향이 없다.</p><div class="row" style="gap:8px;align-items:flex-end"><label class="field" style="flex:0 1 160px">가격 배율<input type="number" id="teprice" min="0.3" max="10" step="0.05" inputmode="decimal"><small class="hint">능력은 그대로 두고 건설 비용만 곱한다</small></label></div><div class="row" style="gap:6px"><button class="btn pri" id="teauto">능력으로 맞추기</button><button class="btn" id="teautop">가격으로 맞추기</button></div><div id="tebaldiff"></div>' +
  '<h3 class="te-h">겹침 분석</h3><p class="te-desc">기존 타워와 세 가지를 비교한다. <b>단어</b>: 이미 있는 단어나 파생어(FIRE → FIRED)인지. <b>디자인</b>: 픽셀 모양과 색이 비슷한 타워. <b>능력</b>: 효과와 속성이 비슷한 타워. 60~70% 이상이면 차별점을 하나 더 넣는 걸 권한다.</p><div class="row" style="gap:6px"><button class="btn" id="teov">기존 타워와 비교</button></div><div id="teovout"><p class="count">단어, 디자인, 능력이 기존 ' + WORDS.length + '개 타워와 얼마나 겹치는지 검사한다.</p></div>' +
  '<h3 class="te-h">저장</h3><p class="te-desc">저장하면 위키 저장소에 들어가 Claude가 읽을 수 있다. 같은 단어로 다시 저장하면 덮어쓴다.</p><div class="row" style="gap:6px"><button class="btn pri" id="tesave">타워 저장</button><button class="btn" id="tenew">새 타워</button></div><p class="count" id="tedb" style="margin:0"></p>' +
  '</section></div>' +
  '<h2>테스터 제출 코드 불러오기</h2><p>크리에이터 페이지에서 받은 WTDT1. 코드를 붙여 넣으면 편집기로 불러온다. 확인한 뒤 타워 저장을 누르면 저장소에 들어간다.</p><div class="row"><input class="inp" id="teimp" placeholder="WTDT1.…" style="flex:1 1 260px" aria-label="타워 제출 코드"><button class="btn" id="teimpb">불러오기</button></div>' +
  '<h2>저장된 타워</h2><div class="saved" id="tesaved"><p class="count">저장된 타워를 불러오는 중입니다.</p></div>' +
  '<h2>밸런스 계산 방식</h2><ul><li><b>공격력</b>은 직접 정한다. 단어의 공식 공격력(글자 점수 합 × 3 × (1 + 0.15 × (글자 수 − 3)))과 비교한 비율이 <b>배율</b>이 되고, 배율이 곧 비용 배율이다. 공격력을 올리면 비용도 오른다. 배율 칸을 고치면 공격력이 거꾸로 맞춰진다. 공격 간격과 사거리 기본값은 ' + link("words","기본 스탯 공식") + '을 따른다.</li><li><b>전투력</b> = 초당 피해 × 공격 방식 계수 × √(사거리 / 2.5) × (1 + 효과 가치) + 지원 가치.</li><li>효과 가치: 화상 1%당 0.03, 둔화 0.012, 기절 0.01, 연쇄 1회 0.45, 독 1중첩 0.15, 넉백 1칸 0.8, 즉사 1%당 0.03, 방어 무시 0.004, 치명타 0.01.</li><li>지원 가치: 주변 강화 1%당 3.2 × √배율, 골드 1G당 5, 생명 회복 1당 55 (KING, COIN, HEAL 기준으로 맞춤).</li><li><b>적정 기준</b>: 전투력 ÷ 건설 비용이 0.85~1.15. 기존 타워 FIRE가 약 0.96이다.</li><li><b>능력으로 맞추기</b>: 고정하지 않은 항목을 한꺼번에 조금씩 움직여 0.97~1.03에 맞춘다. 한도는 공격 간격 0.15~15초, 사거리 1.5~5칸, 범위 0.3~3칸. 효과는 이미 있는 것만 비율대로 줄이거나 늘리고, 새 효과를 더하거나 1%짜리로 잘게 쪼개지 않는다. 공격력은 비용과 함께 오르내려 판정에 영향이 없으므로 건드리지 않는다. 사거리는 기본으로 고정된다.</li><li><b>가격으로 맞추기</b>: 능력은 그대로 두고 가격 배율(0.3~10배)을 바꿔 비용을 맞춘다. "강하지만 비싼" 타워를 만들 때 쓴다. 예: 공격 간격을 고정한 미니건은 능력만으로 5.2까지 내려오고, 나머지는 가격 ×5.4로 맞춘다.</li><li>건설 비용 = (10 + 글자 점수 합 × 4) × 배율 × 가격 배율.</li></ul>';
}, after:function(){ teInit(); }};

var TE = null, teDb = null, teDocs = null, teTried = false, teRecSalt = 0;
function teDefault(){ return {word:"QUASAR", ko:"퀘이사", kind:"light", concept:"별의 핵이 폭발하듯 일직선을 꿰뚫는 광선", mode:"pierce", radius:0, mult:1.2, dmg:+(teBase("QUASAR").atk * 1.2).toFixed(1), dtype:"magic", interval:1.8, range:teBase("QUASAR").range, fx:{crit:10, slow:10}, lv5:"광선 2줄", px:(TG.icon("NOVA","light",false) || TG.make("QUASAR","light",false,0)).slice(), undo:[], tool:"pen", color:"#ffe680", mirror:false, price:1, lock:{range:true}, zoom:320}; }
function teInit(){
  if (!TE) TE = teDefault();
  var cv = document.getElementById("tec"), ctx = cv.getContext("2d");
  var $ = function(id){ return document.getElementById(id); };
  function N(){ return pxN(TE.px); }
  function grid(){ var n = N(), c = 384 / n, x, y; ctx.clearRect(0,0,384,384); for (y = 0; y < n; y++) for (x = 0; x < n; x++){ ctx.fillStyle = (x + y) % 2 ? "#c9ccd3" : "#bfc2ca"; ctx.fillRect(x*c, y*c, c, c); }
    if (ref && $("teref").checked){ ctx.globalAlpha = +$("terefo").value / 100; ctx.drawImage(refC, 0, 0); ctx.globalAlpha = 1; }
    for (y = 0; y < n; y++) for (x = 0; x < n; x++) if (TE.px[y*n+x]){ ctx.fillStyle = TE.px[y*n+x]; ctx.fillRect(x*c, y*c, c, c); }
    if (TE.mirror){ ctx.fillStyle = "rgba(53,82,201,.6)"; ctx.fillRect(191, 0, 2, 384); }
    $("tesizelbl").textContent = n + " × " + n; }
  function preview(){
    grid();
    var url = pxCanvas(TE.px, Math.max(1, Math.round(64 / N()))).toDataURL(); $("teprev").src = url; $("teplate").textContent = TE.word || "WORD"; $("teplate").style.borderColor = EL[TE.kind].m;
    $("tebig").innerHTML = '<img src="' + url + '" width="96" height="96" alt="" style="image-rendering:pixelated;width:96px;height:96px"><span class="plate" style="border-color:' + EL[TE.kind].m + '">' + esc(TE.word || "WORD") + '</span>';
  }
  drawMap($("teprevbg"), ["...","..."], 32, 0);
  function swatches(){
    var e = EL[TE.kind], cols = [e.m, e.l, e.d, "#a7acb8", "#7d8392", "#555a68", "#262a36", "#ffffff", "#f0c14a", "#e8504a", "#3fc8e0", "#a77bff", "#4cc35a", "#7a4a2a", "#f4ead2"];
    $("tesw").innerHTML = cols.map(function(c){ return '<button class="sw' + (c === TE.color ? ' on' : '') + '" data-c="' + c + '" style="background:' + c + '" aria-label="색 ' + c + '"></button>'; }).join("");
  }
  function snap(){ TE.undo.push(TE.px.slice()); if (TE.undo.length > 80) TE.undo.shift(); }
  function setPx(i, c){ var n = N(); TE.px[i] = c; if (TE.mirror){ var x = i % n, y = Math.floor(i / n); TE.px[y*n + n - 1 - x] = c; } }
  function fill(i, c){ var n = N(), t = TE.px[i]; if (t === c) return; var st = [i], seen = {}; while (st.length){ var k = st.pop(); if (seen[k] || TE.px[k] !== t) continue; seen[k] = 1; TE.px[k] = c; var x = k % n, y = Math.floor(k / n); if (x > 0) st.push(k-1); if (x < n-1) st.push(k+1); if (y > 0) st.push(k-n); if (y < n-1) st.push(k+n); } }
  function at(e){ var n = N(), r = cv.getBoundingClientRect(); var x = Math.floor((e.clientX - r.left) / r.width * n), y = Math.floor((e.clientY - r.top) / r.height * n); return x < 0 || y < 0 || x >= n || y >= n ? -1 : y * n + x; }
  var down = false;
  function act(e, first){ var i = at(e); if (i < 0) return;
    if (TE.tool === "pick"){ var pc = TE.px[i] || refAt(i); if (pc){ TE.color = pc; $("tecol").value = TE.color; swatches(); TE.tool = "pen"; tools(); } return; }
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
  $("teundo").onclick = function(){ if (TE.undo.length){ TE.px = TE.undo.pop(); $("tes").value = N(); preview(); } };
  /* 해상도와 확대 */
  function zoom(){ cv.style.maxWidth = (TE.zoom || 320) + "px"; $("tez").value = TE.zoom || 320; }
  $("tes").value = N(); zoom();
  $("tes").onchange = function(){ var to = +this.value; if (to === N()) return; snap(); TE.px = pxResample(TE.px, to); preview(); toast(to + " × " + to + " 격자로 바꿨습니다. 되돌리기로 이전 크기로 돌아갈 수 있습니다."); };
  $("tez").onchange = function(){ TE.zoom = +this.value; zoom(); };
  /* 이미지에서 색 가져오기: 밑그림 + 팔레트 */
  var ref = null, refC = document.createElement("canvas"); refC.width = refC.height = 384; var rctx = refC.getContext("2d", {willReadFrequently: true});
  function hex(r, g, b){ return "#" + [r, g, b].map(function(v){ return ("0" + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }).join(""); }
  function layRef(){ rctx.clearRect(0, 0, 384, 384); if (!ref) return; var s = Math.min(384 / ref.width, 384 / ref.height) * (+$("terefs").value / 100), w = ref.width * s, h = ref.height * s;
    rctx.imageSmoothingEnabled = true; rctx.drawImage(ref, (384 - w) / 2 + +$("terefx").value * 3.84, (384 - h) / 2 + +$("terefy").value * 3.84, w, h); }
  function refAt(i){ if (!ref) return null; var n = N(), c = 384 / n, x = (i % n) * c, y = Math.floor(i / n) * c, d = rctx.getImageData(Math.floor(x), Math.floor(y), Math.max(1, Math.floor(c)), Math.max(1, Math.floor(c))).data, r = 0, g = 0, b = 0, k = 0;
    for (var j = 0; j < d.length; j += 4) if (d[j+3] > 100){ r += d[j]; g += d[j+1]; b += d[j+2]; k++; } return k ? hex(r / k, g / k, b / k) : null; }
  function refPalette(){ if (!ref) return; var S = 72, oc = document.createElement("canvas"); oc.width = oc.height = S; var o = oc.getContext("2d", {willReadFrequently: true}), sc = Math.min(S / ref.width, S / ref.height);
    o.drawImage(ref, (S - ref.width * sc) / 2, (S - ref.height * sc) / 2, ref.width * sc, ref.height * sc); var d = o.getImageData(0, 0, S, S).data, pts = [], bg = null;
    if ($("tenobg").checked){ var cnt = {}, best = 0; for (var e = 0; e < S; e++) [[e, 0], [e, S-1], [0, e], [S-1, e]].forEach(function(p){ var q = (p[1] * S + p[0]) * 4; if (d[q+3] < 100) return; var key = (d[q] >> 4) + "," + (d[q+1] >> 4) + "," + (d[q+2] >> 4); cnt[key] = (cnt[key] || 0) + 1; if (cnt[key] > best){ best = cnt[key]; bg = [d[q], d[q+1], d[q+2]]; } }); if (best < S * 0.6) bg = null; }
    for (var j = 0; j < d.length; j += 4){ if (d[j+3] < 100) continue; if (bg && Math.abs(d[j] - bg[0]) + Math.abs(d[j+1] - bg[1]) + Math.abs(d[j+2] - bg[2]) < 60) continue; pts.push([d[j], d[j+1], d[j+2]]); }
    if (!pts.length){ $("teimgpal").innerHTML = '<span class="count">뽑을 색이 없습니다. ‘배경색 빼기’를 꺼 보세요.</span>'; return; }
    var K = Math.min(+$("tecols").value, pts.length), cen = [], used = {}; cen.push(pts[0]);
    while (cen.length < K){ var far = -1, fi = 0; for (var a = 0; a < pts.length; a += 3){ var md = 1e9; for (var c2 = 0; c2 < cen.length; c2++){ var dd = Math.pow(pts[a][0]-cen[c2][0],2) + Math.pow(pts[a][1]-cen[c2][1],2) + Math.pow(pts[a][2]-cen[c2][2],2); if (dd < md) md = dd; } if (md > far){ far = md; fi = a; } } if (far < 300) break; cen.push(pts[fi].slice()); }
    var asg = new Array(pts.length);
    for (var it = 0; it < 8; it++){ var sum = cen.map(function(){ return [0, 0, 0, 0]; }); pts.forEach(function(p, pi){ var bi = 0, bd = 1e9; cen.forEach(function(cc, ci){ var dd = Math.pow(p[0]-cc[0],2) + Math.pow(p[1]-cc[1],2) + Math.pow(p[2]-cc[2],2); if (dd < bd){ bd = dd; bi = ci; } }); asg[pi] = bi; var s2 = sum[bi]; s2[0] += p[0]; s2[1] += p[1]; s2[2] += p[2]; s2[3]++; }); cen = cen.map(function(cc, ci){ var s2 = sum[ci]; return s2[3] ? [s2[0]/s2[3], s2[1]/s2[3], s2[2]/s2[3], s2[3]] : [cc[0], cc[1], cc[2], 0]; }); }
    var cols = cen.filter(function(cc){ return cc[3] > 0; }).sort(function(a2, b2){ return b2[3] - a2[3]; }).map(function(cc){ return hex(cc[0], cc[1], cc[2]); }).filter(function(h){ if (used[h]) return false; used[h] = 1; return true; });
    $("teimgpal").innerHTML = cols.map(function(h){ return '<button class="sw" data-c="' + h + '" style="background:' + h + '" aria-label="색 ' + h + '"></button>'; }).join("");
    $("teimgst").textContent = "밑그림을 깔고 색 " + cols.length + "개를 뽑았습니다"; }
  function setRef(im){ ref = im; $("terefbox").hidden = false; $("tepastebox").hidden = true; layRef(); refPalette(); grid(); toast("밑그림을 깔았습니다. 뽑은 색으로 따라 그려 보세요."); }
  function loadFile(f){ if (!f || !/^image\//.test(f.type)){ toast("이미지 파일만 쓸 수 있습니다 (PNG, JPG, GIF, WEBP)."); return; } if (f.size > 15 * 1024 * 1024){ toast("파일이 너무 큽니다 (15MB 이하)."); return; } loadURL(URL.createObjectURL(f)); }
  function loadURL(u){ var im = new Image(); im.onload = function(){ setRef(im); }; im.onerror = function(){ toast("이미지를 읽지 못했습니다. 다른 파일로 해 보세요."); }; im.src = u; }
  $("tefile").onchange = function(){ loadFile(this.files[0]); this.value = ""; };
  ["tedrop", "tec"].forEach(function(id){ var el = $(id);
    el.addEventListener("dragover", function(e){ e.preventDefault(); $("tedrop").classList.add("over"); });
    el.addEventListener("dragleave", function(){ $("tedrop").classList.remove("over"); });
    el.addEventListener("drop", function(e){ e.preventDefault(); $("tedrop").classList.remove("over"); var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) loadFile(f); }); });
  /* 붙여넣기: PC는 Ctrl+V, 휴대폰은 버튼(클립보드 읽기) → 안 되면 길게 눌러 붙여넣는 칸 */
  function pasteEvt(e){ var items = (e.clipboardData && e.clipboardData.items) || []; for (var i = 0; i < items.length; i++) if (items[i].type.indexOf("image") === 0){ e.preventDefault(); var f = items[i].getAsFile(); if (f){ loadFile(f); return true; } } return false; }
  if (!window.__tePaste){ window.__tePaste = 1; document.addEventListener("paste", function(e){ if (!document.getElementById("tec") || e.target.id === "tepastebox") return; var fn = window.__tePasteEvt; if (fn) fn(e); }); }
  window.__tePasteEvt = pasteEvt;
  var pb = $("tepastebox");
  pb.addEventListener("paste", function(e){ if (pasteEvt(e)) return; setTimeout(function(){ var img = pb.querySelector("img"); if (img && img.src){ loadURL(img.src); } else toast("붙여넣은 것 중에 이미지가 없습니다."); pb.innerHTML = "이 칸을 길게 누르고 ‘붙여넣기’를 고르세요"; }, 60); });
  pb.addEventListener("focus", function(){ pb.textContent = ""; });
  $("tepaste").onclick = function(){
    function fallback(){ pb.hidden = false; pb.focus(); toast("아래 칸을 길게 누르고 ‘붙여넣기’를 고르세요."); }
    if (!navigator.clipboard || !navigator.clipboard.read){ fallback(); return; }
    navigator.clipboard.read().then(function(list){ for (var i = 0; i < list.length; i++){ var t = list[i].types.filter(function(x){ return x.indexOf("image") === 0; })[0]; if (t) return list[i].getType(t).then(function(bl){ loadFile(new File([bl], "paste", {type: bl.type || t})); }); } toast("클립보드에 이미지가 없습니다. 이미지를 먼저 복사하세요."); }).catch(fallback); };
  ["terefo","teref"].forEach(function(id){ $(id).addEventListener("input", grid); $(id).addEventListener("change", grid); });
  ["terefs","terefx","terefy"].forEach(function(id){ $(id).addEventListener("input", function(){ layRef(); grid(); }); });
  ["tecols","tenobg"].forEach(function(id){ $(id).addEventListener("change", refPalette); });
  $("terefclr").onclick = function(){ ref = null; layRef(); $("terefbox").hidden = true; $("teimgst").textContent = ""; grid(); };
  $("teimgpal").addEventListener("click", function(e){ var b = e.target.closest("[data-c]"); if (!b) return; TE.color = b.getAttribute("data-c"); $("tecol").value = TE.color; if (TE.tool === "erase" || TE.tool === "pick") TE.tool = "pen"; tools(); swatches(); [].forEach.call(this.querySelectorAll(".sw"), function(s){ s.classList.toggle("on", s === b); }); });
  var clr = 0; $("teclear").onclick = function(){ var b = this; if (Date.now() - clr > 3000){ clr = Date.now(); b.textContent = "한 번 더 누르면 비움"; setTimeout(function(){ b.textContent = "비우기"; }, 3000); return; } snap(); TE.px = TE.px.map(function(){ return null; }); b.textContent = "비우기"; clr = 0; preview(); };
  function recs(){
    var w = TE.word.length >= 3 ? TE.word : "TOWER", box = $("terecs"); box.innerHTML = "";
    var cands = [], own = TG.icon(w, TE.kind, false), kw = WORDS.filter(function(x){ return TE.ko && x.ko === TE.ko; })[0];
    if (own) cands.push({w: w, g: own});
    if (kw && kw.w !== w) cands.push({w: kw.w, g: TG.icon(kw.w, TE.kind, false)});
    var pool = WORDS.filter(function(x){ return x.k === TE.kind && !x.L && x.w !== w; });
    var h = 0; for (var i = 0; i < w.length; i++) h = (h * 31 + w.charCodeAt(i)) >>> 0;
    var start = (h + teRecSalt * 8) % Math.max(1, pool.length);
    for (var j = 0; cands.length < 8 && j < pool.length; j++){ var p = pool[(start + j * 7) % pool.length]; if (!cands.some(function(c){ return c.w === p.w; })) cands.push({w: p.w, g: TG.icon(p.w, TE.kind, false)}); }
    cands.forEach(function(c, s){ if (!c.g) return; var b = document.createElement("button"); b.className = "rec"; b.title = c.w + " 아이콘에서 시작"; b.setAttribute("aria-label", c.w + " 아이콘을 바탕으로 시작"); b.appendChild(pxCanvas(c.g, 3)); var sm = document.createElement("small"); sm.textContent = c.w; b.appendChild(sm); b.onclick = function(){ snap(); TE.px = pxResample(c.g, N()); preview(); toast(c.w + " 아이콘을 불러왔습니다. 단어에 맞게 고쳐 보세요."); }; box.appendChild(b); });
  }
  $("temore").onclick = function(){ teRecSalt++; recs(); };
  /* 컨셉 폼 */
  function form(){
    $("teprice").value = +TE.price > 0 ? TE.price : 1; [].forEach.call(document.querySelectorAll("#telocks [data-lock]"), function(c){ c.checked = !!(TE.lock || {})[c.getAttribute("data-lock")]; });
    $("teword").value = TE.word; $("teko").value = TE.ko || ""; $("teel").value = TE.kind; $("teconcept").value = TE.concept; $("temode").value = TE.mode; $("teradius").value = TE.radius;
    $("temult").value = TE.mult; $("tedmg").value = TE.dmg; $("tedtype").value = TE.dtype || "physical"; $("teint").value = TE.interval; $("terange").value = TE.range; $("telv5").value = TE.lv5;
    TE_FX.forEach(function(f){ $("fx-" + f[0]).value = TE.fx[f[0]] || ""; });
    $("teradius").disabled = TE.mode !== "aoe"; hints();
  }
  function hints(){ $("temodehint").textContent = TE_MODE_D[TE.mode] || ""; $("teelhint").textContent = "기본 효과: " + EL[TE.kind].e; }
  function read(){
    TE.word = $("teword").value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12); $("teword").value = TE.word;
    if (document.activeElement !== $("teko")) { TE.ko = $("teko").value.replace(/[^가-힣]/g, "").slice(0, 8); } else { TE.ko = $("teko").value.replace(/\s/g, "").slice(0, 8); }
    TE.kind = $("teel").value; TE.concept = $("teconcept").value; TE.mode = $("temode").value; TE.radius = +$("teradius").value || 0;
    TE.price = Math.min(10, Math.max(0.3, +$("teprice").value || 1)); TE.lock = {}; [].forEach.call(document.querySelectorAll("#telocks [data-lock]"), function(c){ if (c.checked) TE.lock[c.getAttribute("data-lock")] = true; });
    TE.dtype = $("tedtype").value; TE.dmg = Math.min(2000, Math.max(1, +$("tedmg").value || 1)); TE.mult = +(TE.dmg / teBaseAtk(TE)).toFixed(2); if (document.activeElement !== $("temult")) $("temult").value = TE.mult; TE.interval = Math.min(15, Math.max(0.1, +$("teint").value || 1)); TE.range = Math.min(7, Math.max(1, +$("terange").value || 2)); TE.lv5 = $("telv5").value;
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
  ["teprice","teword","teko","teel","teconcept","temode","teradius","tedmg","tedtype","teint","terange","telv5"].forEach(function(id){ $(id).addEventListener("input", update); $(id).addEventListener("change", update); });
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
    var r = teBalance(TE).after; TE.fx = r.fx; TE.interval = r.interval; TE.range = r.range; TE.radius = r.radius;
    form(); bal(); toast("속성 기본 컨셉을 넣고 밸런스를 맞췄습니다.");
  };
  function applyBal(how){
    read(); var res = teBalance(TE, how), a = res.before, z = res.after, rows = [];
    if (a.interval !== z.interval) rows.push(["공격 간격", a.interval + "초", z.interval + "초"]);
    if (a.range !== z.range) rows.push(["사거리", a.range + "칸", z.range + "칸"]);
    if (a.radius !== z.radius) rows.push(["범위 반경", a.radius + "칸", z.radius + "칸"]);
    TE_FX.forEach(function(f){ var x = (a.fx || {})[f[0]] || 0, y = (z.fx || {})[f[0]] || 0; if (x !== y) rows.push([f[1], x + f[2], y + f[2]]); });
    if ((+a.price || 1) !== (+z.price || 1)) rows.push(["가격 배율", "×" + (+a.price || 1), "×" + z.price]);
    if (teCost(a) !== teCost(z)) rows.push(["비용", teCost(a) + "G", teCost(z) + "G"]);
    rows.push(["전투력 ÷ 비용", teRatio(a).toFixed(2), teRatio(z).toFixed(2)]);
    TE.interval = z.interval; TE.range = z.range; TE.radius = z.radius; TE.fx = z.fx; TE.price = z.price; form(); bal();
    $("tebaldiff").innerHTML = table(["항목","조정 전","조정 후"], rows.map(function(r){ return [r[0], String(r[1]), "<b>" + r[2] + "</b>"]; })) + (res.note ? '<p class="te-desc">' + esc(res.note) + '</p>' : '');
  }
  $("teauto").onclick = function(){ applyBal("ability"); };
  $("teautop").onclick = function(){ applyBal("price"); };

  /* 겹침 분석 */
  $("teov").onclick = function(){
    read(); var out = [], w = TE.word;
    var exact = WORDS.filter(function(x){ return x.w === w; })[0];
    var root = WORDS.filter(function(x){ return w !== x.w && w.indexOf(x.w) === 0 && /^(S|ES|ED|D|ING|ER|R|Y|LY|IER|IEST|EST)$/.test(w.slice(x.w.length)); })[0];
    var custom = (teDocs || []).filter(function(d){ return d.id === w; })[0];
    var wordMsg = exact ? '<span class="bad">이미 있는 특수 단어</span>입니다: <span class="word">' + exact.w + '</span> (' + EL[exact.k].n + '). 저장하면 기존 능력을 덮어쓰는 제안으로 처리됩니다.' :
      root ? '<span class="warn">파생어 규칙과 겹칩니다.</span> <span class="word">' + w + '</span>는 지금 <span class="word">' + root.w + '</span>의 능력을 물려받습니다. 별도 타워로 만들면 파생어 예외로 등록됩니다.' :
      custom ? '<span class="warn">이미 저장된 사용자 타워</span>와 같은 단어입니다. 저장하면 덮어씁니다.' : '<span class="ok">겹치는 단어가 없습니다.</span>';
    var koHit = TE.ko ? WORDS.filter(function(x){ return x.ko === TE.ko; })[0] : null;
    if (koHit) wordMsg += ' <span class="warn">한글 이름 ‘' + esc(TE.ko) + '’은 이미 <span class="word">' + koHit.w + '</span>의 한글 이름입니다.</span> 다른 한글 이름을 정해 주세요.';
    else if (TE.ko) wordMsg += ' 한글 이름 ‘' + esc(TE.ko) + '’도 겹치지 않습니다.';
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
    var body = {word:TE.word, ko:TE.ko || "", price:+TE.price || 1, kind:TE.kind, concept:TE.concept, mode:TE.mode, radius:TE.radius, dmg:TE.dmg, dtype:TE.dtype, mult:TE.mult, interval:TE.interval, range:TE.range, fx:TE.fx, lv5:TE.lv5, pixels:teEncode(TE.px), cost:teCost(TE), ratio:+teRatio(TE).toFixed(3), updatedAt:Date.now()};
    try { await teDb.collection("towers").doc(TE.word).set(body); toast("‘" + TE.word + "’ 타워를 저장했습니다."); }
    catch (e){ toast(e && e.code === "quota_exceeded" ? "저장 공간이 가득 찼습니다. 안 쓰는 타워를 지워 주세요." : "저장하지 못했습니다. 잠시 뒤 다시 눌러 주세요."); }
  };
  if ($("teimpb")) $("teimpb").onclick = function(){ var u = unpackCode($("teimp").value); if (u.err){ toast(u.err); return; } if (u.tag !== "WTDT1"){ toast("맵 코드입니다. 맵 에디터의 ‘맵 코드 붙여넣기’에 넣어 주세요."); return; } try { var d = u.data; TE = towerFromData(d); render("toweredit"); window.scrollTo(0, 0); toast("‘" + TE.word + "’ 타워를 불러왔습니다" + (d.author ? " (만든 사람: " + String(d.author).slice(0, 20) + ")" : "") + ". 확인 후 저장해 주세요."); } catch (e){ toast("코드가 깨져 있어 읽을 수 없습니다."); } };
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
      TE = teDefault(); TE.price = Math.min(10, Math.max(0.3, +t.price || 1)); TE.word = String(t.word || d.id).toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12); TE.kind = kind; TE.ko = String(t.ko || "").replace(/[^가-힣]/g, "").slice(0, 8); TE.concept = String(t.concept || ""); TE.mode = TE_MODES.some(function(m){ return m[0] === t.mode; }) ? t.mode : "single";
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

function b64e(o){ return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function b64d(s){ s = String(s).replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return JSON.parse(decodeURIComponent(escape(atob(s)))); }
function codeSum(s){ var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 46656; return ("00" + h.toString(36)).slice(-3); }
function packCode(tag, o){ var b = b64e(o); return tag + "." + b + "." + codeSum(b); }
/* 붙여 넣은 제출 코드 읽기: 공백·줄바꿈 제거, URL용 문자 허용, 끝 확인 문자로 잘림 감지 */
function unpackCode(text){
  var s = String(text || "").replace(/[\s\u200b\u00a0]+/g, "").replace(/^[^W]*(WTD)/i, "$1");
  var m = s.match(/^(WTD[TM]1)[.:,](.+)$/i);
  if (!m) return {err: "형식이 맞지 않습니다. WTDT1. (타워) 또는 WTDM1. (맵)으로 시작하는 코드를 통째로 붙여 넣어 주세요."};
  var tag = m[1].toUpperCase(), parts = m[2].replace(/[^A-Za-z0-9+/=_\-.]/g, "").split("."), body = parts[0];
  if (parts.length > 1 && parts[1] && codeSum(body) !== parts[1]) return {tag: tag, err: "코드 일부가 빠졌거나 바뀌었습니다. 메신저가 긴 글을 자른 것일 수 있어요. 처음부터 끝까지 다시 복사해 주세요."};
  try { return {tag: tag, data: b64d(body)}; } catch (e){ return {tag: tag, err: "코드를 읽을 수 없습니다. 처음부터 끝까지 빠짐없이 복사했는지 확인해 주세요."}; }
}
/* ---------- 타워 불러오기 ---------- */
function towerFromData(t){
  var kind = EL[t.kind] ? t.kind : "fire", fx = {};
  if (t.fx && typeof t.fx === "object") TE_FX.forEach(function(f){ var v = +t.fx[f[0]]; if (v > 0) fx[f[0]] = Math.min(f[4], v); });
  var x = teDefault();
  x.word = String(t.word || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12); x.ko = String(t.ko || "").replace(/[^가-힣]/g, "").slice(0, 8); x.kind = kind; x.concept = String(t.concept || "").slice(0, 300);
  x.mode = TE_MODES.some(function(m){ return m[0] === t.mode; }) ? t.mode : "single"; x.radius = Math.min(3, Math.max(0, +t.radius || 0));
  x.mult = Math.min(5, Math.max(0.1, +t.mult || 1)); x.interval = Math.min(15, Math.max(0.1, +t.interval || 1)); x.range = Math.min(7, Math.max(1, +t.range || 2));
  x.dmg = +t.dmg > 0 ? Math.min(2000, +t.dmg) : +(teBaseAtk(x) * x.mult).toFixed(1); x.dtype = ["physical","magic","true"].indexOf(t.dtype) >= 0 ? t.dtype : "physical";
  x.fx = fx; x.price = Math.min(10, Math.max(0.3, +t.price || 1)); x.lv5 = String(t.lv5 || "").slice(0, 120); x.px = t.pixels ? teDecode(t.pixels) : x.px; x.color = EL[kind].m;
  return x;
}

/* ---------- 이미지 → 픽셀 (누끼 + 축소 + 색 줄이기) ---------- */
function imgToPx(img, n, o){
  var W = img.naturalWidth || img.width, H = img.naturalHeight || img.height; if (!W || !H) return null;
  var sc = Math.min(1, 320 / Math.max(W, H)), w = Math.max(1, Math.round(W * sc)), h = Math.max(1, Math.round(H * sc));
  var cv = document.createElement("canvas"); cv.width = w; cv.height = h; var x = cv.getContext("2d"); x.drawImage(img, 0, 0, w, h);
  var d = x.getImageData(0, 0, w, h).data, A = new Uint8Array(w * h), i, k;
  for (i = 0; i < w * h; i++) A[i] = d[i*4+3] >= 128 ? 1 : 0;
  if (o.bg === "auto"){
    /* 가장자리에서 가장 많은 색을 배경으로 보고, 가장자리에서 이어진 비슷한 색을 지운다 */
    var cnt = {}, best = null, bc = 0;
    function key(p){ return (d[p*4] >> 4) + "," + (d[p*4+1] >> 4) + "," + (d[p*4+2] >> 4); }
    for (i = 0; i < w; i++){ [i, (h-1)*w + i].forEach(function(p){ if (A[p]){ var kk = key(p); cnt[kk] = (cnt[kk] || 0) + 1; } }); }
    for (i = 0; i < h; i++){ [i*w, i*w + w - 1].forEach(function(p){ if (A[p]){ var kk = key(p); cnt[kk] = (cnt[kk] || 0) + 1; } }); }
    for (k in cnt) if (cnt[k] > bc){ bc = cnt[k]; best = k; }
    if (best){
      var sr = 0, sg = 0, sb = 0, sn = 0;
      for (i = 0; i < w * h; i++) if (A[i] && (i < w || i >= (h-1)*w || i % w === 0 || i % w === w-1) && key(i) === best){ sr += d[i*4]; sg += d[i*4+1]; sb += d[i*4+2]; sn++; }
      var br = sr/sn, bgc = sg/sn, bb = sb/sn, tol = o.tol, seen = new Uint8Array(w * h), st = [];
      function near(p){ var dr = d[p*4]-br, dg = d[p*4+1]-bgc, db = d[p*4+2]-bb; return Math.sqrt(dr*dr + dg*dg + db*db) <= tol; }
      for (i = 0; i < w; i++){ st.push(i); st.push((h-1)*w + i); } for (i = 0; i < h; i++){ st.push(i*w); st.push(i*w + w - 1); }
      while (st.length){ var p = st.pop(); if (seen[p]) continue; seen[p] = 1; if (!A[p] || !near(p)) { if (!A[p]){ var px0 = p % w, py0 = (p / w) | 0; if (px0 > 0) st.push(p-1); if (px0 < w-1) st.push(p+1); if (py0 > 0) st.push(p-w); if (py0 < h-1) st.push(p+w); } continue; }
        A[p] = 0; var qx = p % w, qy = (p / w) | 0; if (qx > 0) st.push(p-1); if (qx < w-1) st.push(p+1); if (qy > 0) st.push(p-w); if (qy < h-1) st.push(p+w); }
    }
  } else if (o.bg === "none"){ for (i = 0; i < w * h; i++) A[i] = 1; }
  var x0 = w, x1 = -1, y0 = h, y1 = -1;
  for (i = 0; i < w * h; i++) if (A[i]){ var ax = i % w, ay = (i / w) | 0; if (ax < x0) x0 = ax; if (ax > x1) x1 = ax; if (ay < y0) y0 = ay; if (ay > y1) y1 = ay; }
  if (x1 < 0) return null;
  var bw = x1 - x0 + 1, bh = y1 - y0 + 1, ped = o.ped ? Math.round(n / 4) : 0, m = o.outline ? 1 : 0;
  var aw = n - 2 * m, ah = n - ped - m, s2 = Math.min(aw / bw, ah / bh), tw = Math.max(1, Math.round(bw * s2)), th = Math.max(1, Math.round(bh * s2));
  var ox = Math.floor((n - tw) / 2), oy = n - ped - th, cells = [], px = [];
  for (i = 0; i < n * n; i++) px.push(null);
  for (var ty = 0; ty < th; ty++) for (var tx = 0; tx < tw; tx++){
    var sx0 = x0 + Math.floor(tx * bw / tw), sx1 = x0 + Math.max(Math.floor((tx + 1) * bw / tw), Math.floor(tx * bw / tw) + 1), sy0 = y0 + Math.floor(ty * bh / th), sy1 = y0 + Math.max(Math.floor((ty + 1) * bh / th), Math.floor(ty * bh / th) + 1);
    var r = 0, g = 0, b = 0, c = 0, tot = 0;
    for (var yy = sy0; yy < sy1; yy++) for (var xx = sx0; xx < sx1; xx++){ tot++; var q = yy * w + xx; if (A[q]){ r += d[q*4]; g += d[q*4+1]; b += d[q*4+2]; c++; } }
    if (c && c / tot >= 0.35) cells.push({i: (oy + ty) * n + ox + tx, c: [r/c, g/c, b/c]});
  }
  if (!cells.length) return null;
  /* 색 줄이기 (k-평균) */
  var K = Math.min(o.cols, cells.length), cen = [];
  var sorted = cells.slice().sort(function(a, b2){ return (a.c[0]*0.3 + a.c[1]*0.59 + a.c[2]*0.11) - (b2.c[0]*0.3 + b2.c[1]*0.59 + b2.c[2]*0.11); });
  for (k = 0; k < K; k++) cen.push(sorted[Math.floor((k + 0.5) * sorted.length / K)].c.slice());
  for (var itr = 0; itr < 10; itr++){
    var acc = cen.map(function(){ return [0,0,0,0]; });
    cells.forEach(function(e){ var bi = 0, bd = 1e9; cen.forEach(function(cc, ci){ var dd = (cc[0]-e.c[0])*(cc[0]-e.c[0]) + (cc[1]-e.c[1])*(cc[1]-e.c[1]) + (cc[2]-e.c[2])*(cc[2]-e.c[2]); if (dd < bd){ bd = dd; bi = ci; } }); e.k = bi; acc[bi][0] += e.c[0]; acc[bi][1] += e.c[1]; acc[bi][2] += e.c[2]; acc[bi][3]++; });
    cen = cen.map(function(cc, ci){ return acc[ci][3] ? [acc[ci][0]/acc[ci][3], acc[ci][1]/acc[ci][3], acc[ci][2]/acc[ci][3]] : cc; });
  }
  function hex(cc){ return "#" + cc.map(function(v){ return ("0" + Math.max(0, Math.min(255, Math.round(v))).toString(16)).slice(-2); }).join(""); }
  var used = {};
  cells.forEach(function(e){ var hc = hex(cen[e.k]); px[e.i] = hc; used[hc] = 1; });
  if (o.outline){
    var ol = [];
    for (i = 0; i < n * (n - ped); i++){ if (px[i]) continue; var cx = i % n, cy = (i / n) | 0;
      if ((cx > 0 && px[i-1] && px[i-1] !== "#1d2029") || (cx < n-1 && px[i+1] && px[i+1] !== "#1d2029") || (cy > 0 && px[i-n] && px[i-n] !== "#1d2029") || (cy < n-ped-1 && px[i+n] && px[i+n] !== "#1d2029")) ol.push(i); }
    ol.forEach(function(p){ px[p] = "#1d2029"; });
  }
  if (ped){
    var C = (EL[o.kind] || EL.plain), rowsC = [C.d, "#c9ccd3", "#8c909b", "#555a68"], widths = [8, 10, 12, 12];
    for (var pr = 0; pr < ped; pr++){ var pi = Math.min(3, Math.floor(pr * 4 / ped)), pw = Math.round(widths[pi] * n / 16), px0b = Math.floor((n - pw) / 2);
      for (var pxx = 0; pxx < pw; pxx++) px[(n - ped + pr) * n + px0b + pxx] = rowsC[pi]; }
  }
  return {px: px, colors: Object.keys(used).length, filled: cells.length};
}
