exec(open('gen_v3.py').read())
COLS = [('종이','#FBF6EA'),('모눈 선','#DCE8F3'),('여백선','#E9A3A3'),('연필','#3B3F4E'),('먹 글씨','#2A2D3A'),('형광 노랑','#FFE86B'),('형광 분홍','#FF9EC7'),('형광 민트','#8EF0D0'),('테이프','#F2D7A6'),('포스트잇','#FFF1A8'),('빨간 펜','#E0483E'),('파란 펜','#3B6FD8'),('책상','#C99B6D')]
sw = ''.join(f'<div style="display: flex; flex-direction: column; gap: 4px; width: 54px"><div style="height: 40px; border-radius: 8px; background: {c}; border: 1.5px solid #2A2D3A"></div><span style="font-size: 11px; line-height: 1.2">{n}</span><span style="font-family: monospace; font-size: 10px; color: #5b6174">{c}</span></div>' for n, c in COLS)
H = lambda t: f'<b style="font-family: Gaegu, cursive; font-size: 24px; line-height: 1">{t}</b>'
typ = f'''<div style="display: flex; flex-direction: column; gap: 8px">{H('글꼴')}
<div style="font-family: Silkscreen, monospace; font-weight: 700; font-size: 26px; letter-spacing: 0.04em">FROST · ZAP</div><span style="font-size: 12px; color: #5b6174">게임 단어: Silkscreen</span>
<div style="font-family: Gaegu, cursive; font-weight: 700; font-size: 28px; line-height: 1">참 잘했어요! 4쪽으로</div><span style="font-size: 12px; color: #5b6174">제목·말풍선: Gaegu</span>
<div style="font-size: 15px">적 단어를 치면 바로 때린다. 콤보가 이어질수록 강해진다.</div><span style="font-size: 12px; color: #5b6174">본문·수치: Gowun Dodum</span></div>'''
parts = f'''<div style="display: flex; flex-direction: column; gap: 12px">{H('부품')}
<div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap">
<button style="height: 48px; padding: 0 18px; border: 2px solid #2A2D3A; border-radius: 12px; background: #FFE86B; box-shadow: 0 3px 0 #2A2D3A; font-family: Gaegu, cursive; font-weight: 700; font-size: 20px">지우개 버튼</button>
<button style="height: 48px; padding: 0 18px; border: 2px solid #2A2D3A; border-radius: 12px; background: #ffffff; box-shadow: 0 3px 0 #2A2D3A; font-family: Gaegu, cursive; font-weight: 700; font-size: 20px">보조</button>
<div style="background: #FFF1A8; padding: 8px 12px; transform: rotate(-1.5deg); box-shadow: 0 2px 4px rgba(59,63,78,0.2); font-size: 13px"><b style="font-family: Gaegu, cursive; font-size: 18px">포스트잇</b> 쪽 규칙·알림</div>
<span style="font-family: Gaegu, cursive; font-weight: 700; font-size: 18px; background: #8EF0D0; padding: 2px 12px 0; border-radius: 8px 8px 0 0; border: 1.5px solid #2A2D3A; border-bottom: 0">인덱스 탭</span>
</div>
<div style="display: flex; gap: 18px; align-items: flex-end; flex-wrap: wrap">
<div style="display: flex; flex-direction: column; align-items: center; gap: 4px">{sticker('FIRE', 40)}<span style="font-size: 11px; color: #5b6174">타워 = 스티커 + 테이프</span></div>
<div style="display: flex; flex-direction: column; align-items: center; gap: 4px">{sticker('ZAP', 40, True, 'linear-gradient(135deg,#f4f6fa,#c9ced8,#f4f6fa)')}<span style="font-size: 11px; color: #5b6174">Lv4 은박</span></div>
<div style="display: flex; flex-direction: column; align-items: center; gap: 4px">{sticker('GOLD', 40, True, 'linear-gradient(135deg,#ffd1ec,#c8f0ff,#fff3b0,#d4ffe0)')}<span style="font-size: 11px; color: #5b6174">Lv5 홀로그램</span></div>
<div style="display: flex; flex-direction: column; align-items: center; gap: 4px">{tape('CAT', 2, 12)}{blob(30)}<span style="font-size: 11px; color: #5b6174">적 = 낙서 + 단어 테이프</span></div>
<div style="display: flex; flex-direction: column; align-items: center; gap: 4px"><span style="font-family: Silkscreen, monospace; font-weight: 700; font-size: 20px; color: #E0483E; border: 2px solid #E0483E; border-radius: 50%; padding: 2px 8px; transform: rotate(-8deg)">126</span><span style="font-size: 11px; color: #5b6174">치명타 = 채점 동그라미</span></div>
</div></div>'''
MO = [('단일 탄환','연필심 탄'),('관통','자로 그은 직선'),('범위','도장 쾅 + 잉크 튐'),('연사','스테이플러 심 3연발'),('지속 광선','형광펜 줄긋기'),('설치 함정','압정'),('오라','반짝이 가루 원')]
mot = f'<div style="display: flex; flex-direction: column; gap: 8px">{H("공격 모션")}<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 14px">' + ''.join(f'<div style="display: flex; justify-content: space-between; gap: 8px; font-size: 13px; border-bottom: 1px dashed #cbbf9f; padding-bottom: 3px"><b>{a}</b><span>{b}</span></div>' for a, b in MO) + '<div style="display: flex; justify-content: space-between; gap: 8px; font-size: 13px; border-bottom: 1px dashed #cbbf9f; padding-bottom: 3px"><b>처치</b><span>지우개로 지워짐 + 동전</span></div></div></div>'
body = f'''<div style="width: 880px; height: 680px; box-sizing: border-box; overflow: hidden; padding: 24px 28px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px 32px; align-content: start; {PAPER}">
<div style="grid-column: 1 / -1; display: flex; align-items: baseline; gap: 12px"><b style="font-family: Gaegu, cursive; font-size: 34px; line-height: 1">아늑한 문구점·공책</b><span style="font-size: 14px; color: #5b6174">책상 위 공책 속에서 벌어지는 낙서 전쟁 · WORD TD v3 스타일</span></div>
<div style="grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 8px">{sw}</div>
{typ}{parts}
<div style="grid-column: 1 / -1">{mot}</div>
</div>'''
open('v3/project/Style.dc.html','w',encoding='utf-8').write(page('v3 스타일 시트', 880, 680, body))
