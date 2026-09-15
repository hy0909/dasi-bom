# 다시, 봄 (Dasi Bom)

사진 한 장에서 시작해, 가족의 목소리와 AI 질문으로 그날의 이야기를 함께 기록하는 모바일 프로토타입입니다.

원본 프로토타입: https://dasi-bom-memory-prototype.pongg005.chatgpt.site/
이 저장소는 그 프로토타입을 Vite + React + TypeScript 단일 페이지 앱으로 옮긴 클론입니다.

## 화면 흐름

- **로그인** — 구글 / 카카오 계정으로 시작 (프로토타입 목업 인증)
- **가입 온보딩** — 약관 동의(1/2) → 이름·프로필 색 설정(2/2)
- **홈** — 내 앨범 목록, 새 앨범 만들기, 기록 Tip
- **앨범 상세** — 사진 / 목소리 / 이야기 / 연대표 탭, 진행률 요약
- **사진 이야기 남기기** — AI 질문 3단계, 목소리(실제 마이크 녹음) 또는 글로 답하기
- **사진 이야기** — AI가 정리한 이야기, 문체 선택, 원본 목소리 듣기, 수정
- **가족 초대** — 참여 링크 복사 / 공유 / 문자, 참여자 현황
- **게스트 참여** — `?invite=EU23` 링크로 진입 → 참여자 정보 → 답변 → 완료

전체 분기와 예외 경로는 [docs/UX-FLOW.md](docs/UX-FLOW.md)에 정리돼 있습니다.

## 인증

구글 / 카카오 소셜 로그인을 **프로토타입 목업**으로 구현했습니다. 실제 OAuth 대신
`localStorage`(`dasiBomAuth`, `dasiBomAccounts`)에 세션과 가입 이력을 저장합니다.

- 신규 계정 → 약관 동의 → 프로필 설정 → 홈
- 기존 계정 → 바로 홈 / 가입을 중간에 멈췄으면 약관 단계부터 재개
- 초대 링크(`?invite=EU23`)는 로그인과 무관하게 게스트 플로우로 들어갑니다
- 로그아웃은 세션만, 회원 탈퇴(두 번 누르기)는 가입 이력까지 지웁니다

실제 연동이 필요해지면 `src/lib/auth.ts` 의 `mockAuthorize()` 한 곳만 Google Identity Services /
Kakao SDK 호출로 교체하면 됩니다.

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
- Tailwind CSS v4 + shadcn/ui (Radix 기반). UI 프리미티브는 `src/components/ui/`
- 디자인 토큰은 `src/index.css` 한 곳에서 관리 (Zapier 계열 웜 크림 / 커피 잉크 / 오렌지 CTA)
- 사진은 Unsplash 이미지를 사용합니다

## 디자인 시스템 요약

| 토큰 | 값 | 쓰임 |
|---|---|---|
| `--canvas` | `#fffefb` | 페이지 바탕 (순백 아님) |
| `--canvas-soft` | `#f8f4f0` | 카드 표면 |
| `--ink` | `#201515` | 헤드라인·본문 잉크 |
| `--primary` | `#ff4f00` | 유일한 강조색, 주요 CTA |
| `--radius` | `12px` | 버튼·카드 공통 라운드 (입력은 6px) |

서체는 Inter(라틴) + Pretendard(한글)를 한 스택으로 묶어 씁니다.
