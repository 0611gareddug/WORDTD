/* WORD TD 전투 엔진: 적 이동, 타워 공격, 원소 반응, 전투 타이핑 */
var B = null; /* 현재 전투 상태 */
var LV = [[1, 1], [1.4, 1.05], [1.9, 1.1], [2.6, 1.15], [3.5, 1.25]];
function has(id){ return RUN && RUN.stickers.indexOf(id) >= 0; }
function rule(id){ return B && B.rules.some(function(r){ return r.id === id; }); }
function penIs(id){ return RUN && RUN.pen === id; }

/* ---------- 전투 시작 ---------- */
function battleInit(){
  var nb = RUN.nb, pc = pathCells(nb), pts2 = NOTEBOOKS[nb].path.map(function(p){ return [p[0] + 0.5, p[1] + 0.5]; });
  var segs = [], tot = 0;
  for (var i = 0; i < pts2.length - 1; i++){ var a = pts2[i], b = pts2[i+1], l = Math.hypot(b[0]-a[0], b[1]-a[1]); segs.push({a:a, b:b, l:l, s:tot}); tot += l; }
  var fa = pts2[0], fb = pts2[pts2.length-1];
  RUN.board = RUN.board || {towers:{}};
  B = {nb:nb, cells:pc.cells, pathSet:pc.set, segs:segs, len:tot, start:fa, end:fb, flyLen:Math.hypot(fb[0]-fa[0], fb[1]-fa[1]),
    towers:RUN.board.towers, enemies:[], shots:[], fx:[], nums:[], traps:[], texts:[], queue:[], t:0, phase:"idle", wave:0, waves:0,
    rules:[], sel:null, prep:0, spellT:{}, slowAll:0, shake:0, lastBuilt:RUN.lastBuilt || "", miss:false, freeBlank:has("blank") ? 1 : 0, letter:"", node:null, boss:null, over:false};
}
function startPage(node){
  B.node = node; B.rules = (node.rules || []).slice(); B.letter = node.letter || "";
  B.wave = 0; B.miss = false; B.freeBlank = has("blank") ? 1 : 0; B.pageBuilt = {};
  B.waves = node.type === "boss" ? 2 : 2; if (RUN.skipWave){ B.waves = 1; RUN.skipWave = false; }
  B.combo = RUN.perfectNext ? 10 : 0; RUN.perfectNext = false; B.comboT = 0; B.maxCombo = B.combo;
  B.ink = B.ink || 0; recalcAll(); B.phase = "prep"; B.prep = 12; B.pageKills = 0; B.pageFirst = 0; B.goldStart = RUN.gold;
}
/* ---------- 경로 위치 ---------- */
function posAt(d){ var s = B.segs; for (var i = 0; i < s.length; i++){ if (d <= s[i].s + s[i].l || i === s.length - 1){ var f = Math.max(0, Math.min(1, (d - s[i].s) / s[i].l)); return [s[i].a[0] + (s[i].b[0]-s[i].a[0]) * f, s[i].a[1] + (s[i].b[1]-s[i].a[1]) * f]; } } return B.end; }
function ePos(e){ if (e.fly){ var f = Math.min(1, e.d / B.flyLen); return [B.start[0] + (B.end[0]-B.start[0]) * f, B.start[1] + (B.end[1]-B.start[1]) * f]; } return posAt(e.d); }
function eLen(e){ return e.fly ? B.flyLen : B.len; }

