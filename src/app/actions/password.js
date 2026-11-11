"use server";

import { createClient } from "@/lib/supabase/server";
import { ChangePasswordSchema } from "@/lib/validation/password";

export async function ChangePasswordAction(rawPwd) {
  const validation = ChangePasswordSchema.safeParse(rawPwd);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { currentPassword, newPassword } = validation.data;

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Unauthorized. Please log in first." };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return {
      success: false,
      error: verifyError.message || "Current password is incorrect.",
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return {
      success: false,
      error: updateError.message || "Failed to update password.",
    };
  }

  return { success: true };
}
