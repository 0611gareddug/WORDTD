exec(open('gen_v31.py').read())
exec(open('gen_reward.py').read().split("stamp = ")[0].split("exec(open('gen_v3.py').read())")[1].split('def scard')[0])
I_PEN = '<svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l3-1 11-11-2-2L5 17z" fill="#E0483E" stroke="#2A2D3A" stroke-width="1.4" stroke-linejoin="round"></path></svg>'
I_HL = '<svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18h18" stroke="#FF9EC7" stroke-width="5" stroke-linecap="round"></path><path d="M8 15l8-10 3 2-8 10H8z" fill="#FFE86B" stroke="#2A2D3A" stroke-width="1.4" stroke-linejoin="round"></path></svg>'
I_SEN = '<svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="8" width="6" height="8" rx="1" fill="#f08a24" stroke="#2A2D3A" stroke-width="1.3"></rect><rect x="9" y="8" width="6" height="8" rx="1" fill="#8fd8ff" stroke="#2A2D3A" stroke-width="1.3"></rect><rect x="16" y="8" width="6" height="8" rx="1" fill="#ffe680" stroke="#2A2D3A" stroke-width="1.3"></rect></svg>'
def scard(name, eff, kind, icon):
    face = {'n':'#ffffff','s':'linear-gradient(135deg,#f4f6fa,#c9ced8 50%,#f4f6fa)','h':'linear-gradient(135deg,#ffd1ec,#c8f0ff 35%,#fff3b0 65%,#d4ffe0)'}[kind]
    tag, tc = {'n':('보통',TX),'s':('반짝','#c9d2de'),'h':('홀로그램','#ff9ec7')}[kind]
    return f'''<button style="width: 100%; text-align: left; border: 2px solid {LINE}; background: {PANEL}; color: {TX}; padding: 10px; box-shadow: 0 3px 0 #0b0c10; display: flex; gap: 12px; align-items: center">
<div style="flex: 0 0 auto; width: 64px; height: 64px; background: {face}; border: 3px solid #ffffff; outline: 2px solid {LINE}; display: flex; align-items: center; justify-content: center">{icon}</div>
<div style="display: flex; flex-direction: column; gap: 4px; min-width: 0"><div style="display: flex; gap: 6px; align-items: center"><b style="font-size: 16px">{name}</b><span style="font-size: 10px; border: 1px solid {tc}; color: {tc}; padding: 1px 5px">{tag}</span></div><span style="font-size: 13px; line-height: 1.45; color: #c7cad6">{eff}</span></div></button>'''
stamp = '<div style="align-self: center; transform: rotate(-6deg); border: 4px solid #E0483E; color: #E0483E; border-radius: 50%; width: 120px; height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: Gaegu, cursive; font-weight: 700; line-height: 1.05; background: #FBF6EA"><span style="font-size: 21px">참 잘했어요</span><span style="font-size: 14px">3쪽 클리어</span></div>'
body = f'''<div style="width: 390px; height: 844px; box-sizing: border-box; overflow: hidden; background: {BG}; display: flex; flex-direction: column">
<div style="height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; background: {PANEL}; border-bottom: 2px solid {LINE}"><b style="font-size: 16px">3쪽 클리어</b><span style="display: flex; gap: 10px; font-family: Silkscreen; font-weight: 700; font-size: 13px"><span style="display: flex; gap: 4px; align-items: center">{IC['heart']}17</span><span style="display: flex; gap: 4px; align-items: center; color: {GOLD}">{IC['coin']}200</span></span></div>
<div style="padding: 18px 14px; display: flex; flex-direction: column; gap: 14px; flex: 1 1 auto">
{stamp}
<div style="display: flex; justify-content: center; gap: 16px; font-size: 12px; color: {MU}"><span>최고 콤보 <b style="color: {TX}">14</b></span><span>처음 쓴 단어 <b style="color: {TX}">3</b></span><span>골드 <b style="color: {GOLD}">+58</b></span></div>
<div style="display: flex; justify-content: space-between; align-items: baseline"><b style="font-size: 16px">스티커 하나 고르기</b><span style="font-size: 11px; color: {MU}">표지 칸 3 / 8</span></div>
{scard('빨간 펜','적 단어 타격 피해 +50%','n',I_PEN)}
{scard('형광 띠','콤보 10 이상이면 모든 타워 공격 속도 +15%','s',I_HL)}
{scard('문장 완성','일렬로 붙은 타워 3기의 글자 수만큼 셋 모두 공격력 +3%씩 (최대 +45%)','h',I_SEN)}
<div style="display: flex; gap: 8px; margin-top: auto">{pbtn('<span style="font-family: Noto Sans KR">골드 40 받기</span>', 175, 48, '#3a3420', '대신 골드 40')}{pbtn('<span style="font-family: Noto Sans KR">새로고침 20G</span>', 175, 48, KEY, '진열 새로고침')}</div>
</div></div>'''
open('v3/project/Reward.dc.html','w',encoding='utf-8').write(page2('스티커 보상', 390, 844, body))
