import type { MetadataRoute } from "next";

import { getAllChallengeIds } from "@/lib/queries/challenges";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.AUTH_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${base}/challenges/new`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  try {
    const challenges = await getAllChallengeIds();
    const challengeRoutes = challenges.map((c) => ({
      url: `${base}/challenges/${c.id}`,
      lastModified: c.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    return [...staticRoutes, ...challengeRoutes];
  } catch {
    return staticRoutes;
  }
}