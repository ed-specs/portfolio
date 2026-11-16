"use server";

import { createClient } from "../../lib/supabase/server";
import { signInSchema } from "../../lib/validation/auth";
import { revalidatePath } from "next/cache";

export async function SignInAction({ email, password }) {
  // 1. validate rules on the zod
  const validation = signInSchema.safeParse({ email, password });

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const validData = validation.data;

  //   2. check credentials on supabase
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validData.email,
    password: validData.password,
  });

  if (error) {
    return { success: false, error: "Invalid email or password." };
  }

  return { success: true };
}

export async function SignOutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: "Failed to sign out. Please try again." };
  }

  revalidatePath("/admin", "layout");
  return { success: true };
}
