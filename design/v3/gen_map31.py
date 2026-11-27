exec(open('gen_v31.py').read())
def px(d, col, s=22): return f'<svg width="{s}" height="{s}" viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path d="{d}" fill="{col}"></path></svg>'
NI = {'fight':px('M0 0h2v1h1v1h1v1h1V2h1V1h1V0h1v2H7v1H6v1H5v1h1v1h1v1H6V6H5V5H3v1H2v1H1V6h1V5h1V4H2V3H1V2H0z',TX),
 'elite':px('M3 0h2v2h3v2H6v1h1v3H5V6H3v2H1V5h1V4H0V2h3z','#ff6b8a'),
 'shop':px('M2 0h4v2h2v6H0V2h2zM3 1v1h2V1z','#6be36b'),
 'rest':px('M3 0h2v1h1v1h1v4h1v1H0V6h1V2h1V1h1zM3 7h2v1H3z',GOLD),
 'boss':px('M1 0h6v1h1v4H7v1H6v2H2V6H1V5H0V1h1zM2 2v2h1V2zM5 2v2h1V2z',RED,28)}
nodes = [(1,0,'fight','done'),(0,1,'fight','done'),(2,1,'elite','skip'),(0,2,'shop','cur'),(2,2,'fight','skip'),(1,3,'elite','next'),(0,3,'rest','next'),(2,4,'fight','fut'),(0,4,'fight','fut'),(1,5,'rest','fut'),(1,6,'boss','fut')]
edges = [(0,1),(0,2),(1,3),(2,4),(3,5),(3,6),(4,5),(5,7),(6,8),(7,9),(8,9),(9,10)]
X0=80; DX=115; Y0=440; DY=64
pos=lambda n:(X0+n[0]*DX, Y0-n[1]*DY)
lines=''.join(f'<path d="M{pos(nodes[a])[0]} {pos(nodes[a])[1]} L{pos(nodes[b])[0]} {pos(nodes[b])[1]}" stroke="{TX if nodes[a][3] in ("done","cur") and nodes[b][3] in ("done","cur") else LINE}" stroke-width="{3 if nodes[a][3] in ("done","cur") and nodes[b][3] in ("done","cur") else 2}" stroke-dasharray="{"0" if nodes[a][3] in ("done","cur") and nodes[b][3] in ("done","cur") else "4 4"}"></path>' for a,b in edges)
LAB={'fight':'전투','elite':'엘리트','shop':'문구점','rest':'쉬는 시간','boss':'보스'}
nh=''
for n in nodes:
    x,y=pos(n); st=n[3]; s=54 if n[2]=='boss' else 44
    bd={'done':LINE,'skip':LINE,'cur':GOLD,'next':SEL,'fut':LINE}[st]; bg={'done':'#262a35','skip':BG,'cur':'#3a3420','next':'#1f2c3a','fut':PANEL}[st]; op='0.4' if st=='skip' else '1'
    chk=f'<span style="position: absolute; right: -5px; top: -5px; width: 16px; height: 16px; background: {GRN}; color: #0b2a10; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center">✓</span>' if st=='done' else ''
    me=f'<span style="position: absolute; left: calc(100% + 8px); top: 10px; font-size: 11px; font-weight: 700; background: {GOLD}; color: #2a1a00; padding: 2px 6px; white-space: nowrap">지금 여기</span>' if st=='cur' else ''
    nh+=f'<div style="position: absolute; left: {x-s/2}px; top: {y-s/2}px; width: {s}px; height: {s}px; box-sizing: border-box; border: 2px solid {bd}; background: {bg}; box-shadow: 0 3px 0 #0b0c10; display: flex; align-items: center; justify-content: center; opacity: {op}">{NI[n[2]]}{chk}{me}</div><div style="position: absolute; left: {x-40}px; top: {y+s/2+3}px; width: 80px; text-align: center; font-size: 10px; color: {MU}; opacity: {op}">{LAB[n[2]]}</div>'
