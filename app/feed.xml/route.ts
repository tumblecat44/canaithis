import { getChallenges } from "@/lib/queries/challenges";

export const dynamic = "force-dynamic";

export async function GET() {
  const base =
    process.env.AUTH_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const feed = await getChallenges({ page: 1 });
  const items = feed.items
    .map(
      (c) => `    <item>
      <title>${escapeXml(c.title)}</title>
      <link>${base}/challenges/${c.id}</link>
      <guid isPermaLink="true">${base}/challenges/${c.id}</guid>
      <pubDate>${c.createdAt.toUTCString()}</pubDate>
      <description>${escapeXml(c.description.slice(0, 300))}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>CanAIThis</title>
    <link>${base}</link>
    <description>AI challenges and solutions community</description>
    <language>ko</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}