/* ---------- 웨이브 구성 ---------- */
function gradeMul(){ return 1 + 0.12 * (RUN.grade - 1); }
function hpScale(){ return Math.pow(1.17, RUN.gw - 1) * DIFF[RUN.diff].hp * (1.3 + 0.5 * RUN.nb) * gradeMul(); }
function makeWave(){
  var node = B.node, nb = RUN.nb, pool = NOTEBOOKS[nb].pool, page = RUN.page, q = [], t = rule("late") ? 2 : 0.5;
  var n = 7 + Math.floor(page * 1.3) + nb + (node.type === "elite" ? 2 : 0) + B.wave * 2;
  var gap = Math.max(0.45, 1.05 - page * 0.05 - nb * 0.05);
  for (var i = 0; i < n; i++){
    var type = pool[Math.floor(Math.random() * Math.min(pool.length, 2 + page + B.wave))] || pool[0];
    if (i === n - 1 && page >= 2 && pool.indexOf("mimic") >= 0 && Math.random() < 0.4) type = "mimic";
    var elite = node.type === "elite" && (i % 3 === 2);
    q.push({t:t, type:type, elite:elite}); t += gap * (ENEMY[type].fast ? 0.7 : 1);
  }
  if (node.type === "boss" && B.wave === B.waves - 1) q.push({t:t + 2, boss:true});
  B.queue = q; B.wt = 0;
}
function startWave(early){
  if (B.phase !== "prep" && B.phase !== "gap") return;
  if (early && B.phase === "prep" && B.prep > 0){ var bonus = Math.floor(B.prep); if (bonus > 0){ addGold(bonus, null); floatText("빨리 시작 +" + bonus + "G", 4.5, 6, "#FFD34D"); } }
  B.phase = "wave"; makeWave(); RUN.gw++; SFX.play("wave");
  if (has("sand")) B.slowAll = 5;
  /* 기계: 웨이브마다 공격 속도, 자연: 공격력 성장 */
  eachTower(function(t){ t.waves = (t.waves || 0) + 1; }); recalcAll();
  UI.onWave();
}
var ENEMY_WORDS = null, ENEMY_KO = null;
function enemyWord(len){
  if (!ENEMY_WORDS){ ENEMY_WORDS = {3:[], 4:[], 5:[], 6:[], 7:[]}; ENEMY_KO = {1:[], 2:[], 3:[], 4:[]};
    WORDS.forEach(function(w){ if (w.u || w.L) return; var L = w.w.length; if (ENEMY_WORDS[L]) ENEMY_WORDS[L].push(w); if (w.ko && w.ko.length <= 4 && /^[가-힣]+$/.test(w.ko)) ENEMY_KO[w.ko.length].push(w); }); }
  var ko = UI.lang() === "ko", used = {};
  B.enemies.forEach(function(e){ if (e.word) used[e.word[0]] = 1; });
  for (var tries = 0; tries < 14; tries++){
    var w, s;
    if (ko){ var kl = Math.max(1, Math.min(4, len <= 3 ? (SAVE.settings.kb === "cji" || SAVE.settings.slow ? 2 : pick([2,2,3])) : len <= 5 ? 3 : 4)); if (SAVE.settings.slow) kl = Math.min(kl, 2); w = pick(ENEMY_KO[kl].length ? ENEMY_KO[kl] : ENEMY_KO[2]); s = w.ko; }
    else { var L = SAVE.settings.slow ? 3 : Math.min(7, Math.max(3, len)); w = pick(ENEMY_WORDS[L]); s = w.w; }
    if (!used[s[0]] || tries > 10) return {s:s, w:w};
  }
  return {s:"CAT", w:WMAP.CAT};
}
function spawn(item){
  var nb = RUN.nb, e;
  if (item.boss){
    var bd = BOSS[nb], hp = bd.hp * DIFF[RUN.diff].hp * gradeMul() * 1.1;
    e = {boss:true, type:"boss", n:bd.n, hp:hp, max:hp, sp:bd.sp, ar:bd.ar, mr:bd.mr, col:bd.col, gold:120 + nb * 40, fly:!!bd.fly, pat:bd.pat, patT:6, size:1.7, weakAt:0.75, bd:bd};
    B.boss = e; SFX.play("boss"); UI.banner(bd.n + " 등장!", "#FF5A6E"); B.shake = 0.5;
  } else {
    var d = ENEMY[item.type], hp2 = d.hp * hpScale() * (item.elite ? 1.6 : 1) * (item.small ? 0.4 : 1);
    e = {type:item.type, n:d.n, hp:hp2, max:hp2, sp:d.sp * (item.small ? 1.2 : 1), ar:d.ar, mr:d.mr, col:d.col, gold:d.g * 0.75 * (1 + 0.05 * RUN.gw) * DIFF[RUN.diff].gold * (item.elite ? 2 : 1) * (1 - 0.02 * (RUN.grade - 1)),
      fly:!!d.fly, elite:!!item.elite, size:(item.elite ? 1.15 : item.type === "splitter" ? 1.05 : 0.85) * (item.small ? 0.7 : 1), ghostT:3, burrowT:4, healT:2};
    if (item.elite){ var mod = pick(["regen", "swift", "armor"]); e.mod = mod; if (mod === "swift") e.sp *= 1.3; if (mod === "armor") e.ar += 6; }
    if (d.shield) e.shieldGive = 1;
  }
  e.sp *= DIFF[RUN.diff].sp * (rule("late") ? 1.15 : 1);
  e.d = item.d || 0; e.st = {}; e.id = ++B.eid || (B.eid = 1); e.hitT = 0; e.shieldHp = 0;
  var wl = e.boss ? 0 : e.elite ? 5 + (RUN.longWords ? 2 : 0) : (e.fly || ENEMY[e.type].fast ? 3 : 3 + (Math.random() < 0.5 ? 1 : 0)) + (RUN.longWords ? 2 : 0);
  if (e.boss){ e.word = null; } else { var ew = enemyWord(wl); e.word = ew.s; e.wobj = ew.w; }
  B.enemies.push(e);
}
/* ---------- 타워 수치 계산 ---------- */
function eachTower(f){ for (var k in B.towers) f(B.towers[k], k); }
function towerList(){ var a = []; eachTower(function(t){ a.push(t); }); return a; }
function recalcAll(){ eachTower(function(t){ calcTower(t); }); }
function calcTower(t){
  var w = t.w, st = wordStats(w, t.typed), L = t.typed.length, k = w.k, mult = 1, spd = 1, fx = {};
  for (var f in st.fx) fx[f] = st.fx[f];
  var lv = LV[t.lv - 1];
  if (penIs("ball")) mult *= 0.9; if (penIs("crayon")) mult *= 0.95;
  if (penIs("hl")){ mult *= 0.9; for (f in fx) if (f !== "chain") fx[f] = Math.min(FXMAX[f] * 1.25, fx[f] * 1.25); }
  if (penIs("fountain") && L >= 6) mult *= 1.25;
  if (has("ember") && k === "fire") mult *= 1.25;
  if (has("frost") && fx.slow) fx.slow += 15;
  if (has("rod") && fx.chain) fx.chain += 1;
  if (has("longs") && L >= 6) mult *= 1.2;
  if (has("shout") && L <= 4) spd *= 1.25;
  if (has("scythe") && fx.execute) fx.execute += 5;
  if (has("ency")) mult *= 1.1;
  if (has("chainw") && t.chainBonus) mult *= 1.35;
  if (rule("vowel") && (t.typed.match(/[AEIOU]/g) || []).length >= 3) mult *= 1.3;
  if (rule("dark")){ if (k === "light") mult *= 1.5; }
  if (rule("letter") && B.letter && t.typed.indexOf(B.letter) >= 0) spd *= 1.4;
  if (rule("long") && L >= 7) mult *= 1.4;
  if (rule("lunch") && k === "food") for (f in fx) fx[f] *= 2;
  if (rule("rain")){ if (k === "water" || k === "storm") mult *= 1.3; if (k === "fire") mult *= 0.8; }
  if (rule("picky")){ var same = towerList().filter(function(o){ return o.w.k === k; }).length; if (same >= 3) mult *= 0.8; }
  if (has("stamp")){ var fl = towerList().filter(function(o){ return o.typed[0] === t.typed[0]; }).length; if (fl >= 3) mult *= 1.25; }
  /* 인접 공명 */
  var res = 0; for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++){ if (!dx && !dy) continue; var o = B.towers[(t.x+dx) + "," + (t.y+dy)]; if (o && o.w.k === k && k !== "support") res++; }
  t.res = Math.min(3, res); mult *= 1 + t.res * 0.08 * (has("resonance") ? 2 : 1);
  /* 문장 완성 */
  if (has("sentence")){ var best = 0; for (var sx = t.x - 2; sx <= t.x; sx++){ var row = [0,1,2].map(function(i){ return B.towers[(sx+i) + "," + t.y]; }); if (row.every(Boolean)){ var n = row.reduce(function(s, r){ return s + r.typed.length; }, 0); best = Math.max(best, Math.min(45, n * 3)); } } mult *= 1 + best / 100; }
  /* 지원 버프 (주변 강화) */
  var buff = 0; eachTower(function(o){ if (o !== t && o.st && o.st.fx.buff && Math.abs(o.x - t.x) <= 1 && Math.abs(o.y - t.y) <= 1) buff += o.st.fx.buff; }); mult *= 1 + Math.min(80, buff) / 100;
  if (k === "nature") mult *= 1 + Math.min(0.3, 0.03 * (t.waves || 0));
  if (k === "gear") spd *= 1 + Math.min(0.3, 0.03 * (t.waves || 0));
  var range = st.range * lv[1] * (rule("dark") ? 0.8 : 1);
  var iv = st.interval * (penIs("brush") ? 1.1 : 1) / spd;
  t.st = {mode:st.mode, dmg:st.dmg * lv[0] * mult, dtype:st.dtype, interval:iv, range:range, radius:(st.radius || 0) + (penIs("brush") && st.mode === "aoe" ? 0.5 : 0), fx:fx};
}
function dynSpeed(){ var s = 1 + Math.min(0.2, 0.01 * B.combo); if (B.spellT.RUSH > 0) s *= 1.5; if (has("hlband") && B.combo >= 10) s *= 1.15; return s; }

