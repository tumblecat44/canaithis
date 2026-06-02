"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { createChallengeSchema } from "@/lib/validations/challenge";
import { prisma } from "@/lib/prisma";

export async function createChallenge(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("unauthorized");
  }

  const parsed = createChallengeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "invalid");
  }

  const challenge = await prisma.challenge.create({
    data: {
      ...parsed.data,
      authorId: session.user.id,
    },
  });

  revalidatePath("/");
  redirect(`/challenges/${challenge.id}`);
}

export async function deleteChallenge(challengeId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("unauthorized");
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { authorId: true },
  });

  if (!challenge) {
    return fail("not_found");
  }

  if (challenge.authorId !== session.user.id) {
    return fail("forbidden");
  }

  await prisma.challenge.delete({ where: { id: challengeId } });

  revalidatePath("/");
  revalidatePath("/profile");
  return ok();
}