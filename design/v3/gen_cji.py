exec(open('gen_v31.py').read())
def ck(main, sub='', bg=KEY, fg=TX, label=None, hi=False):
    al = label or (main + sub)
    s = f'<span style="font-size: 12px; color: {MU}; font-weight: 500">{sub}</span>' if sub else ''
    return f'<button aria-label="{al}" style="flex: 1 1 0; height: 50px; border: 2px solid {SEL if hi else LINE}; border-radius: 4px; background: {bg}; color: {fg}; box-shadow: 0 3px 0 #0b0c10; font-weight: 700; font-size: 20px; display: flex; align-items: center; justify-content: center; gap: 3px; padding: 0">{main}{s}</button>'
rows = [
 [ck('ㅣ'), ck('ㆍ', hi=True), ck('ㅡ'), ck(IC['back'], '', KEY, TX, '지우기')],
 [ck('ㄱ','ㅋ'), ck('ㄴ','ㄹ'), ck('ㄷ','ㅌ'), ck('<span style="font-size: 15px">확정</span>', '', GRN, '#0b2a10', '확정')],
 [ck('ㅂ','ㅍ'), ck('ㅅ','ㅎ'), ck('ㅈ','ㅊ'), ck('<span style="font-size: 15px">한/영</span>', '', KEY, TX, '한영 전환')],
 [ck('<span style="font-size: 15px">사전</span>', '', KEY, TX, '사전'), ck('ㅇ','ㅁ', hi=True), ck('<span style="font-size: 15px">→</span>', '', KEY, TX, '다음 글자'), ck('<span style="font-size: 14px">웨이브 ▶</span>', '', ORG, '#2a1a00', '웨이브')],
]
kb = f'<div style="flex: 1 1 auto; box-sizing: border-box; padding: 8px 6px 10px; display: flex; flex-direction: column; gap: 6px; background: {PANEL}; border-top: 2px solid {LINE}"><div style="display: flex; justify-content: space-between; font-size: 11px; color: {MU}"><span>천지인 · 한글</span><span>양 = ㅇ ㅣ ㆍ ㆍ ㅇ</span></div>' + ''.join(f'<div style="display: flex; gap: 6px">{"".join(r)}</div>' for r in rows) + '</div>'
ens = [(5.0,1,'고양이',2,blob(26)),(2.3,1,'다리',0,blob(32,'#5a4a6e')),(3.1,5,'달',0,blob(24)),(6.3,5,'개',0,plane(28)),(7.05,6.6,'알',0,blob(22))]
body = f'<div style="width: 390px; height: 844px; display: flex; flex-direction: column; overflow: hidden; background: {BG}">{topbar()}{rulebar("짧게 말해요 · 4글자 이하 단어 비용 −30%")}{nb_map(9, ens, True)}{inputcard("타격","고양","적 단어 고양이 (CAT) · 콤보 유지 +0.8초", korean=True)}{chipsrow(["고양이","곰"],[("서둘러",30,True),("멈춰",40,False)])}{kb}</div>'
open('v3/project/BattleCJ.dc.html','w',encoding='utf-8').write(page2('전투 화면 (천지인)', 390, 844, body))