/* ---------- 피해 ---------- */
function curseMul(e){ return e.st.curse > 0 ? 1.15 : 1; }
function hurt(e, amt, dtype, src, opt){
  if (e.dead || amt <= 0) return 0;
  if (e.burrowed) return 0;
  opt = opt || {};
  var pa = (opt.pierce || 0) / 100, d = amt * curseMul(e);
  if (dtype === "physical") d = Math.max(amt * 0.15, d - Math.max(0, (e.ar - (e.st.poisonN || 0)) * (1 - pa)));
  else if (dtype === "magic") d *= 1 - e.mr / 100 * (1 - pa);
  if (e.shieldHp > 0){ var ab = Math.min(e.shieldHp, d); e.shieldHp -= ab; d -= ab; }
  e.hp -= d; e.hitT = 0.1;
  if (SAVE.settings.nums && !opt.silent && d >= 1){ var p = ePos(e); B.nums.push({x:p[0] + (Math.random() - 0.5) * 0.3, y:p[1] - 0.3, v:Math.round(d), t:0.7, cr:opt.crit, big:opt.big}); }
  if (e.hp <= 0) kill(e, src);
  return d;
}
function kill(e, src){
  if (e.dead) return; e.dead = true; e.hp = 0;
  var p = ePos(e), g = Math.round(e.gold); addGold(g, p); B.pageKills++;
  B.ink = Math.min(100, B.ink + 1 * (has("inkup") ? 1.3 : 1));
  for (var i = 0; i < 8; i++) B.fx.push({k:"crumb", x:p[0], y:p[1], vx:(Math.random() - 0.5) * 3, vy:-Math.random() * 2.5, t:0.6, T:0.6, c:i % 2 ? "#f2c4d0" : "#e8eaf3"});
  SFX.play("kill");
  if (e.type === "splitter" && !e.small){ for (var j = 0; j < 2; j++) spawnChild(e, j); }
  if (e.type === "mimic"){ var w = pick(WORDS.filter(function(x){ return !SAVE.seen[x.w] && !x.u; })) || pick(WORDS); SAVE.seen[w.w] = 1; floatText("새 단어: " + w.w + (w.ko ? " (" + w.ko + ")" : ""), p[0], p[1] - 0.6, "#8FD8FF", 2.2); UI.toast("필통 미믹이 단어를 떨어뜨렸다: " + w.w + (w.ko ? " · " + w.ko : "")); }
  if (e.boss){ B.boss = null; SFX.play("stamp"); B.shake = 0.6; floatText("참 잘했어요!", p[0], p[1], "#E0483E", 2); }
}
function spawnChild(e, j){ var hp = ENEMY.blob.hp * hpScale() * 0.5; var c = {type:"blob", n:"작은 잉크 방울", hp:hp, max:hp, sp:1.2, ar:0, mr:0, col:"#3b3f4e", gold:1, fly:false, size:0.6, small:true, d:Math.max(0, e.d - 0.3 * j), st:{}, id:++B.eid, hitT:0, shieldHp:0};
  var ew = enemyWord(3); c.word = ew.s; c.wobj = ew.w; B.enemies.push(c); }
