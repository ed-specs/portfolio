// src/app/actions/analytics.js
"use server";

import { createClient } from "@/lib/supabase/server";
import { pageViewSchema } from "@/lib/validation/analytics";
import { insertPageViewRecord } from "@/services/analytics";

function extractCleanReferrer(rawReferrer) {
  if (!rawReferrer) return "Direct";
  try {
    const url = new URL(rawReferrer);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

export async function recordPageViewAction(rawData) {
  // 1. Validate payload shape
  const validation = pageViewSchema.safeParse(rawData);
  if (!validation.success) {
    return { success: false };
  }

  // 2. Exclude owner's own visits when logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { success: true, skipped: true };
  }

  // 3. Insert anonymous view
  try {
    await insertPageViewRecord({
      page_path: validation.data.page_path,
      referrer: extractCleanReferrer(validation.data.referrer),
      device_type: validation.data.device_type,
    });

    return { success: true };
  } catch {
    // Fail silently so a tracking hiccup never affects the visitor's experience
    return { success: false };
  }
}
