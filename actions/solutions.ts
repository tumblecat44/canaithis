"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import {
  createSolutionSchema,
  updateSolutionSchema,
} from "@/lib/validations/solution";
import { prisma } from "@/lib/prisma";

export async function createSolution(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("unauthorized");
  }

  const parsed = createSolutionSchema.safeParse({
    challengeId: formData.get("challengeId"),
    content: formData.get("content"),
    githubUrl: formData.get("githubUrl"),
    demoUrl: formData.get("demoUrl"),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "invalid");
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: parsed.data.challengeId },
    select: { id: true },
  });

  if (!challenge) {
    return fail("not_found");
  }

  await prisma.solution.create({
    data: {
      ...parsed.data,
      authorId: session.user.id,
    },
  });

  revalidatePath(`/challenges/${parsed.data.challengeId}`);
  revalidatePath("/profile");
  redirect(`/challenges/${parsed.data.challengeId}`);
}

export async function updateSolution(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("unauthorized");
  }

  const solutionId = formData.get("solutionId");
  if (typeof solutionId !== "string" || !solutionId) {
    return fail("invalid");
  }

  const parsed = updateSolutionSchema.safeParse({
    content: formData.get("content"),
    githubUrl: formData.get("githubUrl"),
    demoUrl: formData.get("demoUrl"),
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "invalid");
  }

  const existing = await prisma.solution.findUnique({
    where: { id: solutionId },
    select: { authorId: true, challengeId: true },
  });

  if (!existing) {
    return fail("not_found");
  }

  if (existing.authorId !== session.user.id) {
    return fail("forbidden");
  }

  await prisma.solution.update({
    where: { id: solutionId },
    data: parsed.data,
  });

  revalidatePath(`/challenges/${existing.challengeId}`);
  revalidatePath("/profile");
  return ok();
}

export async function deleteSolution(solutionId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("unauthorized");
  }

  const solution = await prisma.solution.findUnique({
    where: { id: solutionId },
    select: { authorId: true, challengeId: true },
  });

  if (!solution) {
    return fail("not_found");
  }

  if (solution.authorId !== session.user.id) {
    return fail("forbidden");
  }

  await prisma.solution.delete({ where: { id: solutionId } });

  revalidatePath(`/challenges/${solution.challengeId}`);
  revalidatePath("/profile");
  return ok();
}