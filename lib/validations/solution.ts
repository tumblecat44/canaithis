import { z } from "zod";

export const createSolutionSchema = z.object({
  challengeId: z.string().min(1),
  content: z.string().min(20).max(8000),
  githubUrl: z.string().url(),
  demoUrl: z.string().url(),
});

export type CreateSolutionInput = z.infer<typeof createSolutionSchema>;

export const updateSolutionSchema = createSolutionSchema.omit({
  challengeId: true,
});

export type UpdateSolutionInput = z.infer<typeof updateSolutionSchema>;