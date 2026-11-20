import { z } from "zod";

export const aboutSchema = z.object({
  content: z
    .string()
    .trim()
    .max(10000, "Formatted HTML content is too long.")
    .refine(
      (html) => html.replace(/<[^>]*>/g, "").length <= 3000,
      "About Me content cannot exceed 3,000 visible characters.",
    )
    .optional()
    .or(z.literal("")),
});
