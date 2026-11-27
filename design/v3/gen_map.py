exec(open('gen_v3.py').read())
NI = {
 'fight':'<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20L15 9M15 9l2-5 3 3-5 2M20 20L9 9M9 9L7 4 4 7l5 2" fill="none" stroke="#2A2D3A" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"></path></svg>',
 'elite':'<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="#FF9EC7" stroke="#2A2D3A" stroke-width="1.6" stroke-linejoin="round"></path></svg>',
 'shop':'<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6z" fill="#8EF0D0" stroke="#2A2D3A" stroke-width="1.6" stroke-linejoin="round"></path><path d="M9 8V6a3 3 0 016 0v2" fill="none" stroke="#2A2D3A" stroke-width="1.6"></path></svg>',
 'rest':'<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4z" fill="#FFE86B" stroke="#2A2D3A" stroke-width="1.6" stroke-linejoin="round"></path><path d="M10 20a2 2 0 004 0" fill="none" stroke="#2A2D3A" stroke-width="1.6"></path></svg>',
 'boss':'<svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 6 0 0118 0z" fill="#E0483E" stroke="#2A2D3A" stroke-width="1.6"></path><circle cx="8" cy="9" r="1.5" fill="#FBF6EA"></circle><circle cx="15" cy="8" r="1.2" fill="#FBF6EA"></circle><path d="M9 12v6a3 3 0 006 0v-6" fill="#FBF6EA" stroke="#2A2D3A" stroke-width="1.6"></path></svg>',
}
# node layout: (col,row,kind,state)  cols 0..2, rows 0..6 (row 0 bottom = 1쪽)
nodes = [(1,0,'fight','done'),(0,1,'fight','done'),(2,1,'elite','skip'),(0,2,'shop','cur'),(2,2,'fight','skip'),(1,3,'elite','next'),(0,3,'rest','next'),(2,4,'fight','fut'),(0,4,'fight','fut'),(1,5,'rest','fut'),(1,6,'boss','fut')]
edges = [(0,1),(0,2),(1,3),(2,4),(3,5),(3,6),(4,5),(5,7),(6,8),(7,9),(8,9),(9,10)]
W = 390; X0 = 75; DX = 120; Y0 = 446; DY = 64
def pos(n): c, r = n[0], n[1]; return X0 + c*DX, Y0 - r*DY
lines = ''
for a, b in edges:
    (x1,y1),(x2,y2) = pos(nodes[a]), pos(nodes[b])
    done = nodes[a][3] in ('done','cur') and nodes[b][3] in ('done','cur')
    lines += f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{"#2A2D3A" if done else "#8C909B"}" stroke-width="{2.2 if done else 1.6}" stroke-dasharray="{"0" if done else "5 5"}" stroke-linecap="round"></path>'
svg = f'<svg width="{W}" height="490" viewBox="0 0 {W} 490" aria-hidden="true" style="position: absolute; left: 0; top: 0">{lines}</svg>'
LAB = {'fight':'전투','elite':'엘리트','shop':'문구점','rest':'쉬는 시간','boss':'보스'}
nh = ''
for i, n in enumerate(nodes):
    x, y = pos(n); st = n[3]; size = 56 if n[2] == 'boss' else 46
    bg = {'done':'#e8e2d2','skip':'#efeadc','cur':'#FFE86B','next':'#ffffff','fut':'#ffffff'}[st]
    op = '0.45' if st == 'skip' else '1'
    ring = '0 0 0 4px #3B6FD8, 0 3px 0 #2A2D3A' if st == 'next' else '0 3px 0 #2A2D3A'
    check = '<div style="position: absolute; right: -6px; top: -6px; width: 20px; height: 20px; border-radius: 50%; background: #E0483E; color: #fff; font-size: 13px; display: flex; align-items: center; justify-content: center">✓</div>' if st == 'done' else ''
    me = '<div style="position: absolute; left: calc(100% + 8px); top: 10px; font-family: Gaegu, cursive; font-weight: 700; font-size: 16px; background: #2A2D3A; color: #FBF6EA; padding: 1px 8px 0; border-radius: 10px; white-space: nowrap">지금 여기</div>' if st == 'cur' else ''
    nh += f'<div style="position: absolute; left: {x - size/2}px; top: {y - size/2}px; width: {size}px; height: {size}px; border-radius: 50%; border: 2px solid #2A2D3A; background: {bg}; box-shadow: {ring}; display: flex; align-items: center; justify-content: center; opacity: {op}">{NI[n[2]]}{check}{me}</div>'
    nh += f'<div style="position: absolute; left: {x - 40}px; top: {y + size/2 + 4}px; width: 80px; text-align: center; font-size: 11px; color: #5b6174; opacity: {op}">{LAB[n[2]]}</div>'
