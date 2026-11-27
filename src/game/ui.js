/* WORD TD 화면·입력·진행 */
var RUN = null;
var $ = function(id){ return document.getElementById(id); };
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
(function(){ var d = {kbShow:"auto", koPlate:false, lastNb:0, lastDiff:1, lastPen:"pencil", lastSpells:["STOP","RUSH"]}; for (var k in d) if (SAVE.settings[k] == null) SAVE.settings[k] = d[k]; })();

/* ================= 입력 ================= */
var IN = {lang:"en", shift:false, en:"", cji:new Hangul.CJI(), dub:new Hangul.DUB(), mt:{key:null, at:0, i:0}, sealed:{}, sealT:0};
IN.touch = function(){ var s = SAVE.settings.kbShow; if (s === "on") return true; if (s === "off") return false; return window.matchMedia && matchMedia("(pointer: coarse)").matches; };
IN.text = function(){
  if (!IN.touch()){ var v = ($("ti") && $("ti").value || "").replace(/\s+/g, ""); return Hangul.isKo(v) ? v : v.toUpperCase().replace(/[^A-Z]/g, ""); }
  if (IN.lang === "ko") return SAVE.settings.kb === "cji" ? IN.cji.text() : IN.dub.text();
  return IN.en;
};
IN.clear = function(){ IN.en = ""; IN.cji.clear(); IN.dub.clear(); IN.mt.key = null; if ($("ti")) $("ti").value = ""; UI.refreshInput(); };
IN.setText = function(s){ IN.clear(); if (!IN.touch()){ $("ti").value = s; } else if (Hangul.isKo(s)){ IN.dub.js = Hangul.decompose(s).split(""); if (SAVE.settings.kb === "cji"){ IN.cji.clear(); IN.cji.tk = IN.dub.js.map(function(j){ return /[ㅏ-ㅣ]/.test(j) ? {t:"v", s:Object.keys(CJMAP).filter(function(k){ return CJMAP[k] === j; })[0] || j} : {t:"c", j:j, key:j, step:0}; }); } } else IN.en = s; UI.refreshInput(); };
var CJMAP = {"ㅣ":"ㅣ","ㅡ":"ㅡ","ㅣㆍ":"ㅏ","ㅣㆍㆍ":"ㅑ","ㆍㅣ":"ㅓ","ㆍㆍㅣ":"ㅕ","ㆍㅡ":"ㅗ","ㆍㆍㅡ":"ㅛ","ㅡㆍ":"ㅜ","ㅡㆍㆍ":"ㅠ","ㅡㅣ":"ㅢ","ㅣㆍㅣ":"ㅐ","ㆍㅣㅣ":"ㅔ","ㅣㆍㆍㅣ":"ㅒ","ㆍㆍㅣㅣ":"ㅖ","ㆍㅡㅣㆍ":"ㅘ","ㆍㅡㅣㆍㅣ":"ㅙ","ㆍㅡㅣ":"ㅚ","ㅡㆍㆍㅣ":"ㅝ","ㅡㆍㆍㅣㅣ":"ㅞ","ㅡㆍㅣ":"ㅟ"};
IN.langAllowed = function(){ var l = SAVE.settings.lang; return l === "both" ? ["en", "ko"] : [l]; };
IN.setLang = function(l){ if (IN.langAllowed().indexOf(l) < 0) return; if (IN.lang === l) return; IN.lang = l; IN.clear(); UI.relabelEnemies(); UI.buildKb(); UI.refreshInput(); };
var MT = {"ABC":"ABC","DEF":"DEF","GHI":"GHI","JKL":"JKL","MNO":"MNO","PQRS":"PQRS","TUV":"TUV","WXYZ":"WXYZ"};
var DUBS = {"ㅂ":"ㅃ","ㅈ":"ㅉ","ㄷ":"ㄸ","ㄱ":"ㄲ","ㅅ":"ㅆ","ㅐ":"ㅒ","ㅔ":"ㅖ"};
IN.key = function(k){
  if (B && B.over) return;
  SFX.play("key"); vib(6);
  if (k === "BACK"){ if (IN.lang === "ko"){ if (SAVE.settings.kb === "cji") IN.cji.back(); else IN.dub.back(); } else IN.en = IN.en.slice(0, -1); IN.mt.key = null; }
  else if (k === "ENTER"){ UI.submit(); return; }
  else if (k === "LANG"){ var al = IN.langAllowed(); if (al.length > 1) IN.setLang(IN.lang === "en" ? "ko" : "en"); return; }
  else if (k === "NEXT"){ IN.cji.next(); IN.mt.key = null; }
  else if (k === "SHIFT"){ IN.shift = !IN.shift; UI.buildKb(); return; }
  else if (MT[k]){ var now = Date.now(), g = MT[k];
    if (IN.mt.key === k && now - IN.mt.at < SAVE.settings.wait){ IN.mt.i = (IN.mt.i + 1) % g.length; IN.en = IN.en.slice(0, -1) + g[IN.mt.i]; }
    else { IN.mt.i = 0; IN.en += g[0]; } IN.mt.key = k; IN.mt.at = now; }
  else if (IN.lang === "ko"){ if (SAVE.settings.kb === "cji") IN.cji.press(k); else { IN.dub.press(IN.shift && DUBS[k] ? DUBS[k] : k); if (IN.shift){ IN.shift = false; UI.buildKb(); } } }
  else { if (IN.sealed[k]){ SFX.play("err"); UI.toast("봉인된 글자: " + k); return; } if (IN.en.length < 14) IN.en += k; }
  UI.refreshInput();
};

/* ================= 화면 ================= */
var UI = {scene:"title", paused:false, chipUsed:false, hudT:0};
UI.lang = function(){ return IN.lang; };
UI.text = function(){ return IN.text(); };
UI.show = function(html, cls){ var s = $("screen"); s.className = "screen " + (cls || ""); s.innerHTML = html; s.hidden = false; $("battle").hidden = true; s.scrollTop = 0; };
UI.toast = function(t){ var el = $("toast"); el.textContent = t; el.hidden = false; clearTimeout(UI.toastT); UI.toastT = setTimeout(function(){ el.hidden = true; }, 2600); };
UI.banner = function(t, c){ var el = $("banner"); el.textContent = t; el.style.color = c || "#E8EAF3"; el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); };
UI.flash = function(){ var el = $("flash"); el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); };
UI.modal = function(html){ $("modalbox").innerHTML = html; $("modal").hidden = false; };
UI.closeModal = function(){ $("modal").hidden = true; $("modalbox").innerHTML = ""; if (UI.scene === "battle" && UI.pausedByModal){ UI.pausedByModal = false; UI.paused = false; } };
function btn(label, act, cls, extra){ return '<button class="btn ' + (cls || "") + '" data-act="' + act + '"' + (extra || "") + '>' + label + '</button>'; }
function chipEl(k){ var e = EL[k] || EL.support; return '<span class="chip"><i style="background:' + e.m + '"></i>' + e.n + '</span>'; }
function sprImg(w, scale, lv){ var g = TG.get(w.w, w.k, w.L), c = TG.toCanvas(g, scale || 3); return '<img class="pix" src="' + c.toDataURL() + '" width="' + 16 * (scale || 3) + '" height="' + 16 * (scale || 3) + '" alt="">'; }

