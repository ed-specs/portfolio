// src/services/achievements.js
import { createClient } from "@/lib/supabase/server";

export async function getAchievementsRecord() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("issue_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching achievements:", error.message);
    return [];
  }

  return data || [];
}

export async function getAchievementById(achievementId, userId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("id", achievementId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function insertAchievementRecord(achievementData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("achievements")
    .insert(achievementData)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateAchievementRecord(achievementId, userId, updates) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("achievements")
    .update(updates)
    .eq("id", achievementId)
    .eq("user_id", userId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    throw new Error(
      "Achievement not found or you do not have permission to update it.",
    );
  }

  return data;
}

export async function deleteAchievementRecord(achievementId, userId) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("achievements")
    .delete()
    .eq("id", achievementId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

// --- STORAGE HELPERS ---

export async function uploadCertificatePdf(userId, file) {
  const supabase = await createClient();
  const filePath = `${userId}/${crypto.randomUUID()}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("certificates")
    .upload(filePath, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("certificates").getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteCertificatePdf(publicUrl) {
  if (!publicUrl) return;

  const supabase = await createClient();
  const marker = "/storage/v1/object/public/certificates/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;

  const storagePath = decodeURIComponent(
    publicUrl.slice(idx + marker.length).split("?")[0],
  );

  const { error } = await supabase.storage
    .from("certificates")
    .remove([storagePath]);

  if (error) throw new Error(error.message);
}
