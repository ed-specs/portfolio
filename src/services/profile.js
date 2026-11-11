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

  if (error) {
    console.error("Error updating profile:", error.message);
  }
  return data;
}

// upload avatar
export async function uploadAvatar(userId, file) {
  const supabase = await createServerClient();
  const uniqueName = crypto.randomUUID();
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/avatar-${uniqueName}.${fileExt}`;

  const { error } = await supabase.from("avatars").upload(filePath, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    console.error("Error uploading avatar:", error.message);
  }

  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return { filePath, publicUrl: urlData.publicUrl };
}

// delete avatar
export async function deleteAvatarByPath(filePath) {
  if (!filePath) return;
  const supabase = await createServerClient();
  await supabase.storage.from("avatars").remove([filePath]);
}