/* ---------- 타이틀 ---------- */
UI.title = function(){
  UI.scene = "title"; SFX.bgm(false);
  var hero = ["FIRE","FROST","ZAP","CAT","SUN","BOOM"].map(function(w){ return WMAP[w] ? '<span class="hero">' + sprImg(WMAP[w], 3) + '<b>' + w + '</b></span>' : ""; }).join("");
  UI.show('<div class="title"><div class="logo"><span>W</span><span>O</span><span>R</span><span>D</span><i></i><span>T</span><span>D</span></div>' +
    '<p class="sub">치는 단어가 곧 타워가 된다</p><div class="heroes">' + hero + '</div>' +
    '<div class="menu">' + btn("공책 펼치기", "setup", "pri big") + btn("단어 사전", "dict", "") + btn("설정", "settings", "") + '</div>' +
    '<p class="stat">별 ' + totalStars() + '개 · 발견한 단어 ' + Object.keys(SAVE.used).length + ' / ' + WORDS.length + '</p>' +
    '<p class="foot">영감: <a href="https://youtube.com/shorts/XlcxdyNHKjE" target="_blank" rel="noopener">원본 영상</a> · 타워 능력·그래픽은 독자 제작</p></div>', "titlebg");
};
/* ---------- 판 준비 ---------- */
UI.setup = function(){
  UI.scene = "setup"; var st = SAVE.settings, sel = {nb:st.lastNb, diff:st.lastDiff, pen:st.lastPen, spells:st.lastSpells.slice(), grade:1};
  if (!nbOpen(sel.nb)) sel.nb = 0; if (!penUnlocked(PENS.filter(function(p){ return p.id === sel.pen; })[0] || PENS[0])) sel.pen = "pencil";
  sel.grade = maxGrade(sel.nb);
  UI.setupSel = sel; UI.renderSetup();
};
function nbOpen(i){ return i === 0 || (SAVE.clear[i - 1] || 0) >= 1; }
function maxGrade(i){ return Math.min(10, (SAVE.clear[i] || 0) + 1); }
UI.renderSetup = function(){
  var s = UI.setupSel;
  var nbs = NOTEBOOKS.map(function(n, i){ var open = nbOpen(i), stars = 0; for (var g = 1; g <= 10; g++) stars += SAVE.stars[i + "_" + g] || 0;
    return '<button class="nb' + (s.nb === i ? " on" : "") + '" data-act="nb" data-i="' + i + '"' + (open ? "" : " disabled") + ' style="--cv:' + n.cover + '"><b>' + n.n + '</b><span>' + n.m + '</span><small>' + (open ? "★ " + stars + " · 등급 " + (SAVE.clear[i] || 0) + " 클리어" : "앞 공책을 클리어하면 열림") + '</small></button>'; }).join("");
  var grades = ""; for (var g = 1; g <= maxGrade(s.nb); g++) grades += '<button class="seg' + (s.grade === g ? " on" : "") + '" data-act="grade" data-i="' + g + '">' + g + '</button>';
  var diffs = DIFF.map(function(d, i){ return '<button class="seg' + (s.diff === i ? " on" : "") + '" data-act="diff" data-i="' + i + '">' + d.n + '</button>'; }).join("");
  var pens = PENS.map(function(p){ var ok = penUnlocked(p); return '<button class="pen' + (s.pen === p.id ? " on" : "") + '" data-act="pen" data-id="' + p.id + '"' + (ok ? "" : " disabled") + '><b>' + p.n + '</b><span>' + (ok ? p.d : "잠김: " + p.unlock.t) + '</span></button>'; }).join("");
  var sp = SPELLS.map(function(x){ var on = s.spells.indexOf(x.id) >= 0; return '<button class="spl' + (on ? " on" : "") + '" data-act="spell" data-id="' + x.id + '"><b>' + x.id + '</b><small>' + x.ko + ' · 잉크 ' + x.ink + '</small><span>' + x.d + '</span></button>'; }).join("");
  UI.show('<div class="page"><div class="ph">' + btn("←", "title", "sq", ' aria-label="뒤로"') + '<h2>공책 고르기</h2></div>' +
    '<h3>공책</h3><div class="nbs">' + nbs + '</div>' +
    '<h3>등급 <small>높을수록 적 체력 +12%씩</small></h3><div class="segs">' + grades + '</div>' +
    '<h3>난이도</h3><div class="segs">' + diffs + '</div>' +
    '<h3>펜 <small>판 전체에 적용되는 특징</small></h3><div class="pens">' + pens + '</div>' +
    '<h3>주문 2개 <small>잉크를 모아 단어로 발동</small></h3><div class="spls">' + sp + '</div>' +
    '<div class="sticky">' + btn("이 공책으로 시작", "begin", "pri big") + '</div></div>');
};
/* ---------- 판 시작 ---------- */
UI.begin = function(){
  var s = UI.setupSel; if (s.spells.length !== 2){ UI.toast("주문을 2개 고르세요"); return; }
  var st = SAVE.settings; st.lastNb = s.nb; st.lastDiff = s.diff; st.lastPen = s.pen; st.lastSpells = s.spells.slice(); save();
  var D = DIFF[s.diff];
  RUN = {nb:s.nb, grade:s.grade, diff:s.diff, pen:s.pen, spells:s.spells.slice(), stickers:[], gold:D.start + (s.pen === "crayon" ? 30 : 0), life:D.life, maxLife:D.life,
    page:0, gw:1, board:null, usedWords:{}, seenEnemy:{}, cardUsed:{}, freeTickets:0, erasers:s.pen === "pencil" ? 2 : 0, lastBuilt:"", discount:{}, route:makeRoute(), chosen:[], kills:0, maxCombo:0, refresh:20, firstWords:0};
  var al = IN.langAllowed(); IN.lang = al.indexOf(IN.lang) >= 0 ? IN.lang : al[0]; if (SAVE.settings.kb === "cji" && al.indexOf("ko") >= 0 && IN.touch()) IN.lang = "ko";
  battleInit(); UI.map();
};
function makeRoute(){
  var r = [], fights = ["fight", "fight"];
  function node(t){ var n = {type:t}; if (t === "fight" || t === "elite" || t === "boss"){ var rs = shuffle(RULES); n.rules = t === "elite" ? rs.slice(0, 2) : rs.slice(0, 1);
    if (t === "boss") n.rules = [RULES.filter(function(x){ return x.id === ["vowel","short","dark","rain","quiet"][RUN_NB()]; })[0]];
    n.rules.forEach(function(x){ if (x.id === "letter") n.letter = pick("KZWJXVQHY".split("")); }); } return n; }
  var plan = [["fight"], ["fight", "elite"], ["shop", "fight"], ["rest", "elite"], ["fight", Math.random() < 0.5 ? "shop" : "rest"], ["elite", "rest"], ["boss"]];
  plan.forEach(function(p){ r.push(shuffle(p).map(node)); });
  return r;
}
function RUN_NB(){ return UI.setupSel ? UI.setupSel.nb : 0; }
/* ---------- 공책 지도 ---------- */
var NODE = {fight:["전투","⚔"], elite:["엘리트","★"], shop:["문구점","🛍"], rest:["쉬는 시간","🔔"], boss:["보스","☠"]};
function nodeIcon(t){ var p = {fight:"M0 0h2v1h1v1h1v1h1V2h1V1h1V0h1v2H7v1H6v1H5v1h1v1h1v1H6V6H5V5H3v1H2v1H1V6h1V5h1V4H2V3H1V2H0z", elite:"M3 0h2v2h3v2H6v1h1v3H5V6H3v2H1V5h1V4H0V2h3z", shop:"M2 0h4v2h2v6H0V2h2zM3 1v1h2V1z", rest:"M3 0h2v1h1v1h1v4h1v1H0V6h1V2h1V1h1zM3 7h2v1H3z", boss:"M1 0h6v1h1v4H7v1H6v2H2V6H1V5H0V1h1zM2 2v2h1V2zM5 2v2h1V2z"}[t];
  var c = {fight:"#E8EAF3", elite:"#ff6b8a", shop:"#6be36b", rest:"#FFD34D", boss:"#FF5A6E"}[t]; return '<svg width="22" height="22" viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path d="' + p + '" fill="' + c + '"></path></svg>'; }
