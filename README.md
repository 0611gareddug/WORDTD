# WORD TD

영단어(또는 한글 이름)를 치면 그 단어가 타워가 되는 픽셀 타워 디펜스.
공책 한 권(7쪽, 7~9분)을 지키는 로그라이크 런 + 웨이브 중 적 단어 타이핑 타격.

- 플레이: https://0611gareddug.github.io/WORDTD/
- 기획서: `docs/기획서.md` · 단어 목록: `docs/단어목록.md` (507개)

## 파일 구조
```
index.html        배포용 (빌드 결과)
game.js           배포용 스크립트 (난독화, 빌드 결과)
style.css         배포용 스타일 (빌드 결과)
src/game/         원본 (난독화 전) — 여기서 수정
  index.html      개발용 페이지 (원본 스크립트를 그대로 불러옴)
  style.css       화면 스타일 (회색 UI + 공책 맵)
  hangul.js       한글 조합 (두벌식, 천지인)
  core.js         단어·수치·적·스티커·규칙·저장·소리
  battle.js       전투 엔진 (공격, 원소 반응, 타이핑 타격, 주문)
  render.js       맵·타워·적 그리기
  ui.js           화면, 입력, 키보드, 판 진행
  data.js         단어 데이터 (빌드 때 wiki/words.json에서 생성)
src/towerGen.js   타워 픽셀 아이콘 생성기
tools/build.js    빌드 스크립트
wiki/             위키·크리에이터·단어 데이터
```

## 빌드
```
npm install
npm run build     # src/game → index.html, game.js, style.css
```
개발 중에는 `src/game/index.html`을 바로 열면 원본 그대로 실행된다.

## 배포 (GitHub Pages)
저장소 Settings → Pages → Branch를 배포할 브랜치 / root로 설정.