pg = ''.join(f'<div style="position: absolute; left: 6px; top: {Y0 - r*DY - 8}px; font-family: Gaegu, cursive; font-size: 15px; color: #E0483E">{r+1}쪽</div>' for r in range(7))
mapbox = f'<div style="position: relative; width: {W}px; height: 490px; flex-shrink: 0; {PAPER}"><div style="position: absolute; left: 40px; top: 0; bottom: 0; width: 2px; background: #E9A3A3"></div>{svg}{pg}{nh}</div>'
STK = [('빨간 펜','#ffffff','#E0483E'),('문장 완성','holo','#3B6FD8'),('모음 부적','#ffffff','#4cc35a'),('','',''),('','',''),('','',''),('','',''),('','','')]
def stk(name, kind, col):
    if not name: return '<div style="width: 38px; height: 38px; border-radius: 8px; border: 1.5px dashed #8C909B"></div>'
    bg = 'linear-gradient(135deg,#ffd1ec,#c8f0ff,#fff3b0,#d4ffe0)' if kind == 'holo' else '#ffffff'
    return f'<div aria-label="{name}" style="width: 38px; height: 38px; border-radius: 50%; background: {bg}; border: 2px solid #2A2D3A; box-shadow: 0 2px 0 rgba(42,45,58,0.35); display: flex; align-items: center; justify-content: center; font-family: Gaegu, cursive; font-weight: 700; font-size: 12px; line-height: 1; text-align: center; color: {col}">{name}</div>'
head = f'''<div style="box-sizing: border-box; padding: 14px 16px 10px; background: #5c9a5a; color: #FBF6EA; display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: baseline; gap: 8px"><b style="font-family: Gaegu, cursive; font-size: 26px; line-height: 1">초록 줄공책</b><span style="font-size: 13px">속삭이는 숲 · 등급 1 · 볼펜</span></div>
<div style="display: flex; align-items: center; gap: 12px; font-weight: 700"><span style="display: flex; gap: 4px; align-items: center">{ICON['heart']}17 / 20</span><span style="display: flex; gap: 4px; align-items: center">{ICON['coin']}142</span><span style="font-weight: 400; font-size: 13px">주문 STOP · RUSH</span></div>
<div style="display: flex; gap: 6px; background: rgba(251,246,234,0.16); padding: 6px; border-radius: 10px">{''.join(stk(*s) for s in STK)}</div>
</div>'''
def card(kind, title, rule, reward, sel):
    bd = '#3B6FD8' if sel else '#2A2D3A'
    return f'''<a href="Battle.dc.html" style="flex: 1 1 0; text-decoration: none; color: #2A2D3A; background: #ffffff; border: 2px solid {bd}; border-radius: 12px; padding: 10px; box-shadow: 0 3px 0 {bd}; display: flex; flex-direction: column; gap: 6px; min-width: 0">
<div style="display: flex; align-items: center; gap: 6px">{NI[kind]}<b style="font-family: Gaegu, cursive; font-size: 20px; line-height: 1">{title}</b></div>
<div style="background: #FFF1A8; padding: 5px 7px; font-size: 12px; transform: rotate(-1deg)">{rule}</div>
<div style="font-size: 12px; color: #5b6174">보상 {reward}</div></a>'''
choose = f'''<div style="box-sizing: border-box; padding: 12px 14px 18px; background: #F3EBD6; border-top: 2px solid #E3D3A8; display: flex; flex-direction: column; gap: 10px; flex: 1 1 auto">
<b style="font-family: Gaegu, cursive; font-size: 22px; line-height: 1">4쪽: 어디로 갈까?</b>
<div style="display: flex; gap: 10px">{card('elite','엘리트','<b>긴 글짓기</b> 7글자 이상 공격력 +40%<br><b>지각생</b> 적 속도 +15%','반짝 스티커 확정, 골드 ×2',True)}{card('rest','쉬는 시간','무작위 이벤트 하나 (급식, 쪽지 시험, 도서실…)','선택에 따라',False)}</div>
</div>'''
body = f'<div style="width: 390px; height: 844px; display: flex; flex-direction: column; overflow: hidden; background: #FBF6EA">{head}{mapbox}{choose}</div>'
open('v3/project/RunMap.dc.html','w',encoding='utf-8').write(page('공책 지도 (갈림길)', 390, 844, body))
