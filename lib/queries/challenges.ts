import { prisma } from "@/lib/prisma";
import { isValidUserId } from "@/lib/user-id";

export type ChallengeSort = "latest" | "popular" | "views";

const PAGE_SIZE = 9;

export async function getChallenges(filters?: {
  q?: string;
  category?: string;
  sort?: ChallengeSort;
  page?: number;
}) {
  const where: {
    category?: string;
    OR?: Array<{ title: { contains: string; mode: "insensitive" } } | { description: { contains: string; mode: "insensitive" } }>;
  } = {};

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const sort: ChallengeSort =
    filters?.sort === "popular"
      ? "popular"
      : filters?.sort === "views"
        ? "views"
        : "latest";
  const page = Math.max(1, filters?.page ?? 1);
  const skip = (page - 1) * PAGE_SIZE;

  const orderBy =
    sort === "popular"
      ? { solutions: { _count: "desc" as const } }
      : sort === "views"
        ? { viewCount: "desc" as const }
        : { createdAt: "desc" as const };

  const [items, total] = await Promise.all([
    prisma.challenge.findMany({
      where,
      orderBy,
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { solutions: true } },
      },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.challenge.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getChallengeById(id: string) {
  if (!isValidUserId(id)) {
    return null;
  }

  return prisma.challenge.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          _count: { select: { solutions: true } },
        },
      },
      solutions: {
        include: {
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { likes: true } },
          likes: { select: { userId: true } },
          comments: {
            include: {
              author: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { likes: { _count: "desc" } },
      },
    },
  });
}

export async function isChallengeBookmarked(
  userId: string,
  challengeId: string,
) {
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_challengeId: { userId, challengeId },
    },
    select: { id: true },
  });
  return Boolean(bookmark);
}

export async function getUserBookmarks(userId: string) {
  return prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      challenge: {
        include: {
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { solutions: true } },
        },
      },
    },
  });
}

export async function getUserStats(userId: string) {
  const [challenges, solutions, likesReceived] = await Promise.all([
    prisma.challenge.count({ where: { authorId: userId } }),
    prisma.solution.count({ where: { authorId: userId } }),
    prisma.like.count({
      where: { solution: { authorId: userId } },
    }),
  ]);

  return { challenges, solutions, likesReceived };
}

export async function getUserChallenges(userId: string) {
  return prisma.challenge.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { solutions: true } } },
  });
}

export async function getRelatedChallenges(
  challengeId: string,
  category: string,
  limit = 3,
) {
  return prisma.challenge.findMany({
    where: {
      id: { not: challengeId },
      category,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { solutions: true } },
    },
  });
}

export async function getAllChallengeIds() {
  return prisma.challenge.findMany({
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecentActivity(limit = 5) {
  const [challenges, solutions] = await Promise.all([
    prisma.challenge.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.solution.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        author: { select: { name: true } },
        challenge: { select: { id: true, title: true } },
      },
    }),
  ]);

  type ActivityItem =
    | {
        type: "challenge";
        id: string;
        title: string;
        createdAt: Date;
        authorName: string | null;
        href: string;
      }
    | {
        type: "solution";
        id: string;
        title: string;
        createdAt: Date;
        authorName: string | null;
        href: string;
      };

  const items: ActivityItem[] = [
    ...challenges.map((c) => ({
      type: "challenge" as const,
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      authorName: c.author.name,
      href: `/challenges/${c.id}`,
    })),
    ...solutions.map((s) => ({
      type: "solution" as const,
      id: s.id,
      title: s.challenge.title,
      createdAt: s.createdAt,
      authorName: s.author.name,
      href: `/challenges/${s.challenge.id}`,
    })),
  ];

  return items
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export async function getTrendingSolutions(limit = 3) {
  return prisma.solution.findMany({
    orderBy: { likes: { _count: "desc" } },
    take: limit,
    include: {
      challenge: { select: { id: true, title: true } },
      _count: { select: { likes: true } },
    },
  });
}

export async function getCommunityStats() {
  const [challenges, solutions, likes, users] = await Promise.all([
    prisma.challenge.count(),
    prisma.solution.count(),
    prisma.like.count(),
    prisma.user.count(),
  ]);

  return { challenges, solutions, likes, users };
}

export async function getUserSolutions(userId: string) {
  return prisma.solution.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      challenge: { select: { id: true, title: true } },
      _count: { select: { likes: true } },
    },
  });
}