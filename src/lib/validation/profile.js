import { z } from "zod";

export const profileSchema = z.object({
  firstname: z.string().trim().min(1, "First name is required."),
  middlename: z.string().trim().optional().or(z.literal("")),
  lastname: z.string().trim().min(1, "Last name is required."),
  email: z
    .string()
    .trim()
    .email("Invalid email address format.")
    .min(1, "Email is required"),
  phone: z.string().trim().optional().or(z.literal("")),
  birthdate: z.string().optional().or(z.literal("")),
  age: z
    .number()
    .int()
    .min(0, "Age cannot be negative.")
    .max(120, "Please enter a valid age")
    .optional()
    .nullable(),
  address: z.string().trim().optional().or(z.literal("")),
});
