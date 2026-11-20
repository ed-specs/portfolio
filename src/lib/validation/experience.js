import { z } from "zod";

export const experienceSchema = z
  .object({
    role: z
      .string()
      .trim()
      .min(1, "Work Experience / Job Title is required.")
      .max(100, "Work Experience / Job Title is too long."),
    company: z
      .string()
      .trim()
      .min(1, "Company / Organization is required.")
      .max(100, "Company / Organzation is too long."),
    description: z
      .string()
      .trim()
      .min(1, "Description is required.")
      .max(10000, "Formatted HTML is too long")
      .refine(
        (html) => html.replace(/<[^>]*>/g, "").trim().length > 0,
        "Project description is required.",
      )
      .refine(
        (html) => html.replace(/<[^>]*>/g, "").length <= 3000,
        "Project description is too long",
      ),
    start_date: z.string().min(1, "Start date is required."),
    end_date: z.string().optional().nullable(),
    is_current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.is_current && !data.end_date) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required unless you currently work here.",
      path: ["end_date"],
    },
  )
  .refine(
    (data) => {
      if (!data.is_current && data.end_date && data.start_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    {
      message: "End date cannot be earlier than the start date.",
      path: ["end_date"],
    },
  );
