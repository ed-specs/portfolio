import { z } from "zod";

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be atleast 8 characters long.")
      .max(72, "Password is too long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((pwd) => pwd.newPassword === pwd.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmpassword"],
  })
  .refine((pwd) => pwd.newPassword !== pwd.currentPassword, {
    message: "New password cannot be the same as your current password",
    path: ["newpassword"],
  });
