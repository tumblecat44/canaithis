# CanAIThis

AI로 이거 해봤다 / 이거 되나? — 챌린지·솔루션 커뮤니티 (기말 개별 프로젝트)

## 로컬 실행

1. Supabase에서 PostgreSQL URL을 받아 `.env.local`을 [`.env.example`](.env.example) 기준으로 채운다.
2. GitHub·Google OAuth 앱을 만들고 콜백 URI를 등록한다.
   - `http://localhost:3000/api/auth/callback/github`
   - `http://localhost:3000/api/auth/callback/google`
3. `npm install` → `npx prisma migrate dev` → `npm run dev`

```bash
openssl rand -base64 32   # AUTH_SECRET
```

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npx prisma studio` | DB 확인 |

## Phase 7 (선택)

- 홈 피드 정렬: `?sort=latest` (기본) · `?sort=popular` (솔루션 수)
- 솔루션 수정: 작성자만 `/challenges/[id]/solutions/[solutionId]/edit`
- 솔루션 제출 모달: 챌린지 상세에서 링크 시 Parallel + Intercepting Routes (`@modal`)

## 배포 (Vercel)

- **Production:** https://canaithis.vercel.app
- Production에 `.env.example` 변수 등록 (`DATABASE_URL`, `DIRECT_URL`, `AUTH_*`, OAuth)
- OAuth 콜백: `https://canaithis.vercel.app/api/auth/callback/github` · `.../google`

## 제출 (Phase 6)

| 파일 | 경로 |
|------|------|
| 보고서 PDF | `docs/제출-보고서.pdf` |
| 채점용 env 템플릿 | `submission/.env` |
| 채점 안내 | `submission/README-채점.md` |
| 소스 ZIP | `bash scripts/package-submission.sh` → `canaithis-submission.zip` |

## 문서

- [docs/기획서.md](docs/기획서.md)
- [docs/개발-Phase.md](docs/개발-Phase.md)