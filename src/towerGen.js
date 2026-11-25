/* WORD TD 타워 생성기: 속성별 건물 양식 + 단어별 변형 (16x16 픽셀) */
var TG = (function(){
  var EC = {
    fire:{m:"#f08a24",l:"#ffd34d",d:"#b8471a"}, ice:{m:"#8fd8ff",l:"#e8f8ff",d:"#3a8fc7"},
    storm:{m:"#ffd84a",l:"#fff6c2",d:"#c79a12"}, poison:{m:"#9be64a",l:"#e0ffb0",d:"#4f8a1c"},
    earth:{m:"#b9824e",l:"#e0b583",d:"#6b4a2a"}, water:{m:"#3f8cff",l:"#a9d0ff",d:"#1d4fa8"},
    wind:{m:"#6fe3c8",l:"#d4fff4",d:"#2a9c84"}, light:{m:"#ffe680",l:"#fffbe0",d:"#d8a520"},
    dark:{m:"#a77bff",l:"#ece2ff",d:"#4a2a7a"}, steel:{m:"#c9d2de",l:"#f4f7fb",d:"#6d7a8c"},
    arcane:{m:"#e060d8",l:"#ffc2f8",d:"#8a2a8a"}, nature:{m:"#4cc35a",l:"#b6f58a",d:"#23763a"},
    support:{m:"#ffcf3d",l:"#fff3b0",d:"#c08a12"}, plain:{m:"#d7dae1",l:"#ffffff",d:"#8a8f9b"}
  };
  var S1 = "#a7acb8", S2 = "#7d8392", S3 = "#555a68", INK = "#262a36";
  var ACC = ["#f0c14a","#e8504a","#3fc8e0","#a77bff","#4cc35a","#ff8fb0","#f4f7fb","#ff9b3a"];
  var PLAIN = [["#c9a27a","#a07850","#6e5034"],["#9fb0c8","#7486a0","#4c5a70"],["#c48a8a","#9a6060","#6a3e3e"],["#a8c49a","#7e9a70","#566c4a"],["#c8b88a","#a08f60","#6e623e"],["#b0a0c8","#8676a0","#5a4c70"],["#9ac4c0","#709a96","#4a6c68"],["#c8c8c8","#9a9a9a","#6a6a6a"]];
  function hash(s){ var h = 2166136261; for (var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function make(word, kind, legend, salt){
    var g = [], i; for (i = 0; i < 256; i++) g.push(null);
    var H = hash(word + "|" + kind + "|" + (salt || 0)), bits = H;
    function pick(n){ var v = bits % n; bits = Math.floor(bits / n) ^ (Math.imul(bits, 2654435761) >>> 7); if (bits === 0) bits = hash(word + bits); return v; }
    function R(x, y, w, h, c){ for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) if (xx >= 0 && yy >= 0 && xx < 16 && yy < 16) g[yy*16 + xx] = c; }
    function S(x, y, w, h, c){ R(x, y, w, h, c); R(16 - x - w, y, w, h, c); }
    function P(x, y, c){ R(x, y, 1, 1, c); }
    var C = EC[kind] || EC.plain, len = word.length;
    var tall = Math.max(0, Math.min(3, len - 3 + pick(2) - 1));  // 0..3
    var acc = ACC[pick(ACC.length)];
    var baseW = [10, 12, 14][pick(3)], bx = (16 - baseW) / 2;
    var v1 = pick(4), v2 = pick(4), v3 = pick(3), v4 = pick(3);
    /* 받침 */
    if (v4 === 0){ R(bx, 14, baseW, 1, S1); R(bx, 15, baseW, 1, S3); }
    else if (v4 === 1){ R(bx, 14, baseW, 2, S2); R(bx, 14, baseW, 1, S1); R(bx + 1, 15, baseW - 2, 1, S3); }
    else { R(bx + 1, 13, baseW - 2, 1, S1); R(bx, 14, baseW, 1, S2); R(bx, 15, baseW, 1, S3); }
    var top = 13 - (v4 === 2 ? 1 : 0);
    var A = {
      fire: function(){
        var bw = [4, 6][v3 % 2], h = 3 + tall, y0 = top - h, br = ["#8a4a3a","#6a3428","#b06a52"];
        R(8 - bw/2, y0, bw, h, br[0]); for (var r = 0; r < h; r += 2) R(8 - bw/2 + (r/2 % 2), y0 + r, 1, 1, br[1]);
        R(8 - bw/2, y0, 1, h, br[2]);
        var bowl = bw + 4 + (v1 % 2) * 2; R(8 - bowl/2, y0 - 2, bowl, 2, C.d); R(8 - bowl/2, y0 - 2, bowl, 1, br[2]);
        var fy = y0 - 2;
        if (v2 === 0){ R(6, fy - 3, 4, 3, C.m); R(7, fy - 5, 2, 2, C.m); R(7, fy - 3, 2, 2, C.l); }
        else if (v2 === 1){ S(5, fy - 2, 2, 2, C.m); R(7, fy - 4, 2, 4, C.m); P(7, fy - 2, C.l); P(8, fy - 3, C.l); S(5, fy - 3, 1, 1, C.l); }
        else if (v2 === 2){ R(5, fy - 2, 6, 2, C.m); R(6, fy - 4, 4, 2, C.m); R(7, fy - 6, 1, 2, C.m); R(7, fy - 3, 2, 2, C.l); }
        else { R(6, fy - 2, 4, 2, C.l); R(6, fy - 4, 1, 2, C.m); R(9, fy - 3, 1, 1, C.m); R(8, fy - 5, 1, 3, C.m); }
        if (v1 >= 2){ S(8 - bw/2 - 2, y0 + 1, 1, h - 1, S3); S(8 - bw/2 - 2, y0, 1, 1, C.l); }
      },
      ice: function(){
        var h = 6 + tall, y0 = top - h;
        for (var r = 0; r < h; r++){ var w = Math.min(6, 1 + Math.floor(r * 6 / h) * 1 + (r > 1 ? 1 : 0)); R(8 - Math.ceil(w/2), y0 + r, w, 1, C.m); P(8 - Math.ceil(w/2), y0 + r, C.l); P(8 - Math.ceil(w/2) + w - 1, y0 + r, C.d); }
        if (v2 === 1 || v2 === 3){ var sh = 3 + (tall > 1 ? 1 : 0); for (var q = 0; q < sh; q++){ S(4, top - sh + q, 1 + (q > 0 ? 1 : 0), 1, C.m); } S(4, top - sh, 1, 1, C.l); }
        if (v2 === 2){ R(6, y0 + 2, 4, 1, acc); }
        if (v1 === 1){ R(5, top - 1, 6, 1, "#e8f2fa"); }
        if (v1 === 2){ P(3, y0 + 1, C.l); P(12, y0 + 3, C.l); P(2, y0 + 4, C.l); }
        if (v1 === 3){ R(7, y0 - 1, 2, 1, C.l); }
        if (v3 === 2){ S(2, top - 2, 2, 2, C.d); }
      },
      storm: function(){
        var h = 6 + tall, y0 = top - h;
        R(7, y0, 2, h, S2); R(7, y0, 1, h, S1);
        var rings = 2 + v3; for (var k = 0; k < rings; k++){ var ry = y0 + 1 + Math.floor(k * (h - 2) / rings); R(5, ry, 6, 1, C.d); R(6, ry, 4, 1, C.m); }
        if (v2 === 0){ R(6, y0 - 4, 4, 4, C.m); R(7, y0 - 4, 2, 1, C.l); R(6, y0 - 3, 1, 1, C.l); }
        else if (v2 === 1){ S(5, y0 - 3, 1, 3, S2); R(7, y0 - 4, 2, 4, S2); S(5, y0 - 4, 1, 1, C.l); R(7, y0 - 5, 2, 1, C.l); }
        else if (v2 === 2){ R(5, y0 - 2, 6, 2, C.d); R(6, y0 - 4, 4, 2, C.m); R(7, y0 - 5, 2, 1, C.l); }
        else { R(6, y0 - 3, 4, 3, S3); R(7, y0 - 4, 2, 1, C.l); P(4, y0 - 5, C.m); P(11, y0 - 4, C.m); }
        if (v1 >= 2){ P(3, y0 + 1, C.l); P(4, y0 + 2, C.m); P(12, y0 + 3, C.l); P(11, y0 + 4, C.m); }
        if (v1 === 1){ S(4, top - 2, 1, 2, C.d); }
      },
      poison: function(){
        var w = [6, 8][v3 % 2], h = 4 + Math.min(2, tall), y0 = top - h - 1;
        S(8 - w/2 + 1, top - 1, 1, 1, S3);
        for (var r = 0; r < h; r++){ var ww = (r === 0 || r === h - 1) ? w - 2 : w; R(8 - ww/2, y0 + r, ww, 1, C.m); }
        R(8 - w/2 + 1, y0 + h - 1, w - 2, 1, C.d); P(8 - w/2 + 1, y0 + 1, C.l); P(9, y0 + 2, C.l);
        var nh = 2 + (v2 % 2); R(7, y0 - nh, 2, nh, C.d); R(6, y0 - nh - 1, 4, 1, S2);
        if (v2 >= 2){ R(6, y0 - nh - 3, 1, 2, C.l); P(9, y0 - nh - 2, C.m); }
        if (v1 === 1){ R(8 + w/2, y0 + 1, 2, 1, S2); R(9 + w/2, y0 + 2, 1, 3, S2); P(9 + w/2, y0 + 5, C.m); }
        if (v1 === 2){ R(7, y0 + 2, 2, 2, "#f4ead2"); P(7, y0 + 2, INK); P(8, y0 + 2, INK); }
        if (v1 === 3){ P(8 - w/2, y0 + h, C.m); P(8 - w/2, y0 + h + 1, C.l); }
      },
      earth: function(){
        var y = top, n = 2 + Math.min(1, tall >> 1) + (v3 === 2 ? 1 : 0), w = 8 + (v1 % 2) * 2;
        for (var k = 0; k < n; k++){ var hh = 2 + (k === 0 ? 1 : 0); y -= hh; var off = (k % 2 === 0) ? 0 : (v2 % 2 ? 1 : -1);
          R(8 - w/2 + off, y, w, hh, C.m); R(8 - w/2 + off, y, w, 1, C.l); R(8 - w/2 + off + w - 1, y, 1, hh, C.d); w = Math.max(4, w - 2); }
        if (v2 === 2){ R(7, y - 3, 2, 3, acc); P(7, y - 3, "#ffffff"); }
        else if (v2 === 3){ R(6, y - 2, 4, 2, C.d); R(7, y - 3, 2, 1, C.d); }
        else if (v2 === 1){ P(6, y - 1, C.d); P(9, y - 1, C.d); }
        if (v1 >= 2){ P(7, top - 2, acc); P(8, top - 4, acc); }
      },
      water: function(){
        var ph = 2 + tall, y0 = top - ph; R(7, y0, 2, ph, S2); R(7, y0, 1, ph, S1);
        var bw = [8, 10, 12][v3]; R(8 - bw/2, y0 - 2, bw, 2, C.d); R(8 - bw/2 + 1, y0 - 2, bw - 2, 1, C.m);
        var j = y0 - 2;
        if (v2 === 0){ R(7, j - 4, 2, 4, C.l); S(5, j - 4, 2, 1, C.m); S(4, j - 3, 1, 2, C.m); }
        else if (v2 === 1){ R(7, j - 5, 2, 5, C.m); R(7, j - 5, 1, 5, C.l); S(4, j - 3, 1, 3, C.m); S(4, j - 3, 1, 1, C.l); }
        else if (v2 === 2){ R(6, j - 3, 4, 3, C.m); R(7, j - 4, 2, 1, C.l); S(8 - bw/2, j + 1, 1, ph + 1, C.m); }
        else { R(7, j - 3, 2, 3, C.l); P(5, j - 4, C.m); P(10, j - 5, C.m); P(8, j - 6, C.l); }
        if (v1 >= 2){ R(8 - bw/2 - 1, top, bw + 2, 1, C.m); }
      },
      wind: function(){
        var h = 5 + tall, y0 = top - h;
        for (var r = 0; r < h; r++){ var w = 3 + Math.floor(r * 3 / h); R(8 - Math.ceil(w/2), y0 + r, w, 1, r % 3 === 2 ? S2 : S1); }
        R(7, y0 + Math.floor(h/2), 2, 2, INK);
        var cy = y0 - 1;
        if (v2 === 0 || v2 === 2){ for (var k = 1; k <= 4; k++){ P(8 - k, cy - k, C.m); P(7 + k, cy - k, C.m); P(8 - k, cy + k - 1, C.m); P(7 + k, cy + k - 1, C.m); } P(4, cy - 4, C.l); P(11, cy + 3, C.l); }
        else { R(7, cy - 5, 2, 4, C.m); R(7, cy + 1, 2, 3, C.m); R(3, cy - 1, 4, 2, C.m); R(9, cy - 1, 4, 2, C.m); R(7, cy - 5, 1, 1, C.l); }
        R(7, cy - 1, 2, 2, C.d);
        if (v2 >= 2){ R(9, y0 - 7, 1, 3, S3); R(10, y0 - 7, 3, 2, acc); }
        if (v1 >= 2){ S(3, top - 2, 1, 2, C.l); }
      },
      light: function(){
        var h = 5 + tall, y0 = top - h, w = [4, 6][v3 % 2];
        for (var r = 0; r < h; r++) R(8 - w/2, y0 + r, w, 1, (Math.floor(r / 2) % 2) ? acc : "#f4f7fb");
        R(8 - w/2, y0, 1, h, S1);
        if (v2 === 0){ R(8 - w/2 - 1, y0 - 1, w + 2, 1, S3); R(6, y0 - 4, 4, 3, C.m); R(7, y0 - 4, 2, 1, C.l); R(6, y0 - 5, 4, 1, S3); P(4, y0 - 3, C.l); P(11, y0 - 3, C.l); }
        else if (v2 === 1){ R(7, y0 - 5, 2, 5, C.m); R(6, y0 - 3, 4, 1, C.m); R(7, y0 - 4, 1, 2, C.l); }
        else if (v2 === 2){ R(5, y0 - 4, 6, 4, C.m); R(6, y0 - 5, 4, 6, C.m); R(6, y0 - 4, 2, 2, C.l); }
        else { R(7, y0 - 3, 2, 3, C.d); R(5, y0 - 6, 6, 3, C.m); R(6, y0 - 5, 2, 1, C.l); }
        if (v1 >= 2){ P(3, y0 - 2, C.m); P(12, y0 - 6, C.m); P(2, y0 + 1, C.l); }
      },
      dark: function(){
        var h = 6 + tall, y0 = top - h, st = ["#3c3150","#5a4a7a","#2a2238"];
        for (var r = 0; r < h; r++){ var w = 2 + Math.floor(r * 4 / h), off = (v3 === 1 && r < h/2) ? 1 : 0; R(8 - w/2 + off, y0 + r, w, 1, st[0]); P(8 - w/2 + off, y0 + r, st[1]); }
        if (v2 === 0){ R(6, y0 - 3, 4, 3, C.l); P(6, y0 - 2, INK); P(9, y0 - 2, INK); R(7, y0, 2, 1, C.m); }
        else if (v2 === 1){ R(6, y0 - 3, 4, 3, C.m); R(7, y0 - 2, 2, 1, C.l); P(7, y0 - 2, INK); }
        else if (v2 === 2){ S(5, y0 - 3, 1, 2, st[1]); S(4, y0 - 4, 1, 1, st[1]); R(7, y0 - 2, 2, 2, C.m); }
        else { R(6, y0 - 5, 3, 1, C.l); R(5, y0 - 4, 2, 3, C.l); R(6, y0 - 1, 3, 1, C.l); }
        if (v1 >= 2){ S(4, y0 + 3, 1, 1, st[1]); S(3, y0 + 4, 1, 1, st[1]); }
        if (v1 === 1){ P(3, y0, C.m); P(12, y0 + 2, C.m); }
      },
      steel: function(){
        var w = [6, 8][v3 % 2], h = 3 + Math.min(2, tall), y0 = top - h;
        R(8 - w/2, y0, w, h, S2); R(8 - w/2, y0, w, 1, S1); R(8 - w/2 + w - 1, y0, 1, h, S3);
        for (var c = 0; c < w; c += 2) R(8 - w/2 + c, y0 - 1, 1, 1, S1);
        R(7, y0 + 1, 2, 1, INK);
        if (v2 === 0){ R(8, y0 - 3, 6, 2, C.d); R(8, y0 - 3, 6, 1, C.l); R(6, y0 - 4, 3, 3, S3); }
        else if (v2 === 1){ R(7, y0 - 7, 2, 6, C.m); R(7, y0 - 7, 1, 6, C.l); R(5, y0 - 2, 6, 1, acc); P(7, y0 - 8, C.l); }
        else if (v2 === 2){ R(4, y0 - 3, 8, 1, C.d); P(4, y0 - 4, C.d); P(11, y0 - 4, C.d); R(7, y0 - 4, 2, 3, S3); R(9, y0 - 3, 4, 1, C.l); }
        else { R(6, y0 - 4, 4, 3, C.d); R(7, y0 - 5, 2, 1, C.m); R(6, y0 - 4, 1, 1, C.l); S(4, y0 - 2, 1, 1, C.l); }
        if (v1 >= 2){ R(8 - w/2 - 2, y0 - 4, 1, 4 + h, S3); R(8 - w/2 - 1, y0 - 4, 2, 2, acc); }
      },
      arcane: function(){
        var h = 3 + Math.min(2, tall), w = [4, 6][v3 % 2], y0 = top - h;
        R(8 - w/2, y0, w, h, C.d); R(8 - w/2, y0, w, 1, C.m); for (var r = 1; r < h; r += 2) P(8 - w/2 + 1 + (r % 3), y0 + r, C.l);
        var oy = y0 - 6;
        if (v2 === 0){ R(6, oy, 4, 4, C.m); R(7, oy - 1, 2, 6, C.m); R(6, oy + 1, 1, 1, C.l); }
        else if (v2 === 1){ R(7, oy - 1, 2, 1, C.l); R(6, oy, 4, 1, C.m); R(5, oy + 1, 6, 2, C.m); R(6, oy + 3, 4, 1, C.m); R(7, oy + 4, 2, 1, C.d); }
        else if (v2 === 2){ R(6, oy + 1, 4, 3, C.m); S(4, oy + 2, 1, 1, C.l); R(5, oy, 6, 1, C.l); R(5, oy + 4, 6, 1, C.l); }
        else { R(5, oy + 1, 6, 4, "#f4ead2"); R(8, oy + 1, 1, 4, C.d); R(5, oy + 5, 6, 1, C.d); }
        if (v1 >= 2){ P(3, oy + 1, C.l); P(12, oy + 3, C.l); P(4, oy + 5, C.m); }
        if (v1 === 1){ R(5, y0 - 1, 6, 1, acc); }
      },
      nature: function(){
        var th = 3 + Math.min(2, tall), tw = 2 + (v3 === 2 ? 1 : 0), y0 = top - th, bark = "#7a4a2a";
        R(8 - Math.ceil(tw/2), y0, tw, th, bark); P(8 - Math.ceil(tw/2), y0, "#9a6a40");
        if (v2 === 0){ R(4, y0 - 5, 8, 5, C.m); R(5, y0 - 6, 6, 1, C.m); R(3, y0 - 3, 10, 2, C.m); R(5, y0 - 5, 3, 2, C.l); R(4, y0 - 1, 8, 1, C.d); }
        else if (v2 === 1){ for (var r = 0; r < 7; r++){ var w = 1 + r; R(8 - Math.ceil(w/2), y0 - 7 + r, w, 1, r % 3 === 2 ? C.d : C.m); } P(7, y0 - 6, C.l); }
        else if (v2 === 2){ R(3, y0 - 4, 4, 4, C.m); R(9, y0 - 4, 4, 4, C.m); R(6, y0 - 6, 4, 4, C.m); R(4, y0 - 4, 2, 1, C.l); R(7, y0 - 6, 2, 1, C.l); }
        else { R(4, y0 - 3, 8, 3, C.m); R(5, y0 - 4, 6, 1, C.m); R(3, y0 - 1, 10, 1, C.d); S(4, y0 - 2, 1, 1, C.l); }
        if (v1 >= 2){ P(5, y0 - 3, acc); P(10, y0 - 2, acc); P(8, y0 - 5, acc); }
        if (v1 === 1){ S(4, top - 1, 1, 1, C.m); }
      },
      support: function(){
        var w = [8, 10][v3 % 2], h = 3 + Math.min(2, tall), y0 = top - h;
        if (v2 === 0){ R(8 - w/2, y0, w, h, "#e8dcc0"); R(7, y0 + 1, 2, h - 1, INK); for (var r = 0; r < 4; r++) R(8 - r - 1, y0 - 4 + r, 2 + r*2, 1, r % 2 ? acc : C.m); }
        else if (v2 === 1){ R(8 - w/2, y0, w, h, S1); S(8 - w/2 + 1, y0, 1, h, S3); R(8 - w/2 - 1, y0 - 1, w + 2, 1, C.d); R(8 - w/2, y0 - 3, w, 2, C.m); R(6, y0 - 4, 4, 1, C.m); R(7, y0 - 3, 2, 1, C.l); }
        else if (v2 === 2){ R(8 - w/2 + 1, y0, w - 2, h, C.d); R(8 - w/2 + 1, y0, w - 2, 1, C.l); R(6, y0 - 4, 4, 4, C.m); R(7, y0 - 3, 1, 2, C.d); P(6, y0 - 4, C.l); }
        else { R(8 - w/2 + 1, y0, w - 2, h, "#8a5a3a"); R(8 - w/2 + 1, y0 + 1, w - 2, 1, C.m); R(8 - w/2, y0 - 2, w, 2, "#6a4428"); R(7, y0 - 1, 2, 1, C.l); }
        var fx = v1 % 2 ? 2 : 12; R(fx + 1, y0 - 6, 1, 6 + h, S3); R(v1 % 2 ? fx + 2 : fx - 2, y0 - 6, 3, 2, acc);
      },
      plain: function(){
        var pal = PLAIN[pick(PLAIN.length)], w = [4, 6, 8][v3], h = 4 + tall, y0 = top - h;
        R(8 - w/2, y0, w, h, pal[1]); R(8 - w/2, y0, 1, h, pal[0]); R(8 + w/2 - 1, y0, 1, h, pal[2]);
        if (v1 === 0) R(7, y0 + 1, 2, 2, INK); else if (v1 === 1){ R(7, y0 + 1, 2, 1, INK); R(7, y0 + 3, 2, 1, INK); } else if (v1 === 2) R(7, y0 + h - 2, 2, 2, INK); else { P(8 - w/2 + 1, y0 + 1, INK); P(8 + w/2 - 2, y0 + 1, INK); }
        if (v2 === 0){ for (var c = 0; c < w + 2; c += 2) R(8 - w/2 - 1 + c, y0 - 1, 1, 1, pal[0]); R(8 - w/2 - 1, y0, w + 2, 1, pal[2]); }
        else if (v2 === 1){ for (var r = 0; r < 3; r++) R(8 - (w/2 + 1) + r, y0 - 1 - r, w + 2 - r*2, 1, r ? pal[0] : pal[2]); }
        else if (v2 === 2){ R(8 - w/2, y0 - 2, w, 2, pal[0]); R(8 - w/2 + 1, y0 - 3, w - 2, 1, pal[0]); }
        else { R(8 - w/2 - 1, y0 - 1, w + 2, 1, pal[2]); R(8, y0 - 5, 1, 4, S3); R(9, y0 - 5, 3, 2, acc); }
      }
    };
    (A[kind] || A.plain)();
    if (legend){ R(5, 0, 1, 2, "#f0c14a"); R(7, 0, 2, 2, "#f0c14a"); R(10, 0, 1, 2, "#f0c14a"); R(5, 2, 6, 1, "#f0c14a"); P(7, 1, "#e8504a"); S(1, 11, 1, 1, "#ffd34d"); S(0, 8, 1, 1, "#fff3b0"); }
    return g;
  }
  var seen = {};
  function get(word, kind, legend){
    var key = word + "|" + kind; if (seen[key]) return seen[key].g;
    var salt = 0, g, sig;
    do { g = make(word, kind, legend, salt); sig = g.join(","); salt++; } while (get.sigs[sig] && salt < 40);
    get.sigs[sig] = word; seen[key] = {g: g}; return g;
  }
  get.sigs = {};
  function toCanvas(g, scale){
    var c = document.createElement("canvas"); c.width = c.height = 16 * scale; var x = c.getContext("2d");
    for (var i = 0; i < 256; i++) if (g[i]){ x.fillStyle = g[i]; x.fillRect((i % 16) * scale, Math.floor(i / 16) * scale, scale, scale); }
    return c;
  }
  return {get: get, make: make, toCanvas: toCanvas, EC: EC};
})();
if (typeof module !== "undefined") module.exports = TG;
