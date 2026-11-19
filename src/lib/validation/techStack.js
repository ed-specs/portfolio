import { z } from "zod";

export const techStackSchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, "Category is required.")
    .max(50, "Category is too long."),
  items: z
    .array(
      z.string().trim().min(1, "Tech stack name is required."),
      max(50, "Tech stack name is too long."),
    )
    .min(1, "Add at least one technlogy."),
});
