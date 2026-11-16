import { createClient as createServerClient } from "@/lib/supabase/server";

export async function getExperienceRecord() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .order("is_current", { ascending: false })
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching experiences:", error.message);
    return [];
  }

  return data || [];
}

export async function insertExperienceRecord(experienceData) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("experiences")
    .insert(experienceData)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateExperienceRecord(
  userId,
  experienceId,
  experienceData,
) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("experiences")
    .update(experienceData)
    .eq("id", experienceId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteExperienceRecord(experienceId, userId) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("experiences")
    .delete()
    .eq("id", experienceId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
