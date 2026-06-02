import { z } from "zod";

import { CHALLENGE_CATEGORIES } from "@/lib/constants/categories";

const categoryValues = CHALLENGE_CATEGORIES.map((c) => c.value);

export const createChallengeSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  category: z.enum(categoryValues as [string, ...string[]]),
  imageUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
});

export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;