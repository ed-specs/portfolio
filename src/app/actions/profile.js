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
  } = await supabase.getUser();

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
  const { data: currentProfile } = await supabase
    .from("profile")
    .select("avatarurl")
    .eq("id", user.id)
    .single();

  let finalavatarurl = currentProfile?.avatarurl || null;
  const file = formData.get("avatar");

  // then handle avatar upload
  if (file && file.size > 0) {
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
      const { publicUrl } = await uploadAvatar(file, user.id);

      // Clean up previous avatar if it exists
      if (currentProfile?.avatarurl) {
        const oldPath = currentProfile.avatarurl.split("/avatars/")[1];
        if (oldPath) {
          await deleteAvatarByPath(decodeURIComponent(oldPath));
        }
      }

      finalavatarurl = publicUrl;
    } catch (uploadError) {
      return {
        success: false,
        error: "Failed to upload image. Please try again.",
      };
    }
  }

  //   then build payload to insert to database
  const dbPayload = {
    firstname: validData.firstname,
    middlename: validData.middlename || null,
    lastname: validData.lastname,
    email: validData.email,
    phone: validData.phone || null,
    birthdate: validData.birthdate || null,
    age: validData.age,
    address: validData.address || null,
    avatarurl: validData.avatarurl,
  };

  try {
    const updateRecord = await updateProfileRecord(user.id, dbPayload);

    // then clear cache to render changes
    revalidatePath("/");
    revalidatePath("/admin/profile");

    return { success: true, data: updateRecord };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
