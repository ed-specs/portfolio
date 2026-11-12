"use server";

import { createClient } from "@/lib/supabase/server";
import { aboutSchema } from "@/lib/validation/about";
import { updateAboutRecord } from "@/services/about";
import { revalidatePath } from "next/cache";

export async function updateAboutAction(formData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized access." };
  }
  const validation = aboutSchema.safeParse(formData);

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const cleanText = validation.data.content || null;

  try {
    const updatedContent = await updateAboutRecord(user.id, cleanText);
    revalidatePath("/admin/about-me");
    revalidatePath("/");

    return { success: true, data: updatedContent || "" };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to update About Me.",
    };
  }
}
