import { createClient as createServerClient } from "@/lib/supabase/server";

// read
export async function getProfileRecord() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching data:", error.message);
    return null;
  }

  return data;
}

// update
export async function updateProfileRecord(userId, profileData) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from("profile")
    .update(profileData)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// upload avatar
export async function uploadAvatar(userId, file) {
  const supabase = await createServerClient();
  const uniqueName = crypto.randomUUID();
  const fileExt =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const filePath = `${userId}/avatar-${uniqueName}.${fileExt}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return { filePath, publicUrl: urlData.publicUrl };
}

// delete avatar
export async function deleteAvatarByPath(filePath) {
  if (!filePath) return;
  const supabase = await createServerClient();
  const { error } = await supabase.storage.from("avatars").remove([filePath]);
  if (error) throw error;
}

// Add to src/services/profile.js
export async function uploadResumeFile(userId, file) {
  const supabase = await createServerClient();
  const filePath = `${userId}/resume.pdf`;

  const { error: uploadError } = await supabase.storage
    .from("resumes")
    .upload(filePath, file, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("resumes").getPublicUrl(filePath);

  // Append timestamp query param so browsers bypass cached old PDFs after re-upload
  const publicUrlWithVersion = `${data.publicUrl}?v=${Date.now()}`;

  const { data: updatedProfile, error: updateError } = await supabase
    .from("profile")
    .update({ resume_url: publicUrlWithVersion })
    .eq("id", userId)
    .select()
    .single();

  if (updateError) throw new Error(updateError.message);
  return updatedProfile;
}

export async function removeResumeFile(userId) {
  const supabase = await createServerClient();
  const filePath = `${userId}/resume.pdf`;

  await supabase.storage.from("resumes").remove([filePath]);

  const { data: updatedProfile, error } = await supabase
    .from("profile")
    .update({ resume_url: null })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return updatedProfile;
}
