// src/lib/validation/achievements.js
import { z } from "zod";

export const achievementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Certificate title is required.")
    .max(150, "Certificate title cannot exceed 150 characters."),
  issuer: z
    .string()
    .trim()
    .max(100, "Issuer name cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),
  issue_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid issue date.")
    .optional()
    .or(z.literal("")),
  certificate_url: z
    .string()
    .trim()
    .url("Please enter a valid URL (including https://).")
    .optional()
    .or(z.literal("")),
});

export const MAX_CERT_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_CERT_TYPES = ["application/pdf"];
