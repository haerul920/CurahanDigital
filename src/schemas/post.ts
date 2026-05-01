import { z } from "zod";

export const postSchema = z.object({
  content: z
    .string()
    .min(10, "Confession must be at least 10 characters.")
    .max(500, "Confession cannot exceed 500 characters."),
  is_anonymous: z.boolean().default(true),
});

export type PostFormValues = z.infer<typeof postSchema>;
