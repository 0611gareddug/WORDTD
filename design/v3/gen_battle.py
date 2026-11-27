exec(open('gen_v3.py').read())
C = 40; OX = 15; OY = 0
path = ['.........','S######..','......#..','..#####..','..#......','..######.','.......#.','.......#.','.......B.','.........']
cells = []
for y, row in enumerate(path):
    for x, ch in enumerate(row):
        if ch in '#SB':
            cells.append(f'<div style="position: absolute; left: {OX + x*C}px; top: {OY + y*C}px; width: {C}px; height: {C}px; background: rgba(255,232,107,0.78)"></div>')
# start (연필깎이 구멍) & base (책갈피)
start = f'<div style="position: absolute; left: {OX + 6}px; top: {OY + C + 8}px; width: 26px; height: 24px; border-radius: 50%; background: #3B3F4E; box-shadow: inset 0 0 0 4px #8C909B"></div>'
base = f'<div style="position: absolute; left: {OX + 7*C + 10}px; top: {OY + 8*C - 6}px; width: 20px; height: 46px; background: #E0483E; clip-path: polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)"></div>'
towers = [('FIRE',2,2),('FROST',4,4),('SUN',7,2),('BOOM',5,6),('CAT',0,4),('MINIGUN',8,4),('STONE',4,2)]
tw = ''.join(f'<div style="position: absolute; left: {OX + x*C + 2}px; top: {OY + y*C - 2}px; width: 36px">{sticker(w, 30)}</div>' for w, x, y in towers)
# enemies
ens = [(5.2,1,'CAT',2,blob(26)),(2.4,1,'BRIDGE',0,blob(32,'#5a4a6e')),(3.6,3,'MOON',0,blob(24)),(6.3,5,'DOG',0,plane(28)),(7.05,6.6,'EGG',0,blob(22))]
en = ''
for x, y, word, typed, art in ens:
    en += f'<div style="position: absolute; left: {OX + x*C}px; top: {OY + y*C - 14}px; display: flex; flex-direction: column; align-items: center; gap: 3px">{tape(word, typed, 10)}{art}</div>'
# effects: pencil-lead shot from FIRE to CAT enemy, damage numbers, stamp splash from BOOM
fx = f'''<svg width="390" height="400" viewBox="0 0 390 400" aria-hidden="true" style="position: absolute; left: 0; top: 0; pointer-events: none">
<path d="M{OX+2*C+20} {OY+2*C+8} L{OX+5.2*C+12} {OY+1*C+16}" stroke="#f08a24" stroke-width="2" stroke-dasharray="3 3"></path>
<rect x="{OX+4.6*C}" y="{OY+1.3*C}" width="6" height="3" fill="#2A2D3A" transform="rotate(-20 {OX+4.6*C} {OY+1.3*C})"></rect>
<circle cx="{OX+3.9*C}" cy="{OY+3*C+18}" r="26" fill="none" stroke="#b9824e" stroke-width="2" stroke-dasharray="4 3"></circle>
<path d="M{OX+3.9*C-12} {OY+3*C+8} l-6 -5 M{OX+3.9*C+14} {OY+3*C+10} l7 -4 M{OX+3.9*C} {OY+3*C-6} l0 -7" stroke="#2A2D3A" stroke-width="1.5"></path>
<path d="M{OX+8*C+6} {OY+4*C+20} L{OX+6.3*C+14} {OY+5*C+6}" stroke="#5fb8c8" stroke-width="1.5" stroke-dasharray="2 4"></path>
</svg>'''
nums = (f'<div style="position: absolute; left: {OX + 5.5*C}px; top: {OY + 0.35*C}px; font-family: Silkscreen, monospace; font-weight: 700; font-size: 15px; color: #E0483E; text-shadow: 1px 1px 0 #FBF6EA">48</div>'
        f'<div style="position: absolute; left: {OX + 3.6*C}px; top: {OY + 2.2*C}px; font-family: Silkscreen, monospace; font-weight: 700; font-size: 19px; color: #E0483E; border: 2px solid #E0483E; border-radius: 50%; padding: 1px 6px; transform: rotate(-8deg); background: rgba(251,246,234,0.85)">126</div>')
