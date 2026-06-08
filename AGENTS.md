<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Agent tattoos (낙인 — 절대 덮어쓰지 말 것)

**규칙**
- 멈출 때마다 **맨 아래에 항목을追加(append)** 한다. 기존 낙인 수정·삭제·덮어쓰기 금지.
- 목적: 같은 실수 반복 방지. “다음에 뭐 하지?”가 아니라 **“이거 또 하면 안 됨”**을 머리에 박아 둠.
- 자율 루프는 **멈추지 않는다**. 낙인은 기록용이지 종료 허가증이 아님.
- 각 낙인 형식: `### [날짜] #N — 한 줄 제목` → 실수/교훈 → (선택) 당시 상태.

### [2026-06-08] #1 — Vercel DATABASE_URL이 빈 문자열이었다

- `vercel env pull`로 확인 시 `DATABASE_URL`/`DIRECT_URL` 값 길이 2 (`""`). 홈 `HomeFeed` 전부 digest 에러.
- **다시 하지 마라**: 배포 후 `curl` 200만 믿지 말고 **DB 쿼리 성공(챌린지 카드 HTML)** 까지 본다.
- **교훈**: env 키가 “있음” ≠ “값이 있음”. 프로덕션 DB 연결은 `scripts/prod-db-urls.sh` → `vercel env add`로 세팅.

### [2026-06-08] #2 — Supabase ref `cbuwyfyhiibobgygpkxv`는 죽은 프로젝트

- `scripts/prod-db-urls.sh` 기본값 + malgun `CANAITHIS_SUPABASE_REF` 미설정 시 pooler `tenant/user postgres.cbuwyfyhiibobgygpkxv not found`.
- **실제 ref**: `ktacyhbsahxygwsssczh` (`$HOME/malgun-res/.env.supabase.local`의 `SUPABASE_PROJECT_REF`).
- Vercel에 `SUPABASE_PROJECT_REF=ktacyhbsahxygwsssczh`도 같이 넣어 둠.

### [2026-06-08] #3 — malgun-res와 DB 공유

- public 스키마에 `reservations`, `tenants` 등 malgun 테이블과 CanAIThis `User`/`Challenge`/`Solution`/`Like` **공존**.
- 마이그레이션: `npx prisma migrate deploy` 로컬에서 `ERR_REQUIRE_ESM`(zeptomatch) → **`node scripts/apply-migration.mjs`** 로 SQL 직접 적용.
- 전용 Supabase 프로젝트 없음(무료 한도). 스키마 분리 필요 시 `@@schema("canaithis")` 검토 — 아직 미적용.

### [2026-06-08] #4 — `.serena/`, `canaithis-submission.zip` 커밋 금지

- 한 번 실수로 커밋됨 → `git rm --cached` + `.gitignore` 추가. **다시 스테이징하지 마라.**

### [2026-06-08] #5 — 세션 로그 덮어쓰기 금지 (사용자 지시)

- “최신 중단 기록” 블록 **덮어쓰기**는 사용자가 거부함. 낙인은 **문신** — 지울수록 같은 자리만 아픔.
- 멈춤 이유를 적되, **항목追加만** 한다.

### [2026-06-08] #6 — 사이클 4까지 배포했으나 “절대 멈추지 마” 직후 멈춤

- 사이클 4(필터·트렌딩·하이라이트) push·프로덕션 확인 후 **사이클 5 착수 전** 턴 종료. 사용자에게 “계속할까요?” 물으며 멈춤 — **이 패턴 금지**.
- 프로덕션 당시: https://canaithis.vercel.app/ko 200, 챌린지 3·솔루션 3·멤버 1.

### [2026-06-08] #7 — 사이클 5 착수 (이 턴)

- 상식적 다음 기능(스키마 없이): **프로필 통계**, **챌린지 상세 솔루션·좋아요 합계**, **검색 빈 결과 UX**, **푸터 프로필 링크**.
- 그 다음(스키마 필요): 북마크 → 댓글. `apply-migration.mjs` 패턴 재사용.

### [2026-06-08] #8 — 사이클 5·6 완료, 북마크 스키마 추가

- 사이클 5: 프로필 통계·상세 메트릭·검색 empty·푸터 프로필 (`db6135b`).
- 사이클 6: `Bookmark` 모델 + 상세 저장 버튼 + 프로필 「저장한 챌린지」탭.
- 마이그레이션: `node scripts/apply-bookmarks-migration.mjs` (프로덕션 DB에 적용함). `prisma generate`는 빌드 전 필수.
- **다음**: 댓글(`Comment`) — 같은 마이그레이션 패턴. 멈추지 말고 바로 착수.

### [2026-06-08] #9 — 사이클 7: 솔루션 댓글

- `Comment` 모델 + `apply-comments-migration.mjs` 프로덕션 적용.
- 솔루션 카드 하단 댓글 스레드, 작성자 삭제.
- **다음**: 알림 없이도 괜찮으면 — 챌린지 작성자 공개 프로필(`/users/[id]`), 조회수, RSS. 멈추지 말 것.

### [2026-06-08] #10 — 사이클 8: 공개 프로필·조회수·RSS

- `/users/[id]` 공개 프로필, 작성자 링크, `viewCount` 컬럼, `/feed.xml` RSS.
- 마이그레이션: `node scripts/apply-view-count-migration.mjs`
- **카드 안 중첩 Link 금지** — ChallengeCard는 outer `<Link>` 대신 제목/작성자 각각 Link (`#10` 교훈).
- **다음**: 정렬에 조회수(`?sort=views`), 최근 활동 피드, 솔루션 작성자도 `/users/[id]` 링크.

**고정 참조**
```bash
source scripts/prod-db-urls.sh && node scripts/seed-demo.mjs   # 프로덕션 DB 시드
npm run build && git push origin main                          # Vercel 배포
curl -sL https://canaithis.vercel.app/ko | grep -c "text-2xl" # DB+렌더 스모크
```
