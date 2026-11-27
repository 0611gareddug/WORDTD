exec(open('gen_v31.py').read())
def mini_q():
    r = lambda ks: '<div style="display: flex; gap: 2px; justify-content: center">' + ''.join(f'<span style="width: 11px; height: 14px; background: {KEY}; border: 1px solid {LINE}; font-family: Silkscreen; font-size: 7px; display: flex; align-items: center; justify-content: center">{k}</span>' for k in ks) + '</div>'
    return f'<div style="display: flex; flex-direction: column; gap: 2px">{r("QWERTYUIOP")}{r("ASDFGHJKL")}{r("ZXCVBNM")}</div>'
def mini_c():
    ks = [['ㅣ','ㆍ','ㅡ','⌫'],['ㄱ','ㄴ','ㄷ','↵'],['ㅂ','ㅅ','ㅈ','한'],['사','ㅇ','→','▶']]
    return '<div style="display: flex; flex-direction: column; gap: 2px">' + ''.join('<div style="display: flex; gap: 2px; justify-content: center">' + ''.join(f'<span style="width: 26px; height: 14px; background: {KEY}; border: 1px solid {LINE}; font-size: 8px; display: flex; align-items: center; justify-content: center">{k}</span>' for k in row) + '</div>' for row in ks) + '</div>'
def opt(title, desc, mini, on):
    bd = SEL if on else LINE
    mark = f'<span style="position: absolute; right: 8px; top: 8px; width: 18px; height: 18px; border-radius: 50%; border: 2px solid {bd}; background: {SEL if on else "transparent"}; box-shadow: inset 0 0 0 3px {PANEL}"></span>'
    return f'''<label style="position: relative; flex: 1 1 0; min-width: 0; box-sizing: border-box; padding: 10px; background: {PANEL}; border: 2px solid {bd}; display: flex; flex-direction: column; gap: 8px; cursor: pointer"><input type="radio" name="kb" {"checked" if on else ""} style="position: absolute; opacity: 0">{mark}<b style="font-size: 15px">{title}</b>{mini}<span style="font-size: 11px; color: {MU}; line-height: 1.45">{desc}</span></label>'''
def seg(items, sel):
    return f'<div style="display: flex; border: 2px solid {LINE}">' + ''.join(f'<button style="flex: 0 0 auto; padding: 0 12px; white-space: nowrap; height: 40px; border: 0; border-left: {"0" if i == 0 else "2px solid " + LINE}; background: {"#2b3a4a" if i == sel else KEY}; color: {SEL if i == sel else TX}; font-weight: 700; font-size: 13px">{t}</button>' for i, t in enumerate(items)) + '</div>'
def row(label, ctrl, hint=''):
    h = f'<span style="font-size: 11px; color: {MU}">{hint}</span>' if hint else ''
    return f'<div style="display: flex; flex-direction: column; gap: 6px; padding: 10px 0; border-bottom: 1px solid {LINE}"><div style="display: flex; justify-content: space-between; align-items: center; gap: 10px"><span style="font-size: 14px; font-weight: 500">{label}</span>{ctrl}</div>{h}</div>'
def slider(v): return f'<div style="width: 140px; height: 8px; background: {KEY}; border: 1px solid {LINE}; position: relative"><div style="width: {v}%; height: 6px; background: {SEL}"></div><div style="position: absolute; left: calc({v}% - 7px); top: -6px; width: 14px; height: 18px; background: {TX}; border: 2px solid {LINE}"></div></div>'
def tog(on): return f'<button aria-pressed="{"true" if on else "false"}" aria-label="켜기" style="width: 52px; height: 28px; border: 2px solid {LINE}; background: {"#24402a" if on else KEY}; position: relative; padding: 0"><span style="position: absolute; top: 2px; {"right" if on else "left"}: 2px; width: 20px; height: 20px; background: {"#6be36b" if on else MU}"></span></button>'
body = f'''<div style="width: 390px; height: 844px; box-sizing: border-box; overflow: hidden; background: {BG}; display: flex; flex-direction: column">
<div style="height: 52px; display: flex; align-items: center; gap: 10px; padding: 0 10px; background: {PANEL}; border-bottom: 2px solid {LINE}">{pbtn('←', 40, 34, KEY, '뒤로')}<b style="font-size: 17px">설정</b></div>
<div style="padding: 14px 14px 0; display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: baseline; justify-content: space-between"><b style="font-size: 15px; color: {GOLD}">모바일 키보드</b><span style="font-size: 11px; color: {MU}">터치 화면에서만 보여요</span></div>
<div style="display: flex; gap: 8px">{opt('쿼티', '영문 기본. 한/영 키로 두벌식 한글. 키마다 글자 점수 표시.', mini_q(), False)}{opt('천지인', '한글 기본 (ㅣㆍㅡ). 한/영 키로 영문 다중 탭. 큰 키, 콤보 유지 +0.8초.', mini_c(), True)}</div>
<div style="background: {PANEL}; border: 1px solid {LINE}; padding: 8px 10px; font-size: 12px; line-height: 1.5; color: {MU}">한글로 입력하면 적 머리 위 단어도 <b style="color: {TX}">한글 이름</b>으로 바뀌어요 (CAT → 고양이). 주문: 멈춰 · 서둘러 · 펑 · 황금 · 회복 · 지우개</div>
</div>
<div style="padding: 4px 14px 0; display: flex; flex-direction: column">
{row('시작 입력 언어', seg(['영어','한글','둘 다'], 2), '둘 다: 한/영 키로 바꿔요')}
{row('다중 탭 넘김 시간', '<span style="display: flex; align-items: center; gap: 8px">' + slider(45) + '<span style="font-family: Silkscreen; font-size: 12px">0.8s</span></span>', '천지인 영문에서 같은 키를 다시 눌러 다음 글자로 가는 시간')}
{row('천천히 타이핑', tog(False), '적 단어 3글자 고정, 콤보 유지 +1.5초, 오답 벌점 없음')}
{row('키 누름 진동', tog(True))}
{row('효과음', slider(70))}
{row('배경음', slider(50))}
</div>
<div style="margin-top: auto; padding: 14px; display: flex; gap: 8px"><a href="BattleCJ.dc.html" style="flex: 1 1 0; height: 48px; display: flex; align-items: center; justify-content: center; text-decoration: none; background: {GRN}; color: #0b2a10; font-weight: 700; border: 2px solid {LINE}; box-shadow: 0 3px 0 #0b0c10">천지인으로 해 보기</a><a href="Battle.dc.html" style="flex: 1 1 0; height: 48px; display: flex; align-items: center; justify-content: center; text-decoration: none; background: {KEY}; color: {TX}; font-weight: 700; border: 2px solid {LINE}; box-shadow: 0 3px 0 #0b0c10">쿼티 화면 보기</a></div>
</div>'''
open('v3/project/Settings.dc.html','w',encoding='utf-8').write(page2('설정 (키보드)', 390, 844, body))