function addGold(g, p){ RUN.gold += g; if (p && g > 0){ B.nums.push({x:p[0], y:p[1] - 0.6, v:"+" + g, t:0.8, gold:true}); } }
function floatText(s, x, y, c, t){ B.texts.push({s:s, x:x, y:y, c:c || "#fff", t:t || 1.2, T:t || 1.2}); }
function react(name, p){ floatText(name, p[0], p[1] - 0.5, "#FFD34D", 1.1); }
/* 한 번 맞힘: 효과와 원소 반응 */
function applyHit(e, t, mult, opts){
  if (e.dead) return;
  var st = t.st, fx = st.fx, k = t.w.k, p = ePos(e), dmg = st.dmg * (mult || 1), crit = false;
  if (fx.crit && Math.random() * 100 < fx.crit){ dmg *= 2; crit = true; }
  if (k === "wind" && e.fly) dmg *= 1.5;
  if (k === "light" && e.st.curse > 0){ dmg *= 1.8; react("정화", p); }
  var sch = has("scholar") ? 1.5 : 1;
  if (k === "steel" && (e.st.slow > 0 || e.st.frozen > 0)){ dmg *= 2; react("파쇄", p); }
  if (st.mode === "aoe" && e.st.lure > 0) dmg *= 1.5;
  if (k === "ice" && e.st.burn > 0){ e.st.burn = 0; e.st.slow = 0; react("증기 폭발", p); aoe(p, 1.1, st.dmg * 1.5 * sch, "magic", t, {noFx:true}); }
  if (k === "fire" && e.st.poisonN > 0){ react("독가스 폭발", p); aoe(p, 1.1, st.dmg * 0.3 * e.st.poisonN * sch, "magic", t, {noFx:true}); }
  if (k === "ice" && e.st.wet > 0){ e.st.frozen = e.boss ? 0.5 : 1.5; e.st.wet = 0; react("빙결", p); }
  if (k === "fire" && e.st.root > 0){ react("산불", p); B.enemies.forEach(function(o){ if (o !== e && !o.dead){ var q = ePos(o); if (Math.hypot(q[0]-p[0], q[1]-p[1]) <= 1.2){ o.st.burn = 3; o.st.burnD = st.dmg * 0.2; } } }); }
  hurt(e, dmg, st.dtype, t, {pierce:fx.pierceArmor, crit:crit});
  if (e.dead) return;
  if (fx.burn){ e.st.burn = 3; e.st.burnD = Math.max(e.st.burnD || 0, st.dmg * fx.burn / 100); }
  if (fx.slow){ var sv = Math.min(70, fx.slow) / 100 * (e.boss ? 0.5 : 1); e.st.slow = 2; e.st.slowV = Math.max(e.st.slow > 0 ? (e.st.slowV || 0) : 0, sv); }
  if (fx.stun && Math.random() * 100 < fx.stun){ e.st.stun = Math.max(e.st.stun || 0, e.boss ? 0.2 : 0.5); }
  if (fx.poison){ var mx = 5 + (has("venom") ? 3 : 0), add = fx.poison * (e.st.bleed > 0 ? 2 : 1); if (e.st.bleed > 0) react("감염", p); e.st.poisonN = Math.min(mx, (e.st.poisonN || 0) + add); e.st.poison = 4; e.st.poisonD = st.dmg * 0.08; }
  if (fx.knock && !e.boss){ e.d = Math.max(0, e.d - fx.knock); }
  if (fx.execute && !e.boss && e.hp / e.max * 100 < fx.execute){ react("즉사", p); kill(e, t); return; }
  if (k === "water") e.st.wet = 3;
  if (k === "dark") e.st.curse = 4;
  if (k === "nature" && Math.random() < 0.15) e.st.root = 1;
  if (k === "beast"){ e.st.bleed = 3; e.st.bleedD = st.dmg * 0.15; }
  if (k === "food" && Math.random() < 0.2) e.st.lure = 0.6;
  if (k === "light" && e.type === "ghost") e.revealT = 2;
}
function aoe(p, r, dmg, dtype, t, o){ B.fx.push({k:"ring", x:p[0], y:p[1], r:r, t:0.35, T:0.35, c:t ? EL[t.w.k].m : "#E0483E"});
  B.enemies.forEach(function(e){ if (e.dead) return; var q = ePos(e); if (Math.hypot(q[0]-p[0], q[1]-p[1]) <= r + e.size * 0.3){ if (t && !(o && o.noFx)) applyHit(e, t, o && o.mult); else hurt(e, dmg, dtype, t, {}); } }); }
function canTarget(t, e){ if (e.dead || e.burrowed) return false; if (t.w.k === "earth" && e.fly) return false; if (e.type === "ghost" && e.invis && t.w.k !== "light") return false; return true; }
function findTarget(t){
  var best = null, bv = -1e9, r = t.st.range, mode = t.tgt || "first";
  for (var i = 0; i < B.enemies.length; i++){ var e = B.enemies[i]; if (!canTarget(t, e)) continue; var p = ePos(e), dd = Math.hypot(p[0] - t.x - 0.5, p[1] - t.y - 0.5); if (dd > r) continue;
    var v = mode === "first" ? e.d / eLen(e) : mode === "last" ? -e.d / eLen(e) : mode === "strong" ? e.hp : mode === "weak" ? -e.hp : mode === "close" ? -dd : (e.fly ? 1000 : 0) + e.d / eLen(e);
    if (v > bv){ bv = v; best = e; } }
  return best;
}
function fire(t){
  var st = t.st, cx = t.x + 0.5, cy = t.y + 0.4, col = EL[t.w.k];
  if (st.mode === "aura"){ B.fx.push({k:"aura", x:cx, y:cy + 0.1, t:0.8, T:0.8, c:col.m}); return true; }
  var e = findTarget(t); if (!e) return false;
  var p = ePos(e); t.ang = Math.atan2(p[1] - cy, p[0] - cx); t.recoil = 0.1;
  if (st.mode === "beam"){ B.fx.push({k:"beam", x:cx, y:cy, e:e, t:0.3, T:0.3, c:col.m, l:col.l}); applyHit(e, t); chain(t, e); }
  else if (st.mode === "pierce"){ var L = st.range + 0.5, ex = cx + Math.cos(t.ang) * L, ey = cy + Math.sin(t.ang) * L; B.fx.push({k:"line", x:cx, y:cy, x2:ex, y2:ey, t:0.22, T:0.22, c:col.m, l:col.l});
    B.enemies.forEach(function(o){ if (!canTarget(t, o)) return; var q = ePos(o), vx = ex - cx, vy = ey - cy, u = ((q[0]-cx) * vx + (q[1]-cy) * vy) / (vx*vx + vy*vy); if (u < 0 || u > 1) return; if (Math.hypot(cx + vx*u - q[0], cy + vy*u - q[1]) < 0.4 + o.size * 0.2) applyHit(o, t); }); }
  else if (st.mode === "trap"){ var best = null, bd = 1e9; B.cells.forEach(function(c){ var dd = Math.hypot(c[0] + 0.5 - cx, c[1] + 0.5 - cy); if (dd > st.range) return; var occupied = B.traps.some(function(tr){ return tr.x === c[0] && tr.y === c[1]; }); if (occupied) return; var dp = Math.hypot(c[0] + 0.5 - p[0], c[1] + 0.5 - p[1]); if (dp < bd){ bd = dp; best = c; } });
    if (best && B.traps.filter(function(tr){ return tr.t === t; }).length < 3){ B.traps.push({x:best[0], y:best[1], t:t, life:12}); B.fx.push({k:"toss", x:cx, y:cy, x2:best[0] + 0.5, y2:best[1] + 0.5, t:0.3, T:0.3, c:col.m}); } else return false; }
  else if (st.mode === "rapid"){ for (var i = 0; i < 3; i++) B.shots.push({x:cx, y:cy, e:e, t:t, delay:i * 0.07, sp:12, sz:1, mult:0.45, c:col.d, l:col.l}); }
  else B.shots.push({x:cx, y:cy, e:e, t:t, delay:0, sp:st.mode === "aoe" ? 6 : 9, sz:st.mode === "aoe" ? 3 : 2, aoe:st.mode === "aoe", c:col.d, l:col.l, arc:st.mode === "aoe"});
  return true;
}
function chain(t, e){ var n = t.st.fx.chain || 0; if (!n) return; var cur = e, hit = {}; hit[e.id] = 1; var full = e.st.wet > 0; if (full){ n += 3; react("감전", ePos(e)); }
  for (var i = 0; i < n; i++){ var p = ePos(cur), nx = null, nd = 2.2; B.enemies.forEach(function(o){ if (hit[o.id] || !canTarget(t, o)) return; var q = ePos(o), dd = Math.hypot(q[0]-p[0], q[1]-p[1]); if (dd < nd){ nd = dd; nx = o; } }); if (!nx) break; hit[nx.id] = 1;
    B.fx.push({k:"zig", a:ePos(cur), b:ePos(nx), t:0.2, T:0.2, c:EL[t.w.k].l}); applyHit(nx, t, full ? 1 : Math.pow(0.75, i + 1)); cur = nx; } }

