import { createClient } from "@/lib/supabase/server";

export async function getCategoriesWithStacks() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_categories")
    .select("*, tech_stacks(*)")
    .order("created_at", { ascending: true }) // Oldest category first (Frontend -> Backend)
    .order("created_at", { referencedTable: "tech_stacks", ascending: true }); // Oldest chip first

  if (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }

  return data || [];
}

export async function insertCategoryRecord(categoryData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_categories")
    .insert(categoryData)
    .select()
    .single();

  if (error) {
    if (error.code === "23505")
      throw new Error("This category already exists.");
    throw new Error(error.message);
  }

  // Return with an empty tech_stacks array so UI state matches getCategoriesWithStacks()
  return { ...data, tech_stacks: [] };
}

export async function updateCategoryRecord(categoryId, userId, name) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_categories")
    .update({ name })
    .eq("id", categoryId)
    .eq("user_id", userId)
    .select("*, tech_stacks(*)")
    .single();

  if (error) {
    if (error.code === "23505")
      throw new Error("Another category already uses this name.");
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCategoryRecord(categoryId, userId) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tech_categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

// Tech Stack Items CRUD
export async function insertTechStacksBulk(rows) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_stacks")
    .insert(rows)
    .select();

  if (error) {
    if (error.code === "23505") {
      throw new Error(
        "One or more technologies already exist in this category.",
      );
    }
    throw new Error(error.message);
  }

  return data || [];
}

export async function updateTechStackRecord(techId, userId, name) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_stacks")
    .update({ name })
    .eq("id", techId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    if (error.code === "23505")
      throw new Error("This technology already exists in this category.");
    throw new Error(error.message);
  }

  return data;
}

export async function deleteTechStackRecord(techId, userId) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tech_stacks")
    .delete()
    .eq("id", techId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
