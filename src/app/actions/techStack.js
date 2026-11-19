"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  insertTechStacksBulk,
  deleteTechStackRecord,
} from "@/services/techStack";
import { techStackSchema } from "@/lib/validation/techStack";

export async function createTechStacksAction(rawData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (!user || authError)
    return { success: false, error: "Unauthorized access" };

  const validation = techStackSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const uniqueNames = Array.from(new Set(validation.data.items));
  const rowsToInsert = uniqueNames.map((name) => ({
    user_id: user.id,
    category: validation.data.category,
    name,
  }));

  try {
    const insertedRows = await insertTechStacksBulk(rowsToInsert);

    // 5. Revalidate & Return
    revalidatePath("/");
    revalidatePath("/admin/tech-stacks");

    return { success: true, data: insertedRows };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to add tech stacks.",
    };
  }
}

export async function deleteTechStackAction(techId) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    await deleteTechStackRecord(techId, user.id);

    revalidatePath("/");
    revalidatePath("/admin/tech-stacks");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to delete technology.",
    };
  }
}