stamp = f'<div style="position: absolute; right: 12px; top: 8px; transform: rotate(12deg); border: 3px solid #E0483E; color: #E0483E; border-radius: 10px; padding: 4px 8px; font-family: Gaegu, cursive; font-weight: 700; font-size: 18px; line-height: 1; background: rgba(251,246,234,0.7); opacity: 0.9">콤보 7<br>참 잘했어요</div>'
mapbox = f'''<div style="position: relative; width: 390px; height: 400px; {PAPER}">
<div style="position: absolute; left: 10px; top: 0; bottom: 0; width: 2px; background: #E9A3A3"></div>
{''.join(cells)}{start}{base}{fx}{tw}{en}{nums}{stamp}
</div>'''
top = f'''<div style="height: 56px; box-sizing: border-box; padding: 0 12px; display: flex; align-items: center; gap: 12px; background: #F3EBD6; border-bottom: 2px solid #E3D3A8">
<div style="display: flex; align-items: center; gap: 4px; font-weight: 700">{ICON['heart']}<span>17</span></div>
<div style="display: flex; align-items: center; gap: 4px; font-weight: 700">{ICON['coin']}<span>142</span></div>
<div style="flex: 1 1 auto; display: flex; justify-content: center"><span style="font-family: Gaegu, cursive; font-weight: 700; font-size: 20px; background: #8EF0D0; padding: 2px 10px 0; border-radius: 6px 6px 0 0; border: 1.5px solid #2A2D3A; border-bottom: 0">3 / 7쪽</span></div>
<button aria-label="속도 두 배" style="width: 44px; height: 40px; border: 1.5px solid #2A2D3A; border-radius: 10px; background: #FBF6EA; box-shadow: 0 2px 0 #2A2D3A; display: flex; align-items: center; justify-content: center">{ICON['fast']}</button>
<button aria-label="일시정지" style="width: 44px; height: 40px; border: 1.5px solid #2A2D3A; border-radius: 10px; background: #FBF6EA; box-shadow: 0 2px 0 #2A2D3A; display: flex; align-items: center; justify-content: center">{ICON['pause']}</button>
</div>'''
rule = '''<div style="height: 46px; display: flex; align-items: center; padding: 0 14px; background: #FBF6EA"><div style="background: #FFF1A8; padding: 6px 12px; transform: rotate(-1.2deg); box-shadow: 0 2px 4px rgba(59,63,78,0.2); font-size: 13px; display: flex; gap: 8px; align-items: baseline"><b style="font-family: Gaegu, cursive; font-size: 18px">짧게 말해요</b><span>4글자 이하 단어 비용 −30%</span></div></div>'''
inputrow = f'''<div style="height: 60px; box-sizing: border-box; padding: 0 12px; display: flex; align-items: center; gap: 10px; background: #FBF6EA; border-top: 2px solid #E3D3A8; background-image: linear-gradient(transparent 46px, #9fbbe0 46px, #9fbbe0 47px, transparent 47px)">
<div style="width: 36px; height: 36px; border-radius: 50%; background: #DCE8F3; display: flex; align-items: center; justify-content: center">{ICON['nib']}</div>
<label style="flex: 1 1 auto; display: flex; flex-direction: column"><span style="font-size: 11px; color: #5b6174">타격: 적 단어 CAT</span><span style="font-family: Silkscreen, monospace; font-weight: 700; font-size: 26px; line-height: 1.1">CA<span style="display: inline-block; width: 2px; height: 22px; background: #2A2D3A; vertical-align: -2px"></span></span></label>
<div style="display: flex; flex-direction: column; align-items: flex-end"><span style="font-family: Gaegu, cursive; font-weight: 700; font-size: 22px; color: #e0559a; line-height: 1">콤보 7</span><span style="font-size: 11px; color: #5b6174">타격 ×1.35 · 공속 +7%</span></div>
<div aria-label="잉크 62%" style="width: 26px; height: 40px; border: 2px solid #2A2D3A; border-radius: 6px 6px 8px 8px; background: linear-gradient(to top, #8EF0D0 62%, #FBF6EA 62%); position: relative"><div style="position: absolute; top: -7px; left: 6px; width: 10px; height: 6px; background: #2A2D3A; border-radius: 2px 2px 0 0"></div></div>
</div>'''
chip = lambda t, on, sub='': f'<button style="height: 36px; padding: 0 12px; border: 1.5px solid #2A2D3A; border-radius: 18px; background: {on}; font-family: Silkscreen, monospace; font-weight: 700; font-size: 13px; box-shadow: 0 2px 0 #2A2D3A; display: flex; align-items: center; gap: 6px">{t}{sub}</button>'
chips = f'''<div style="height: 48px; display: flex; align-items: center; gap: 8px; padding: 0 12px; background: #F3EBD6; overflow: hidden">
{chip('CAT', '#FFE86B')}{chip('COW', '#FBF6EA')}
<div style="flex: 1 1 auto"></div>
{chip('RUSH', '#8EF0D0', '<span style="font-family: Gowun Dodum; font-weight: 400; font-size: 11px">30</span>')}{chip('STOP', '#e8e2d2', '<span style="font-family: Gowun Dodum; font-weight: 400; font-size: 11px">40</span>')}
</div>'''
PT = dict(zip('ABCDEFGHIJKLMNOPQRSTUVWXYZ',[1,3,3,2,1,4,2,4,1,8,5,1,3,1,1,3,10,1,1,1,1,4,4,8,4,10]))
def key(k, w=33):
    on = '#FFE86B' if k in 'CA' else '#ffffff'
    return f'<button aria-label="{k}" style="position: relative; width: {w}px; height: 50px; border: 1.5px solid #2A2D3A; border-radius: 8px; background: {"#FBF6EA" if k=="T" else "#ffffff"}; box-shadow: 0 3px 0 #c9b98f; font-family: Silkscreen, monospace; font-weight: 700; font-size: 16px; padding: 0"><span style="{"color:#E0483E" if k=="T" else ""}">{k}</span><span style="position: absolute; right: 3px; bottom: 1px; font-family: Gowun Dodum; font-size: 9px; color: #5b6174">{PT[k]}</span></button>'