pg=''.join(f'<div style="position: absolute; left: 8px; top: {Y0-r*DY-7}px; font-family: Silkscreen; font-size: 10px; color: {MU}">{r+1}P</div>' for r in range(7))
grid=f'background-color: {BG}; background-image: linear-gradient({PANEL} 1px, transparent 1px), linear-gradient(90deg, {PANEL} 1px, transparent 1px); background-size: 24px 24px'
mapbox=f'<div style="position: relative; height: 486px; flex-shrink: 0; {grid}"><svg width="390" height="486" viewBox="0 0 390 486" aria-hidden="true" style="position: absolute; left: 0; top: 0">{lines}</svg>{pg}{nh}</div>'
def stk(name, kind):
    if not name: return f'<div style="width: 36px; height: 36px; border: 2px dashed {LINE}"></div>'
    bg={'n':'#ffffff','h':'linear-gradient(135deg,#ffd1ec,#c8f0ff,#fff3b0,#d4ffe0)'}[kind]
    return f'<div aria-label="{name}" style="width: 36px; height: 36px; box-sizing: border-box; background: {bg}; border: 2px solid {LINE}; color: #2A2D3A; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1">{name}</div>'
head=f'''<div style="background: {PANEL}; border-bottom: 2px solid {LINE}; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 8px"><b style="font-size: 17px">초록 줄공책</b><span style="font-size: 12px; color: {MU}">속삭이는 숲 · 등급 1 · 볼펜</span></div>
<div style="display: flex; gap: 12px; align-items: center; font-family: Silkscreen; font-weight: 700; font-size: 14px"><span style="display: flex; gap: 4px; align-items: center">{IC['heart']}17/20</span><span style="display: flex; gap: 4px; align-items: center; color: {GOLD}">{IC['coin']}142</span><span style="font-family: 'Noto Sans KR'; font-weight: 400; font-size: 12px; color: {MU}">주문 STOP · RUSH</span></div>
<div style="display: flex; gap: 5px">{stk('빨간 펜','n')}{stk('문장 완성','h')}{stk('모음 부적','n')}{''.join(stk('','') for _ in range(5))}</div></div>'''
def card(kind,title,rule,rew,sel):
    bd=SEL if sel else LINE
    return f'<a href="Battle.dc.html" style="flex: 1 1 0; min-width: 0; text-decoration: none; color: {TX}; background: {PANEL}; border: 2px solid {bd}; box-shadow: 0 3px 0 #0b0c10; padding: 10px; display: flex; flex-direction: column; gap: 6px"><div style="display: flex; gap: 6px; align-items: center">{NI[kind]}<b style="font-size: 15px">{title}</b></div><div style="font-size: 12px; background: {KEY}; padding: 5px 7px; line-height: 1.45">{rule}</div><div style="font-size: 11px; color: {MU}">보상 {rew}</div></a>'
choose=f'<div style="padding: 10px 10px 16px; display: flex; flex-direction: column; gap: 8px; flex: 1 1 auto; background: {BG}; border-top: 2px solid {LINE}"><b style="font-size: 15px">4쪽: 어디로 갈까?</b><div style="display: flex; gap: 8px">{card("elite","엘리트","<b style=\'color:#FFD34D\'>긴 글짓기</b> 7글자 이상 공격력 +40%<br><b style=\'color:#FFD34D\'>지각생</b> 적 속도 +15%","반짝 스티커 확정, 골드 ×2",True)}{card("rest","쉬는 시간","무작위 이벤트 (급식, 쪽지 시험, 도서실…)","선택에 따라",False)}</div></div>'
body=f'<div style="width: 390px; height: 844px; display: flex; flex-direction: column; overflow: hidden; background: {BG}">{head}{mapbox}{choose}</div>'
open('v3/project/RunMap.dc.html','w',encoding='utf-8').write(page2('공책 지도 (갈림길)',390,844,body))
