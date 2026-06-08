import { Pool } from "pg";
import { randomBytes } from "node:crypto";

const cuid = () => randomBytes(12).toString("hex").slice(0, 25);

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});

const demoUserId = "demo-seed-user-canaithis";
const challenges = [
  {
    title: "AI로 유튜브 쇼츠 자동 편집 가능할까?",
    description:
      "원본 영상만 넣으면 AI가 하이라이트를 잘라 쇼츠로 만들어주는 워크플로우를 만들고 싶습니다. 실제로 쓸 만한 도구 조합이 있을까요?",
    category: "editing",
    imageUrl:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
  },
  {
    title: "ChatGPT로 Next.js 앱 전체를 생성할 수 있나?",
    description:
      "프롬프트만으로 CRUD + 인증까지 포함한 Next.js 앱을 만들 수 있는지, 어디까지 자동화가 가능한지 궁금합니다.",
    category: "coding",
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  },
  {
    title: "AI가 매일 아침 뉴스레터를 자동 발송할 수 있을까?",
    description:
      "RSS 수집 → 요약 → 이메일 발송까지 완전 자동화하는 파이프라인을 n8n이나 Make로 구성할 수 있는지 알고 싶습니다.",
    category: "automation",
    imageUrl: null,
  },
];

try {
  const existing = await pool.query(
    `SELECT count(*)::int AS n FROM "Challenge"`,
  );
  if (existing.rows[0].n > 0) {
    console.log(`Skipping seed: ${existing.rows[0].n} challenges already exist`);
    process.exit(0);
  }

  await pool.query(
    `INSERT INTO "User" (id, name, email, "createdAt")
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (id) DO NOTHING`,
    [demoUserId, "CanAIThis Demo", "demo@canaithis.app"],
  );

  for (const c of challenges) {
    const challengeId = cuid();
    await pool.query(
      `INSERT INTO "Challenge" (id, title, description, category, "imageUrl", "authorId", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [challengeId, c.title, c.description, c.category, c.imageUrl, demoUserId],
    );

    const solutionId = cuid();
    await pool.query(
      `INSERT INTO "Solution" (id, content, "githubUrl", "demoUrl", "challengeId", "authorId", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        solutionId,
        "Claude + Cursor 조합으로 프로토타입을 먼저 만들고, 수동으로 마무리하는 방식이 가장 현실적이었습니다.",
        "https://github.com/vercel/next.js",
        "https://canaithis.vercel.app",
        challengeId,
        demoUserId,
      ],
    );
  }

  console.log(`Seeded ${challenges.length} demo challenges with solutions`);
} catch (e) {
  console.error("Seed failed:", e.message);
  process.exit(1);
} finally {
  await pool.end();
}