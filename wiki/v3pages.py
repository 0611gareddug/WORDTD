import markdown, json, re
src=open('../v3.md',encoding='utf-8').read()
parts=re.split(r'\n## ',src)
def page(md):
    md=md.split('\n',1)[1]  # drop section title
    md=re.sub(r'^### \d+-\d+\. ',r'## ',md,flags=re.M)
    h=markdown.markdown(md,extensions=['tables'])
    h=h.replace('<table>','<div class="tw"><table>').replace('</table>','</table></div>')
    return h
run=[p for p in parts if p.startswith('20.')][0]; art=[p for p in parts if p.startswith('21.')][0]
js='PAGES.run = {cats:["진행"], html:function(){ return '+json.dumps(page(run),ensure_ascii=False).replace('</','<\\/')+'; }};\n'
js+='PAGES.artdir = {cats:["제작"], html:function(){ return '+json.dumps(page(art),ensure_ascii=False).replace('</','<\\/')+'; }};\n'
s=open('tpl.html',encoding='utf-8').read()
import re as _r
s=_r.sub(r'PAGES\.run = \{.*?\n',lambda m:'',s); s=_r.sub(r'PAGES\.artdir = \{.*?\n',lambda m:'',s)
a='PAGES.tutorial = {'; i=s.index(a); s=s[:i]+js+s[i:]
s=s.replace('["진행", [["chapters","챕터 목록"]','["진행", [["run","공책 런 (v3 개편)"],["chapters","챕터 목록"]',1) if '["run","공책 런' not in s else s
s=s.replace('["제작", [["editor","맵 에디터"]','["제작", [["artdir","디자인 방향 (v3)"],["editor","맵 에디터"]',1) if '["artdir"' not in s else s
s=s.replace("'<h2>최근 변경</h2><ul><li><b>v2.3</b>","'<h2>최근 변경</h2><ul><li><b>v3.0 기획</b> 공책 런(로그라이크)·전투 타이핑·문구점 공책 디자인 기획, 도감 공격 모션과 상세 정보, 에디터 밑그림·색 가져오기</li><li><b>v2.3</b>",1) if 'v3.0 기획' not in s else s
s=s.replace("return '<h2>v2.3 (2026-11-27)</h2>","return '<h2>v3.0 기획 (2026-11-27)</h2><ul><li>새 기획: <a href=\"#run\">공책 런</a> (한 판 7~9분, 갈림길 7쪽, 쪽 규칙, 스티커, 펜, 문구점, 쉬는 시간), 전투 타이핑 (적 단어 타격, 콤보, 잉크 주문), <a href=\"#artdir\">아늑한 문구점·공책 디자인</a></li><li>타워 도감: 카드마다 공격 모션 재생, 누르면 1회 피해·초당 피해·효과·레벨별 수치 상세</li><li>타워 에디터: 이미지 자동 변환을 밑그림 + 색 뽑기 방식으로 교체, 휴대폰 붙여넣기 버튼 추가</li></ul>' + '<h2>v2.3 (2026-11-27)</h2>",1) if 'v3.0 기획 (' not in s else s
open('tpl.html','w',encoding='utf-8').write(s)
w=json.dumps(json.load(open('words.json',encoding='utf-8')),ensure_ascii=False,separators=(',',':')).replace('<','\\u003c');open('wordtd-wiki.html','w',encoding='utf-8').write(s.replace('__WORDS__',w))
print('ok', len(js))