/* ---------- 프레임 갱신 ---------- */
function step(dt){
  if (!B || B.over) return;
  B.t += dt;
  for (var s in B.spellT) if (B.spellT[s] > 0) B.spellT[s] -= dt;
  if (B.slowAll > 0) B.slowAll -= dt;
  if (B.shake > 0) B.shake -= dt;
  if (B.comboT > 0){ B.comboT -= dt; if (B.comboT <= 0 && B.combo > 0){ B.combo = 0; } }
  if (B.phase === "prep"){ B.prep -= dt; if (B.prep <= 0) startWave(false); }
  if (B.phase === "gap"){ B.gapT -= dt; if (B.gapT <= 0) startWave(false); }
  if (B.phase === "wave"){
    B.wt += dt;
    while (B.queue.length && B.queue[0].t <= B.wt) spawn(B.queue.shift());
    if (!B.queue.length && !B.enemies.some(function(e){ return !e.dead; })) waveDone();
  }
  /* 적 */
  var stopAll = B.spellT.STOP > 0;
  for (var i = 0; i < B.enemies.length; i++){
    var e = B.enemies[i]; if (e.dead) continue; var S = e.st;
    for (var k in S) if (typeof S[k] === "number" && k.slice(-1) !== "D" && k !== "poisonN" && k !== "slowV" && S[k] > 0) S[k] -= dt;
    if (S.poison <= 0) S.poisonN = 0;
    if (S.burn > 0) hurt(e, S.burnD * dt, "true", null, {silent:true});
    if (S.poison > 0) hurt(e, S.poisonD * S.poisonN * dt, "true", null, {silent:true});
    if (S.bleed > 0) hurt(e, S.bleedD * dt, "true", null, {silent:true});
    if (e.dead) continue;
    if (e.mod === "regen") e.hp = Math.min(e.max, e.hp + e.max * 0.02 * dt);
    /* 특수 능력 */
    if (e.type === "ghost"){ e.ghostT -= dt; if (e.ghostT <= 0){ e.invis = !e.invis; e.ghostT = e.invis ? 1.5 : 4; } if (e.revealT > 0){ e.revealT -= dt; e.invis = false; } }
    if (e.type === "burrow"){ e.burrowT -= dt; if (e.burrowT <= 0){ e.burrowed = !e.burrowed; e.burrowT = e.burrowed ? 2 : 5; } }
    if (e.type === "medic"){ e.healT -= dt; if (e.healT <= 0){ e.healT = 2; var p0 = ePos(e); B.enemies.forEach(function(o){ if (!o.dead && !o.boss){ var q = ePos(o); if (Math.hypot(q[0]-p0[0], q[1]-p0[1]) < 1.6) o.hp = Math.min(o.max, o.hp + o.max * 0.05); } }); B.fx.push({k:"ring", x:p0[0], y:p0[1], r:1.6, t:0.4, T:0.4, c:"#6be36b"}); } }
    if (e.shieldGive){ e.shieldGive = 0; var p1 = ePos(e); B.enemies.forEach(function(o){ if (!o.dead && o !== e){ var q = ePos(o); if (Math.hypot(q[0]-p1[0], q[1]-p1[1]) < 2) o.shieldHp = o.max * 0.2; } }); }
    if (e.boss) bossStep(e, dt);
    var sp = e.sp;
    if (S.slow > 0) sp *= 1 - (S.slowV || 0); if (B.slowAll > 0) sp *= 0.5;
    if (S.stun > 0 || S.frozen > 0 || S.root > 0 || S.lure > 0 || stopAll || e.hitStop > 0) sp = 0;
    if (e.hitStop > 0) e.hitStop -= dt;
    if (e.hitT > 0) e.hitT -= dt;
    e.d += sp * dt;
    if (e.d >= eLen(e)){ e.dead = true; e.leaked = true; leak(e); }
  }
  B.enemies = B.enemies.filter(function(e){ return !e.dead || (e.deadT = (e.deadT || 0) + dt) < 0.01; });
  /* 함정 */
  B.traps = B.traps.filter(function(tr){ tr.life -= dt; if (tr.life <= 0) return false;
    for (var j = 0; j < B.enemies.length; j++){ var e2 = B.enemies[j]; if (e2.dead || e2.fly || e2.burrowed) continue; var q = ePos(e2); if (Math.abs(q[0] - tr.x - 0.5) < 0.5 && Math.abs(q[1] - tr.y - 0.5) < 0.5){ applyHit(e2, tr.t, 1.5); B.fx.push({k:"ring", x:tr.x + 0.5, y:tr.y + 0.5, r:0.6, t:0.3, T:0.3, c:EL[tr.t.w.k].m}); SFX.play("hit"); return false; } } return true; });
  /* 타워 */
  var ds = dynSpeed();
  eachTower(function(t){ if (!t.st) calcTower(t); if (t.recoil > 0) t.recoil -= dt; if (t.frozen > 0){ t.frozen -= dt; return; } if (t.sealed > 0){ t.sealed -= dt; return; }
    t.cd -= dt * ds; if (t.cd <= 0 && B.phase === "wave"){ if (fire(t)){ t.cd = t.st.interval; if (t.st.mode !== "aura") SFX.play("hit"); } else t.cd = 0.1; } });
  /* 탄환 */
  B.shots = B.shots.filter(function(s){ if (s.delay > 0){ s.delay -= dt; return true; } var e = s.e; if (!e || e.dead){ return false; } var p = ePos(e), dx = p[0] - s.x, dy = p[1] - s.y, L = Math.hypot(dx, dy), mv = s.sp * dt;
    if (L <= mv + 0.05){ if (s.aoe){ aoe(p, Math.max(0.6, s.t.st.radius || 1), 0, s.t.st.dtype, s.t, {}); B.shake = Math.max(B.shake, 0.08); } else { applyHit(e, s.t, s.mult); chain(s.t, e); } return false; }
    s.x += dx / L * mv; s.y += dy / L * mv; return true; });
  /* 효과 */
  B.fx = B.fx.filter(function(f){ f.t -= dt; if (f.k === "crumb"){ f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 6 * dt; } return f.t > 0; });
  if (B.fx.length > 200) B.fx.splice(0, B.fx.length - 200);
  B.nums = B.nums.filter(function(n){ n.t -= dt; n.y -= dt * 0.8; return n.t > 0; }); if (B.nums.length > 60) B.nums.splice(0, B.nums.length - 60);
  B.texts = B.texts.filter(function(n){ n.t -= dt; n.y -= dt * 0.4; return n.t > 0; });
}
function bossStep(e, dt){
  e.patT -= dt; var p = ePos(e);
  if (!e.word && e.hp / e.max <= e.weakAt){ e.weakAt -= 0.25; var ko = UI.lang() === "ko"; e.word = ko ? e.bd.ko : e.bd.weak; e.weak = true; UI.banner("약점 단어: " + e.word, "#FFD34D"); }
  if (e.patT > 0) return;
  e.patT = {spore:6, dive:8, freeze:10, breath:7, seal:12}[e.pat] * (RUN.diff === 3 ? 0.7 : 1);
  if (e.pat === "spore"){ for (var i = 0; i < 4; i++) spawn({type:"blob", d:Math.max(0, e.d - 0.4 * i), small:true}); floatText("포자!", p[0], p[1] - 1, "#4cc35a"); }
  if (e.pat === "dive"){ e.burrowed = true; setTimeout(function(){ if (!e.dead){ e.burrowed = false; e.d += 3; } }, 1500); floatText("잠수!", p[0], p[1] - 1, "#e0b583"); }
  if (e.pat === "freeze"){ towerList().sort(function(a, b){ return Math.hypot(a.x - p[0], a.y - p[1]) - Math.hypot(b.x - p[0], b.y - p[1]); }).slice(0, 3).forEach(function(t){ t.frozen = 4; B.fx.push({k:"ring", x:t.x + 0.5, y:t.y + 0.5, r:0.7, t:0.6, T:0.6, c:"#8fd8ff"}); }); floatText("빙결!", p[0], p[1] - 1, "#8fd8ff"); }
  if (e.pat === "breath"){ shuffle(towerList()).slice(0, 2).forEach(function(t){ t.frozen = 3; B.fx.push({k:"ring", x:t.x + 0.5, y:t.y + 0.5, r:0.7, t:0.6, T:0.6, c:"#ff5a6e"}); }); floatText("화염 숨결!", p[0], p[1] - 1, "#ff5a6e"); }
  if (e.pat === "seal"){ var t1 = pick(towerList()); if (t1){ t1.sealed = 5; floatText("???", t1.x + 0.5, t1.y, "#a77bff"); } UI.sealKeys(); floatText("글자 봉인!", p[0], p[1] - 1, "#a77bff"); }
  if (e.hp / e.max < 0.5 && e.pat === "spore" && !e.rage){ e.rage = 1; e.sp *= 1.3; }
}
function leak(e){
  var dmg = e.boss ? 10 : e.elite ? 2 : 1; RUN.life -= dmg; SFX.play("leak"); vib(60); B.shake = 0.25; UI.flash();
  if (e.boss) B.boss = null;
  if (RUN.life <= 0){ RUN.life = 0; B.over = true; setTimeout(function(){ UI.runEnd(false); }, 600); }
}
function waveDone(){
  B.wave++;
  /* 웨이브 종료: 지원 효과 */
  var g = 0, h = 0; eachTower(function(t){ if (t.st.fx.gold) g += t.st.fx.gold * LV[t.lv - 1][0]; if (t.st.fx.heal) h += t.st.fx.heal; });
  if (g) addGold(Math.round(g), null); if (h){ RUN.life = Math.min(RUN.maxLife, RUN.life + h); }
  if (g || h) UI.toast("지원 타워: " + (g ? "골드 +" + Math.round(g) : "") + (g && h ? ", " : "") + (h ? "생명 +" + h : ""));
  if (B.wave >= B.waves){ B.phase = "done"; pageClear(); }
  else { B.phase = "gap"; B.gapT = 4; UI.onWave(); }
}
function pageClear(){
  B.traps = []; B.shots = [];
  if (has("interest")){ var it = Math.min(50, Math.round(RUN.gold * 0.05)); if (it) addGold(it, null), UI.toast("이자 +" + it + "G"); }
  if (has("perfect") && !B.miss){ addGold(60, null); RUN.perfectNext = true; UI.toast("만점 시험지: 골드 +60, 다음 쪽 콤보 10부터"); }
  RUN.maxCombo = Math.max(RUN.maxCombo || 0, B.maxCombo);
  SFX.play("stamp"); B.shake = 0.3;
  setTimeout(function(){ UI.pageCleared(); }, 900);
}

