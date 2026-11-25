import json
icons={}
for f in ['icons1.txt','icons2.txt','icons3.txt']:
    cur=None
    for line in open(f,encoding='utf-8').read().split('\n'):
        if line.startswith('@'):
            p=line[1:].split(); cur=p[0]; icons[cur]={'sym':len(p)>1 and p[1]=='S','rows':[]}
        elif cur and line.strip():
            icons[cur]['rows'].append(line.rstrip())
out={}
for w,d in icons.items():
    rows=[]
    for r in d['rows']:
        if d['sym']:
            h=r[:6].ljust(6,'.'); r=h+h[::-1]
        rows.append(r[:12].ljust(12,'.'))
    out[w]=rows
W=[x['w'] for x in json.load(open('words.json',encoding='utf-8'))]
print('missing',[w for w in W if w not in out]); print('extra',[w for w in out if w not in W]); print(len(out))
json.dump(out,open('icons.json','w'),separators=(',',':'))
js='''var TICON = %s;
var TPAL = {k:"#1d2029",w:"#ffffff",e:"#f4ead2",s:"#c9ccd3",t:"#8c909b",u:"#555a68",q:"#3c3150",r:"#e8504a",o:"#ff9b3a",y:"#ffd34d",g:"#4cc35a",G:"#23763a",b:"#7a4a2a",n:"#c48a5a",c:"#8fd8ff",B:"#3f8cff",p:"#a77bff",P:"#e060d8",h:"#ff8fb0"};
function iconTower(word, kind, legend){
  var rows = TICON[word]; if (!rows){ var sf = ["ING","ES","ED","ER","LY","S","D","R","Y"]; for (var si = 0; si < sf.length && !rows; si++){ var z = sf[si]; if (word.length > z.length + 2 && word.slice(-z.length) === z) rows = TICON[word.slice(0, -z.length)]; } } if (!rows) return null;
  var C = TG.EC[kind] || TG.EC.plain, g = [], i, x, y;
  for (i = 0; i < 256; i++) g.push(null);
  var x0 = 99, x1 = -1, y0 = 99, y1 = -1;
  for (y = 0; y < rows.length; y++) for (x = 0; x < 12; x++) if (rows[y][x] !== ".") { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  var w = x1 - x0 + 1, h = y1 - y0 + 1, ox = Math.floor((16 - w) / 2), oy = 12 - Math.min(12, h);
  for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++){ var ch = rows[y][x]; if (ch === ".") continue; var col = ch === "m" ? C.m : ch === "l" ? C.l : ch === "d" ? C.d : TPAL[ch]; var X = ox + x - x0, Y = oy + y - y0; if (X >= 0 && X < 16 && Y >= 0 && Y < 12 && col) g[Y*16 + X] = col; }
  function R(a, b, c, d, col){ for (var yy = b; yy < b + d; yy++) for (var xx = a; xx < a + c; xx++) g[yy*16 + xx] = col; }
  R(4, 12, 8, 1, legend ? "#ffd34d" : C.d); R(3, 13, 10, 1, "#c9ccd3"); R(2, 14, 12, 1, "#8c909b"); R(2, 15, 12, 1, "#555a68"); R(3, 13, 1, 1, "#ffffff");
  if (legend){ g[13*16 + 7] = "#e8504a"; g[13*16 + 8] = "#e8504a"; }
  return g;
}
(function(){ var make0 = TG.make; TG.make = function(word, kind, legend, salt){ if (!salt){ var ic = iconTower(word, kind, legend); if (ic) return ic; } return make0(word, kind, legend, salt); };
  var get0 = TG.get, icache = {}; TG.get = function(word, kind, legend){ var key = word + "|" + kind; if (icache[key]) return icache[key]; var ic = iconTower(word, kind, legend); return ic ? (icache[key] = ic) : get0(word, kind, legend); };
  TG.icon = iconTower; })();
''' % json.dumps(out,separators=(',',':'))
open('icons.js','w',encoding='utf-8').write(js)
