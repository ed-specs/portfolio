// src/app/actions/techStack.js
"use server";

import { createClient } from "@/lib/supabase/server";
import {
  categorySchema,
  bulkTechStackSchema,
  updateTechItemSchema,
} from "@/lib/validation/techStack";
import {
  insertCategoryRecord,
  updateCategoryRecord,
  deleteCategoryRecord,
  insertTechStacksBulk,
  updateTechStackRecord,
  deleteTechStackRecord,
} from "@/services/techStack";
import { revalidatePath } from "next/cache";

// --- CATEGORY ACTIONS ---

export async function createCategoryAction(rawData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return { success: false, error: "Unauthorized access." };

  const validation = categorySchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const newCategory = await insertCategoryRecord({
      user_id: user.id,
      name: validation.data.name,
    });

    revalidatePath("/");
    revalidatePath("/admin/tech-stacks");
    return { success: true, data: newCategory };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to create category.",
    };
  }
}

export async function updateCategoryAction(categoryId, rawData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return { success: false, error: "Unauthorized access." };

  const validation = categorySchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const updated = await updateCategoryRecord(
      categoryId,
      user.id,
      validation.data.name,
    );

    revalidatePath("/");
    revalidatePath("/admin/tech-stacks");
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to update category.",
    };
  }
}

export async function deleteCategoryAction(categoryId) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return { success: false, error: "Unauthorized access." };

  try {
    await deleteCategoryRecord(categoryId, user.id);

    revalidatePath("/");
    revalidatePath("/admin/tech-stacks");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to delete category.",
    };
  }
}

// --- TECH STACK ITEM ACTIONS ---

export async function createTechStacksAction(rawData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return { success: false, error: "Unauthorized access." };

  const validation = bulkTechStackSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const uniqueNames = Array.from(new Set(validation.data.items));
  const rowsToInsert = uniqueNames.map((name) => ({
    user_id: user.id,
    category_id: validation.data.category_id,
    name,
  }));

  try {
    const inserted = await insertTechStacksBulk(rowsToInsert);

    revalidatePath("/");
    revalidatePath("/admin/tech-stacks");
    return { success: true, data: inserted };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to add tech stack.",
    };
  }
}

export async function updateTechStackAction(techId, rawData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return { success: false, error: "Unauthorized access." };

  const validation = updateTechItemSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const updated = await updateTechStackRecord(
      techId,
      user.id,
      validation.data.name,
    );

    revalidatePath("/");
    revalidatePath("/admin/tech-stacks");
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to update technology.",
    };
  }
}

export async function deleteTechStackAction(techId) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user)
    return { success: false, error: "Unauthorized access." };

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
