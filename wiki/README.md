# WORD TD 위키 원본

- `template.html`: 위키 페이지 원본. `__WORDS__` 자리에 단어 데이터(JSON)가 들어간다.
- `build_words.py`: `docs/단어목록.md`에서 단어 데이터(words.json)를 뽑는 스크립트.
- `towerEditor.js`: 타워 에디터 코드 (template.html 안에도 같은 코드가 들어 있다).
- 타워 생성기는 `src/towerGen.js`와 같은 코드다.

## 크리에이터 (테스터용)
- `creator/`: 테스터용 공개 제작 도구. `build_creator.py`가 `template.html`의 공통 코드와 `towerEditor.js`를 합쳐 페이지를 만든다.
- 제출 코드 형식: 타워 `WTDT1.` + base64(JSON), 맵 `WTDM1.` + base64(JSON). 위키 에디터에서 불러올 수 있다.
