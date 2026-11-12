import { createClient as createServerClient } from "@/lib/supabase/server";

export async function getAboutRecord() {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("about")
    .select("content")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching about me:", error.message);
    return "";
  }

  return data?.content || "";
}

export async function updateAboutRecord(userId, updatedContext) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("about")
    .upsert({
      id: userId,
      content: updatedContext,
    })
    .select("content")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.content;
}
