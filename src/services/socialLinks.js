// src/services/socialLinks.js
import { createClient } from "@/lib/supabase/server";

export async function getSocialLinksRecord() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching social links:", error.message);
    return [];
  }

  return data || [];
}

export async function insertSocialLinkRecord(linkData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("social_links")
    .insert(linkData)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("You have already added a link for this platform.");
    }
    throw new Error(error.message);
  }

  return data;
}

export async function deleteSocialLinkRecord(linkId, userId) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("social_links")
    .delete()
    .eq("id", linkId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}
