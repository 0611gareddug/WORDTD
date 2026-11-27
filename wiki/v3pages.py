import markdown, json, re
doc=open('/home/user/WORDTD/docs/기획서.md',encoding='utf-8').read()
src=doc[doc.index('\n## 20.'):]
kb=doc[doc.index('### 11-5.'):doc.index('\n---',doc.index('### 11-5.'))]
parts=re.split(r'\n## ',src)
def page(md):
    md=md.split('\n',1)[1]
    md=re.sub(r'^### \d+-\d+\. ',r'## ',md,flags=re.M)
    h=markdown.markdown(md,extensions=['tables'])
    return h.replace('<table>','<div class="tw"><table>').replace('</table>','</table></div>')
run=[p for p in parts if p.startswith('20.')][0]; art=[p for p in parts if p.startswith('21.')][0]
J=lambda h: json.dumps(h,ensure_ascii=False).replace('</','<\\/')
js='PAGES.run = {cats:["진행"], html:function(){ return '+J(page(run)+page('x\n'+kb.replace('### 11-5. ','### 11-5. ')))+'; }};\n'
js+='PAGES.artdir = {cats:["제작"], html:function(){ return '+J(page(art))+'; }};\n'
s=open('tpl.html',encoding='utf-8').read()
s=re.sub(r'PAGES\.(run|run0|artdir) = \{.*?\n','',s)
i=s.index('PAGES.tutorial = {'); s=s[:i]+js+s[i:]
if '["run","공책 런' not in s: s=s.replace('["진행", [["chapters","챕터 목록"]','["진행", [["run","공책 런 (v3 개편)"],["chapters","챕터 목록"]',1)
if '["artdir"' not in s: s=s.replace('["제작", [["editor","맵 에디터"]','["제작", [["artdir","디자인 방향 (v3)"],["editor","맵 에디터"]',1)
s=s.replace('["artdir","디자인 방향 (v3)"]','["artdir","디자인 방향 (v3.1)"]')
if 'v3.1 기획</b>' not in s: s=s.replace("<li><b>v3.0 기획</b>","<li><b>v3.1 기획</b> UI는 회색 디자인 유지, 맵만 공책 테마. 모바일 키보드 설정 (쿼티 / 천지인)</li><li><b>v3.0 기획</b>",1)
if 'v3.1 기획 (' not in s: s=s.replace("return '<h2>v3.0 기획 (2026-11-27)</h2>","return '<h2>v3.1 기획 (2026-11-27)</h2><ul><li>디자인: UI(메뉴·버튼·패널·키보드)는 원래 회색·남색 디자인으로 되돌리고, 맵만 공책 테마 (<a href=\"#artdir\">디자인 방향</a>)</li><li>설정 → 모바일 키보드: 쿼티 / 천지인. 천지인은 한글 기본 + 영문 다중 탭, 한글 모드에서는 적 단어를 한글 이름으로 표시 (<a href=\"#run\">공책 런</a> 맨 아래)</li></ul>' + '<h2>v3.0 기획 (2026-11-27)</h2>",1)
open('tpl.html','w',encoding='utf-8').write(s)
w=json.dumps(json.load(open('words.json',encoding='utf-8')),ensure_ascii=False,separators=(',',':')).replace('<','\\u003c');open('wordtd-wiki.html','w',encoding='utf-8').write(s.replace('__WORDS__',w))
print('ok', s.count('PAGES.run ='), s.count('PAGES.artdir ='))
