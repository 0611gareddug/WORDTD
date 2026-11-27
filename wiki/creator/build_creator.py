t=open('tpl.html',encoding='utf-8').read()
css=t[t.index('<style>')+7:t.index('</style>')]
js=t[t.index('var WORDS = __WORDS__;'):t.index('/* ---------- 문서 ---------- */')]
te=open('te.js',encoding='utf-8').read()
def R(a,b):
    global te
    assert te.count(a)==1,(te.count(a),a[:70]); te=te.replace(a,b)
R('<p>새 특수 단어 타워의 컨셉과 픽셀 디자인을 만드는 도구다. 저장한 타워는 Claude가 읽어 게임과 도감에 넣는다. 저장한 뒤 채팅에서 "타워 저장했어"라고 알려 주면 된다.</p>',
  '<p>단어를 정하고, 픽셀로 디자인하고, 능력과 수치를 정한다. 막히면 <b>디자인 자동 추천</b>과 <b>속성 기본 컨셉 추천</b>을 눌러 보자. 다 만들면 밸런스를 <b>적정</b>으로 맞추고 <b>겹침 분석</b>을 돌린 뒤 제출 코드를 보내 주면 된다.</p>')
i=te.index('<h3 class="te-h">저장</h3>'); j=te.index('<p class="count" id="tedb" style="margin:0"></p>')
te=te[:i]+'<h3 class="te-h">제출</h3><p class="te-desc"><b>내 작품에 저장</b>은 이 브라우저에만 임시로 남긴다. <b>제출 코드 만들기</b>를 누르면 개발자에게 보낼 코드가 나온다. 밸런스가 적정이 아니어도 보낼 수 있다 (개발자가 검토하며 조정).</p><div class="row" style="gap:6px"><button class="btn" id="tesave">내 작품에 저장</button><button class="btn pri" id="tecode">제출 코드 만들기</button><button class="btn" id="tenew">새 타워</button></div><div id="tecodeout"></div>'+te[j:]
i=te.index("'<h2>테스터 제출 코드 불러오기</h2>"); j=te.index("'<h2>밸런스 계산 방식</h2>")
te=te[:i]+te[j:]
R('link("words","기본 스탯 공식")','"기본 스탯 공식"')
i=te.index('  $("tesave").onclick = async function(){'); j=te.index('  if ($("teimpb"))')
te=te[:i]+'''  $("tesave").onclick = function(){ read(); if (TE.word.length < 3){ toast("단어를 영문 3글자 이상 적어 주세요."); $("teword").focus(); return; }
    toast(saveWork({type:"tower", key:TE.word, name:TE.word, data:towerData(), updatedAt:Date.now()}) ? "내 작품에 저장했습니다. 이 브라우저에만 남습니다." : "이 브라우저에서는 저장할 수 없습니다. 제출 코드를 바로 보내 주세요."); };
  $("tecode").onclick = function(){ read();
    if (TE.word.length < 3){ toast("단어를 영문 3글자 이상 적어 주세요."); $("teword").focus(); return; }
    if (!TE.px.some(Boolean)){ toast("디자인이 비어 있습니다. 그리거나 추천 디자인을 불러와 주세요."); return; }
    var r = teRatio(TE);
    saveWork({type:"tower", key:TE.word, name:TE.word, data:towerData(), updatedAt:Date.now()});
    codeBox($("tecodeout"), packCode("WTDT1", towerData()), "타워");
    if (r < 0.85 || r > 1.15){ var nb = document.createElement("p"); nb.className = "te-desc"; nb.textContent = "참고: 밸런스가 " + (r < 0.85 ? "약함" : "강함") + "(" + r.toFixed(2) + ")입니다. 그대로 보내도 되고, 개발자가 검토하며 조정합니다."; $("tecodeout").appendChild(nb); } };
  ["teword","teko","tedmg","teint","terange","temode","teel"].forEach(function(id){ $(id).addEventListener("change", function(){ lsSet("wtd-draft-tower", towerData()); }); });
'''+te[j:]
i=te.index('function teRenderSaved(){'); j=te.index('function b64e(o)')
te=te[:i]+'function teConnect(){ var s = document.getElementById("tedb"); if (s) s.textContent = "작업은 이 브라우저에만 임시로 남습니다. 완성하면 제출 코드를 보내 주세요."; }\n'+te[j:]
R('  if (!TE) TE = teDefault();','  if (!TE){ var dr = lsGet("wtd-draft-tower", null); TE = dr && dr.word && dr.dv === 2 ? towerFromData(dr) : teDefault(); }')
app=open('creator_app.js',encoding='utf-8').read()
extra=open('creator_extra.css',encoding='utf-8').read()
head=open('creator_head.html',encoding='utf-8').read()
html=head.replace('/*CSS*/',css+extra)+'<script>\n"use strict";\n'+js+'\nvar PAGES = {};\n'+te+'\n'+app+'\n</script>\n'
open('creator_tpl.html','w',encoding='utf-8').write(html)
w=open('words.json',encoding='utf-8').read().replace('<','\\u003c')
open('wordtd-creator.html','w',encoding='utf-8').write(html.replace('__WORDS__',w))
print('built',len(html))
