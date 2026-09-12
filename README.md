# 다시, 봄 (Dasi Bom)

사진 한 장에서 시작해, 가족의 목소리와 AI 질문으로 그날의 이야기를 함께 기록하는 모바일 프로토타입입니다.

원본 프로토타입: https://dasi-bom-memory-prototype.pongg005.chatgpt.site/
이 저장소는 그 프로토타입을 Vite + React + TypeScript 단일 페이지 앱으로 옮긴 클론입니다.

## 화면 흐름

- **홈** — 내 기록 목록, 새 기록 만들기, 오늘의 기록 팁
- **기록 상세** — 사진 / 목소리 / 이야기 / 연대표 탭, 진행률 요약
- **사진 이야기 남기기** — AI 질문 3단계, 목소리(실제 마이크 녹음) 또는 글로 답하기
- **사진 이야기** — AI가 정리한 이야기, 문체 선택, 원본 목소리 듣기, 수정
- **가족 초대** — 참여 링크 복사 / 공유 / 문자, 참여자 현황
- **게스트 참여** — `?invite=EU23` 링크로 진입 → 참여자 정보 → 답변 → 완료

## 실행

```bash
npm install
npm run dev
```

빌드는 `npm run build`, 결과물은 `dist/` 에 생성됩니다.

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 GitHub Pages로 자동 배포합니다.

## 기술

- Vite 7, React 19, TypeScript
- 외부 UI 라이브러리 없이 `src/index.css` 단일 스타일시트
- 사진은 Unsplash 이미지를 사용합니다
