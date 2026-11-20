"use server";

import DOMPurify from "isomorphic-dompurify";
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

  // Sanitize HTML before saving to Supabase
  const cleanHtml = validation.data.content
    ? DOMPurify.sanitize(validation.data.content, {
        ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "ol", "li"],
        ALLOWED_ATTR: [],
      })
    : null;

  try {
    const updatedContent = await updateAboutRecord(user.id, cleanHtml);
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
