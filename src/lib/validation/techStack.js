// src/lib/validation/techStack.js
import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required.")
    .max(50, "Category name is too long."),
});

export const bulkTechStackSchema = z.object({
  category_id: z.string().uuid("Please select a valid category."),
  items: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Tech name cannot be empty.")
        .max(50, "Tech name is too long."),
    )
    .min(1, "Add at least one technology."),
});

export const updateTechItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tech name is required.")
    .max(50, "Tech name is too long."),
});
