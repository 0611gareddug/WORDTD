exec(open('gen_v3.py').read())
BG='#12141B'; PANEL='#1D2029'; LINE='#353A49'; KEY='#2A2E3A'; TX='#E8EAF3'; MU='#8C909B'; GRN='#4CC35A'; ORG='#F0A830'; GOLD='#FFD34D'; RED='#FF5A6E'; SEL='#8FD8FF'
FONTS2 = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gaegu:wght@700&amp;family=Noto+Sans+KR:wght@400;500;700&amp;family=Silkscreen:wght@400;700&amp;display=swap">'
def page2(title, w, h, body):
    return page(title, w, h, body).replace(FONTS, FONTS2).replace('font-family:"Gowun Dodum",system-ui,sans-serif;color:#2A2D3A', f"font-family:'Noto Sans KR',system-ui,sans-serif;color:{TX};background:{BG}")
def pbtn(inner, w=40, h=36, bg=KEY, label=''):
    al = f' aria-label="{label}"' if label else ''
    return f'<button{al} style="width: {w}px; height: {h}px; border: 2px solid {LINE}; border-radius: 4px; background: {bg}; color: {TX}; box-shadow: 0 3px 0 #0b0c10; display: flex; align-items: center; justify-content: center; padding: 0; font-family: Silkscreen, monospace; font-weight: 700; font-size: 13px">{inner}</button>'
IC = {
 'heart': f'<svg width="18" height="18" viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path d="M1 1h2v1h2V1h2v1h1v2H7v1H6v1H5v1H3V6H2V5H1V4H0V2h1z" fill="{RED}"></path></svg>',
 'coin': f'<svg width="18" height="18" viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path d="M2 0h4v1h1v1h1v4H7v1H6v1H2V7H1V6H0V2h1V1h1z" fill="{GOLD}"></path><path d="M3 2h2v1H4v2h1v1H3V5h1V3H3z" fill="#b8860b"></path></svg>',
 'pause': f'<svg width="14" height="14" viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path d="M1 1h2v6H1zM5 1h2v6H5z" fill="{TX}"></path></svg>',
 'full': f'<svg width="14" height="14" viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 0h3v1H1v2H0zM5 0h3v3H7V1H5zM0 5h1v2h2v1H0zM7 5h1v3H5V7h2z" fill="{TX}"></path></svg>',
 'nib': f'<svg width="20" height="20" viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path d="M3 0h2v1h1v2H5v1H3V3H2V1h1z" fill="{SEL}"></path><path d="M3 4h2v3H3z" fill="{SEL}"></path><path d="M4 7h0v1h0z" fill="{SEL}"></path></svg>',
 'back': f'<svg width="18" height="14" viewBox="0 0 10 8" shape-rendering="crispEdges" aria-hidden="true"><path d="M3 0h7v8H3V7H2V6H1V5H0V3h1V2h1V1h1z" fill="none" stroke="{TX}" stroke-width="1"></path><path d="M5 2h1v1h1V2h1v1H7v1h1v1H7v1H6V5H5V4h1V3H5z" fill="{TX}"></path></svg>',
}
def topbar(page_txt='3 / 7쪽', prog=40):
    return f'''<div style="height: 52px; box-sizing: border-box; padding: 0 10px; display: flex; align-items: center; gap: 10px; background: {PANEL}; border-bottom: 2px solid {LINE}">
<div style="display: flex; align-items: center; gap: 4px; font-family: Silkscreen, monospace; font-weight: 700; font-size: 15px">{IC['heart']}<span>17</span></div>
<div style="display: flex; align-items: center; gap: 4px; font-family: Silkscreen, monospace; font-weight: 700; font-size: 15px; color: {GOLD}">{IC['coin']}<span>142</span></div>
<div style="flex: 1 1 auto; display: flex; flex-direction: column; align-items: center; gap: 3px"><span style="font-size: 12px; font-weight: 700">{page_txt}</span><div style="width: 90px; height: 5px; background: {KEY}"><div style="width: {prog}%; height: 5px; background: {SEL}"></div></div></div>
{pbtn('×2', 40, 34, KEY, '속도')}{pbtn(IC['pause'], 36, 34, KEY, '일시정지')}{pbtn(IC['full'], 36, 34, KEY, '전체 화면')}
</div>'''
def rulebar(t):
    return f'<div style="height: 32px; display: flex; align-items: center; padding: 0 10px; background: {BG}"><span style="font-size: 12px; background: {KEY}; border: 1px solid {LINE}; padding: 3px 8px; border-radius: 3px"><b style="color: {GOLD}">쪽 규칙</b> {t}</span></div>'
def tapeK(word, typed=0, size=11, rot=-2):
    a = word[:typed]; b = word[typed:]
    t = (f'<span style="color: #E0483E">{a}</span>' if a else '') + b
    return f'<span style="display: inline-block; font-weight: 700; font-size: {size}px; line-height: 1; padding: 3px 5px 2px; background: #F2D7A6; color: #2A2D3A; transform: rotate({rot}deg); box-shadow: 0 1px 0 rgba(59,63,78,0.25); white-space: nowrap">{t}</span>'
