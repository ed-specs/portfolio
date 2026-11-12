import { z } from "zod";

export const aboutSchema = z.object({
  content: z
    .string()
    .trim()
    .max(3000, "Input cannot exceed 3,000 characters.")
    .optional()
    .or(z.literal("")),
});
