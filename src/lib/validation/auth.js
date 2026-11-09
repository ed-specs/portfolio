import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Invalid email address.")
    .max(255, "Email must be less than 255 characters."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be less than 72 characters."),
});
