"use server";

import DOMPurify from "isomorphic-dompurify";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validation/projects";
import {
  deleteProjectIcon,
  deleteProjectRecord,
  getProjectRecord,
  insertProjectRecord,
  updateProjectRecord,
  uploadIconRecord,
} from "@/services/projects";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
];

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

function parseProjectFormData(formData) {
  if (!(formData instanceof FormData)) {
    return { success: false, error: "Invalid project form data." };
  }

  const rawTechstack = formData.get("techstack");
  let techstack = [];

  if (rawTechstack !== null) {
    if (typeof rawTechstack !== "string") {
      return { success: false, error: "Invalid project tech stack." };
    }

    try {
      techstack = JSON.parse(rawTechstack);
    } catch {
      return { success: false, error: "Invalid project tech stack." };
    }
  }

  const validation = projectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    techstack,
    link: formData.get("link") || "",
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid project details.",
    };
  }

  const cleanDescription = DOMPurify.sanitize(validation.data.description, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });

  const iconValue = formData.get("icon");
  if (iconValue !== null && !(iconValue instanceof File)) {
    return { success: false, error: "Invalid project icon." };
  }

  const file =
    iconValue instanceof File && iconValue.size > 0 ? iconValue : null;
  if (file && !ALLOWED_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Only JPG, PNG, WebP, or SVG icons are allowed.",
    };
  }
  if (file && file.size > MAX_FILE_SIZE) {
    return { success: false, error: "Icon size must be 2MB or less." };
  }

  return {
    success: true,
    data: { ...validation.data, description: cleanDescription, file },
  };
}

function parseProjectId(projectId) {
  if (typeof projectId !== "string" || !projectId.trim()) return null;
  return projectId.trim();
}

function revalidateProjectPaths() {
  revalidatePath("/");
  revalidatePath("/admin/projects");
}

export async function createProjectAction(formData) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const input = parseProjectFormData(formData);
  if (!input.success) return input;

  let iconUrl = null;
  if (input.data.file) {
    try {
      iconUrl = await uploadIconRecord(user.id, input.data.file);
    } catch (error) {
      console.error("Error uploading project icon:", error);
      return { success: false, error: "Failed to upload project icon." };
    }
  }

  let newProject;
  try {
    newProject = await insertProjectRecord({
      user_id: user.id,
      title: input.data.title,
      description: input.data.description,
      techstack: input.data.techstack,
      link: input.data.link || null,
      iconurl: iconUrl,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    if (iconUrl) {
      try {
        await deleteProjectIcon(iconUrl);
      } catch (cleanupError) {
        console.error("Error cleaning up unused project icon:", cleanupError);
        return {
          success: false,
          error:
            "Project could not be created, and its uploaded icon could not be cleaned up.",
        };
      }
    }
    return { success: false, error: "Failed to create project." };
  }

  revalidateProjectPaths();
  return { success: true, data: newProject };
}

export async function updateProjectAction(projectId, formData) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const id = parseProjectId(projectId);
  if (!id) return { success: false, error: "Invalid project." };

  const input = parseProjectFormData(formData);
  if (!input.success) return input;

  let existingProject;
  try {
    existingProject = await getProjectRecord(id, user.id);
  } catch (error) {
    console.error("Error fetching project before update:", error);
    return { success: false, error: "Could not load the project." };
  }
  if (!existingProject) {
    return { success: false, error: "Project not found." };
  }

  let newIconUrl = null;
  if (input.data.file) {
    try {
      newIconUrl = await uploadIconRecord(user.id, input.data.file);
    } catch (error) {
      console.error("Error uploading project icon:", error);
      return { success: false, error: "Failed to upload project icon." };
    }
  }

  let updatedProject;
  try {
    updatedProject = await updateProjectRecord(id, user.id, {
      title: input.data.title,
      description: input.data.description,
      techstack: input.data.techstack,
      link: input.data.link || null,
      iconurl: newIconUrl || existingProject.iconurl || null,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    if (newIconUrl) {
      try {
        await deleteProjectIcon(newIconUrl);
      } catch (cleanupError) {
        console.error("Error cleaning up unused project icon:", cleanupError);
        return {
          success: false,
          error:
            "Project could not be updated, and its uploaded icon could not be cleaned up.",
        };
      }
    }
    return { success: false, error: "Failed to update project." };
  }

  let warning;
  if (newIconUrl && existingProject.iconurl) {
    try {
      await deleteProjectIcon(existingProject.iconurl);
    } catch (error) {
      console.error("Error deleting replaced project icon:", error);
      warning = "Project updated, but its previous icon could not be removed.";
    }
  }

  revalidateProjectPaths();
  return { success: true, data: updatedProject, ...(warning && { warning }) };
}

export async function deleteProjectAction(projectId) {
  const user = await getAuthenticatedUser();
  if (!user) return { success: false, error: "Unauthorized access." };

  const id = parseProjectId(projectId);
  if (!id) return { success: false, error: "Invalid project." };

  let project;
  try {
    project = await getProjectRecord(id, user.id);
  } catch (error) {
    console.error("Error fetching project before deletion:", error);
    return { success: false, error: "Could not load the project." };
  }
  if (!project) {
    return { success: false, error: "Project not found." };
  }

  try {
    await deleteProjectRecord(id, user.id);
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: "Failed to delete project." };
  }

  let warning;
  if (project.iconurl) {
    try {
      await deleteProjectIcon(project.iconurl);
    } catch (error) {
      console.error("Error deleting project icon:", error);
      warning = "Project deleted, but its icon could not be removed.";
    }
  }

  revalidateProjectPaths();
  return { success: true, ...(warning && { warning }) };
}
