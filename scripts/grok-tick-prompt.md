CanAIThis 자율 틱 — 멈추지 말고 work-queue를 소비하라.

규칙:
1. `scripts/work-queue.json`에서 `status: "pending"`인 첫 항목을 처리한다. 없으면 프로덕션(https://canaithis.vercel.app/ko)을 보고 작은 개선 1건을 스스로 정해 구현한다.
2. `AGENTS.md` 낙인을 읽고 같은 실수를 반복하지 않는다. 배포 후 curl로 검증한다.
3. `npm run build` 성공 후 `git add` → `git commit` → `git push origin main`.
4. 처리한 항목은 work-queue에서 `status: "done"`으로 바꾸고, 다음 항목 1개를 pending에追加한다.
5. 설명만 하지 말고 코드·커밋으로 증명한다.

현재 틱 ID: {{TICK_ID}}
다음 작업 힌트: {{NEXT_TASK}}