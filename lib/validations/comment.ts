import { z } from "zod";

export const createCommentSchema = z.object({
  solutionId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;