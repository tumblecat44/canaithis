import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { isValidUserId } from "@/lib/user-id";

export { isValidUserId };

export const getPublicUser = cache(async function getPublicUser(userId: string) {
  if (!isValidUserId(userId)) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      challenges: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, image: true } },
          _count: { select: { solutions: true } },
        },
      },
      solutions: {
        orderBy: { createdAt: "desc" },
        include: {
          challenge: { select: { id: true, title: true } },
          _count: { select: { likes: true } },
        },
      },
      _count: {
        select: {
          challenges: true,
          solutions: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const likesReceived = await prisma.like.count({
    where: { solution: { authorId: userId } },
  });

  return { ...user, likesReceived };
});

/** 챌린지 또는 솔루션을 올린 사용자 — 공개 프로필이 의미 있음 */
export async function getActivePublicUserIds() {
  return prisma.user.findMany({
    where: {
      OR: [{ challenges: { some: {} } }, { solutions: { some: {} } }],
    },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function incrementChallengeView(challengeId: string) {
  await prisma.challenge.update({
    where: { id: challengeId },
    data: { viewCount: { increment: 1 } },
  });
}