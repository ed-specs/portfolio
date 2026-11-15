import { createClient as createServerClient } from "@/lib/supabase/server";

export async function getProjectsRecord() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("Error authenticating before fetching projects:", authError);
    throw new Error("Could not authenticate to load projects.");
  }
  if (!user) {
    throw new Error("Unauthorized access.");
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("createdat", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects.");
  }

  return data;
}

export async function getProjectRecord(projectId, userId) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("projects")
    .select("iconurl")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function insertProjectRecord(projectData) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("projects")
    .insert(projectData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function updateProjectRecord(projectId, userId, projectData) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("projects")
    .update(projectData)
    .eq("id", projectId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProjectRecord(projectId, userId) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function uploadIconRecord(userId, file) {
  const supabase = await createServerClient();
  const uniqueName = crypto.randomUUID();
  const fileExtensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  const fileExt = fileExtensions[file.type];
  if (!fileExt) throw new Error("Unsupported project icon type.");
  const filePath = `${userId}/icon-${uniqueName}.${fileExt}`;

  const { error } = await supabase.storage
    .from("project-icons")
    .upload(filePath, file, { upsert: false, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage
    .from("project-icons")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function deleteProjectIcon(iconUrl) {
  if (!iconUrl) return;

  const bucketPath = "/project-icons/";
  const pathname = new URL(iconUrl).pathname;
  const bucketIndex = pathname.indexOf(bucketPath);
  if (bucketIndex === -1) {
    throw new Error("Invalid project icon URL.");
  }

  const encodedFilePath = pathname.slice(bucketIndex + bucketPath.length);
  if (!encodedFilePath) {
    throw new Error("Invalid project icon URL.");
  }
  const filePath = decodeURIComponent(encodedFilePath);

  const supabase = await createServerClient();
  const { error } = await supabase.storage
    .from("project-icons")
    .remove([filePath]);
  if (error) throw new Error(error.message);
}
