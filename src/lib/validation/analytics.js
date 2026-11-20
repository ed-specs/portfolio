// src/lib/validation/analytics.js
import { z } from "zod";

export const pageViewSchema = z.object({
  page_path: z.string().trim().min(1).max(100).startsWith("/"),
  referrer: z.string().trim().max(255).optional().nullable(),
  device_type: z.enum(["mobile", "desktop"]),
});
