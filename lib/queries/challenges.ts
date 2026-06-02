import { prisma } from "@/lib/prisma";

export type ChallengeSort = "latest" | "popular";

export async function getChallenges(filters?: {
  q?: string;
  category?: string;
  sort?: ChallengeSort;
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

  return prisma.challenge.findMany({
    where,
    orderBy:
      sort === "popular"
        ? { solutions: { _count: "desc" } }
        : { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, image: true } },
      _count: { select: { solutions: true } },
    },
  });
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