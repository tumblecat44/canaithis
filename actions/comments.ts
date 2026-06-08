"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validations/comment";

export async function createComment(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("unauthorized");
  }

  const parsed = createCommentSchema.safeParse({
    solutionId: formData.get("solutionId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "invalid");
  }

  const solution = await prisma.solution.findUnique({
    where: { id: parsed.data.solutionId },
    select: { challengeId: true },
  });

  if (!solution) {
    return fail("not_found");
  }

  await prisma.comment.create({
    data: {
      ...parsed.data,
      authorId: session.user.id,
    },
  });

  revalidatePath(`/challenges/${solution.challengeId}`);
  return ok();
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("unauthorized");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, solution: { select: { challengeId: true } } },
  });

  if (!comment) {
    return fail("not_found");
  }

  if (comment.authorId !== session.user.id) {
    return fail("forbidden");
  }

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/challenges/${comment.solution.challengeId}`);
  return ok();
}