/* WORD TD 한글 조합기: 자모 목록 → 글자, 천지인 모음 획 조합 */
var Hangul = (function(){
  var CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
  var JUNG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";
  var JONG = " ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ";
  var VV = {"ㅗㅏ":"ㅘ","ㅗㅐ":"ㅙ","ㅗㅣ":"ㅚ","ㅜㅓ":"ㅝ","ㅜㅔ":"ㅞ","ㅜㅣ":"ㅟ","ㅡㅣ":"ㅢ"};
  var CC = {"ㄱㅅ":"ㄳ","ㄴㅈ":"ㄵ","ㄴㅎ":"ㄶ","ㄹㄱ":"ㄺ","ㄹㅁ":"ㄻ","ㄹㅂ":"ㄼ","ㄹㅅ":"ㄽ","ㄹㅌ":"ㄾ","ㄹㅍ":"ㄿ","ㄹㅎ":"ㅀ","ㅂㅅ":"ㅄ"};
  function isC(j){ return CHO.indexOf(j) >= 0 || JONG.indexOf(j) > 0; }
  function isV(j){ return JUNG.indexOf(j) >= 0; }
  function syl(c, v, f){ return String.fromCharCode(0xAC00 + (CHO.indexOf(c) * 21 + JUNG.indexOf(v)) * 28 + (f ? JONG.indexOf(f) : 0)); }
  /* 자모 배열을 완성형 문자열로 */
  function compose(js){
    var out = "", i = 0, n = js.length;
    while (i < n){
      var a = js[i];
      if (CHO.indexOf(a) >= 0 && i + 1 < n && isV(js[i+1])){
        var v = js[i+1], k = i + 2;
        if (k < n && isV(js[k]) && VV[v + js[k]]){ v = VV[v + js[k]]; k++; }
        var f = "";
        if (k < n && JONG.indexOf(js[k]) > 0 && !(k + 1 < n && isV(js[k+1]))){
          f = js[k]; k++;
          if (k < n && CC[f + js[k]] && !(k + 1 < n && isV(js[k+1]))){ f = CC[f + js[k]]; k++; }
        }
        out += syl(a, v, f); i = k;
      } else { out += a; i++; }
    }
    return out;
  }
  /* 천지인 획 → 모음 */
  var CJ = {"ㅣ":"ㅣ","ㆍ":"ㆍ","ㆍㆍ":"ᆢ","ㅡ":"ㅡ","ㅣㆍ":"ㅏ","ㅣㆍㆍ":"ㅑ","ㆍㅣ":"ㅓ","ㆍㆍㅣ":"ㅕ","ㆍㅡ":"ㅗ","ㆍㆍㅡ":"ㅛ","ㅡㆍ":"ㅜ","ㅡㆍㆍ":"ㅠ","ㅡㅣ":"ㅢ",
    "ㅣㆍㅣ":"ㅐ","ㆍㅣㅣ":"ㅔ","ㅣㆍㆍㅣ":"ㅒ","ㆍㆍㅣㅣ":"ㅖ","ㆍㅡㅣㆍ":"ㅘ","ㆍㅡㅣㆍㅣ":"ㅙ","ㆍㅡㅣ":"ㅚ","ㅡㆍㆍㅣ":"ㅝ","ㅡㆍㆍㅣㅣ":"ㅞ","ㅡㆍㅣ":"ㅟ"};
  var CJC = {"ㄱ":["ㄱ","ㅋ","ㄲ"],"ㄴ":["ㄴ","ㄹ"],"ㄷ":["ㄷ","ㅌ","ㄸ"],"ㅂ":["ㅂ","ㅍ","ㅃ"],"ㅅ":["ㅅ","ㅎ","ㅆ"],"ㅈ":["ㅈ","ㅊ","ㅉ"],"ㅇ":["ㅇ","ㅁ"]};
  /* 천지인 입력기: 토큰 = {t:"c",j,key,step} | {t:"v",s(획)} */
  function CJI(){ this.tk = []; this.last = null; this.at = 0; this.wait = 800; }
  CJI.prototype.jamo = function(){ return this.tk.map(function(t){ return t.t === "c" ? t.j : (CJ[t.s] || t.s); }); };
  CJI.prototype.text = function(){ return compose(this.jamo()); };
  CJI.prototype.press = function(k, now){
    now = now || Date.now(); if (now - this.at > this.wait) this.last = null; this.at = now;
    var top = this.tk[this.tk.length - 1];
    if (CJC[k]){
      if (top && top.t === "c" && top.key === k && this.last === k){ top.step = (top.step + 1) % CJC[k].length; top.j = CJC[k][top.step]; }
      else this.tk.push({t:"c", j:k, key:k, step:0});
    } else if (k === "ㅣ" || k === "ㆍ" || k === "ㅡ"){
      if (top && top.t === "v" && CJ[top.s + k]) top.s += k;
      else if (top && top.t === "v" && (top.s === "ㆍ" || top.s === "ㆍㆍ") && k !== "ㆍ" && CJ[top.s + k]) top.s += k;
      else this.tk.push({t:"v", s:k});
    }
    this.last = k;
  };
  CJI.prototype.next = function(){ this.last = null; };
  CJI.prototype.back = function(){ var top = this.tk[this.tk.length - 1]; if (!top) return; if (top.t === "v" && top.s.length > 1) top.s = top.s.slice(0, -1); else this.tk.pop(); this.last = null; };
  CJI.prototype.clear = function(){ this.tk = []; this.last = null; };
  /* 두벌식 입력기 */
  function DUB(){ this.js = []; }
  DUB.prototype.press = function(j){ this.js.push(j); };
  DUB.prototype.back = function(){ this.js.pop(); };
  DUB.prototype.clear = function(){ this.js = []; };
  DUB.prototype.text = function(){ return compose(this.js); };
  /* 완성형 → 자모 (편집 거리용) */
  function decompose(s){ var o = []; for (var i = 0; i < s.length; i++){ var c = s.charCodeAt(i) - 0xAC00; if (c < 0 || c > 11171){ o.push(s[i]); continue; } o.push(CHO[Math.floor(c / 588)], JUNG[Math.floor(c % 588 / 28)]); if (c % 28) o.push(JONG[c % 28]); } return o.join(""); }
  return {compose: compose, decompose: decompose, CJI: CJI, DUB: DUB, isKo: function(s){ return /[가-힣ㄱ-ㅣㆍᆢ]/.test(s); }};
})();
if (typeof module !== "undefined") module.exports = Hangul;