function ruleText(n){ return (n.rules || []).map(function(r){ return '<b>' + r.n.replace("○", n.letter || "○") + '</b> ' + r.d.replace(/○/g, n.letter || "○"); }).join("<br>"); }
UI.map = function(){
  UI.scene = "map"; SFX.bgm(true);
  var row = RUN.page, rows = RUN.route.map(function(opts, i){
    var cells = opts.map(function(n, j){ var chosen = RUN.chosen[i] === j, past = i < row, next = i === row;
      var cls = past ? (chosen ? "done" : "skip") : next ? "next" : "fut";
      return '<button class="node ' + cls + '"' + (next ? ' data-act="go" data-j="' + j + '"' : " disabled") + '>' + nodeIcon(n.type) + '<span>' + NODE[n.type][0] + '</span></button>'; }).join("");
    return '<div class="mrow"><span class="pg">' + (i + 1) + '쪽</span><div class="mcells">' + cells + '</div></div>'; }).reverse().join("");
  var next = RUN.route[row] || [], cards = next.map(function(n, j){ return '<button class="ncard" data-act="go" data-j="' + j + '"><div class="nt">' + nodeIcon(n.type) + '<b>' + NODE[n.type][0] + '</b></div>' +
    (n.rules ? '<div class="nr">' + ruleText(n) + '</div>' : '<div class="nr">' + {shop:"스티커·주문·레벨업 쿠폰을 산다", rest:"무작위 이벤트 하나"}[n.type] + '</div>') +
    '<small>' + {fight:"보상: 스티커 3개 중 1개", elite:"보상: 반짝 이상 스티커 + 골드", shop:"골드를 쓴다", rest:"선택에 따라", boss:"공책 클리어"}[n.type] + '</small></button>'; }).join("");
  var nb = NOTEBOOKS[RUN.nb];
  UI.show('<div class="page mappage"><div class="ph" style="--cv:' + nb.cover + '"><h2>' + nb.n + '</h2><span>' + nb.m + ' · 등급 ' + RUN.grade + ' · ' + DIFF[RUN.diff].n + ' · ' + PENS.filter(function(p){ return p.id === RUN.pen; })[0].n + '</span></div>' +
    runBar() + '<div class="mapnodes">' + rows + '</div><h3>' + (row + 1) + '쪽: 어디로 갈까?</h3><div class="ncards">' + cards + '</div>' +
    '<div class="row2">' + btn("스티커 보기", "stickers", "") + btn("판 포기", "abandon", "danger") + '</div></div>');
};
function runBar(){ return '<div class="runbar"><span class="hp">♥ ' + RUN.life + '/' + RUN.maxLife + '</span><span class="gd">● ' + RUN.gold + 'G</span><span>주문 ' + RUN.spells.join(" · ") + '</span><span>스티커 ' + RUN.stickers.length + '/8</span></div>'; }
UI.go = function(j){
  var n = RUN.route[RUN.page][j]; RUN.chosen[RUN.page] = j; RUN.node = n;
  if (n.type === "shop") return UI.shop(true);
  if (n.type === "rest") return UI.event();
  UI.battle(n);
};
UI.nextPage = function(){ RUN.page++; if (RUN.page >= RUN.route.length) return UI.runEnd(true); UI.map(); };

/* ---------- 전투 화면 ---------- */
UI.battle = function(n){
  UI.scene = "battle"; $("screen").hidden = true; $("battle").hidden = false; UI.paused = false;
  RUN.longWords = !!RUN.nextLong; RUN.nextLong = false;
  startPage(n); UI.buildKb(); IN.clear();
  $("rulebar").innerHTML = (n.rules || []).map(function(r){ return '<span><b>' + r.n.replace("○", n.letter || "") + '</b> ' + r.d.replace(/○/g, n.letter || "○") + '</span>'; }).join("");
  $("pagel").textContent = (RUN.page + 1) + " / 7쪽"; $("pageb").style.width = (RUN.page / 7 * 100) + "%";
  UI.side();
  setTimeout(function(){ rResize(); draw(); }, 0);
  if (!IN.touch()) setTimeout(function(){ $("ti").focus(); }, 50);
  UI.onWave(); SFX.play("page");
  if (!SAVE.tut){ UI.tut = 0; UI.tutStep(); }
  else UI.hint(n.type === "boss" ? "보스 쪽! 체력이 줄면 약점 단어가 뜬다. 쳐서 패턴을 끊자." : "");
};
UI.side = function(){ var st = RUN.stickers.map(function(id){ var s = STICKERS.filter(function(x){ return x.id === id; })[0]; return '<span><b>' + s.n + '</b> ' + s.d + '</span>'; }).join("") || "<span>아직 없음</span>";
  var pen = PENS.filter(function(p){ return p.id === RUN.pen; })[0];
  $("side").innerHTML = '<h4>펜: ' + pen.n + '</h4><div class="ss"><span>' + pen.d + '</span></div><h4>스티커 ' + RUN.stickers.length + '/8</h4><div class="ss">' + st + '</div>' +
    '<h4>조작</h4><div class="ss"><span>칸 클릭 → 단어 입력 → <kbd>Enter</kbd> 건설</span><span>적 머리 위 단어 입력 → <kbd>Enter</kbd> 타격</span><span>주문 단어(' + RUN.spells.join(", ") + ') → 잉크로 발동</span><span><kbd>Tab</kbd> 단어 사전 · <kbd>Esc</kbd> 지우기 · <kbd>Space</kbd> 일시정지 · <kbd>한/영</kbd> 언어</span></div>'; };
UI.onWave = function(){ if (!B) return; var w = $("wavel"); if (B.phase === "prep") w.textContent = "준비"; else w.textContent = "웨이브 " + Math.min(B.wave + 1, B.waves) + "/" + B.waves; UI.hudNow(); };
UI.hudNow = function(){ if (!RUN || !B) return;
  $("hp").textContent = RUN.life; $("gold").textContent = RUN.gold;
  var wb = $("wavebtn"); wb.hidden = !(B.phase === "prep" || B.phase === "gap"); if (!wb.hidden) wb.textContent = (B.phase === "prep" ? "시작 " + Math.ceil(B.prep) : "다음 " + Math.ceil(B.gapT)) + " ▶";
  $("combo").textContent = B.combo ? "콤보 " + B.combo : ""; $("combom").textContent = B.combo ? "타격 ×" + comboMul().toFixed(2) + " · 공속 +" + Math.min(20, B.combo) + "%" : "";
  $("inkf").style.width = B.ink + "%"; $("inkn").textContent = Math.floor(B.ink);
  $("spells").innerHTML = rule("quiet") ? '<span class="quiet">조용히! 주문 금지</span>' : RUN.spells.map(function(id){ var sp = SPELLS.filter(function(x){ return x.id === id; })[0], ok = B.ink >= sp.ink, nm = IN.lang === "ko" ? sp.ko : sp.id; return '<button class="sp' + (ok ? " ok" : "") + '" data-act="cast" data-id="' + id + '">' + nm + '<small>' + sp.ink + '</small></button>'; }).join("");
  var bs = $("bossbar"); if (B.boss && !B.boss.dead){ bs.hidden = false; $("bossn").textContent = B.boss.n; $("bossf").style.width = (B.boss.hp / B.boss.max * 100) + "%"; } else bs.hidden = true;
  UI.chips();
};
UI.chips = function(){ var box = $("cands"); if (!IN.touch()){ box.innerHTML = ""; return; } var t = IN.text(), up = Hangul.isKo(t) ? t : t.toUpperCase();
  var es = B.enemies.filter(function(e){ return !e.dead && e.word && !e.burrowed && (!up || e.word.indexOf(up) === 0 || (Hangul.isKo(up) && Hangul.decompose(e.word).indexOf(Hangul.decompose(up)) === 0)); }).sort(function(a, b){ return b.d / eLen(b) - a.d / eLen(a); });
  var seen = {}, list = []; es.forEach(function(e){ if (!seen[e.word] && list.length < 3){ seen[e.word] = 1; list.push(e.word); } });
  var h = list.map(function(w, i){ return '<button class="cand' + (i === 0 ? " first" : "") + '" data-act="cand" data-w="' + esc(w) + '">' + esc(w) + '</button>'; }).join("");
  if (box.innerHTML !== h) box.innerHTML = h; };
