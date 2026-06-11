import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || z.string().url().safeParse(value).success, {
    message: "Invalid URL",
  })
  .transform((value) => (value === "" ? null : value));

export const createSolutionSchema = z.object({
  challengeId: z.string().min(1),
  content: z.string().trim().min(1).max(8000),
  githubUrl: optionalUrl,
  demoUrl: optionalUrl,
});

export type CreateSolutionInput = z.infer<typeof createSolutionSchema>;
export type CreateSolutionFormInput = z.input<typeof createSolutionSchema>;

export const updateSolutionSchema = createSolutionSchema.omit({
  challengeId: true,
});

export type UpdateSolutionInput = z.infer<typeof updateSolutionSchema>;
