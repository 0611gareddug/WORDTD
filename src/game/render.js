/* WORD TD 그리기: 공책 맵 + 스티커 타워 + 낙서 적 */
var R = {cv:null, ctx:null, bg:null, ts:32, ox:0, oy:0, w:0, h:0, dpr:1, spr:{}};
function rInit(cv){ R.cv = cv; R.ctx = cv.getContext("2d"); }
function rResize(){
  var box = R.cv.parentNode.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  var ts = Math.floor(Math.min(box.width / COLS, box.height / ROWS)); ts = Math.max(16, ts);
  R.ts = ts; R.dpr = dpr; R.w = ts * COLS; R.h = ts * ROWS;
  R.cv.style.width = R.w + "px"; R.cv.style.height = R.h + "px"; R.cv.width = Math.round(R.w * dpr); R.cv.height = Math.round(R.h * dpr);
  R.spr = {}; R.bg = null;
}
function nbBg(){
  var c = document.createElement("canvas"), ts = R.ts, d = R.dpr; c.width = R.w * d; c.height = R.h * d; var x = c.getContext("2d"); x.scale(d, d);
  x.fillStyle = "#FBF6EA"; x.fillRect(0, 0, R.w, R.h);
  x.fillStyle = "#DCE8F3"; var g = ts / 2; for (var i = 0; i <= R.w; i += g) x.fillRect(Math.round(i), 0, 1, R.h); for (var j = 0; j <= R.h; j += g) x.fillRect(0, Math.round(j), R.w, 1);
  x.fillStyle = "#c9d9ea"; for (i = 0; i <= R.w; i += ts) x.fillRect(Math.round(i), 0, 1, R.h); for (j = 0; j <= R.h; j += ts) x.fillRect(0, Math.round(j), R.w, 1);
  x.fillStyle = "#E9A3A3"; x.fillRect(Math.round(ts * 0.12), 0, 2, R.h);
  var nb = NOTEBOOKS[B.nb]; x.fillStyle = nb.hl;
  B.cells.forEach(function(c2){ x.fillRect(c2[0] * ts + 1, c2[1] * ts + 1, ts - 1, ts - 1); });
  /* 형광펜 결 */
  x.fillStyle = "rgba(255,255,255,0.18)"; B.cells.forEach(function(c2){ x.fillRect(c2[0] * ts + 1, c2[1] * ts + ts * 0.62, ts - 1, 2); });
  var s = B.start, e = B.end;
  x.fillStyle = "#3B3F4E"; x.beginPath(); x.ellipse(s[0] * ts, s[1] * ts, ts * 0.32, ts * 0.28, 0, 0, 7); x.fill(); x.fillStyle = "#8C909B"; x.beginPath(); x.ellipse(s[0] * ts, s[1] * ts, ts * 0.18, ts * 0.15, 0, 0, 7); x.fill();
  x.fillStyle = "#E0483E"; var bx = e[0] * ts - ts * 0.18, by = e[1] * ts - ts * 0.45; x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + ts * 0.36, by); x.lineTo(bx + ts * 0.36, by + ts * 0.9); x.lineTo(bx + ts * 0.18, by + ts * 0.72); x.lineTo(bx, by + ts * 0.9); x.closePath(); x.fill();
  R.bg = c;
}
function sprite(t){
  var key = t.w.w + "|" + t.lv + "|" + R.ts, s = R.spr[key]; if (s) return s;
  var g = TG.get(t.w.w, t.w.k, t.w.L), sz = Math.max(16, Math.round(R.ts * 0.78)), sc = sz / 16, pad = 2, c = document.createElement("canvas"), d = R.dpr;
  c.width = (sz + pad * 2) * d; c.height = (sz + pad * 2 + 1) * d; var x = c.getContext("2d"); x.scale(d, d); x.imageSmoothingEnabled = false;
  var ring = t.lv >= 5 ? null : t.lv >= 4 ? "#d6dbe4" : "#ffffff";
  if (t.lv >= 5){ var gr = x.createLinearGradient(0, 0, sz + 4, sz + 4); gr.addColorStop(0, "#ffd1ec"); gr.addColorStop(0.35, "#c8f0ff"); gr.addColorStop(0.65, "#fff3b0"); gr.addColorStop(1, "#d4ffe0"); x.fillStyle = gr; } else x.fillStyle = ring;
  x.fillStyle = x.fillStyle; x.shadowColor = "rgba(42,45,58,0.35)"; x.shadowOffsetY = 1.5; x.fillRect(0, 0, sz + pad * 2, sz + pad * 2); x.shadowColor = "transparent";
  for (var i = 0; i < 256; i++) if (g[i]){ x.fillStyle = g[i]; x.fillRect(pad + (i % 16) * sc, pad + Math.floor(i / 16) * sc, Math.ceil(sc), Math.ceil(sc)); }
  R.spr[key] = c; return c;
}
var FONT_W = "'Silkscreen', monospace", FONT_K = "'Noto Sans KR', sans-serif";
function tape(x, s, cx, cy, size, typedPrefix, ko, bg){
  x.font = "700 " + size + "px " + (ko ? FONT_K : FONT_W); var w = x.measureText(s).width + size * 0.7, h = size * 1.35;
  x.fillStyle = bg || "#F2D7A6"; x.fillRect(cx - w / 2, cy - h / 2, w, h); x.fillStyle = "rgba(59,63,78,0.25)"; x.fillRect(cx - w / 2, cy + h / 2, w, 1);
  x.textBaseline = "middle"; x.textAlign = "left"; var tx = cx - w / 2 + size * 0.35;
  if (typedPrefix){ x.fillStyle = "#E0483E"; x.fillText(typedPrefix, tx, cy + 0.5); tx += x.measureText(typedPrefix).width; s = s.slice(typedPrefix.length); }
  x.fillStyle = "#2A2D3A"; x.fillText(s, tx, cy + 0.5);
}
function drawEnemy(x, e, px, py, ts){
  var s = ts * e.size, wob = Math.floor(B.t * 4 + e.id) % 2 ? 0.6 : -0.6, flash = e.hitT > 0;
  var col = flash ? "#ffffff" : e.st.frozen > 0 ? "#bfe8ff" : e.st.stun > 0 ? "#f0c14a" : e.st.slow > 0 ? "#7aa8d8" : e.col;
  x.save(); x.translate(px, py + wob);
  if (e.invis) x.globalAlpha = 0.25; if (e.burrowed) x.globalAlpha = 0.15;
  x.lineWidth = Math.max(1, ts / 22); x.strokeStyle = "#2A2D3A"; x.fillStyle = col;
  var t = e.boss ? "boss" : e.type;
  if (t === "bat"){ x.beginPath(); x.moveTo(-s * 0.5, 0); x.lineTo(s * 0.5, -s * 0.35); x.lineTo(s * 0.2, s * 0.4); x.lineTo(0, s * 0.08); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.moveTo(0, s * 0.08); x.lineTo(s * 0.5, -s * 0.35); x.stroke(); }
  else if (t === "shell"){ x.beginPath(); x.ellipse(0, s * 0.08, s * 0.45, s * 0.34, 0, Math.PI, 0); x.lineTo(s * 0.45, s * 0.2); x.lineTo(-s * 0.45, s * 0.2); x.closePath(); x.fill(); x.stroke(); x.fillStyle = "#fbf6ea"; x.fillRect(-s * 0.3, -s * 0.05, s * 0.6, s * 0.08); }
  else if (t === "runner"){ x.beginPath(); x.ellipse(0, 0, s * 0.5, s * 0.2, 0, 0, 7); x.fill(); x.stroke(); x.beginPath(); x.moveTo(s * 0.45, 0); x.lineTo(s * 0.75, -s * 0.12); x.stroke(); }
  else if (t === "ghost"){ x.setLineDash([3, 2]); x.beginPath(); x.arc(0, 0, s * 0.38, Math.PI, 0); x.lineTo(s * 0.38, s * 0.35); x.lineTo(-s * 0.38, s * 0.35); x.closePath(); x.fill(); x.stroke(); x.setLineDash([]); }
  else if (t === "shield"){ x.fillRect(-s * 0.3, -s * 0.35, s * 0.6, s * 0.7); x.strokeRect(-s * 0.3, -s * 0.35, s * 0.6, s * 0.7); x.fillStyle = "#f2d7a6"; x.fillRect(s * 0.3, -s * 0.45, s * 0.14, s * 0.9); x.strokeRect(s * 0.3, -s * 0.45, s * 0.14, s * 0.9); }
  else if (t === "mimic"){ x.fillRect(-s * 0.42, -s * 0.25, s * 0.84, s * 0.5); x.strokeRect(-s * 0.42, -s * 0.25, s * 0.84, s * 0.5); x.fillStyle = "#e0483e"; x.fillRect(-s * 0.3, -s * 0.02, s * 0.6, s * 0.06); }
  else if (t === "boss"){ x.beginPath(); x.moveTo(-s * 0.5, s * 0.1); x.bezierCurveTo(-s * 0.55, -s * 0.6, s * 0.55, -s * 0.6, s * 0.5, s * 0.1); x.lineTo(s * 0.3, s * 0.45); x.lineTo(-s * 0.3, s * 0.45); x.closePath(); x.fill(); x.stroke(); x.fillStyle = "#fbf6ea"; x.beginPath(); x.arc(-s * 0.2, -s * 0.15, s * 0.1, 0, 7); x.arc(s * 0.2, -s * 0.15, s * 0.1, 0, 7); x.fill(); x.fillStyle = "#2A2D3A"; x.fillRect(-s * 0.22, -s * 0.16, s * 0.06, s * 0.06); x.fillRect(s * 0.18, -s * 0.16, s * 0.06, s * 0.06); }
  else { x.beginPath(); x.moveTo(-s * 0.4, s * 0.25); x.bezierCurveTo(-s * 0.55, -s * 0.3, -s * 0.1, -s * 0.45, s * 0.1, -s * 0.4); x.bezierCurveTo(s * 0.5, -s * 0.35, s * 0.5, s * 0.1, s * 0.4, s * 0.3); x.closePath(); x.fill(); x.stroke();
    if (t === "medic"){ x.fillStyle = "#e0483e"; x.fillRect(-s * 0.04, -s * 0.2, s * 0.08, s * 0.24); x.fillRect(-s * 0.12, -s * 0.12, s * 0.24, s * 0.08); } }
  if (t !== "bat" && t !== "boss" && t !== "shield" && t !== "mimic"){ x.fillStyle = "#fbf6ea"; x.fillRect(-s * 0.22, -s * 0.12, s * 0.16, s * 0.16); x.fillRect(s * 0.06, -s * 0.12, s * 0.16, s * 0.16); x.fillStyle = "#2A2D3A"; x.fillRect(-s * 0.16, -s * 0.07, s * 0.07, s * 0.08); x.fillRect(s * 0.12, -s * 0.07, s * 0.07, s * 0.08); }
  if (e.elite){ x.strokeStyle = "#ff6b8a"; x.lineWidth = 2; x.beginPath(); x.arc(0, 0, s * 0.62, 0, 7); x.stroke(); }
  if (e.shieldHp > 0){ x.strokeStyle = "#8fd8ff"; x.lineWidth = 2; x.beginPath(); x.arc(0, 0, s * 0.58, 0, 7); x.stroke(); }
  x.restore();
  /* 체력 */
  var bw = Math.max(ts * 0.6, s * 0.7), hy = py - s * 0.55 - 3;
  x.fillStyle = "rgba(42,45,58,0.5)"; x.fillRect(px - bw / 2, hy, bw, 3); x.fillStyle = e.boss ? "#a77bff" : "#E0483E"; x.fillRect(px - bw / 2, hy, bw * Math.max(0, e.hp / e.max), 3);
  if (e.st.poisonN > 0){ x.fillStyle = "#9be64a"; for (var i = 0; i < e.st.poisonN && i < 8; i++) x.fillRect(px - bw / 2 + i * 3, hy - 3, 2, 2); }
}
function draw(){
  if (!B) return; if (!R.w || R.cv.width === 0) rResize(); if (!R.w) return; var x = R.ctx, ts = R.ts, d = R.dpr;
  if (!R.bg) nbBg();
  x.setTransform(1, 0, 0, 1, 0, 0);
  var sh = B.shake > 0 && SAVE.settings.shake ? (Math.random() - 0.5) * 6 * d : 0;
  x.drawImage(R.bg, sh, sh);
  x.setTransform(d, 0, 0, d, sh, sh); x.imageSmoothingEnabled = false;
  /* 선택 칸과 미리보기 */
  var typedNow = UI.text();
  if (B.sel){ var sp = B.sel.split(",").map(Number), tw = B.towers[B.sel];
    x.strokeStyle = "#3B6FD8"; x.lineWidth = 2; x.setLineDash([4, 3]); x.strokeRect(sp[0] * ts + 2, sp[1] * ts + 2, ts - 4, ts - 4); x.setLineDash([]);
    var prev = lookup(typedNow), rr = tw ? tw.st.range : prev ? wordStats(prev.w, prev.ko ? null : prev.typed).range * (rule("dark") ? 0.8 : 1) : 0;
    if (rr){ x.fillStyle = "rgba(59,111,216,0.08)"; x.strokeStyle = "rgba(59,111,216,0.5)"; x.lineWidth = 1; x.beginPath(); x.arc((sp[0] + 0.5) * ts, (sp[1] + 0.5) * ts, rr * ts, 0, 7); x.fill(); x.stroke(); }
    if (prev && !tw){ x.globalAlpha = 0.5; var ps = sprite({w:prev.w, lv:1}); x.drawImage(ps, sp[0] * ts + (ts - ps.width / d) / 2, sp[1] * ts + 1, ps.width / d, ps.height / d); x.globalAlpha = 1; }
  }
  /* 함정 */
  B.traps.forEach(function(tr){ var c = EL[tr.t.w.k]; x.fillStyle = c.d; x.fillRect((tr.x + 0.4) * ts, (tr.y + 0.55) * ts, ts * 0.2, ts * 0.08); x.fillStyle = c.m; x.beginPath(); x.arc((tr.x + 0.5) * ts, (tr.y + 0.5) * ts, ts * 0.1, 0, 7); x.fill(); });
  /* 공명 선 */
  /* 타워 */
  var tl = towerList().sort(function(a, b){ return a.y - b.y; });
  tl.forEach(function(t){ var s = sprite(t), w = s.width / d, h = s.height / d, px = t.x * ts + (ts - w) / 2 - (t.recoil > 0 ? Math.cos(t.ang || 0) * 1.5 : 0), py = t.y * ts + 1 - (t.recoil > 0 ? Math.sin(t.ang || 0) * 1.5 : 0);
    if (t.frozen > 0){ x.globalAlpha = 0.55; } x.drawImage(s, px, py, w, h); x.globalAlpha = 1;
    if (t.frozen > 0){ x.fillStyle = "rgba(143,216,255,0.35)"; x.fillRect(t.x * ts + 2, t.y * ts + 2, ts - 4, ts - 4); }
    var lab = t.sealed > 0 ? "???" : (UI.lang() === "ko" && t.w.ko && SAVE.settings.koPlate ? t.w.ko : t.typed);
    var fs = Math.max(6, Math.min(ts * 0.22, ts * 1.25 / Math.max(3, lab.length) * 1.4));
    tape(x, lab, t.x * ts + ts / 2, t.y * ts + ts * 0.9, fs, "", Hangul.isKo(lab));
    for (var i = 0; i < t.lv; i++){ x.fillStyle = "#2A2D3A"; x.fillRect(t.x * ts + ts - 5 - i * 4, t.y * ts + 2, 3, 3); x.fillStyle = "#FFD34D"; x.fillRect(t.x * ts + ts - 4.5 - i * 4, t.y * ts + 2.5, 2, 2); }
    if (t.res){ x.fillStyle = EL[t.w.k].m; x.fillRect(t.x * ts + 2, t.y * ts + 2, 3, 3); }
  });
  /* 적 */
  var up = typedNow ? (Hangul.isKo(typedNow) ? typedNow : typedNow.toUpperCase()) : "";
  var es = B.enemies.filter(function(e){ return !e.dead; }).sort(function(a, b){ return a.d - b.d; });
  es.forEach(function(e){ var p = ePos(e); drawEnemy(x, e, p[0] * ts, p[1] * ts, ts); });
  es.forEach(function(e){ if (!e.word || e.burrowed) return; var p = ePos(e), ko = Hangul.isKo(e.word), pre = up && e.word.indexOf(up) === 0 ? up : "";
    var fs = Math.max(8, Math.round(ts * (e.boss ? 0.3 : 0.24))); tape(x, e.word, p[0] * ts, p[1] * ts + (e.id % 2 && !e.boss ? ts * e.size * 0.5 + fs * 0.9 : -ts * e.size * 0.55 - fs * 1.1), fs, pre, ko, e.boss ? "#FFE86B" : e.elite ? "#ffd1dc" : null); });
  /* 탄환 */
  B.shots.forEach(function(s){ if (s.delay > 0) return; var z = s.sz + 1; x.fillStyle = s.c; x.fillRect(s.x * ts - z / 2 - 0.5, s.y * ts - z / 2 - 0.5, z + 1, z + 1); x.fillStyle = s.l; x.fillRect(s.x * ts - z / 2, s.y * ts - z / 2, z, z); });
  /* 효과 */
  B.fx.forEach(function(f){ var a = Math.max(0, f.t / f.T);
    if (f.k === "ring"){ x.globalAlpha = a; x.strokeStyle = f.c; x.lineWidth = 2; x.beginPath(); x.arc(f.x * ts, f.y * ts, Math.max(1, f.r * ts * (1.1 - a * 0.4)), 0, 7); x.stroke(); x.globalAlpha = 1; }
    else if (f.k === "line"){ x.globalAlpha = a; x.strokeStyle = f.c; x.lineWidth = 4; x.beginPath(); x.moveTo(f.x * ts, f.y * ts); x.lineTo(f.x2 * ts, f.y2 * ts); x.stroke(); x.strokeStyle = f.l; x.lineWidth = 1.5; x.stroke(); x.globalAlpha = 1; }
    else if (f.k === "beam" && f.e){ var q = ePos(f.e); x.globalAlpha = 0.4 + a * 0.6; x.strokeStyle = f.c; x.lineWidth = 5; x.beginPath(); x.moveTo(f.x * ts, f.y * ts); x.lineTo(q[0] * ts, q[1] * ts); x.stroke(); x.strokeStyle = f.l; x.lineWidth = 2; x.stroke(); x.globalAlpha = 1; }
    else if (f.k === "zig"){ x.globalAlpha = a; x.strokeStyle = f.c; x.lineWidth = 2; x.beginPath(); x.moveTo(f.a[0] * ts, f.a[1] * ts); x.lineTo((f.a[0] + f.b[0]) / 2 * ts + 4, (f.a[1] + f.b[1]) / 2 * ts - 5); x.lineTo(f.b[0] * ts, f.b[1] * ts); x.stroke(); x.globalAlpha = 1; }
    else if (f.k === "aura"){ x.globalAlpha = a * 0.8; x.strokeStyle = f.c; x.lineWidth = 2; x.beginPath(); x.arc(f.x * ts, f.y * ts, ts * (0.3 + (1 - a) * 0.8), 0, 7); x.stroke(); x.fillStyle = f.c; for (var i = 0; i < 4; i++) x.fillRect(f.x * ts + Math.cos(i * 1.6 + B.t) * ts * 0.5, f.y * ts - (1 - a) * ts * 0.5 + Math.sin(i * 1.6) * ts * 0.3, 2, 2); x.globalAlpha = 1; }
    else if (f.k === "toss"){ var u = 1 - a; x.fillStyle = f.c; x.fillRect((f.x + (f.x2 - f.x) * u) * ts - 2, ((f.y + (f.y2 - f.y) * u) - Math.sin(u * Math.PI) * 0.6) * ts - 2, 4, 4); }
    else if (f.k === "crumb"){ x.globalAlpha = a; x.fillStyle = f.c; x.fillRect(f.x * ts, f.y * ts, 2, 2); x.globalAlpha = 1; }
    else if (f.k === "slash"){ x.globalAlpha = a; x.strokeStyle = "#E0483E"; x.lineWidth = 3; x.beginPath(); x.moveTo((f.x - 0.4) * ts, (f.y - 0.4) * ts); x.lineTo((f.x + 0.4) * ts, (f.y + 0.4) * ts); x.stroke(); x.globalAlpha = 1; }
  });
  /* 숫자 */
  x.textAlign = "center"; x.textBaseline = "middle";
  B.nums.forEach(function(n){ var fs = Math.max(9, ts * (n.big ? 0.42 : n.cr ? 0.36 : 0.27)); x.font = "700 " + fs + "px " + FONT_W; x.globalAlpha = Math.min(1, n.t * 2);
    x.fillStyle = "#FBF6EA"; x.fillText(n.v, n.x * ts + 1, n.y * ts + 1); x.fillStyle = n.gold ? "#c9961a" : "#E0483E"; x.fillText(n.v, n.x * ts, n.y * ts);
    if (n.cr){ x.strokeStyle = "#E0483E"; x.lineWidth = 1.5; x.beginPath(); x.ellipse(n.x * ts, n.y * ts, fs * 1.2, fs * 0.7, -0.15, 0, 7); x.stroke(); } x.globalAlpha = 1; });
  B.texts.forEach(function(n){ var fs = Math.max(10, ts * 0.32); x.font = "700 " + fs + "px " + FONT_K; x.globalAlpha = Math.min(1, n.t / n.T * 2); x.lineWidth = 3; x.strokeStyle = "#2A2D3A"; x.strokeText(n.s, n.x * ts, n.y * ts); x.fillStyle = n.c; x.fillText(n.s, n.x * ts, n.y * ts); x.globalAlpha = 1; });
  if (B.spellT.STOP > 0){ x.fillStyle = "rgba(143,216,255,0.12)"; x.fillRect(0, 0, R.w, R.h); }
}
function tileAt(cx, cy){ var r = R.cv.getBoundingClientRect(), x = Math.floor((cx - r.left) / r.width * COLS), y = Math.floor((cy - r.top) / r.height * ROWS); if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return null; return x + "," + y; }