/* 입력 판정 미리보기 */
function decide(t){
  if (!t) return {k:"empty"};
  var sp = spellOf(t); if (sp) return {k:"spell", sp:sp};
  var res = lookup(t);
  if (B.sel && res){ var tile = B.sel; if (B.pathSet[tile]) return {k:"bad", msg:"길 위에는 지을 수 없어요"}; return {k:"build", res:res, cost:costFor(res, tile), tile:tile}; }
  if (strikeTargets(t).length) return {k:"strike"};
  if (res) return {k:"needtile", res:res};
  var up = Hangul.isKo(t) ? t : t.toUpperCase();
  if (B.enemies.some(function(e){ return !e.dead && e.word && e.word.indexOf(up) === 0; })) return {k:"partial"};
  return {k:"none"};
}
UI.refreshInput = function(){
  if (UI.scene !== "battle" || !B) return;
  var t = IN.text(), d = decide(t), pv = $("prev"), ic = $("modei"), ml = $("model");
  if (IN.touch()) $("ti").value = t;
  var icons = {build:"망치", strike:"타격", spell:"주문", partial:"타격", needtile:"건설", none:"?", empty:"입력", bad:"!"};
  ml.textContent = icons[d.k] || ""; ic.className = "modei m-" + d.k;
  var h = "";
  if (d.k === "empty") h = B.sel ? (B.towers[B.sel] ? "같은 단어를 치면 합성 (Lv+1)" : "이 칸에 지을 단어를 입력하세요") : "칸을 누르거나, 적 머리 위 단어를 치세요";
  else if (d.k === "spell") h = "주문 " + d.sp.id + " · 잉크 " + d.sp.ink + (B.ink < d.sp.ink ? ' <b class="red">(부족)</b>' : "") + " · " + d.sp.d;
  else if (d.k === "build"){ var r = d.res, st = wordStats(r.w, r.ko ? null : r.typed), c = d.cost; h = chipEl(r.w.k) + ' <b>' + esc(r.label) + '</b>' + (r.w.ko && !r.ko ? ' ' + esc(r.w.ko) : r.ko ? ' ' + r.w.w : "") + ' · ' + (c.merge ? "합성 " : "") + '<b class="' + (RUN.gold < c.c ? "red" : "gd") + '">' + c.c + 'G</b> · <small>' + MODEN[st.mode] + ' ' + Math.round(st.dmg) + ' · ' + st.interval + '초 · 사거리 ' + st.range + (c.notes.length ? ' · ' + c.notes.join(", ") : "") + ' · ' + esc(r.w.a || "") + '</small>'; }
  else if (d.k === "strike") h = '적 단어 <b>' + esc(t) + '</b> 타격! Enter';
  else if (d.k === "partial") h = "적 단어 입력 중…";
  else if (d.k === "needtile") h = '<b>' + esc(d.res.label) + '</b> ' + chipEl(d.res.w.k) + ' — 지을 칸을 먼저 누르세요';
  else if (d.k === "bad") h = d.msg;
  else { var sg = t.length >= 3 ? suggest(t) : []; h = t.length < 3 && !Hangul.isKo(t) ? "3글자 이상" : '<span class="red">게임에 없는 단어입니다!</span>' + (sg.length ? ' 혹시: ' + sg.map(function(s){ return '<button class="sug" data-act="sug" data-w="' + esc(s) + '">' + esc(s) + '</button>'; }).join(" ") : ""); }
  pv.innerHTML = h; UI.chips();
};
UI.submit = function(){
  if (!B || B.over || UI.paused) return;
  var t = IN.text(); if (!t) return;
  if (Object.keys(IN.sealed).some(function(k){ return t.toUpperCase().indexOf(k) >= 0; }) && !Hangul.isKo(t)){ SFX.play("err"); UI.toast("봉인된 글자가 들어 있어요"); return; }
  var d = decide(t);
  if (d.k === "spell"){ var r = castSpell(d.sp); if (r.err){ UI.toast(r.err); SFX.play("err"); } else IN.clear(); UI.hudNow(); return; }
  if (d.k === "build"){ var b = build(d.res, d.tile); if (b.err){ UI.toast(b.err); SFX.play("err"); return; } comboUp(); IN.clear(); B.sel = null; UI.closeTower(); UI.tutEvent("build"); UI.hudNow(); return; }
  if (d.k === "strike"){ strike(t); IN.clear(); UI.tutEvent("strike"); UI.hudNow(); return; }
  if (d.k === "needtile"){ UI.toast("지을 칸을 먼저 누르세요"); SFX.play("err"); return; }
  if (d.k === "bad"){ UI.toast(d.msg); SFX.play("err"); return; }
  miss(); SFX.play("err"); vib(40); var sg = suggest(t); UI.toast("게임에 없는 단어입니다!" + (sg.length ? " 혹시: " + sg.join(", ") : "")); $("inbar").classList.remove("shake"); void $("inbar").offsetWidth; $("inbar").classList.add("shake"); IN.clear();
};
UI.relabelEnemies = function(){ if (!B) return; B.enemies.forEach(function(e){ if (e.boss){ if (e.word) e.word = IN.lang === "ko" ? e.bd.ko : e.bd.weak; return; } if (e.wobj){ if (IN.lang === "ko" && e.wobj.ko) e.word = e.wobj.ko; else if (IN.lang === "ko"){ var ew = enemyWord(2); e.word = ew.s; e.wobj = ew.w; } else e.word = e.wobj.w; } }); };
UI.sealKeys = function(){ if (IN.lang === "ko") return; var ks = shuffle("AEIOURSTLN".split("")).slice(0, 2); IN.sealed = {}; ks.forEach(function(k){ IN.sealed[k] = 1; }); IN.sealT = 5; UI.toast("렉시콘이 글자를 봉인했다: " + ks.join(", ")); UI.buildKb(); };
UI.stampCombo = function(n){ UI.banner("콤보 " + n + "! 참 잘했어요", "#ff9ec7"); };
UI.newWord = function(w){ UI.banner("NEW WORD! " + w.w + (w.ko ? " · " + w.ko : ""), "#8FD8FF"); };
/* 타워 정보 */
UI.openTower = function(t){
  var st = t.st, c = upgradeCost(t), sv = sellValue(t), TG2 = {first:"선두", last:"최후미", strong:"최대 체력", weak:"최소 체력", close:"가까운 적", fly:"비행 우선"};
  $("tpanel").innerHTML = '<div class="tph">' + sprImg(t.w, 2) + '<div><b>' + esc(t.typed) + '</b> ' + (t.w.ko ? esc(t.w.ko) + ' ' : '') + chipEl(t.w.k) + ' <span class="lv">Lv' + t.lv + '</span><br><small>' + MODEN[st.mode] + ' · 피해 ' + Math.round(st.dmg) + ' · ' + st.interval.toFixed(2) + '초 · 사거리 ' + st.range.toFixed(2) + (t.res ? ' · 공명 ' + t.res : '') + '</small></div>' + btn("✕", "closet", "sq", ' aria-label="닫기"') + '</div>' +
    '<p class="tpa">' + esc(t.w.a || "") + (t.w.v ? ' <small>★Lv5 ' + esc(t.w.v) + '</small>' : "") + '</p>' +
    '<div class="tpb">' + (t.lv < 3 ? btn("업그레이드 " + c + "G", "upg", RUN.gold >= c ? "pri" : "") : '<span class="note">Lv4부터는 같은 단어 합성</span>') + btn("판매 +" + sv + "G" + (RUN.erasers > 0 ? " (지우개)" : ""), "sell", "danger") + btn("타겟: " + TG2[t.tgt], "tgt", "") + '</div>';
  $("tpanel").hidden = false; UI.tpT = t;
};
UI.closeTower = function(){ $("tpanel").hidden = true; UI.tpT = null; };
UI.tapMap = function(ev){
  if (!B || B.over) return; var tile = tileAt(ev.clientX, ev.clientY); if (!tile) return;
  if (B.pathSet[tile]){ B.sel = null; UI.closeTower(); UI.toast("길 위에는 지을 수 없어요"); UI.refreshInput(); return; }
  B.sel = B.sel === tile && !B.towers[tile] ? null : tile; SFX.play("key");
  if (B.towers[tile]) UI.openTower(B.towers[tile]); else UI.closeTower();
  UI.tutEvent("tile"); UI.refreshInput();
  if (!IN.touch()) $("ti").focus();
};
/* ---------- 키보드 ---------- */
UI.buildKb = function(){
  var kb = $("kb"); if (!IN.touch()){ kb.hidden = true; $("battle").classList.remove("touch"); return; } kb.hidden = false; $("battle").classList.add("touch");
  var ko = IN.lang === "ko", cji = SAVE.settings.kb === "cji", both = IN.langAllowed().length > 1, h = "";
  function k(v, label, cls, sub){ return '<button class="k ' + (cls || "") + (IN.sealed[v] ? " sealed" : "") + '" data-k="' + v + '">' + (label || v) + (sub ? '<small>' + sub + '</small>' : "") + '</button>'; }
  var langK = both ? k("LANG", ko ? "한/<b>영</b>" : "<b>한</b>/영", "fn") : "";
  if (cji){ kb.className = "kb cji";
    if (ko) h = row([k("ㅣ"), k("ㆍ"), k("ㅡ"), k("BACK", "⌫", "fn")]) + row([k("ㄱ", "ㄱ", "", "ㅋ"), k("ㄴ", "ㄴ", "", "ㄹ"), k("ㄷ", "ㄷ", "", "ㅌ"), k("ENTER", "확정", "ok")]) + row([k("ㅂ", "ㅂ", "", "ㅍ"), k("ㅅ", "ㅅ", "", "ㅎ"), k("ㅈ", "ㅈ", "", "ㅊ"), langK || k("NEXT", "→", "fn")]) + row([k("DICT", "사전", "fn"), k("ㅇ", "ㅇ", "", "ㅁ"), k("NEXT", "→", "fn"), k("WAVE", "웨이브 ▶", "wv")]);
    else h = row([k("ABC"), k("DEF"), k("GHI"), k("BACK", "⌫", "fn")]) + row([k("JKL"), k("MNO"), k("PQRS"), k("ENTER", "확정", "ok")]) + row([k("TUV"), k("WXYZ"), k("NEXT", "→", "fn"), langK || k("DICT", "사전", "fn")]) + row([k("DICT", "사전", "fn"), k("WAVE", "웨이브 ▶", "wv")]);
  } else { kb.className = "kb qw";
    if (ko){ var r1 = "ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ".split(""), r2 = "ㅁㄴㅇㄹㅎㅗㅓㅏㅣ".split(""), r3 = "ㅋㅌㅊㅍㅠㅜㅡ".split(""); function sh(c){ return IN.shift && DUBS[c] ? DUBS[c] : c; }
      h = row(r1.map(function(c){ return k(c, sh(c)); })) + row(r2.map(function(c){ return k(c); })) + row([k("SHIFT", "⇧", "fn" + (IN.shift ? " on" : ""))].concat(r3.map(function(c){ return k(c); }), [k("BACK", "⌫", "fn")])); }
    else h = row("QWERTYUIOP".split("").map(function(c){ return k(c, c, "", PT[c]); })) + row("ASDFGHJKL".split("").map(function(c){ return k(c, c, "", PT[c]); })) + row("ZXCVBNM".split("").map(function(c){ return k(c, c, "", PT[c]); }).concat([k("BACK", "⌫", "fn wide")]));
    h += row([langK, k("DICT", "사전", "fn"), k("ENTER", "확정", "ok"), k("WAVE", "웨이브 ▶", "wv")].filter(Boolean));
  }
  kb.innerHTML = h;
  function row(a){ return '<div class="kr">' + a.join("") + '</div>'; }
};
/* ---------- 튜토리얼 ---------- */
UI.hint = function(t){ var h = $("hint"); h.innerHTML = t || ""; h.hidden = !t; };
var TUT = [
  ["tile", "① 맵의 <b>빈 칸</b>(형광펜 길이 아닌 곳)을 눌러 고르세요."],
  ["build", "② <b>FIRE</b>(또는 <b>불</b>)를 입력하고 <b>확정</b>. 단어가 곧 타워가 됩니다. 길 옆 칸일수록 좋아요."],
  ["wave", "③ 두세 개 더 지어 보고 <b>웨이브 ▶</b>로 시작하세요. 비용은 글자 점수로 정해져요."],
  ["strike", "④ 적 머리 위 <b>단어</b>를 그대로 치고 확정하면 직접 때립니다! 이어 치면 콤보."],
  ["done", "좋아요! 콤보로 잉크를 모으면 주문(STOP, RUSH…)을 쓸 수 있어요."]
];
UI.tutStep = function(){ var s = TUT[UI.tut]; if (!s){ UI.hint(""); SAVE.tut = true; save(); return; } UI.hint(s[1]); if (s[0] === "done") setTimeout(function(){ if (UI.tut === TUT.length - 1){ UI.tut++; UI.tutStep(); } }, 6000); };
UI.tutEvent = function(ev){ if (SAVE.tut || UI.tut == null) return; var s = TUT[UI.tut]; if (s && s[0] === ev){ UI.tut++; UI.tutStep(); } };