rows = ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM']
kb = '<div style="flex: 1 1 auto; box-sizing: border-box; padding: 8px 4px 10px; display: flex; flex-direction: column; gap: 8px; align-items: center; background: #C99B6D; background-image: repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 3px, transparent 3px 11px)">'
kb += f'<div style="display: flex; gap: 4px">{"".join(key(k) for k in rows[0])}</div>'
kb += f'<div style="display: flex; gap: 4px">{"".join(key(k) for k in rows[1])}</div>'
kb += f'<div style="display: flex; gap: 4px"><button aria-label="지우기" style="width: 50px; height: 50px; border: 1.5px solid #2A2D3A; border-radius: 8px; background: #FF9EC7; box-shadow: 0 3px 0 #b8607f; display: flex; align-items: center; justify-content: center">{ICON["back"]}</button>{"".join(key(k) for k in rows[2])}<button style="width: 62px; height: 50px; border: 1.5px solid #2A2D3A; border-radius: 8px; background: #8EF0D0; box-shadow: 0 3px 0 #4aa58a; font-family: Gaegu, cursive; font-weight: 700; font-size: 18px">확인</button></div>'
kb += '</div>'
body = f'<div style="width: 390px; height: 844px; display: flex; flex-direction: column; overflow: hidden; background: #FBF6EA">{top}{rule}{mapbox}{inputrow}{chips}{kb}</div>'
open('v3/project/Battle.dc.html','w',encoding='utf-8').write(page('전투 화면 (공책)', 390, 844, body))
print(len(body))
