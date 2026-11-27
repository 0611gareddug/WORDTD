exec(open('gen_v31.py').read())
PT = dict(zip('ABCDEFGHIJKLMNOPQRSTUVWXYZ',[1,3,3,2,1,4,2,4,1,8,5,1,3,1,1,3,10,1,1,1,1,4,4,8,4,10]))
def key(k):
    hi = k == 'T'
    return f'<button aria-label="{k}" style="position: relative; width: 34px; height: 44px; border: 2px solid {LINE}; border-radius: 4px; background: {"#3a3f52" if hi else KEY}; color: {TX}; box-shadow: 0 3px 0 #0b0c10; font-family: Silkscreen, monospace; font-weight: 700; font-size: 15px; padding: 0">{k}<span style="position: absolute; right: 2px; bottom: 1px; font-family: \'Noto Sans KR\'; font-weight: 400; font-size: 9px; color: {MU}">{PT[k]}</span></button>'
def wide(t, w, bg=KEY, fg=TX, label=''):
    al = f' aria-label="{label}"' if label else ''
    return f'<button{al} style="width: {w}px; height: 44px; border: 2px solid {LINE}; border-radius: 4px; background: {bg}; color: {fg}; box-shadow: 0 3px 0 #0b0c10; font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center; padding: 0">{t}</button>'
kb = f'<div style="flex: 1 1 auto; box-sizing: border-box; padding: 8px 3px 10px; display: flex; flex-direction: column; gap: 6px; align-items: center; background: {PANEL}; border-top: 2px solid {LINE}">'
kb += '<div style="display: flex; gap: 3px">' + ''.join(key(k) for k in 'QWERTYUIOP') + '</div>'
kb += '<div style="display: flex; gap: 3px">' + ''.join(key(k) for k in 'ASDFGHJKL') + '</div>'
kb += '<div style="display: flex; gap: 3px">' + ''.join(key(k) for k in 'ZXCVBNM') + wide(IC['back'], 70, KEY, TX, '지우기') + '</div>'
kb += f'<div style="display: flex; gap: 4px">{wide("한/영", 70)}{wide("사전", 70)}{wide("확정", 120, GRN, "#0b2a10")}{wide("웨이브 ▶", 104, ORG, "#2a1a00")}</div></div>'
body = f'<div style="width: 390px; height: 844px; display: flex; flex-direction: column; overflow: hidden; background: {BG}">{topbar()}{rulebar("짧게 말해요 · 4글자 이하 단어 비용 −30%")}{nb_map(10)}{inputcard("타격","CA","적 단어 CAT · 가장 앞의 적")}{chipsrow(["CAT","COW"],[("RUSH",30,True),("STOP",40,False)])}{kb}</div>'
open('v3/project/Battle.dc.html','w',encoding='utf-8').write(page2('전투 화면 (쿼티)', 390, 844, body))