/* ---------- 건설·합성·판매 ---------- */
function costFor(res, tile){
  var w = res.w, typed = res.typed && !res.ko ? res.typed : w.w, c, L = typed.length;
  var p = 0; for (var i = 0; i < typed.length; i++){ var ch = typed[i], v = PT[ch] || 0; if (has("vowelc") && "AEIOU".indexOf(ch) >= 0) v = 0; if (has("rare") && "QZXJK".indexOf(ch) >= 0) v /= 2; p += v; }
  var m = w.m == null ? 1.5 : w.m; c = (10 + p * 4) * m * (w.p || 1) * DIFF[RUN.diff].cost;
  var notes = [];
  var merge = tile && B.towers[tile] && B.towers[tile].w.w === w.w;
  if (!merge){ var rep = B.pageBuilt[w.w] || 0; if (rep){ c *= 1 + 0.15 * rep; notes.push("반복 +" + (15 * rep) + "%"); } }
  else if (has("pedestal")){ c *= 0.75; notes.push("받침대 −25%"); }
  if (rule("short") && L <= 4){ c *= 0.7; notes.push("짧게 −30%"); }
  if (rule("fresh") && !RUN.usedWords[w.w]){ c *= 0.6; notes.push("새 학기 −40%"); }
  if (penIs("fountain") && L <= 4){ c *= 1.2; notes.push("만년필 +20%"); }
  if (penIs("crayon") && w.k === "support"){ c *= 0.7; notes.push("크레파스 −30%"); }
  if (has("card") && RUN.seenEnemy[w.w] && !RUN.cardUsed[w.w]){ c *= 0.5; notes.push("단어 카드 −50%"); }
  if (has("chainw") && B.lastBuilt && typed[0] === B.lastBuilt[B.lastBuilt.length - 1]){ c *= 0.85; notes.push("끝말잇기 −15%"); }
  if (has("dict2") && w.L){ c *= 0.7; notes.push("전설 −30%"); }
  if (RUN.discount && RUN.discount[w.w]){ c *= 0.5; notes.push("도서실 −50%"); }
  c = Math.round(c);
  if (RUN.freeTickets > 0 && !merge){ notes.push("무료 건설권"); c = 0; }
  else if (B.freeBlank > 0 && L <= 6 && !merge){ notes.push("백지 무료"); c = 0; }
  return {c:c, notes:notes, merge:merge};
}
function build(res, tile){
  var xy = tile.split(",").map(Number), cst = costFor(res, tile), ex = B.towers[tile];
  if (ex && !cst.merge) return {err:"이미 다른 타워가 있어요. 같은 단어를 지으면 합성, 아니면 먼저 판매하세요."};
  if (ex && ex.lv >= 5) return {err:"이미 Lv5입니다."};
  if (RUN.gold < cst.c) return {err:"골드가 모자라요 (" + cst.c + "G 필요)"};
  RUN.gold -= cst.c;
  if (cst.notes.indexOf("무료 건설권") >= 0) RUN.freeTickets--; else if (cst.notes.indexOf("백지 무료") >= 0) B.freeBlank--;
  if (has("card") && RUN.seenEnemy[res.w.w]) RUN.cardUsed[res.w.w] = 1;
  var typed = res.ko ? res.w.w : res.typed;
  if (ex){ ex.lv++; ex.spent += cst.c; if (typed.length > ex.typed.length && WMAP[res.w.w]) ex.typed = typed; floatText("Lv" + ex.lv + "!", ex.x + 0.5, ex.y, "#FFD34D"); }
  else {
    var t = {w:res.w, typed:typed, x:xy[0], y:xy[1], lv:1, cd:0.3, spent:cst.c, tgt:"first", waves:0, chainBonus:has("chainw") && B.lastBuilt && typed[0] === B.lastBuilt[B.lastBuilt.length - 1]};
    B.towers[tile] = t; B.pageBuilt[res.w.w] = (B.pageBuilt[res.w.w] || 0) + 1;
    if (!RUN.usedWords[res.w.w]){ RUN.usedWords[res.w.w] = 1; B.pageFirst++; }
    if (!SAVE.used[res.w.w]){ SAVE.used[res.w.w] = 1; UI.newWord(res.w); }
    B.lastBuilt = typed; RUN.lastBuilt = typed;
  }
  recalcAll(); SFX.play("build"); vib(15);
  for (var i = 0; i < 6; i++) B.fx.push({k:"crumb", x:xy[0] + 0.5, y:xy[1] + 0.6, vx:(Math.random() - 0.5) * 2, vy:-Math.random() * 2, t:0.4, T:0.4, c:EL[res.w.k].l});
  return {ok:true, cost:cst.c, merge:!!ex};
}
function upgradeCost(t){ var c = t.typed.length * (t.lv === 1 ? 15 : 30) * DIFF[RUN.diff].cost; if (has("pedestal")) c *= 0.75; return Math.round(c); }
function upgrade(t){ if (t.lv >= 3) return {err:"Lv4부터는 같은 단어 합성으로만 올릴 수 있어요."}; var c = upgradeCost(t); if (RUN.gold < c) return {err:"골드가 모자라요"}; RUN.gold -= c; t.spent += c; t.lv++; recalcAll(); SFX.play("build"); floatText("Lv" + t.lv, t.x + 0.5, t.y, "#FFD34D"); return {ok:true}; }
function sellValue(t){ return Math.round(t.spent * (RUN.erasers > 0 ? 1 : 0.6)); }
function sell(t){ var v = sellValue(t); if (RUN.erasers > 0) RUN.erasers--; RUN.gold += v; delete B.towers[t.x + "," + t.y]; B.traps = B.traps.filter(function(tr){ return tr.t !== t; }); recalcAll(); SFX.play("gold"); return v; }

