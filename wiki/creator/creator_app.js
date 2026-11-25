/* ---------- 크리에이터 공통 ---------- */
function toast(t){ var el = document.getElementById("toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function(){ el.hidden = true; }, 3400); }
function lsGet(k, d){ try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e){ return d; } }
function lsSet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e){ return false; } }
function nick(){ var i = document.getElementById("nick"); return (i ? i.value : lsGet("wtd-nick", "")).trim().slice(0, 20); }
function works(){ var a = lsGet("wtd-works", []); return Array.isArray(a) ? a : []; }
function saveWork(w){ var a = works().filter(function(x){ return !(x.type === w.type && x.key === w.key); }); a.unshift(w); return lsSet("wtd-works", a.slice(0, 80)); }
function copyText(t, area){
  function fb(){ if (area){ area.focus(); area.select(); } toast("자동 복사가 막혀 있어 코드를 선택해 두었습니다. 길게 눌러 복사해 주세요."); }
  try { navigator.clipboard.writeText(t).then(function(){ toast("제출 코드를 복사했습니다. 개발자에게 붙여 넣어 보내 주세요."); }, fb); } catch (e){ fb(); }
}
function codeBox(el, code, what){
  el.innerHTML = '<div class="codebox"><p><b>' + what + ' 제출 코드</b> · 아래 코드를 통째로 복사해서 개발자에게 보내 주세요 (디스코드, 카카오톡, 메일 등 어디든 괜찮습니다).</p><textarea readonly rows="4" aria-label="제출 코드"></textarea><div class="row" style="gap:6px"><button class="btn pri">코드 복사</button></div></div>';
  var ta = el.querySelector("textarea"), bt = el.querySelector("button"); ta.value = code; bt.onclick = function(){ copyText(code, ta); };
}

function towerData(){ return {v:1, author:nick(), word:TE.word, kind:TE.kind, concept:TE.concept, mode:TE.mode, radius:TE.radius, dmg:TE.dmg, dtype:TE.dtype, mult:TE.mult, interval:TE.interval, range:TE.range, fx:TE.fx, lv5:TE.lv5, pixels:teEncode(TE.px), cost:teCost(TE), ratio:+teRatio(TE).toFixed(3)}; }

