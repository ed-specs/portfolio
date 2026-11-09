"use server";

import { createClient } from "../../lib/supabase/server";
import { signInSchema } from "../../lib/validation/auth";

export async function SignInAction({ rawFormData }) {
  // 1. validate rules on the zod
  const validation = signInSchema.safeParse({ rawFormData });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { email, password } = validation.data;

  //   2. check credentials on supabase
  const supabase = await createClient();
  const { error } = await supabase.auth.SignInWithpassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: "Invalid email or password." };
  }

  return { success: true };
}
