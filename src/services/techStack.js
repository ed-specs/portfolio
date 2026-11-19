import { createClient } from "@/lib/supabase/server";

export async function getTechStackRecord() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_stacks")
    .select("*")
    .order("category", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching tech stack records:", error.message);
    return data || [];
  }
}

export async function insertTechStacksBulk(rows) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tech_stacks")
    .insert(rows)
    .select();

  if (error) {
    // Handle PostgreSQL unique constraint violation (code 23505) cleanly
    if (error.code === "23505") {
      throw new Error(
        "One or more technologies already exist in this category.",
      );
    }
    throw new Error(error.message);
  }

  return data || [];
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
