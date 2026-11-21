// src/app/actions/achievements.js
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  achievementSchema,
  MAX_CERT_SIZE,
  ALLOWED_CERT_TYPES,
} from "@/lib/validation/achievements";
import {
  getAchievementById,
  insertAchievementRecord,
  updateAchievementRecord,
  deleteAchievementRecord,
  uploadCertificatePdf,
  deleteCertificatePdf,
} from "@/services/achievements";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

function revalidateAchievementPaths() {
  revalidatePath("/");
  revalidatePath("/admin/achievements");
}

export async function createAchievementAction(formData) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const validation = achievementSchema.safeParse({
    title: formData.get("title"),
    issuer: formData.get("issuer") || "",
    issue_date: formData.get("issue_date") || "",
    certificate_url: formData.get("certificate_url") || "",
  });

  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.issues[0]?.message || "Invalid certificate details.",
    };
  }

  const fileValue = formData.get("certificate_file");
  const file =
    fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  if (file && !ALLOWED_CERT_TYPES.includes(file.type)) {
    return { success: false, error: "Only PDF files are allowed." };
  }

  if (file && file.size > MAX_CERT_SIZE) {
    return { success: false, error: "Certificate PDF must be 5MB or less." };
  }

  // Require at least a URL or an uploaded PDF
  if (!validation.data.certificate_url && !file) {
    return {
      success: false,
      error: "Please provide either a Certificate URL or upload a PDF.",
    };
  }

  let uploadedFileUrl = null;
  if (file) {
    try {
      uploadedFileUrl = await uploadCertificatePdf(user.id, file);
    } catch {
      return { success: false, error: "Failed to upload certificate PDF." };
    }
  }

  try {
    const newAchievement = await insertAchievementRecord({
      user_id: user.id,
      title: validation.data.title,
      issuer: validation.data.issuer || null,
      issue_date: validation.data.issue_date || null,
      certificate_url: file ? null : validation.data.certificate_url || null,
      file_url: uploadedFileUrl,
    });

    revalidateAchievementPaths();
    return { success: true, data: newAchievement };
  } catch {
    if (uploadedFileUrl) {
      await deleteCertificatePdf(uploadedFileUrl).catch(() => {});
    }
    return { success: false, error: "Failed to save achievement." };
  }
}

export async function updateAchievementAction(achievementId, formData) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const existing = await getAchievementById(achievementId, user.id);
  if (!existing) {
    return { success: false, error: "Achievement not found." };
  }

  const validation = achievementSchema.safeParse({
    title: formData.get("title"),
    issuer: formData.get("issuer") || "",
    issue_date: formData.get("issue_date") || "",
    certificate_url: formData.get("certificate_url") || "",
  });

  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.issues[0]?.message || "Invalid certificate details.",
    };
  }

  const mode = formData.get("source_mode"); // "url" or "pdf"
  const fileValue = formData.get("certificate_file");
  const newFile =
    fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  if (newFile && !ALLOWED_CERT_TYPES.includes(newFile.type)) {
    return { success: false, error: "Only PDF files are allowed." };
  }

  if (newFile && newFile.size > MAX_CERT_SIZE) {
    return { success: false, error: "Certificate PDF must be 5MB or less." };
  }

  if (mode === "url" && !validation.data.certificate_url) {
    return { success: false, error: "Please enter a valid Certificate URL." };
  }

  if (mode === "pdf" && !newFile && !existing.file_url) {
    return { success: false, error: "Please upload a Certificate PDF." };
  }

  let uploadedFileUrl = null;
  if (mode === "pdf" && newFile) {
    try {
      uploadedFileUrl = await uploadCertificatePdf(user.id, newFile);
    } catch {
      return { success: false, error: "Failed to upload new certificate PDF." };
    }
  }

  const nextFileUrl =
    mode === "pdf" ? uploadedFileUrl || existing.file_url : null;
  const nextCertUrl = mode === "url" ? validation.data.certificate_url : null;

  try {
    const updated = await updateAchievementRecord(achievementId, user.id, {
      title: validation.data.title,
      issuer: validation.data.issuer || null,
      issue_date: validation.data.issue_date || null,
      certificate_url: nextCertUrl,
      file_url: nextFileUrl,
    });

    // Clean up old Storage PDF if switched to URL or replaced with a new PDF
    if (existing.file_url && (mode === "url" || uploadedFileUrl)) {
      await deleteCertificatePdf(existing.file_url).catch(() => {});
    }

    revalidateAchievementPaths();
    return { success: true, data: updated };
  } catch (err) {
    if (uploadedFileUrl) {
      await deleteCertificatePdf(uploadedFileUrl).catch(() => {});
    }
    return {
      success: false,
      error: err.message || "Failed to update achievement.",
    };
  }
}

export async function deleteAchievementAction(achievementId) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const existing = await getAchievementById(achievementId, user.id);
  if (!existing) {
    return { success: false, error: "Achievement not found." };
  }

  try {
    await deleteAchievementRecord(achievementId, user.id);

    if (existing.file_url) {
      await deleteCertificatePdf(existing.file_url).catch(() => {});
    }

    revalidateAchievementPaths();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to delete achievement.",
    };
  }
}
