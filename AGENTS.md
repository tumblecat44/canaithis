<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Agent session log (멈출 때마다 갱신)

에이전트가 자율 개선 루프를 **멈출 때마다** 아래 **「최신 중단 기록」** 블록을 덮어쓴다.  
이유 · 당시 상태 · 다음에 할 일을 남겨 다음 세션이 바로 이어가게 한다.

### 최신 중단 기록 — 2026-06-08

**왜 멈췄는가**
- 사용자가 “무한 반복, 절대 멈추지 마”를 요청했으나, 에이전트 턴/컨텍스트 한도와 **사용자 응답 대기** 때문에 사이클 4(필터·트렌딩) 배포 후 자연 종료됨.
- 배포 검증(`curl` 200, `인기 솔루션`·`3개 결과` 확인)까지 끝냈고, **다음 사이클(북마크·댓글 등)은 시작 전**에 멈춤.
- Vercel `vercel logs` 백그라운드 작업은 301초 후 exit -1(타임아웃) — 프로덕션 장애 원인은 아님(당시 사이트 200 정상).

**당시 프로덕션 상태**
- URL: https://canaithis.vercel.app
- DB: Supabase `ktacyhbsahxygwsssczh` (malgun-res와 **public 스키마 공유** — CanAIThis 테이블만 추가됨)
- Vercel env: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_PROJECT_REF` 설정 완료 (이전엔 **빈 문자열**이라 홈 피드 전부 실패)
- 데모 데이터: 챌린지 3 · 솔루션 3 · 멤버 1 (`scripts/seed-demo.mjs`, 이미 데이터 있으면 스킵)

**이번 세션에 배포한 것 (커밋 순)**
| 커밋 | 내용 |
|------|------|
| `74d701f` | DB 복구, 챌린지 수정, 홈 커뮤니티 통계, i18n navigation |
| `ce9956f` | 공유 버튼, 비슷한 챌린지, 동적 sitemap·OG |
| `27a0e4d` | 홈 페이지네이션(9개), 카드 작성자·날짜, 상세 삭제 |
| `cd0aaf8` | 필터 뱃지·결과 수·초기화, 검색 하이라이트, 인기 솔루션 |

**다음 세션에서 할 일 (우선순위)**
1. **프로덕션 스모크** — `curl -sL https://canaithis.vercel.app/ko` → 통계 숫자·챌린지 카드 노출 확인.
2. **사이클 5 후보** (스키마 없이 가능한 것부터):
   - 프로필 통계 카드 (내 챌린지/솔루션/받은 좋아요 수)
   - 홈 `?q=` 검색 UX polish (빈 결과 empty state 문구)
   - 챌린지 상세 솔루션 수·좋아요 합계 표시
3. **스키마 마이그레이션 필요 시**:
   - 북마크(`Bookmark` 모델) 또는 댓글(`Comment`) — `prisma migrate` 로컬에서 `ERR_REQUIRE_ESM`(zeptomatch) 나면 `scripts/apply-migration.mjs` 패턴으로 SQL 직접 적용.
4. **DB/배포 주의**:
   - `scripts/prod-db-urls.sh` — ref는 `CANAITHIS_SUPABASE_REF` 또는 `SUPABASE_PROJECT_REF`, 기본 `ktacyhbsahxygwsssczh`. `cbuwyfyhiibobgygpkxv` 쓰면 pooler `tenant not found`.
   - malgun-res 테이블과 **같은 DB** — CanAIThis 전용 스키마 분리는 아직 안 함; 필요 시 `@@schema("canaithis")` 검토.
5. **커밋 금지**: `.serena/`, `canaithis-submission.zip` (`.gitignore`에 있음).

**로컬 실행**
```bash
npm install && npm run dev          # .env.local = Prisma Dev 로컬 DB
source scripts/prod-db-urls.sh      # 프로덕션 DB URL (마이그레이션/시드용)
node scripts/seed-demo.mjs        # 빈 DB일 때만 데모 삽입
npm run build && git push origin main   # Vercel 자동 배포
```

---

### 이전 중단 기록 — 2026-06-08 (사이클 3 직후)

**왜 멈췄는가**  
사이클 3(페이지네이션·상세 삭제) push 후 사용자에게 진행 요약만 전달하고 종료. 프로덕션 배포 대기 중이었음.

**다음에 할 일** → 위 「최신 중단 기록」의 사이클 4 항목을 수행함(완료).
