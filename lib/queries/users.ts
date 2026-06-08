import { prisma } from "@/lib/prisma";

export async function getPublicUser(userId: string) {
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
}

export async function incrementChallengeView(challengeId: string) {
  await prisma.challenge.update({
    where: { id: challengeId },
    data: { viewCount: { increment: 1 } },
  });
}