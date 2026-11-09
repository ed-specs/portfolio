"use server";

import { createClient } from "../../lib/supabase/server";
import { signInSchema } from "../../lib/validation/auth";

export async function SignInAction({ rawFormData }) {
  // 1. validate rules on the zod
  const validationResult = signInSchema.safeParse({ rawFormData });

  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message };
  }

  //   2. check credentials on supabase
  const supabase = await createClient();
  const { error } = await supabase.auth.SignInWithpassword({
    email: check.auth.email,
    password: check.auth.password,
  });

  if (error) {
    return { error: "Invalid email or password." };
  }

  return { success: true };
}
