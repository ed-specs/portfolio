import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  middleName: z.string().trim().optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z
    .string()
    .trim()
    .email("Invalid email address format.")
    .min(1, "Email is required"),
  phone: z.string().trim().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  age: z
    .number()
    .int()
    .min(0, "Age cannot be negative.")
    .max(120, "Please enter a valid age")
    .optional()
    .nullable(),
  address: z.string().trim().optional().or(z.literal("")),
});
