"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";

export async function toggleLike(
  solutionId: string,
  challengeId: string,
): Promise<ActionResult<{ liked: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("unauthorized");
  }

  const existing = await prisma.like.findUnique({
    where: {
      solutionId_userId: {
        solutionId,
        userId: session.user.id,
      },
    },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    revalidatePath(`/challenges/${challengeId}`);
    return ok({ liked: false });
  }

  await prisma.like.create({
    data: {
      solutionId,
      userId: session.user.id,
    },
  });

  revalidatePath(`/challenges/${challengeId}`);
  return ok({ liked: true });
}