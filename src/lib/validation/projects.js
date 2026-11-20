import { z } from "zod";

export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Project title is required.")
    .max(100, "Project title is too long."),
  description: z
    .string()
    .trim()
    .min(1, "Project description is required.")
    .max(10000, "Formatted HTML content is too long.")
    .refine(
      (html) => html.replace(/<[^>]*>/g, "").trim().length > 0,
      "Project description is required.",
    )
    .refine(
      (html) => html.replace(/<[^>]*>/g, "").length <= 3000,
      "Project description is too long",
    ),
  techstack: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one technology."),
  link: z.string().trim().url("Please enter a valid URL.").or(z.literal("")),
});