/* ---------- 쪽 클리어 → 보상 ---------- */
UI.pageCleared = function(){
  if (!RUN || !B) return; if (!SAVE.tut && UI.tut != null){ SAVE.tut = true; save(); UI.hint(""); }
  save();
  var n = RUN.node; if (n.type === "boss") return UI.runEnd(true);
  UI.reward(n.type === "elite");
};
function stickerPool(minR){ return STICKERS.filter(function(s){ return RUN.stickers.indexOf(s.id) < 0 && s.r >= (minR || 0); }); }
function rollStickers(n, elite){ var out = [], pool; for (var i = 0; i < n; i++){ var r = Math.random(), want = elite ? (r < 0.2 ? 2 : 1) : (r < 0.05 ? 2 : r < 0.3 ? 1 : 0);
  pool = stickerPool().filter(function(s){ return s.r === want && out.indexOf(s) < 0; }); if (!pool.length) pool = stickerPool(elite ? 1 : 0).filter(function(s){ return out.indexOf(s) < 0; }); if (!pool.length) pool = stickerPool().filter(function(s){ return out.indexOf(s) < 0; }); if (pool.length) out.push(pick(pool)); } return out; }
function stickerCard(s, act, price){ return '<button class="stk r' + s.r + '" data-act="' + act + '" data-id="' + s.id + '"><span class="face">' + s.n.slice(0, 2) + '</span><span class="sd"><b>' + s.n + '</b><em>' + RARN[s.r] + '</em><small>' + s.d + '</small>' + (price ? '<i>' + price + 'G</i>' : "") + '</span></button>'; }
UI.reward = function(elite){
  UI.scene = "reward"; SFX.bgm(true);
  var mul = RUN.rewardMul || 1; RUN.rewardMul = 1;
  if (elite){ addGoldRun(40 * mul); }
  RUN.offer = rollStickers(3, elite);
  UI.show('<div class="page"><div class="stampbig">참 잘했어요<small>' + (RUN.page + 1) + '쪽 클리어</small></div>' +
    '<p class="center mute">처치 ' + B.pageKills + ' · 최고 콤보 ' + B.maxCombo + ' · 골드 +' + Math.max(0, RUN.gold - B.goldStart) + (elite ? ' (엘리트 보너스 포함)' : '') + '</p>' + runBar() +
    '<h3>스티커 하나 고르기 <small>표지 칸 ' + RUN.stickers.length + '/8</small></h3><div class="stks">' + RUN.offer.map(function(s){ return stickerCard(s, "takestk"); }).join("") + '</div>' +
    '<div class="row2">' + btn("대신 골드 " + 40 * mul + "G", "takegold", "") + '</div></div>');
  UI.rewardGold = 40 * mul;
};
function addGoldRun(g){ RUN.gold += g; }
UI.takeSticker = function(id, after){
  if (RUN.stickers.length >= 8){ UI.modal('<h3>스티커 칸이 가득 찼어요</h3><p>뗄 스티커를 고르세요.</p><div class="stks">' + RUN.stickers.map(function(x){ var s = STICKERS.filter(function(y){ return y.id === x; })[0]; return stickerCard(s, "replstk"); }).join("") + '</div>' + btn("취소", "closemodal", "")); UI.pendingStk = {id:id, after:after}; return; }
  RUN.stickers.push(id); onSticker(id); SFX.play("gold"); (after || UI.nextPage)();
};
function onSticker(id){ if (id === "wall"){ RUN.maxLife += 5; RUN.life += 5; } if (id === "freepen") RUN.freeTickets += 2; if (B) recalcAll(); }
/* ---------- 문구점 ---------- */
UI.shop = function(fresh){
  UI.scene = "shop"; SFX.bgm(true);
  if (fresh){ RUN.shopItems = rollStickers(2, false).map(function(s){ return {s:s, price:[60, 100, 150][s.r]}; }); RUN.refresh = 20;
    var sp = SPELLS.filter(function(x){ return RUN.spells.indexOf(x.id) < 0; }); RUN.shopSpell = sp.length ? pick(sp) : null; RUN.coupon = true; }
  var items = RUN.shopItems.map(function(it){ return stickerCard(it.s, "buystk", it.price); }).join("");
  UI.show('<div class="page"><div class="ph"><h2>문구점</h2></div>' + runBar() +
    '<h3>스티커</h3><div class="stks">' + (items || '<p class="mute">다 팔렸어요</p>') + '</div>' +
    '<h3>그 밖</h3><div class="shoplist">' +
    (RUN.shopSpell ? '<button class="shopit" data-act="buyspell"><b>주문 ' + RUN.shopSpell.id + ' (' + RUN.shopSpell.ko + ')</b><small>' + RUN.shopSpell.d + ' · 잉크 ' + RUN.shopSpell.ink + '</small><i>80G</i></button>' : '') +
    (RUN.coupon ? '<button class="shopit" data-act="coupon"><b>레벨업 쿠폰</b><small>고른 타워 Lv +1 (Lv3까지)</small><i>70G</i></button>' : '') +
    '<button class="shopit" data-act="refresh"><b>수정테이프</b><small>스티커 진열 새로고침</small><i>' + RUN.refresh + 'G</i></button>' +
    '<button class="shopit" data-act="eraser"><b>지우개</b><small>내 스티커 1개를 떼고 골드 30</small><i>무료</i></button></div>' +
    '<div class="sticky">' + btn("문구점 나가기", "leaveshop", "pri big") + '</div></div>');
};
function spend(c){ if (RUN.gold < c){ UI.toast("골드가 모자라요"); SFX.play("err"); return false; } RUN.gold -= c; SFX.play("gold"); return true; }
/* ---------- 쉬는 시간 ---------- */
UI.event = function(){
  UI.scene = "event"; var ev = pick(EVENTS); RUN.ev = ev;
  UI.show('<div class="page"><div class="ph"><h2>쉬는 시간</h2></div>' + runBar() + '<div class="evcard"><h3>' + ev.n + '</h3><p>' + ev.d + '</p>' +
    ev.o.map(function(o, i){ return '<button class="evopt" data-act="evo" data-i="' + i + '"><b>' + o[0] + '</b><small>' + o[1] + '</small></button>'; }).join("") + '</div></div>');
};
UI.evo = function(i){
  var ev = RUN.ev, done = function(msg){ if (msg) UI.toast(msg); UI.nextPage(); };
  if (ev.id === "eraser"){ if (i === 0){ var s = rollStickers(1, false)[0]; if (s) return UI.takeSticker(s.id, function(){ done("스티커 " + s.n + "!"); }); } else { RUN.life += 3; RUN.maxLife = Math.max(RUN.maxLife, RUN.life); } return done(i ? "생명 +3" : ""); }
  if (ev.id === "quiz"){ if (i === 0) return UI.quiz(); return done(); }
  if (ev.id === "lunch"){ if (i === 0){ RUN.life += 5; RUN.maxLife = Math.max(RUN.maxLife, RUN.life); return done("생명 +5"); } RUN.gold += 60; return done("골드 +60"); }
  if (ev.id === "pencase"){ if (i === 0){ var ts = towerList().sort(function(a, b){ return b.spent - a.spent; }); if (ts.length >= 2){ var hi = ts[0], lo = ts[ts.length - 1]; if (hi.lv < 5) hi.lv++; sell(lo); recalcAll(); return done(hi.typed + " Lv" + hi.lv + ", " + lo.typed + " 판매"); } return done("타워가 2기 이상 있어야 해요"); } return done(); }
  if (ev.id === "nodoodle"){ if (i === 0){ RUN.nextLong = true; RUN.rewardMul = 2; return done("다음 쪽: 적 단어 길이 +2, 보상 ×2"); } return done(); }
  if (ev.id === "mate"){ if (i === 0){ if (!RUN.stickers.length) return done("줄 스티커가 없어요"); RUN.stickers.splice(Math.floor(Math.random() * RUN.stickers.length), 1); if (Math.random() < 0.5){ var h = pick(stickerPool(2)); if (h){ RUN.stickers.push(h.id); onSticker(h.id); return done("홀로그램 " + h.n + "!"); } } return done("아쉽게도 꽝…"); } return done(); }
  if (ev.id === "library"){ if (i === 0){ var ws = shuffle(WORDS.filter(function(w){ return !w.u && w.m && w.m >= 1; })).slice(0, 3); ws.forEach(function(w){ RUN.discount[w.w] = 1; SAVE.seen[w.w] = 1; }); return done("이번 판 −50%: " + ws.map(function(w){ return w.w + (w.ko ? "(" + w.ko + ")" : ""); }).join(", ")); } RUN.life += 2; return done("생명 +2"); }
  if (ev.id === "nap"){ if (i === 0){ RUN.skipWave = true; return done("다음 쪽 웨이브 1개 건너뛰기"); } RUN.gold += 25; return done("골드 +25"); }
  done();
};
UI.quiz = function(){
  var got = {}, left = 15, need = 5;
  UI.modal('<h3>쪽지 시험</h3><p>15초 안에 서로 다른 목록 단어 5개를 입력하세요 (영어 또는 한글).</p><input id="quizin" class="qin" autocomplete="off" autocapitalize="characters" spellcheck="false"><p id="quizs" class="mute"></p>' + btn("포기", "quizend", ""));
  var inp = $("quizin"); inp.focus();
  function upd(){ $("quizs").textContent = "남은 시간 " + left + "초 · " + Object.keys(got).length + "/" + need + " (" + Object.keys(got).join(", ") + ")"; }
  inp.addEventListener("keydown", function(e){ if (e.key !== "Enter") return; var r = lookup(inp.value.trim()); if (r && !got[r.w.w]){ got[r.w.w] = 1; SFX.play("build"); } else SFX.play("err"); inp.value = ""; upd(); if (Object.keys(got).length >= need) fin(true); });
  upd(); UI.quizT = setInterval(function(){ left--; upd(); if (left <= 0) fin(false); }, 1000);
  function fin(ok){ clearInterval(UI.quizT); UI.closeModal(); if (ok){ var s = pick(stickerPool(1)); if (s) return UI.takeSticker(s.id, function(){ UI.toast("합격! " + s.n); UI.nextPage(); }); } UI.toast(ok ? "합격!" : "아쉽게 시간 초과"); UI.nextPage(); }
  UI.quizFin = fin;
};
/* ---------- 판 끝 ---------- */
UI.runEnd = function(win){
  if (!RUN) return; UI.scene = "result"; SFX.bgm(false); SFX.play(win ? "win" : "lose");
  var stars = 0;
  if (win){ stars = 1 + (RUN.life >= RUN.maxLife * 0.5 ? 1 : 0) + (RUN.life >= RUN.maxLife ? 1 : 0); var key = RUN.nb + "_" + RUN.grade; SAVE.stars[key] = Math.max(SAVE.stars[key] || 0, stars); SAVE.clear[RUN.nb] = Math.max(SAVE.clear[RUN.nb] || 0, RUN.grade); }
  save();
  var used = Object.keys(RUN.usedWords);
  UI.show('<div class="page result">' + (win ? '<div class="stampbig">참 잘했어요<small>' + NOTEBOOKS[RUN.nb].n + ' 클리어</small></div><div class="stars">' + "★★★".slice(0, stars) + '<span>' + "★★★".slice(stars) + '</span></div>' : '<div class="stampbig lose">다시 해 볼까?<small>' + (RUN.page + 1) + '쪽에서 멈춤</small></div>') +
    '<div class="rstat"><div><span>쓴 단어</span><b>' + used.length + '</b></div><div><span>최고 콤보</span><b>' + Math.max(RUN.maxCombo || 0, B ? B.maxCombo : 0) + '</b></div><div><span>남은 생명</span><b>' + RUN.life + '</b></div><div><span>스티커</span><b>' + RUN.stickers.length + '</b></div></div>' +
    '<p class="mute center">' + used.slice(0, 20).join(" · ") + '</p>' +
    (win && RUN.grade < 10 ? '<p class="center">등급 ' + (RUN.grade + 1) + '이 열렸어요.' + (RUN.nb < 4 && SAVE.clear[RUN.nb] === 1 ? ' 다음 공책 <b>' + NOTEBOOKS[RUN.nb + 1].n + '</b>도 열렸어요!' : '') + '</p>' : '') +
    '<div class="sticky">' + btn("다시 하기", "setup", "pri big") + btn("처음으로", "title", "") + '</div></div>');
  RUN = null; B = null;
};
/* ---------- 사전 ---------- */
UI.dict = function(){
  var q = "", list = function(){ var ws = WORDS.filter(function(w){ return SAVE.used[w.w] || SAVE.seen[w.w]; }); if (q) ws = ws.filter(function(w){ return (w.w + " " + (w.ko || "") + " " + (w.a || "")).toLowerCase().indexOf(q.toLowerCase()) >= 0; });
    return ws.slice(0, 120).map(function(w){ var st = wordStats(w); return '<button class="dw" data-act="dpick" data-w="' + w.w + '">' + sprImg(w, 2) + '<span><b>' + w.w + '</b> ' + esc(w.ko || "") + ' ' + chipEl(w.k) + (SAVE.used[w.w] ? "" : ' <em>본 단어</em>') + '<small>' + Math.round(baseCost(w)) + 'G · ' + MODEN[st.mode] + ' · ' + esc(w.a || "") + '</small></span></button>'; }).join("") || '<p class="mute">아직 발견한 단어가 없어요. 지어 보거나 적 단어를 쳐 보세요.</p>'; };
  var found = Object.keys(SAVE.used).length, seen = WORDS.filter(function(w){ return SAVE.seen[w.w] && !SAVE.used[w.w]; }).length;
  UI.modal('<div class="mh"><h3>단어 사전</h3>' + btn("✕", "closemodal", "sq", ' aria-label="닫기"') + '</div><p class="mute">지은 단어 ' + found + ' · 본 단어 ' + seen + ' / 전체 ' + WORDS.length + '. 누르면 입력돼요.</p><input id="dq" class="qin" placeholder="검색 (영어·한글·능력)"><div id="dl" class="dlist">' + list() + '</div>');
  $("dq").addEventListener("input", function(){ q = this.value; $("dl").innerHTML = list(); });
  if (UI.scene === "battle" && !UI.paused){ UI.paused = true; UI.pausedByModal = true; }
};
/* ---------- 설정 ---------- */
UI.settings = function(){
  var s = SAVE.settings;
  function seg(name, opts){ return '<div class="segs">' + opts.map(function(o){ return '<button class="seg' + (s[name] === o[0] ? " on" : "") + '" data-act="set" data-k="' + name + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join("") + '</div>'; }
  function tog(name){ return '<button class="tog' + (s[name] ? " on" : "") + '" data-act="tog" data-k="' + name + '" aria-pressed="' + !!s[name] + '"><i></i></button>'; }
  function rng(name, min, max, stp){ return '<input type="range" data-set="' + name + '" min="' + min + '" max="' + max + '" step="' + stp + '" value="' + s[name] + '">'; }
  UI.modal('<div class="mh"><h3>설정</h3>' + btn("✕", "closemodal", "sq", ' aria-label="닫기"') + '</div>' +
    '<h4>모바일 키보드</h4>' + seg("kb", [["qwerty", "쿼티"], ["cji", "천지인"]]) + '<p class="mute">쿼티: 영문 기본, 한/영 키로 두벌식 한글. 천지인: ㅣㆍㅡ 한글 기본, 한/영 키로 영문 다중 탭. 한글로 입력하면 적 단어도 한글 이름으로 바뀌어요.</p>' +
    '<h4>입력 언어</h4>' + seg("lang", [["en", "영어"], ["ko", "한글"], ["both", "둘 다"]]) +
    '<h4>화면 키보드</h4>' + seg("kbShow", [["auto", "자동 (터치면 표시)"], ["on", "항상"], ["off", "끄기"]]) +
    '<div class="setrow"><span>다중 탭·천지인 넘김 시간 <b id="waitv">' + (s.wait / 1000).toFixed(1) + '초</b></span>' + rng("wait", 400, 1500, 100) + '</div>' +
    '<div class="setrow"><span>천천히 타이핑 <small>적 단어 짧게, 콤보 유지 +1.5초, 오답 벌점 없음</small></span>' + tog("slow") + '</div>' +
    '<div class="setrow"><span>한글 모드에서 타워 이름표도 한글</span>' + tog("koPlate") + '</div>' +
    '<div class="setrow"><span>효과음</span>' + rng("sfx", 0, 1, 0.1) + '</div><div class="setrow"><span>배경음</span>' + rng("bgm", 0, 1, 0.1) + '</div>' +
    '<div class="setrow"><span>진동</span>' + tog("vib") + '</div><div class="setrow"><span>화면 흔들림</span>' + tog("shake") + '</div><div class="setrow"><span>피해 숫자</span>' + tog("nums") + '</div>' +
    '<h4>크레딧</h4><p class="mute">영감을 받은 영상: <a href="https://youtube.com/shorts/XlcxdyNHKjE" target="_blank" rel="noopener">youtube.com/shorts/XlcxdyNHKjE</a><br>타워 능력, 적, 맵, 그래픽, 사운드는 WORD TD가 독자적으로 설계·제작했습니다.<br>글꼴: Silkscreen, Noto Sans KR, Gaegu (Google Fonts)</p>' +
    btn("기록 초기화", "reset", "danger"));
  if (UI.scene === "battle" && !UI.paused){ UI.paused = true; UI.pausedByModal = true; }
};
UI.pause = function(){ UI.paused = true; UI.modal('<h3>일시정지</h3><div class="menu">' + btn("계속하기", "resume", "pri big") + btn("단어 사전", "dict", "") + btn("설정", "settings", "") + btn("스티커 보기", "stickers", "") + btn("판 포기", "abandon", "danger") + '</div>'); };
UI.stickers = function(){ var h = RUN && RUN.stickers.length ? RUN.stickers.map(function(id){ var s = STICKERS.filter(function(x){ return x.id === id; })[0]; return stickerCard(s, "none"); }).join("") : '<p class="mute">아직 스티커가 없어요.</p>';
  UI.modal('<div class="mh"><h3>내 스티커 ' + (RUN ? RUN.stickers.length : 0) + '/8</h3>' + btn("✕", "closemodal", "sq", ' aria-label="닫기"') + '</div><div class="stks">' + h + '</div>' + (RUN ? '<p class="mute">펜: ' + PENS.filter(function(p){ return p.id === RUN.pen; })[0].d + (RUN.erasers ? ' · 지우개 ' + RUN.erasers : '') + (RUN.freeTickets ? ' · 무료 건설권 ' + RUN.freeTickets : '') + '</p>' : '')); };

/* ================= 이벤트 연결 ================= */
document.addEventListener("click", function(e){
  var b = e.target.closest("[data-act]"); if (!b || b.disabled) return; var a = b.getAttribute("data-act"), d = b.dataset; SFX.init();
  switch (a){
    case "setup": UI.setup(); break; case "title": UI.title(); break; case "dict": UI.dict(); break; case "settings": UI.settings(); break;
    case "nb": UI.setupSel.nb = +d.i; UI.setupSel.grade = maxGrade(+d.i); UI.renderSetup(); break;
    case "grade": UI.setupSel.grade = +d.i; UI.renderSetup(); break; case "diff": UI.setupSel.diff = +d.i; UI.renderSetup(); break;
    case "pen": UI.setupSel.pen = d.id; UI.renderSetup(); break;
    case "spell": var sp = UI.setupSel.spells, i = sp.indexOf(d.id); if (i >= 0) sp.splice(i, 1); else { sp.push(d.id); if (sp.length > 2) sp.shift(); } UI.renderSetup(); break;
    case "begin": UI.begin(); break; case "go": UI.go(+d.j); break;
    case "takestk": UI.takeSticker(d.id); break; case "takegold": RUN.gold += UI.rewardGold || 40; SFX.play("gold"); UI.nextPage(); break;
    case "replstk": var p = UI.pendingStk; RUN.stickers.splice(RUN.stickers.indexOf(d.id), 1); UI.closeModal(); RUN.stickers.push(p.id); onSticker(p.id); (p.after || UI.nextPage)(); break;
    case "buystk": var it = RUN.shopItems.filter(function(x){ return x.s.id === d.id; })[0]; if (it && RUN.stickers.length >= 8){ UI.toast("스티커 칸이 가득 찼어요. 지우개로 먼저 떼세요."); break; } if (it && spend(it.price)){ RUN.stickers.push(it.s.id); onSticker(it.s.id); RUN.shopItems.splice(RUN.shopItems.indexOf(it), 1); UI.shop(false); } break;
    case "buyspell": if (spend(80)){ RUN.spells.push(RUN.shopSpell.id); RUN.shopSpell = null; UI.shop(false); } break;
    case "coupon": var ts = towerList().filter(function(t){ return t.lv < 3; }); if (!ts.length){ UI.toast("Lv3 미만 타워가 없어요"); break; } UI.modal('<h3>레벨업 쿠폰 (70G)</h3><div class="dlist">' + ts.map(function(t){ return '<button class="dw" data-act="usecoupon" data-k="' + t.x + "," + t.y + '">' + sprImg(t.w, 2) + '<span><b>' + t.typed + '</b> Lv' + t.lv + ' → Lv' + (t.lv + 1) + '</span></button>'; }).join("") + '</div>' + btn("취소", "closemodal", "")); break;
    case "usecoupon": if (spend(70)){ var t = B.towers[d.k]; t.lv++; recalcAll(); RUN.coupon = false; UI.closeModal(); UI.toast(t.typed + " Lv" + t.lv); UI.shop(false); } break;
    case "refresh": if (spend(RUN.refresh)){ RUN.refresh += 10; RUN.shopItems = rollStickers(2, false).map(function(s){ return {s:s, price:[60, 100, 150][s.r]}; }); UI.shop(false); } break;
    case "eraser": if (!RUN.stickers.length){ UI.toast("뗄 스티커가 없어요"); break; } UI.modal('<h3>지우개: 뗄 스티커 (골드 +30)</h3><div class="stks">' + RUN.stickers.map(function(x){ return stickerCard(STICKERS.filter(function(y){ return y.id === x; })[0], "erasestk"); }).join("") + '</div>' + btn("취소", "closemodal", "")); break;
    case "erasestk": RUN.stickers.splice(RUN.stickers.indexOf(d.id), 1); RUN.gold += 30; if (d.id === "wall"){ RUN.maxLife -= 5; RUN.life = Math.max(1, RUN.life - 5); } UI.closeModal(); UI.shop(false); break;
    case "leaveshop": UI.nextPage(); break; case "evo": UI.evo(+d.i); break; case "quizend": UI.quizFin && UI.quizFin(false); break;
    case "abandon": UI.closeModal(); if (confirm("이 판을 포기할까요?")){ if (B) B.over = true; UI.runEnd(false); } break;
    case "stickers": UI.stickers(); break; case "closemodal": UI.closeModal(); break;
    case "resume": UI.closeModal(); UI.paused = false; break;
    case "pause": UI.pause(); break;
    case "speed": SAVE.settings.speed = SAVE.settings.speed >= 3 ? 1 : SAVE.settings.speed + 1; b.textContent = "×" + SAVE.settings.speed; save(); break;
    case "full": toggleFull(); break;
    case "wave": startWave(true); UI.tutEvent("wave"); UI.hudNow(); break;
    case "cast": var spx = SPELLS.filter(function(x){ return x.id === d.id; })[0], rr = castSpell(spx); if (rr.err) UI.toast(rr.err); UI.hudNow(); break;
    case "cand": UI.chipUsed = true; if (!strike(d.w)) UI.chipUsed = false; IN.clear(); UI.tutEvent("strike"); UI.hudNow(); break;
    case "sug": IN.setText(d.w); break;
    case "dpick": UI.closeModal(); if (UI.scene === "battle") IN.setText(IN.lang === "ko" && WMAP[d.w] && WMAP[d.w].ko && IN.touch() ? WMAP[d.w].ko : d.w); break;
    case "closet": UI.closeTower(); B.sel = null; UI.refreshInput(); break;
    case "upg": var r1 = upgrade(UI.tpT); if (r1.err) UI.toast(r1.err); UI.openTower(UI.tpT); UI.hudNow(); break;
    case "sell": var v = sell(UI.tpT); UI.toast("판매 +" + v + "G"); UI.closeTower(); B.sel = null; UI.hudNow(); break;
    case "tgt": var o = ["first", "last", "strong", "weak", "close", "fly"]; UI.tpT.tgt = o[(o.indexOf(UI.tpT.tgt) + 1) % o.length]; UI.openTower(UI.tpT); break;
    case "set": SAVE.settings[d.k] = d.v; save(); if (d.k === "lang"){ var al = IN.langAllowed(); if (al.indexOf(IN.lang) < 0) IN.setLang(al[0]); } if (d.k === "kb" && d.v === "cji" && IN.langAllowed().indexOf("ko") >= 0) IN.lang = "ko"; if (UI.scene === "battle"){ UI.buildKb(); UI.refreshInput(); } UI.settings(); break;
    case "tog": SAVE.settings[d.k] = !SAVE.settings[d.k]; save(); UI.settings(); break;
    case "reset": if (confirm("별, 클리어 기록, 발견한 단어를 모두 지울까요?")){ try { localStorage.removeItem(SAVE_KEY); } catch (er){} location.reload(); } break;
  }
});
document.addEventListener("input", function(e){ var k = e.target.getAttribute && e.target.getAttribute("data-set"); if (!k) return; SAVE.settings[k] = +e.target.value; if (k === "wait"){ IN.cji.wait = SAVE.settings.wait; $("waitv").textContent = (SAVE.settings.wait / 1000).toFixed(1) + "초"; } SFX.vol(); save(); });
function toggleFull(){ var d = document, el = d.documentElement; if (!d.fullscreenElement && !d.webkitFullscreenElement){ (el.requestFullscreen || el.webkitRequestFullscreen || function(){}).call(el); try { screen.orientation && screen.orientation.lock && screen.orientation.lock("portrait").catch(function(){}); } catch (e){} } else (d.exitFullscreen || d.webkitExitFullscreen).call(d); }

/* ================= 시작 ================= */
function boot(){
  rInit($("cv")); IN.cji.wait = SAVE.settings.wait;
  $("cv").addEventListener("pointerdown", function(e){ e.preventDefault(); UI.tapMap(e); });
  $("kb").addEventListener("pointerdown", function(e){ var k = e.target.closest("[data-k]"); if (!k) return; e.preventDefault(); var v = k.getAttribute("data-k"); k.classList.add("down"); setTimeout(function(){ k.classList.remove("down"); }, 90);
    if (v === "DICT") return UI.dict(); if (v === "WAVE"){ startWave(true); UI.tutEvent("wave"); return UI.hudNow(); } IN.key(v); });
  var ti = $("ti");
  ti.addEventListener("input", function(){ if (!IN.touch()){ if (Hangul.isKo(ti.value) && IN.lang !== "ko" && IN.langAllowed().indexOf("ko") >= 0){ IN.lang = "ko"; UI.relabelEnemies(); } UI.refreshInput(); } });
  ti.addEventListener("keydown", function(e){ if (e.isComposing) return; if (e.key === "Enter"){ e.preventDefault(); UI.submit(); } else if (e.key === "Escape"){ IN.clear(); B && (B.sel = null); UI.closeTower(); } else if (e.key === "Tab"){ e.preventDefault(); UI.dict(); } });
  ti.addEventListener("keyup", function(e){ if (e.key === "Enter" && e.isComposing === false && Hangul.isKo(ti.value) && ti.value){ /* IME 확정 직후 Enter */ } });
  document.addEventListener("keydown", function(e){
    if (UI.scene !== "battle") return;
    if (e.key === " " && !ti.value){ e.preventDefault(); if (UI.paused) { UI.closeModal(); UI.paused = false; } else UI.pause(); }
    if (e.key === "Hangul" || e.key === "HangulMode"){ IN.setLang(IN.lang === "en" ? "ko" : "en"); }
    if (document.activeElement !== ti && $("modal").hidden && !IN.touch() && /^[a-zA-Z]$/.test(e.key)){ ti.focus(); }
  });
  $("langbtn").addEventListener("click", function(){ var al = IN.langAllowed(); if (al.length > 1){ IN.setLang(IN.lang === "en" ? "ko" : "en"); if (!IN.touch()) ti.focus(); } else UI.toast("설정 → 입력 언어에서 '둘 다'를 고르면 바꿀 수 있어요"); });
  window.addEventListener("resize", function(){ if (UI.scene === "battle"){ rResize(); } UI.buildKb(); });
  document.addEventListener("visibilitychange", function(){ if (document.hidden && UI.scene === "battle" && !UI.paused) UI.pause(); });
  $("modal").addEventListener("click", function(e){ if (e.target.id === "modal" && UI.scene !== "battle") UI.closeModal(); });
  if (IN.touch()) ti.setAttribute("inputmode", "none"), ti.readOnly = true;
  $("speedbtn").textContent = "×" + SAVE.settings.speed;
  UI.title(); requestAnimationFrame(loop);
}
var last = 0;
function loop(ts){
  requestAnimationFrame(loop);
  try { frame(ts); } catch (err){ if (!loop.warned){ loop.warned = 1; console.error(err); } }
}
function frame(ts){
  var dt = Math.min(0.1, (ts - (last || ts)) / 1000); last = ts;
  if (UI.scene === "battle" && B && !UI.paused && !B.over){
    var t = dt * SAVE.settings.speed; while (t > 0){ var s = Math.min(0.04, t); step(s); t -= s; }
    if (IN.sealT > 0){ IN.sealT -= dt; if (IN.sealT <= 0){ IN.sealed = {}; UI.buildKb(); } }
    UI.hudT -= dt; if (UI.hudT <= 0){ UI.hudT = 0.12; UI.hudNow(); $("langbtn").textContent = IN.lang === "ko" ? "한" : "EN"; }
  }
  if (UI.scene === "battle" && B) draw();
}
