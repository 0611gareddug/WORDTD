/* ---------- 타워 공격 모션과 상세 정보 ---------- */
var TA_FXK = [["burn",/화상|불태|불씨|태우/],["slow",/둔화|감속|느리|이동 속도 ?-/],["stun",/기절|멈춤|정지|얼려/],["chain",/연쇄|튕|번져|옮겨/],["poison",/독|중독/],["knock",/넉백|밀어|밀쳐|후퇴/],["execute",/즉사|처형/],["pierceArmor",/방어(력)? ?무시|방어 관통/],["crit",/치명/],["buff",/공격력 \+|공격 속도 \+|강화/],["gold",/골드|G /],["heal",/회복|생명/]];
var TA_FXDEF = {burn:20, slow:30, stun:15, chain:2, poison:2, knock:0.3, execute:10, pierceArmor:50, crit:15, buff:10, gold:10, heal:1};
function taStats(w){
  if (w.u && w.s){ var s = w.s; return {mode:s.mode, dmg:s.dmg, dtype:s.dtype, interval:s.interval, range:s.range, radius:s.radius || 0, fx:s.fx || {}, exact:true}; }
  var b = teBase(w.w), a = (w.a || "") + " " + (w.e || ""), m = w.m == null ? 1 : w.m, mode = "single", fx = {}, radius = 0;
  if (w.k === "support" || w.m == null) mode = "aura";
  else if (/광선|빔|레이저/.test(a)) mode = "beam";
  else if (/관통|일직선|꿰뚫|직선/.test(a) || w.k === "light") mode = "pierce";
  else if (/범위|폭발|주변 적|광역|전체|지진|폭풍|쓸어/.test(a) || w.k === "earth"){ mode = "aoe"; var r = a.match(/(\d(?:\.\d)?)칸/); radius = r ? Math.min(3, +r[1]) : 1.2; }
  else if (/함정|설치|덫|지뢰|압정/.test(a)) mode = "trap";
  else if (/연사|연타|빠르게|난사|2연|3연/.test(a) || w.k === "wind") mode = "rapid";
  var UNIT = {chain:"회", poison:"중첩", knock:"칸", gold:"G", heal:"__"};
  TA_FXK.forEach(function(f){ if (!f[1].test(a)) return; var u = UNIT[f[0]] || "%", re = new RegExp("(?:" + f[1].source + ")[^\\d]{0,10}[+-]?(\\d+(?:\\.\\d+)?) ?" + u), mm = a.match(re); fx[f[0]] = mm ? +mm[1] : TA_FXDEF[f[0]]; });
  var dt = /마법/.test(a) || ["arcane","light","dark","storm"].indexOf(w.k) >= 0 ? "magic" : /고정 피해/.test(a) ? "true" : "physical";
  var iv = b.interval, mi = a.match(/공격 간격 (\d+(?:\.\d+)?)초/); if (mi) iv = +mi[1];
  var gm = a.match(/\+?(\d+)G/); if (fx.gold && gm) fx.gold = +gm[1]; var rg = b.range, mr = a.match(/사거리 (\d+(?:\.\d+)?)(?!초)/); if (mr) rg = +mr[1];
  return {mode:mode, dmg:+(b.atk * m).toFixed(1), dtype:dt, interval:iv, range:rg, radius:radius, fx:fx, exact:false};
}
var TA = {list:[], io:null, raf:0, last:0, reduce:false};
try { TA.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e){}
/* 3×5 숫자 글꼴 */
var TA_DIG = ["111101101101111","010110010010111","111001111100111","111001111001111","101101111001001","111100111001111","111100111101111","111001001001001","111101111101111","111101111001111"];
function taNum(c, n, x, y, col){ var s = String(Math.round(n)); c.fillStyle = "#1d2029"; for (var p = 0; p < 2; p++){ for (var i = 0; i < s.length; i++){ var g = TA_DIG[+s[i]]; for (var k = 0; k < 15; k++) if (g[k] === "1") c.fillRect(x + i * 4 + (k % 3) + (p ? 0 : 1), y + Math.floor(k / 3) + (p ? 0 : 1), 1, 1); } c.fillStyle = col; } }
function taScene(w, big){
  var st = taStats(w), cv = document.createElement("canvas"), W = big ? 120 : 96, H = big ? 42 : 36; cv.width = W; cv.height = H; cv.className = "tanim";
  var col = EL[w.k] || EL.plain, spr = TG.toCanvas(TG.get(w.w, w.k, w.L), 1);
  var vis = Math.min(2.2, Math.max(0.35, st.mode === "rapid" ? st.interval * 0.5 : st.interval));
  var o = {w:w, st:st, cv:cv, c:cv.getContext("2d"), W:W, H:H, col:col, spr:spr, big:big, t:0, cd:0.4, en:[], fx:[], nums:[], vis:vis, trap:null};
  function spawn(i){ return {x:W - 14 + i * 20, y:H - 11, hp:1, slow:0, stun:0, burn:0, pois:0, flash:0, dead:0}; }
  for (var i = 0; i < (big ? 3 : 2); i++) o.en.push(spawn(i));
  o.spawn = spawn; cv.__ta = o; return cv;
}
function taStep(o, dt){
  var c = o.c, W = o.W, H = o.H, st = o.st, col = o.col, tx = 4, ty = H - 18, cx = tx + 8, cy = ty + 6, fx = st.fx;
  o.t += dt; o.cd -= dt;
  var alive = o.en.filter(function(e){ return !e.dead; });
  alive.forEach(function(e){ var sp = 10 * (e.slow > 0 ? 0.5 : 1); if (e.stun > 0){ e.stun -= dt; sp = 0; } e.slow -= dt; e.flash -= dt; e.x -= sp * dt;
    if (e.burn > 0){ e.burn -= dt; e.hp -= 0.05 * dt; } if (e.pois > 0){ e.pois -= dt; e.hp -= 0.04 * dt; }
    if (o.trap && !o.trap.used && Math.abs(e.x - o.trap.x) < 4){ o.trap.used = 1; hit(e, 1.2); boom(o.trap.x, e.y + 3, 6); }
    if (e.x < tx + 22){ e.x = W + 8 + Math.random() * 20; e.hp = 1; } });
  o.en.forEach(function(e, i){ if (e.dead){ e.dead -= dt; if (e.dead <= 0){ var n = o.spawn(i); n.x = W + 4 + Math.random() * 16; o.en[i] = n; } } });
  function dmgOf(mult){ var d = st.dmg * mult, cr = fx.crit && Math.random() * 100 < fx.crit; return {v: cr ? d * 2 : d, cr: cr}; }
  function hit(e, mult){ if (!e || e.dead) return; var d = dmgOf(mult || 1); e.hp -= 0.34 * (mult || 1) * (d.cr ? 2 : 1); e.flash = 0.12;
    if (fx.slow) e.slow = 1.2; if (fx.stun && Math.random() * 100 < fx.stun * 2) e.stun = 0.5; if (fx.burn) e.burn = 1.5; if (fx.poison) e.pois = 2; if (fx.knock) e.x += 4 + fx.knock * 6;
    if (fx.execute && e.hp < fx.execute / 100 * 2) e.hp = 0;
    o.nums.push({x:e.x, y:e.y - 6, v:d.v, cr:d.cr, t:0.7});
    if (e.hp <= 0){ e.dead = 0.6; boom(e.x + 3, e.y + 3, 5); } }
  function boom(x, y, r){ o.fx.push({k:"ring", x:x, y:y, r:r, t:0.3, T:0.3}); }
  var tgt = alive.filter(function(e){ return e.x < W - 4; }).sort(function(a, b){ return a.x - b.x; })[0];
  if (o.cd <= 0 && (tgt || st.mode === "aura")){
    o.cd = o.vis; var m = st.mode;
    if (m === "aura"){ o.fx.push({k:"aura", t:0.8, T:0.8}); }
    else if (m === "beam"){ o.fx.push({k:"beam", e:tgt, t:0.35, T:0.35}); hit(tgt, 1); }
    else if (m === "pierce"){ o.fx.push({k:"line", y:tgt.y + 3, t:0.25, T:0.25}); alive.forEach(function(e){ if (Math.abs(e.y - tgt.y) < 8 && e.x < W) hit(e, 1); }); }
    else if (m === "trap"){ o.trap = {x:Math.max(tx + 30, tgt.x - 14), used:0}; o.fx.push({k:"toss", x0:cx, y0:cy, x1:o.trap.x, y1:tgt.y + 5, t:0.3, T:0.3}); }
    else if (m === "rapid"){ for (var k = 0; k < 3; k++) o.fx.push({k:"shot", x:cx, y:cy, e:tgt, d:k * 0.08, sz:1, sp:120}); }
    else o.fx.push({k:"shot", x:cx, y:cy, e:tgt, d:0, sz:m === "aoe" ? 3 : 2, sp:m === "aoe" ? 55 : 80, aoe:m === "aoe"});
    if (fx.chain && m !== "aura") o.chainNext = 0.18;
  }
  if (o.chainNext != null){ o.chainNext -= dt; if (o.chainNext <= 0){ o.chainNext = null; var t2 = alive.filter(function(e){ return e !== tgt; })[0]; if (tgt && t2){ o.fx.push({k:"zig", a:tgt, b:t2, t:0.25, T:0.25}); hit(t2, 0.7); } } }
  /* 그리기: 회색 타일 바탕 */
  for (var gx = 0; gx < W; gx += 8) for (var gy = 0; gy < H; gy += 8){ c.fillStyle = ((gx + gy) / 8) % 2 ? "#c9ccd3" : "#bfc2ca"; c.fillRect(gx, gy, 8, 8); }
  c.fillStyle = "#8c909b"; c.fillRect(20, H - 14, W - 20, 12); c.fillStyle = "#6f7380"; c.fillRect(20, H - 3, W - 20, 1);
  if (st.mode === "aoe" && st.radius){ }
  if (o.trap && !o.trap.used){ c.fillStyle = col.d; c.fillRect(o.trap.x - 2, H - 8, 5, 2); c.fillStyle = col.m; c.fillRect(o.trap.x - 1, H - 10, 3, 2); }
  /* 적: 낙서 벌레 */
  o.en.forEach(function(e){ if (e.dead){ var a = e.dead / 0.6; c.fillStyle = "rgba(29,32,41," + (a * 0.6) + ")"; for (var p = 0; p < 5; p++) c.fillRect(e.x + 3 + Math.cos(p * 1.3) * (1 - a) * 8, e.y + 3 + Math.sin(p * 1.3) * (1 - a) * 6, 1, 1); return; }
    var x = Math.round(e.x), y = Math.round(e.y), bob = Math.round(Math.sin(o.t * 10 + x) * 0.6);
    c.fillStyle = e.flash > 0 ? "#ffffff" : e.stun > 0 ? "#f0c14a" : e.slow > 0 ? "#6aa6d8" : "#3b3f4e"; c.fillRect(x + 1, y + bob, 6, 5); c.fillRect(x, y + 1 + bob, 8, 3);
    c.fillStyle = "#fbf6ea"; c.fillRect(x + 1, y + 1 + bob, 2, 2); c.fillStyle = "#1d2029"; c.fillRect(x + 1, y + 1 + bob, 1, 1);
    c.fillStyle = "#3b3f4e"; c.fillRect(x + 1 + (Math.floor(o.t * 8) % 2), y + 5, 1, 1); c.fillRect(x + 5 - (Math.floor(o.t * 8) % 2), y + 5, 1, 1);
    if (e.burn > 0 && Math.floor(o.t * 12) % 2){ c.fillStyle = "#f08a24"; c.fillRect(x + 3, y - 2 + bob, 1, 2); }
    if (e.pois > 0){ c.fillStyle = "#9be64a"; c.fillRect(x + 6, y - 2 - Math.floor((o.t * 6) % 3) + bob, 1, 1); }
    if (e.stun > 0){ c.fillStyle = "#ffd34d"; c.fillRect(x + 3 + Math.round(Math.cos(o.t * 9) * 3), y - 3, 1, 1); }
    c.fillStyle = "#e8504a"; c.fillRect(x, y - 2 + bob, Math.max(0, Math.round(8 * e.hp)), 1); });
  /* 타워 + 반동 */
  var rec = o.cd > o.vis - 0.08 && st.mode !== "aura" ? 1 : 0;
  c.fillStyle = "rgba(0,0,0,.12)"; c.fillRect(tx + 1, ty + 16, 14, 1); c.drawImage(o.spr, tx - rec, ty);
  /* 효과 */
  o.fx = o.fx.filter(function(f){
    if (f.k === "shot"){ if (f.d > 0){ f.d -= dt; return true; } var e = f.e; if (!e || e.dead) return false; var ex = e.x + 4, ey = e.y + 2, dx = ex - f.x, dy = ey - f.y, L = Math.hypot(dx, dy), s = f.sp * dt;
      if (L <= s){ if (f.aoe){ var R = 4 + (st.radius || 1) * 5; o.fx.push({k:"ring", x:ex, y:ey, r:R, t:0.35, T:0.35}); o.en.forEach(function(e2){ if (!e2.dead && Math.hypot(e2.x + 4 - ex, e2.y + 2 - ey) < R) hit(e2, 1); }); } else hit(e, st.mode === "rapid" ? 0.45 : 1); return false; }
      f.x += dx / L * s; f.y += dy / L * s + (f.aoe ? -Math.sin(Math.min(1, (ex - f.x) / 60) * Math.PI) * 0.6 : 0); c.fillStyle = col.d; c.fillRect(Math.round(f.x) - 1, Math.round(f.y) - 1, f.sz + 1, f.sz + 1); c.fillStyle = col.l; c.fillRect(Math.round(f.x), Math.round(f.y), f.sz, f.sz); return true; }
    f.t -= dt; if (f.t <= 0) return false; var a = f.t / f.T;
    if (f.k === "ring"){ c.strokeStyle = col.m; c.globalAlpha = a; c.lineWidth = 1; c.beginPath(); c.arc(f.x, f.y, f.r * (1.15 - a * 0.5), 0, 7); c.stroke(); c.globalAlpha = 1; }
    else if (f.k === "beam" && f.e){ c.globalAlpha = 0.5 + a * 0.5; c.strokeStyle = col.m; c.lineWidth = 3; c.beginPath(); c.moveTo(cx + 4, cy); c.lineTo(f.e.x + 4, f.e.y + 2); c.stroke(); c.strokeStyle = col.l; c.lineWidth = 1; c.stroke(); c.globalAlpha = 1; }
    else if (f.k === "line"){ c.fillStyle = col.m; c.globalAlpha = a; c.fillRect(cx + 4, f.y - 1, W, 3); c.fillStyle = col.l; c.fillRect(cx + 4, f.y, W, 1); c.globalAlpha = 1; }
    else if (f.k === "aura"){ c.strokeStyle = col.m; c.globalAlpha = a; c.beginPath(); c.arc(cx, cy + 2, 6 + (1 - a) * 14, 0, 7); c.stroke(); c.globalAlpha = 1; for (var p = 0; p < 3; p++){ c.fillStyle = col.l; c.fillRect(cx - 6 + p * 6, cy - 6 - (1 - a) * 8 - p, 1, 1); } }
    else if (f.k === "toss"){ var q = 1 - a, x = f.x0 + (f.x1 - f.x0) * q, y = f.y0 + (f.y1 - f.y0) * q - Math.sin(q * Math.PI) * 10; c.fillStyle = col.m; c.fillRect(x, y, 2, 2); }
    else if (f.k === "zig"){ c.strokeStyle = col.l; c.globalAlpha = a; c.beginPath(); c.moveTo(f.a.x + 4, f.a.y + 2); c.lineTo((f.a.x + f.b.x) / 2 + 4, f.a.y - 4); c.lineTo(f.b.x + 4, f.b.y + 2); c.stroke(); c.globalAlpha = 1; }
    return true; });
  o.nums = o.nums.filter(function(n){ n.t -= dt; if (n.t <= 0) return false; taNum(c, n.v, Math.round(n.x), Math.round(n.y - (0.7 - n.t) * 10), n.cr ? "#e8504a" : "#ffffff"); return true; });
}
function taLoop(ts){
  TA.raf = 0; var dt = Math.min(0.1, (ts - (TA.last || ts)) / 1000); TA.last = ts;
  TA.list = TA.list.filter(function(cv){ return cv.isConnected; });
  var any = false; TA.list.forEach(function(cv){ if (cv.__on){ taStep(cv.__ta, dt); any = true; } });
  if (any && !document.hidden) TA.raf = requestAnimationFrame(taLoop); else TA.last = 0;
}
function taKick(){ if (!TA.raf && !TA.reduce) TA.raf = requestAnimationFrame(taLoop); }
function taAttach(host, w, big){ var cv = taScene(w, big); host.innerHTML = ""; host.appendChild(cv); TA.list.push(cv); taStep(cv.__ta, 0.016); if (big){ cv.__on = true; taKick(); } else if (TA.io) TA.io.observe(cv); else { cv.__on = true; taKick(); } return cv; }
if ("IntersectionObserver" in window) TA.io = new IntersectionObserver(function(es){ es.forEach(function(e){ e.target.__on = e.isIntersecting; }); taKick(); }, {rootMargin:"80px"});
document.addEventListener("visibilitychange", function(){ if (!document.hidden) taKick(); });
function taDetail(w){
  var st = taStats(w), b = teBase(w.w), modeN = (TE_MODES.filter(function(m){ return m[0] === st.mode; })[0] || ["","단일 탄환"])[1], DT = {physical:"물리 (방어력 영향)", magic:"마법 (마법 저항 영향)", true:"고정 (저항 무시)"};
  var iv = st.mode === "rapid" ? st.interval * 0.5 : st.interval, dps = st.mode === "aura" ? 0 : st.dmg / Math.max(0.1, iv) * (st.mode === "rapid" ? 0.45 : 1);
  var fxRows = TE_FX.filter(function(f){ return st.fx[f[0]]; }).map(function(f){ return [f[1], st.fx[f[0]] + f[2], f[6]]; });
  var LV = [[1,1],[1.4,1.05],[1.9,1.1],[2.6,1.15],[3.5,1.25]];
  var h = '<div class="td-head">' + tCell(w, 3) + '<div><div class="td-word">' + w.w + '</div><div class="td-ko">' + esc(w.ko || "") + ' ' + chip(w.k) + (w.L ? '<span class="chip">전설</span>' : '') + (w.u ? '<span class="chip">테스터 제작</span>' : '') + '</div></div></div>' +
    '<div class="td-anim" id="tdanim"></div>' + (w.d ? '<p class="v">' + esc(w.d) + '</p>' : '') + '<p><b>능력</b> ' + esc(w.a || "") + '</p>' + (w.v ? '<p class="v">★Lv5 ' + esc(w.v) + '</p>' : '') +
    '<div class="td-stats">' + [["비용", cost(w) + "G"], ["1회 피해", st.mode === "aura" ? "—" : st.dmg], ["초당 피해", st.mode === "aura" ? "—" : dps.toFixed(1)], ["공격 간격", st.mode === "aura" ? "—" : st.interval + "초"], ["사거리", st.range + "칸"], ["공격 방식", modeN + (st.mode === "aoe" ? " " + st.radius + "칸" : "")], ["피해 종류", st.mode === "aura" ? "—" : DT[st.dtype]], ["배율", w.m == null ? "—" : "×" + w.m]].map(function(r){ return '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join("") + '</div>' +
    '<h3>효과</h3>' + (fxRows.length ? table(["효과","수치","설명"], fxRows) : '<p class="v">추가 효과 없음</p>') + '<p class="v">속성 기본 효과: ' + esc(EL[w.k].e) + '</p>' +
    (st.mode === "aura" ? '' : '<h3>레벨별</h3>' + table(["레벨","1회 피해","초당 피해","사거리"], LV.map(function(l, i){ return ["Lv" + (i + 1), (st.dmg * l[0]).toFixed(1), (dps * l[0]).toFixed(1), (st.range * l[1]).toFixed(2) + "칸"]; }))) +
    '<p class="count">' + (st.exact ? "제작자가 정한 정확한 수치다." : "공격 방식·효과 수치는 능력 설명에서 뽑은 기획값이며, 게임 구현 때 확정한다. 공격력·간격·사거리는 글자 공식으로 계산했다.") + '</p>';
  return h;
}
function taOpen(word){
  var w = WORDS.filter(function(x){ return x.w === word; })[0]; if (!w) return;
  var d = document.getElementById("tdlg"); if (!d){ d = document.createElement("div"); d.id = "tdlg"; d.className = "tdlg"; d.innerHTML = '<div class="tdbox" role="dialog" aria-modal="true" aria-label="타워 상세"><button class="tdx" aria-label="닫기">✕</button><div id="tdbody"></div></div>'; document.body.appendChild(d);
    d.addEventListener("click", function(e){ if (e.target === d || e.target.closest(".tdx")) taClose(); }); document.addEventListener("keydown", function(e){ if (e.key === "Escape") taClose(); }); }
  document.getElementById("tdbody").innerHTML = taDetail(w); d.hidden = false; document.body.style.overflow = "hidden"; taAttach(document.getElementById("tdanim"), w, true); d.querySelector(".tdx").focus();
}
function taClose(){ var d = document.getElementById("tdlg"); if (d && !d.hidden){ d.hidden = true; document.body.style.overflow = ""; var a = document.getElementById("tdanim"); if (a) a.innerHTML = ""; } }
