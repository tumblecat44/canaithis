"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";

export async function toggleBookmark(
  challengeId: string,
): Promise<ActionResult<{ bookmarked: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("unauthorized");
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { id: true },
  });

  if (!challenge) {
    return fail("not_found");
  }

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_challengeId: {
        userId: session.user.id,
        challengeId,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    revalidatePath(`/challenges/${challengeId}`);
    revalidatePath("/profile");
    return ok({ bookmarked: false });
  }

  await prisma.bookmark.create({
    data: {
      userId: session.user.id,
      challengeId,
    },
  });

  revalidatePath(`/challenges/${challengeId}`);
  revalidatePath("/profile");
  return ok({ bookmarked: true });
}