/* ---------- 전투 타이핑 ---------- */
function comboWindow(){ var w = 2.5; if (penIs("ball")) w += 0.5; if (has("practice")) w += 1; if (UI.lang() === "ko") w += SAVE.settings.kb === "cji" ? 0.8 : 0.3; if (SAVE.settings.slow) w += 1.5; return w; }
function comboUp(){ B.combo++; B.comboT = comboWindow(); B.maxCombo = Math.max(B.maxCombo, B.combo); if (B.combo % 10 === 0){ B.ink = Math.min(100, B.ink + 15 * (has("inkup") ? 1.3 : 1)); SFX.play("combo"); UI.stampCombo(B.combo); } }
function comboMul(){ var cap = rule("quiet") ? 2.5 : 2; return Math.min(cap, 1 + 0.05 * B.combo); }
function miss(){ if (has("wrongnote")) B.combo = Math.floor(B.combo / 2); else B.combo = 0; B.miss = true; if (rule("dict") && !SAVE.settings.slow){ RUN.life = Math.max(1, RUN.life - 1); UI.flash(); } }
function strikeTargets(s){ var ko = Hangul.isKo(s), up = s.toUpperCase(); return B.enemies.filter(function(e){ return !e.dead && e.word && !e.burrowed && (ko ? e.word === s : e.word === up); }); }
function strike(s){
  var cands = strikeTargets(s); if (!cands.length) return false;
  var e = cands.sort(function(a, b){ return b.d / eLen(b) - a.d / eLen(a); })[0], p = ePos(e);
  var pct = e.boss ? (e.weak ? 0.12 : 0.03) : e.elite ? 0.2 : 0.35, m = comboMul();
  if (penIs("ball")) m *= 1.6; if (has("redpen")) m *= 1.5; if (rule("dict")) m *= 2; if (SAVE.settings.slow) m *= 1;
  var chipM = UI.chipUsed ? 0.7 : 1; UI.chipUsed = false;
  var dmg = e.max * pct * m * chipM;
  if (e.wobj){ RUN.seenEnemy[e.wobj.w] = 1; if (!SAVE.seen[e.wobj.w]) SAVE.seen[e.wobj.w] = 1; }
  B.fx.push({k:"slash", x:p[0], y:p[1], t:0.3, T:0.3}); B.shake = Math.max(B.shake, 0.06);
  hurt(e, dmg, "true", null, {big:true});
  if (e.boss && e.weak){ e.weak = false; e.word = null; e.patT = Math.max(e.patT, 6); floatText("패턴 취소!", p[0], p[1] - 1.2, "#FFD34D"); }
  if (!e.dead){ e.hitStop = 0.4; if (!e.boss){ var ew = enemyWord(e.elite ? 5 : 3 + (Math.random() < 0.5 ? 1 : 0)); e.word = ew.s; e.wobj = ew.w; } }
  B.ink = Math.min(100, B.ink + 8 * (has("inkup") ? 1.3 : 1));
  comboUp(); SFX.play("strike"); vib(20);
  return true;
}
function spellOf(s){ var up = s.toUpperCase(); return SPELLS.filter(function(sp){ return RUN.spells.indexOf(sp.id) >= 0 && (sp.id === up || sp.ko === s); })[0]; }
function castSpell(sp){
  if (rule("quiet")) return {err:"조용히! 이번 쪽은 주문을 쓸 수 없어요."};
  if (B.ink < sp.ink) return {err:"잉크가 모자라요 (" + sp.ink + " 필요)"};
  B.ink -= sp.ink; var dur = has("double") ? 1.5 : 1; SFX.play("spell"); comboUp();
  if (sp.id === "STOP"){ B.spellT.STOP = 2 * dur; B.enemies.forEach(function(e){ if (e.boss) e.hitStop = 1 * dur; }); B.spellT.STOP = B.boss ? Math.min(B.spellT.STOP, 2 * dur) : B.spellT.STOP; }
  if (sp.id === "RUSH") B.spellT.RUSH = 5 * dur;
  if (sp.id === "BOOM"){ var best = null, bn = -1; B.enemies.forEach(function(e){ if (e.dead) return; var p = ePos(e), n = B.enemies.filter(function(o){ if (o.dead) return false; var q = ePos(o); return Math.hypot(q[0]-p[0], q[1]-p[1]) < 2; }).length; if (n > bn){ bn = n; best = p; } });
    if (best){ var top = towerList().sort(function(a, b){ return b.st.dmg - a.st.dmg; })[0], dmg = top ? top.st.dmg * 4 : 100; B.fx.push({k:"ring", x:best[0], y:best[1], r:2, t:0.5, T:0.5, c:"#E0483E"}); B.enemies.forEach(function(e){ if (e.dead) return; var q = ePos(e); if (Math.hypot(q[0]-best[0], q[1]-best[1]) <= 2) hurt(e, dmg, "true", null, {big:true}); }); SFX.play("boom"); B.shake = 0.4; } }
  if (sp.id === "GOLD") addGold(40, [4.5, 6]);
  if (sp.id === "HEAL") RUN.life = Math.min(RUN.maxLife + 10, RUN.life + 3);
  if (sp.id === "ERASE"){ var c = B.enemies.filter(function(e){ return !e.dead && !e.boss && !e.elite; }).sort(function(a, b){ return b.d - a.d; })[0]; if (c) kill(c, null); }
  UI.banner(sp.id + (UI.lang() === "ko" ? " · " + sp.ko : "") + "!", "#6be36b");
  return {ok:true};
}
