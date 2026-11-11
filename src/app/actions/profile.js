"use server";

import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/profile";
import {
  updateProfileRecord,
  uploadAvatar,
  deleteAvatarByPath,
} from "@/services/profile";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 5 * 1024 * 1024; //5mb max
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function UpdateProfileAction(formData) {
  const supabase = await createClient();

  // authenticate user first
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized access." };
  }

  // then extract the formData
  const rawAge = formData.get("age");
  const rawData = {
    firstname: formData.get("firstname"),
    middlename: formData.get("middlename"),
    lastname: formData.get("lastname"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    birthdate: formData.get("birthdate"),
    age: rawAge ? parseInt(rawAge, 10) : null,
    address: formData.get("address"),
  };

  // then validate
  const validation = profileSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }
  const validData = validation.data;

  // then check for existing avatar
  const { data: currentProfile, error: profileError } = await supabase
    .from("profile")
    .select("avatarurl")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile before update:", profileError.message);
    return { success: false, error: "Could not load your current profile." };
  }

  const previousAvatarUrl = currentProfile?.avatarurl || null;
  let finalAvatarUrl = previousAvatarUrl;
  const file = formData.get("avatar");
  const hasAvatarFile = file instanceof File && file.size > 0;
  const removeAvatar = formData.get("removeAvatar") === "true";
  let uploadedAvatarPath = null;

  // then handle avatar upload
  if (hasAvatarFile) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Only JPG, PNG, and WebP images are allowed.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "Profile photo must be 5MB or less." };
    }

    try {
      const { publicUrl, filePath } = await uploadAvatar(user.id, file);
      finalAvatarUrl = publicUrl;
      uploadedAvatarPath = filePath;
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      return {
        success: false,
        error: "Failed to upload image. Please try again.",
      };
    }
  } else if (removeAvatar) {
    finalAvatarUrl = null;
  }

  const dbPayload = {
    firstname: validData.firstname,
    middlename: validData.middlename || null,
    lastname: validData.lastname,
    email: validData.email,
    phone: validData.phone || null,
    birthdate: validData.birthdate || null,
    age: validData.age,
    address: validData.address || null,
    avatarurl: finalAvatarUrl,
  };

  let updateRecord;
  try {
    updateRecord = await updateProfileRecord(user.id, dbPayload);
  } catch (err) {
    console.error("Error saving profile:", err);
    if (uploadedAvatarPath) {
      try {
        await deleteAvatarByPath(uploadedAvatarPath);
      } catch (cleanupError) {
        console.error("Error cleaning up unused profile photo:", cleanupError);
      }
    }
    return { success: false, error: "Could not save your profile." };
  }

  const avatarChanged = finalAvatarUrl !== previousAvatarUrl;
  if (avatarChanged && previousAvatarUrl) {
    const previousAvatarPath = previousAvatarUrl.split("/avatars/")[1];
    if (previousAvatarPath) {
      try {
        await deleteAvatarByPath(decodeURIComponent(previousAvatarPath));
      } catch (error) {
        console.error("Error deleting previous profile photo:", error);
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/admin/profile");

  return { success: true, data: updateRecord };
}
