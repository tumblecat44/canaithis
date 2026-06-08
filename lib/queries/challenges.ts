import { prisma } from "@/lib/prisma";

export type ChallengeSort = "latest" | "popular";

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

  const sort = filters?.sort === "popular" ? "popular" : "latest";
  const page = Math.max(1, filters?.page ?? 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [items, total] = await Promise.all([
    prisma.challenge.findMany({
      where,
      orderBy:
        sort === "popular"
          ? { solutions: { _count: "desc" } }
          : { createdAt: "desc" },
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
  return prisma.challenge.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true, email: true } },
      solutions: {
        include: {
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { likes: true } },
          likes: { select: { userId: true } },
        },
        orderBy: { likes: { _count: "desc" } },
      },
    },
  });
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