/* ---------- 맵 에디터 (크리에이터) ---------- */
var MP = null;
PAGES.map = {html:function(){
  var tools = [".","#","I","X","L","S","B","M","O"].map(function(k){ return '<button data-tool="' + k + '"><canvas data-tile="' + k + '" width="14" height="14"></canvas>' + TILE[k].n.replace(/ \(.*\)/, "") + '</button>'; }).join("");
  var presets = '<option value="">기본 맵 불러오기…</option>' + Object.keys(MAPS).filter(function(k){ return /^\d/.test(k); }).map(function(k){ return '<option value="' + k + '">' + CH[+k[0]-1].name + ' · 맵 ' + k[1] + '</option>'; }).join("") + '<option value="END">THE END? (무한 모드)</option>';
  return '<h1 class="ph">맵 만들기</h1><p>회색 격자에 길, 입구, 기지를 그려 스테이지 맵을 만든다. 오른쪽(휴대폰에서는 아래) 검사 결과가 초록색이 되면 제출할 수 있다.</p>' +
  '<div class="ed"><div class="ed-board"><canvas id="edc" aria-label="맵 편집 격자"></canvas><div class="row" style="margin-top:8px;gap:6px"><button class="btn" id="undo">되돌리기</button><button class="btn" id="clear">비우기</button><select class="inp" id="size" aria-label="맵 크기"><option value="9x12">세로 9 × 12</option><option value="16x9">가로 16 × 9</option></select></div></div>' +
  '<div class="ed-side"><div><b style="font-size:14px">그리기 도구</b><div class="tools" id="tools" style="margin-top:6px">' + tools + '</div><p class="count" style="margin:6px 0 0">칸을 누르거나 끌어서 칠한다. 입구·기지·마법진은 한 칸씩 찍힌다.</p></div>' +
  '<div class="status" id="vs" aria-live="polite"></div>' +
  '<label class="field">맵 이름<input id="mname" maxlength="40" placeholder="예: 두 갈래 숲길"></label>' +
  '<div class="row" style="gap:8px"><label class="field" style="flex:1 1 140px">어울리는 챕터<select id="mch"><option value="0">미정</option>' + CH.map(function(c){ return '<option value="' + c.n + '">' + c.n + '. ' + c.name + '</option>'; }).join("") + '<option value="9">무한 모드</option></select></label><label class="field" style="flex:1 1 140px">시작점<select id="preset">' + presets + '</select></label></div>' +
  '<label class="field">설명 (어떤 재미를 노렸는지)<textarea id="mnote" rows="3" maxlength="500" placeholder="예: 입구 두 곳에서 동시에 몰려오는 협공 맵"></textarea></label>' +
  '<div class="row" style="gap:6px"><button class="btn" id="msave">내 작품에 저장</button><button class="btn pri" id="mcode">제출 코드 만들기</button><button class="btn" id="mnew">새 맵</button></div><div id="mcodeout"></div></div></div>' +
  '<h2>맵 규칙</h2><ul><li>입구(S) 1~3개, 기지(B) 정확히 1개.</li><li>모든 입구에서 기지까지 길·얼음길·마법진으로 이어져야 한다 (상하좌우).</li><li>가장 짧은 경로 8칸 이상, 빈칸 12칸 이상.</li><li>마법진 입구(M)와 출구(O)는 같은 수만큼, 최대 3쌍. 적은 M을 밟으면 O로 순간 이동한다.</li><li>얼음길은 적이 20% 빨라지고, 장애물과 용암 칸에는 타워를 지을 수 없다.</li></ul>';
}, after:function(){ mapInit(); }};
function mapInit(){
  function blank(w, h){ var r = []; for (var j = 0; j < h; j++) r.push(new Array(w + 1).join(".")); return r; }
  if (!MP) MP = lsGet("wtd-draft-map", null) || {w:9, h:12, rows:blank(9, 12), name:"", chapter:0, note:""};
  if (!Array.isArray(MP.rows) || !MP.rows.length || MP.rows.some(function(r){ return typeof r !== "string" || r.length !== MP.rows[0].length || /[^.#IXLSBMO]/.test(r); })) MP = {w:9, h:12, rows:blank(9, 12), name:"", chapter:0, note:""};
  MP.w = MP.rows[0].length; MP.h = MP.rows.length; MP.tool = MP.tool || "#"; MP.undo = MP.undo || [];
  var $ = function(id){ return document.getElementById(id); }, cv = $("edc");
  function cell(){ return MP.w > 9 ? 24 : 36; }
  function check(){ var v = validate(MP.rows), el = $("vs"); el.className = "status " + (v.ok ? "ok" : "bad");
    el.innerHTML = (v.ok ? "<b>플레이 가능한 맵입니다. 제출할 수 있습니다.</b>" : "<b>고칠 점 " + v.msgs.length + "개</b><ul>" + v.msgs.map(function(m){ return "<li>" + esc(m) + "</li>"; }).join("") + "</ul>") + '<div class="count" style="margin-top:4px">최단 경로 ' + v.len + '칸 · 빈칸 ' + v.build + '칸 · 입구 ' + v.S + '개</div>'; return v; }
  function draft(){ lsSet("wtd-draft-map", {w:MP.w, h:MP.h, rows:MP.rows, name:$("mname").value, chapter:+$("mch").value, note:$("mnote").value}); }
  function draw(){ drawMap(cv, MP.rows, cell(), +$("mch").value > 5 ? 5 : +$("mch").value || 0); check(); draft(); }
  function setTool(t){ MP.tool = t; [].forEach.call(document.querySelectorAll("#tools button"), function(b){ b.classList.toggle("on", b.getAttribute("data-tool") === t); }); }
  [].forEach.call(document.querySelectorAll("#tools canvas"), function(c){ drawTile(c.getContext("2d"), c.getAttribute("data-tile"), 0, 0, 14, 0); });
  $("tools").addEventListener("click", function(e){ var b = e.target.closest("button"); if (b) setTool(b.getAttribute("data-tool")); });
  setTool(MP.tool);
  function snap(){ MP.undo.push(MP.rows.slice()); if (MP.undo.length > 60) MP.undo.shift(); }
  function paint(e){ var r = cv.getBoundingClientRect(), i = Math.floor((e.clientX - r.left) / r.width * MP.w), j = Math.floor((e.clientY - r.top) / r.height * MP.h);
    if (i < 0 || j < 0 || i >= MP.w || j >= MP.h || MP.rows[j][i] === MP.tool) return; MP.rows[j] = MP.rows[j].slice(0, i) + MP.tool + MP.rows[j].slice(i + 1); draw(); }
  var down = false, single = false;
  cv.addEventListener("pointerdown", function(e){ e.preventDefault(); cv.setPointerCapture(e.pointerId); snap(); down = true; single = "SBMO".indexOf(MP.tool) >= 0; paint(e); });
  cv.addEventListener("pointermove", function(e){ if (down && !single) paint(e); });
  cv.addEventListener("pointerup", function(){ down = false; }); cv.addEventListener("pointercancel", function(){ down = false; });
  $("undo").onclick = function(){ if (MP.undo.length){ MP.rows = MP.undo.pop(); MP.h = MP.rows.length; MP.w = MP.rows[0].length; $("size").value = MP.w + "x" + MP.h; draw(); } };
  var arm = 0; $("clear").onclick = function(){ var b = this; if (Date.now() - arm > 3000){ arm = Date.now(); b.textContent = "한 번 더 누르면 비움"; setTimeout(function(){ b.textContent = "비우기"; }, 3000); return; } snap(); MP.rows = blank(MP.w, MP.h); arm = 0; b.textContent = "비우기"; draw(); };
  var size = $("size"); size.value = MP.w + "x" + MP.h;
  size.onchange = function(){ var p = size.value.split("x"); snap(); MP.w = +p[0]; MP.h = +p[1]; MP.rows = blank(MP.w, MP.h); draw(); toast("새 크기로 시작했습니다. 되돌리기로 이전 맵을 살릴 수 있습니다."); };
  $("preset").onchange = function(){ var k = this.value; if (!k) return; snap(); MP.rows = MAPS[k].slice(); MP.h = MP.rows.length; MP.w = MP.rows[0].length; size.value = MP.w + "x" + MP.h; this.value = ""; draw(); toast("기본 맵을 불러왔습니다. 고쳐서 새 맵으로 만들어 보세요."); };
  $("mname").value = MP.name || ""; $("mch").value = MP.chapter || 0; $("mnote").value = MP.note || "";
  ["mname","mnote"].forEach(function(id){ $(id).addEventListener("input", draft); }); $("mch").onchange = draw;
  function data(){ return {v:1, author:nick(), name:$("mname").value.trim(), chapter:+$("mch").value, note:$("mnote").value.trim(), w:MP.w, h:MP.h, rows:MP.rows.slice()}; }
  $("msave").onclick = function(){ var d = data(); if (!d.name){ toast("맵 이름을 적어 주세요."); $("mname").focus(); return; } toast(saveWork({type:"map", key:d.name, name:d.name, data:d, updatedAt:Date.now()}) ? "내 작품에 저장했습니다. 이 브라우저에만 남습니다." : "이 브라우저에서는 저장할 수 없습니다. 제출 코드를 바로 보내 주세요."); };
  $("mcode").onclick = function(){ var d = data(), v = check();
    if (!d.name){ toast("맵 이름을 적어 주세요."); $("mname").focus(); return; }
    if (!v.ok){ toast("검사에서 고칠 점이 남아 있습니다. 먼저 고쳐 주세요."); return; }
    saveWork({type:"map", key:d.name, name:d.name, data:d, updatedAt:Date.now()}); codeBox($("mcodeout"), "WTDM1." + b64e(d), "맵"); };
  $("mnew").onclick = function(){ snap(); MP.rows = blank(MP.w, MP.h); $("mname").value = ""; $("mnote").value = ""; $("mch").value = 0; $("mcodeout").innerHTML = ""; draw(); };
  draw();
}

/* ---------- 안내 ---------- */
PAGES.guide = {html:function(){
  var hero = ["DRAGON","BLIZZARD","STORM","FOREST","REAPER","NOVA"].map(function(n){ var w = WORDS.filter(function(x){ return x.w === n; })[0]; return tCell(w, 4); }).join("");
  return '<div class="home-hero"><div class="ht"><h2 class="hh">WORD TD 크리에이터</h2><p>영단어가 곧 타워가 되는 타워 디펜스 <b>WORD TD</b>의 테스터용 제작 도구입니다. 직접 만든 타워와 맵을 보내 주시면 검토해서 게임에 넣습니다.</p></div><div class="towers">' + hero + '</div></div>' +
  '<h2>게임 소개</h2><ul><li>플레이어가 영단어를 입력하면 그 단어가 타워가 됩니다. FIRE는 불 타워, ICE는 얼음 타워.</li><li>사전에 있는 단어라면 무엇이든 지을 수 있고, 특수 단어 ' + WORDS.length + '개는 고유 능력을 가집니다.</li><li>글자마다 점수가 있어서 Q, Z처럼 희귀한 글자가 든 긴 단어일수록 강하지만 비쌉니다.</li></ul>' +
  '<h2>이렇게 참여해 주세요</h2><ol><li>위쪽 <b>닉네임</b> 칸에 이름을 적어 주세요. 제출 코드에 함께 담겨 크레딧에 쓰입니다.</li><li><a href="#tower">타워 만들기</a> 또는 <a href="#map">맵 만들기</a>에서 작품을 만듭니다.</li><li>타워는 밸런스가 <b>적정</b>이 되도록 맞추고, <b>겹침 분석</b>으로 기존 타워와 너무 비슷하지 않은지 확인합니다.</li><li><b>제출 코드 만들기</b>를 누르고, 나온 코드를 복사해 개발자에게 보내 주세요.</li></ol>' +
  '<div class="note hl">작품은 이 브라우저에만 임시로 남습니다. 다른 기기에서는 보이지 않고, 브라우저 데이터를 지우면 사라질 수 있으니 완성하면 바로 제출 코드를 보내 주세요.</div>' +
  '<h2>좋은 타워의 조건</h2><ul><li><b>실존하는 영단어</b> (3~12글자, 고유명사 제외).</li><li>단어 뜻과 능력이 바로 연결될 것. 예: ANCHOR는 적을 붙잡아 멈추게 한다.</li><li>기존 타워에 없는 효과 조합이나 쓰임새가 하나는 있을 것.</li><li>디자인은 게임 안에서 작게 보이므로 실루엣이 또렷할 것.</li></ul>' +
  '<h2>좋은 맵의 조건</h2><ul><li>길을 보고 "어디에 지을까" 고민하게 만드는 갈림길, 굽이, 합류 지점.</li><li>입구가 여러 개라면 각 길의 길이를 다르게 해서 도착 시간이 엇갈리게.</li><li>마법진은 반전이나 지름길처럼 분명한 의도가 있을 때만.</li></ul>' +
  '<h2>출처</h2><p>이 게임은 <a href="' + INSPIRE_URL + '" target="_blank" rel="noopener">한 YouTube 쇼츠 영상</a>에서 아이디어를 얻었고, 타워 능력과 그래픽은 새로 만들었습니다. 영어 사전은 공개 도메인 ENABLE 단어 목록을 씁니다.</p>';
}};

/* ---------- 내 작품 ---------- */
PAGES.works = {html:function(){
  return '<h1 class="ph">내 작품</h1><p>이 브라우저에 저장한 타워와 맵입니다. 불러와서 고치거나, 제출 코드를 다시 만들 수 있습니다.</p><div class="saved" id="wl"></div>' +
  '<h2>제출 코드 확인</h2><p>받은 코드가 제대로 만들어졌는지 확인하거나, 다른 사람의 작품을 불러와 볼 수 있습니다.</p><div class="row"><input class="inp" id="cin" placeholder="WTDT1. 또는 WTDM1. 으로 시작하는 코드" style="flex:1 1 260px" aria-label="제출 코드"><button class="btn" id="cload">불러오기</button></div>';
}, after:function(){
  var box = document.getElementById("wl"), a = works();
  if (!a.length){ box.innerHTML = '<p class="count">아직 저장한 작품이 없습니다. <a href="#tower">타워 만들기</a>나 <a href="#map">맵 만들기</a>에서 시작해 보세요.</p>'; }
  a.forEach(function(w){
    var el = document.createElement("div"), d = w.data || {}; el.className = "sv";
    var c;
    if (w.type === "tower" && d.pixels){ c = pxCanvas(teDecode(d.pixels), 4); c.style.cssText = "width:64px;height:64px;align-self:center;image-rendering:pixelated"; }
    else if (w.type === "map" && Array.isArray(d.rows) && d.rows.length){ c = document.createElement("canvas"); drawMap(c, d.rows.map(String), 10, 0, false); }
    var b = document.createElement("b"); b.textContent = (w.type === "tower" ? "타워 · " : "맵 · ") + String(w.name || "");
    var s = document.createElement("small"); s.textContent = new Date(+w.updatedAt || 0).toLocaleString("ko-KR");
    var row = document.createElement("div"); row.className = "row";
    var lo = document.createElement("button"); lo.className = "btn"; lo.textContent = "불러오기";
    lo.onclick = function(){ if (w.type === "tower"){ TE = towerFromData(d); location.hash = "tower"; } else { MP = {rows:(d.rows || []).map(String), name:String(d.name || ""), chapter:+d.chapter || 0, note:String(d.note || "")}; lsSet("wtd-draft-map", MP); MP = null; location.hash = "map"; } toast("작품을 불러왔습니다."); };
    var cd = document.createElement("button"); cd.className = "btn"; cd.textContent = "코드";
    var out = document.createElement("div");
    cd.onclick = function(){ codeBox(out, (w.type === "tower" ? "WTDT1." : "WTDM1.") + b64e(d), w.type === "tower" ? "타워" : "맵"); };
    var del = document.createElement("button"); del.className = "btn dan"; del.textContent = "삭제"; var armed = 0;
    del.onclick = function(){ if (Date.now() - armed > 3000){ armed = Date.now(); del.textContent = "한 번 더"; setTimeout(function(){ del.textContent = "삭제"; }, 3000); return; } lsSet("wtd-works", works().filter(function(x){ return !(x.type === w.type && x.key === w.key); })); el.remove(); toast("작품을 삭제했습니다."); };
    row.appendChild(lo); row.appendChild(cd); row.appendChild(del);
    if (c) el.appendChild(c); el.appendChild(b); el.appendChild(s); el.appendChild(row); el.appendChild(out); box.appendChild(el);
  });
  document.getElementById("cload").onclick = function(){
    var t = document.getElementById("cin").value.trim();
    try {
      if (t.indexOf("WTDT1.") === 0){ TE = towerFromData(b64d(t.slice(6))); location.hash = "tower"; toast("타워 코드를 불러왔습니다."); }
      else if (t.indexOf("WTDM1.") === 0){ var d = b64d(t.slice(6)); if (!Array.isArray(d.rows)) throw 0; lsSet("wtd-draft-map", {rows:d.rows.map(String), name:String(d.name || ""), chapter:+d.chapter || 0, note:String(d.note || "")}); MP = null; location.hash = "map"; toast("맵 코드를 불러왔습니다."); }
      else toast("WTDT1. 이나 WTDM1. 으로 시작하는 코드가 아닙니다.");
    } catch (e){ toast("코드가 깨져 있어 읽을 수 없습니다. 처음부터 끝까지 빠짐없이 복사했는지 확인해 주세요."); }
  };
}};

/* ---------- 라우터 ---------- */
var VIEWS = {guide:"안내", tower:"타워 만들기", map:"맵 만들기", works:"내 작품"};
PAGES.tower = PAGES.toweredit;
function render(id){
  if (id === "toweredit") id = "tower"; if (!VIEWS[id]) id = "guide";
  var pg = PAGES[id], main = document.getElementById("main");
  main.innerHTML = (id === "tower" ? '<h1 class="ph">타워 만들기</h1>' : "") + '<div class="art">' + pg.html() + '</div>';
  if (pg.after) pg.after();
  [].forEach.call(document.querySelectorAll(".tabs a"), function(a){ a.setAttribute("aria-current", a.getAttribute("href") === "#" + id ? "page" : "false"); });
  document.title = VIEWS[id] + " - WORD TD 크리에이터";
}
function route(){ render(location.hash.slice(1)); window.scrollTo(0, 0); }
window.addEventListener("hashchange", route);
(function(){
  var n = document.getElementById("nick"); n.value = lsGet("wtd-nick", ""); n.addEventListener("input", function(){ lsSet("wtd-nick", n.value.trim().slice(0, 20)); });
  document.addEventListener("contextmenu", function(e){ if (!e.target.closest("input,textarea")) e.preventDefault(); });
  document.addEventListener("keydown", function(e){ var k = (e.key || "").toLowerCase(); if (k === "f12" || ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === "i" || k === "j" || k === "c")) || ((e.ctrlKey || e.metaKey) && k === "u")) e.preventDefault(); });
})();
route();
