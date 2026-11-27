exec(open('gen_v3.py').read())
def scard(name, grade, eff, kind, icon):
    if kind == 'holo':
        face = 'background: linear-gradient(135deg,#ffd1ec 0%,#c8f0ff 35%,#fff3b0 65%,#d4ffe0 100%)'; ring = '#2A2D3A'; tag = '홀로그램'
    elif kind == 'shine':
        face = 'background: linear-gradient(135deg,#f4f6fa,#d9dee8 50%,#f4f6fa)'; ring = '#6d7a8c'; tag = '반짝'
    else:
        face = 'background: #ffffff'; ring = '#2A2D3A'; tag = '보통'
    return f'''<button style="width: 100%; text-align: left; border: 2px solid #2A2D3A; border-radius: 14px; background: #FBF6EA; padding: 12px; box-shadow: 0 4px 0 #2A2D3A; display: flex; gap: 12px; align-items: center; cursor: pointer">
<div style="flex: 0 0 auto; width: 72px; height: 72px; border-radius: 50%; {face}; border: 3px solid #ffffff; outline: 2px solid {ring}; box-shadow: 0 3px 0 rgba(42,45,58,0.3); display: flex; align-items: center; justify-content: center">{icon}</div>
<div style="display: flex; flex-direction: column; gap: 4px; min-width: 0">
<div style="display: flex; gap: 6px; align-items: baseline"><b style="font-family: Gaegu, cursive; font-size: 24px; line-height: 1">{name}</b><span style="font-size: 11px; border: 1px solid #2A2D3A; border-radius: 8px; padding: 1px 6px">{tag}</span></div>
<span style="font-size: 14px; line-height: 1.45">{eff}</span></div></button>'''
I_PEN = '<svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l3-1 11-11-2-2L5 17z" fill="#E0483E" stroke="#2A2D3A" stroke-width="1.4" stroke-linejoin="round"></path><path d="M16 6l2 2" stroke="#2A2D3A" stroke-width="1.4"></path></svg>'
I_HL = '<svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18h18" stroke="#FF9EC7" stroke-width="5" stroke-linecap="round"></path><path d="M8 15l8-10 3 2-8 10H8z" fill="#FFE86B" stroke="#2A2D3A" stroke-width="1.4" stroke-linejoin="round"></path></svg>'
I_SEN = '<svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="8" width="6" height="8" rx="1" fill="#f08a24" stroke="#2A2D3A" stroke-width="1.3"></rect><rect x="9" y="8" width="6" height="8" rx="1" fill="#8fd8ff" stroke="#2A2D3A" stroke-width="1.3"></rect><rect x="16" y="8" width="6" height="8" rx="1" fill="#ffe680" stroke="#2A2D3A" stroke-width="1.3"></rect><path d="M3 19h18" stroke="#2A2D3A" stroke-width="1.3" stroke-dasharray="2 2"></path></svg>'
stamp = '''<div style="align-self: center; transform: rotate(-6deg); border: 4px solid #E0483E; color: #E0483E; border-radius: 50%; width: 132px; height: 132px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: Gaegu, cursive; font-weight: 700; line-height: 1.05; background: rgba(251,246,234,0.6)"><span style="font-size: 28px">참 잘했어요</span><span style="font-size: 15px">3쪽 클리어</span></div>'''
stats = '''<div style="display: flex; justify-content: center; gap: 18px; font-size: 13px; color: #5b6174"><span>최고 콤보 <b style="color: #2A2D3A">14</b></span><span>처음 쓴 단어 <b style="color: #2A2D3A">3</b></span><span>골드 <b style="color: #2A2D3A">+58</b></span></div>'''
body = f'''<div style="width: 390px; height: 844px; box-sizing: border-box; overflow: hidden; padding: 28px 18px 22px; display: flex; flex-direction: column; gap: 16px; {PAPER}">
{stamp}{stats}
<div style="display: flex; align-items: baseline; justify-content: space-between"><b style="font-family: Gaegu, cursive; font-size: 26px">스티커 하나 고르기</b><span style="font-size: 12px; color: #5b6174">표지 칸 3 / 8</span></div>
<div style="display: flex; flex-direction: column; gap: 14px">
{scard('빨간 펜','보통','적 단어 타격 피해 +50%','',I_PEN)}
{scard('형광 띠','반짝','콤보 10 이상이면 모든 타워 공격 속도 +15%','shine',I_HL)}
{scard('문장 완성','홀로그램','일렬로 붙은 타워 3기의 글자 수만큼 셋 모두 공격력 +3%씩 (최대 +45%)','holo',I_SEN)}
</div>
<div style="display: flex; gap: 10px; margin-top: auto">
<button style="flex: 1 1 0; height: 52px; border: 2px solid #2A2D3A; border-radius: 12px; background: #FFE86B; box-shadow: 0 3px 0 #2A2D3A; font-family: Gaegu, cursive; font-weight: 700; font-size: 20px; display: flex; align-items: center; justify-content: center; gap: 6px">{ICON['coin']} 대신 골드 40</button>
<button style="flex: 1 1 0; height: 52px; border: 2px solid #2A2D3A; border-radius: 12px; background: #ffffff; box-shadow: 0 3px 0 #2A2D3A; font-family: Gaegu, cursive; font-weight: 700; font-size: 20px">수정테이프 (20G)</button>
</div>
</div>'''
open('v3/project/Reward.dc.html','w',encoding='utf-8').write(page('스티커 보상', 390, 844, body))
