/* WORD TD 배포 빌드: src/game 원본 → 루트 index.html + game.js (난독화)
   사용: node tools/build.js        (원본은 src/game 에 그대로 남는다)            */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), SRC = path.join(ROOT, "src", "game");
let Obf = null; try { Obf = require("javascript-obfuscator"); } catch (e) { console.warn("javascript-obfuscator 없음: npm i -D javascript-obfuscator (난독화 없이 빌드)"); }
/* 1) 단어 데이터 */
const words = JSON.parse(fs.readFileSync(path.join(ROOT, "wiki", "words.json"), "utf8"));
fs.writeFileSync(path.join(SRC, "data.js"), "var WORDS = " + JSON.stringify(words) + ";\n");
/* 2) 스크립트 묶기 */
const order = [path.join(SRC, "data.js"), path.join(ROOT, "src", "towerGen.js"), "hangul.js", "core.js", "battle.js", "render.js", "ui.js"].map(f => path.isAbsolute(f) ? f : path.join(SRC, f));
let js = order.map(f => fs.readFileSync(f, "utf8").replace(/if \(typeof module !== "undefined"\) module\.exports = \w+;/g, "")).join("\n;\n") + "\n;boot();\n";
js = "(function(){\n" + js + "\n})();";
const PROTECT = `(function(){var b=function(e){e.preventDefault();return false;};document.addEventListener("contextmenu",b);document.addEventListener("dragstart",function(e){if(e.target&&e.target.tagName==="IMG")e.preventDefault();});
document.addEventListener("keydown",function(e){var k=(e.key||"").toUpperCase();if(k==="F12"||(e.ctrlKey||e.metaKey)&&e.shiftKey&&["I","J","C","K"].indexOf(k)>=0||(e.ctrlKey||e.metaKey)&&["U","S","P"].indexOf(k)>=0||e.metaKey&&e.altKey&&["I","J","C","U"].indexOf(k)>=0){e.preventDefault();e.stopPropagation();return false;}},true);})();`;
if (Obf) {
  js = Obf.obfuscate(js, {compact: true, controlFlowFlattening: false, deadCodeInjection: false, stringArray: true, stringArrayThreshold: 0.75, stringArrayEncoding: ["base64"], rotateStringArray: true, shuffleStringArray: true, splitStrings: false,
    identifierNamesGenerator: "hexadecimal", renameGlobals: false, selfDefending: true, debugProtection: true, debugProtectionInterval: 4000, disableConsoleOutput: true, unicodeEscapeSequence: false, target: "browser"}).getObfuscatedCode();
}
fs.writeFileSync(path.join(ROOT, "game.js"), js);
/* 3) index.html */
let html = fs.readFileSync(path.join(SRC, "index.html"), "utf8");
html = html.replace(/<!--SCRIPTS-->[\s\S]*<!--\/SCRIPTS-->/, '<script src="game.js?v=' + Date.now().toString(36) + '"></script>');
html = html.replace("<!--PROTECT-->", "<script>" + PROTECT + "</script>");
html = html.replace('href="style.css"', 'href="style.css?v=' + Date.now().toString(36) + '"');
fs.writeFileSync(path.join(ROOT, "index.html"), html);
const css = fs.readFileSync(path.join(SRC, "style.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s*\n\s*/g, "");
fs.writeFileSync(path.join(ROOT, "style.css"), css);
console.log("built: index.html, game.js (" + Math.round(js.length / 1024) + "KB), style.css" + (Obf ? " [난독화]" : ""));
