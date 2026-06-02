# 채점 안내 (CanAIThis)

## 프로덕션 (권장)

- URL: https://canaithis.vercel.app
- 로그인: https://canaithis.vercel.app/login (GitHub 또는 Google)
- 비로그인: 홈·챌린지 상세 열람 가능
- 로그인 필수: `/challenges/new`, `/profile`, 솔루션 작성·수정

OAuth redirect URI (프로덕션 채점용 앱에 등록):

- `https://canaithis.vercel.app/api/auth/callback/github`
- `https://canaithis.vercel.app/api/auth/callback/google`

## 로컬 채점

1. 저장소 루트에서 `cp submission/.env .env.local` 후 값 채우기
2. `npm install`
3. `npx prisma migrate deploy` (또는 제출자 Supabase에 이미 스키마 적용됨)
4. `npm run dev` → http://localhost:3000

로컬 OAuth redirect:

- `http://localhost:3000/api/auth/callback/github`
- `http://localhost:3000/api/auth/callback/google`

## `.env` 안전

`submission/.env`에는 **실제 프로덕션 비밀번호·OAuth 시크릿이 없습니다.**  
채점자는 본인 테스트용 OAuth 앱을 만들거나, 제출자가 별도 안내한 채점용 키를 사용하세요.

## 문서

- 보고서 PDF: `docs/제출-보고서.pdf`
- 기획: `docs/기획서.md`
- 개발 Phase: `docs/개발-Phase.md`