def nb_map(rows=10, enemies=None, korean=False):
    C=40; OX=11
    path = ['.........','S######..','......#..','..#####..','..#......','..######.','.......#.','.......#.','.......B.','.........'][:rows]
    cells=''.join(f'<div style="position: absolute; left: {OX+x*C}px; top: {y*C}px; width: {C}px; height: {C}px; background: rgba(255,232,107,0.78)"></div>' for y,r in enumerate(path) for x,ch in enumerate(r) if ch in '#SB')
    start=f'<div style="position: absolute; left: {OX+7}px; top: {C+8}px; width: 26px; height: 24px; border-radius: 50%; background: #3B3F4E; box-shadow: inset 0 0 0 4px #8C909B"></div>'
    base=f'<div style="position: absolute; left: {OX+7*C+10}px; top: {8*C-6}px; width: 20px; height: 46px; background: #E0483E; clip-path: polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)"></div>'
    towers=[('FIRE',2,2),('FROST',4,4),('SUN',7,2),('BOOM',5,6),('CAT',0,4),('MINIGUN',8,4),('STONE',4,2)]
    tw=''.join(f'<div style="position: absolute; left: {OX+x*C+2}px; top: {y*C-2}px; width: 36px">{sticker(w,30)}</div>' for w,x,y in towers)
    ens = enemies or [(5.2,1,'CAT',2,blob(26)),(2.4,1,'BRIDGE',0,blob(32,'#5a4a6e')),(3.1,5,'MOON',0,blob(24)),(6.3,5,'DOG',0,plane(28)),(7.05,6.6,'EGG',0,blob(22))]
    en=''.join(f'<div style="position: absolute; left: {OX+x*C}px; top: {y*C-14}px; display: flex; flex-direction: column; align-items: center; gap: 3px">{(tapeK if korean else tape)(w,t,11 if korean else 10)}{art}</div>' for x,y,w,t,art in ens)
    fx=f'''<svg width="382" height="{rows*C}" viewBox="0 0 382 {rows*C}" aria-hidden="true" style="position: absolute; left: 0; top: 0"><path d="M{OX+2*C+20} {2*C+8} L{OX+5.2*C+12} {C+16}" stroke="#f08a24" stroke-width="2" stroke-dasharray="3 3"></path><circle cx="{OX+3.5*C}" cy="{5*C+18}" r="26" fill="none" stroke="#b9824e" stroke-width="2" stroke-dasharray="4 3"></circle><path d="M{OX+8*C+6} {4*C+20} L{OX+6.3*C+14} {5*C+6}" stroke="#5fb8c8" stroke-width="1.5" stroke-dasharray="2 4"></path></svg>'''
    nums=f'<div style="position: absolute; left: {OX+5.5*C}px; top: {0.35*C}px; font-family: Silkscreen, monospace; font-weight: 700; font-size: 15px; color: #E0483E; text-shadow: 1px 1px 0 #FBF6EA">48</div><div style="position: absolute; left: {OX+2.2*C}px; top: {4.25*C}px; font-family: Silkscreen, monospace; font-weight: 700; font-size: 17px; color: #E0483E; border: 2px solid #E0483E; border-radius: 50%; padding: 0 5px; transform: rotate(-8deg); background: rgba(251,246,234,0.85)">126</div>'
    stamp='<div style="position: absolute; right: 10px; top: 6px; transform: rotate(10deg); border: 3px solid #E0483E; color: #E0483E; border-radius: 10px; padding: 3px 7px; font-family: Gaegu, cursive; font-weight: 700; font-size: 16px; line-height: 1; background: rgba(251,246,234,0.7)">콤보 7<br>참 잘했어요</div>'
    return f'''<div style="padding: 0 4px; background: {BG}"><div style="position: relative; width: 378px; height: {rows*C}px; border: 2px solid {LINE}; box-sizing: content-box; overflow: hidden; {PAPER}"><div style="position: absolute; left: 6px; top: 0; bottom: 0; width: 2px; background: #E9A3A3"></div>{cells}{start}{base}{fx}{tw}{en}{nums}{stamp}</div></div>'''
def inputcard(mode, typed, target, combo='콤보 7', mult='타격 ×1.35 · 공속 +7%', korean=False, ink=62):
    ff = "'Noto Sans KR', sans-serif" if korean else 'Silkscreen, monospace'
    return f'''<div style="margin: 6px 6px 0; box-sizing: border-box; padding: 8px 10px; background: {PANEL}; border: 2px solid {SEL}; display: flex; align-items: center; gap: 10px">
<div style="display: flex; flex-direction: column; align-items: center; gap: 2px; width: 34px">{IC['nib']}<span style="font-size: 10px; color: {SEL}">{mode}</span></div>
<div style="flex: 1 1 auto; display: flex; flex-direction: column; gap: 2px; min-width: 0"><span style="font-family: {ff}; font-weight: 700; font-size: 24px; line-height: 1.1">{typed}<span style="display: inline-block; width: 2px; height: 20px; background: {TX}; vertical-align: -2px"></span></span><span style="font-size: 11px; color: {MU}">{target}</span></div>
<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px"><span style="font-family: Silkscreen, monospace; font-weight: 700; font-size: 14px; color: #ff6b8a">{combo}</span><span style="font-size: 10px; color: {MU}">{mult}</span><div aria-label="잉크 {ink}%" style="width: 86px; height: 6px; background: {KEY}"><div style="width: {ink}%; height: 6px; background: #6be36b"></div></div></div>
</div>'''
def chipsrow(cands, spells):
    ch = lambda t, bg, fg=TX, sub='': f'<button style="height: 32px; padding: 0 10px; border: 2px solid {LINE}; border-radius: 3px; background: {bg}; color: {fg}; font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 5px">{t}{sub}</button>'
    left = ''.join(ch(c, '#3a3f2a' if i == 0 else KEY, GOLD if i == 0 else TX) for i, c in enumerate(cands))
    right = ''.join(ch(n, '#24402a' if ok else KEY, '#6be36b' if ok else MU, f'<span style="font-size: 10px; font-weight: 400">{c}</span>') for n, c, ok in spells)
    return f'<div style="height: 44px; display: flex; align-items: center; gap: 6px; padding: 0 6px; background: {BG}">{left}<div style="flex: 1 1 auto"></div>{right}</div>'
