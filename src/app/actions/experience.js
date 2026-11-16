"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { experienceSchema } from "@/lib/validation/experience";
import {
  insertExperienceRecord,
  updateExperienceRecord,
  deleteExperienceRecord,
} from "@/services/experience";

export async function createExperienceAction(formData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized access." };
  }

  const validation = await experienceSchema.safeParse(formData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const newExperience = await insertExperienceRecord({
      user_id: user.id,
      role: validation.data.role,
      company: validation.data.company,
      description: validation.data.description,
      start_date: validation.data.start_date,
      end_date: validation.data.is_current ? null : validation.data.end_date,
      is_current: validation.data.is_current,
    });

    revalidatePath("/");
    revalidatePath("/admin/experience");

    return { success: true, data: newExperience };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to add experience.",
    };
  }
}

export async function updateExperienceAction(experienceId, formData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized access." };
  }

  const validation = await experienceSchema.safeParse(formData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const updateExperience = updateExperienceRecord(experienceId, user.id, {
      role: validation.data.role,
      company: validation.data.company,
      description: validation.data.description,
      start_date: validation.data.start_date,
      end_date: validation.data.is_current ? null : validation.data.end_date,
      is_current: validation.data.is_current,
    });

    revalidatePath("/");
    revalidatePath("/admin/experience");

    return { success: true, data: updateExperience };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to update experience.",
    };
  }
}

export async function deleteExperienceAction(experienceId) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized access." };
  }

  try {
    await deleteExperienceRecord(experienceId, user.id);

    revalidatePath("/");
    revalidatePath("/admin/experience");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to delete experience.",
    };
  }
}
