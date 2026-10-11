import { z } from "zod";

/**
 * Normalizes a username for case-insensitive uniqueness.
 * Trims surrounding whitespace and converts to lowercase.
 */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Validates username format:
 * - 3 to 20 characters
 * - Letters (a-z, A-Z), numbers (0-9), and underscores (_) only
 */
export const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

export const UsernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must not exceed 20 characters")
  .regex(usernameRegex, "Username can only contain letters, numbers, and underscores");

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters");

export const RegisterInputSchema = z
  .object({
    username: UsernameSchema,
    password: PasswordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the Community Guidelines and Terms of Service to proceed",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const MatchingFiltersSchema = z.object({
  preferredCountries: z.array(z.string().length(2).toUpperCase()).max(10).default([]),
  preferredLanguages: z.array(z.string().min(2).max(5)).max(10).default([]),
  interests: z.array(z.string().trim().min(1).max(30)).max(15).default([]),
});

export type MatchingFilters = z.infer<typeof MatchingFiltersSchema>;

export const TextMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(500, "Message cannot exceed 500 characters"),
});

export type TextMessageInput = z.infer<typeof TextMessageSchema>;

export const ReportCategoryEnum = z.enum([
  "HARASSMENT",
  "SPAM",
  "INAPPROPRIATE_BEHAVIOR",
  "IMPERSONATION",
  "THREATS",
  "OTHER",
]);

export const CreateReportSchema = z.object({
  reportedUserId: z.string().min(1, "Reported user ID is required"),
  matchSessionId: z.string().optional(),
  category: ReportCategoryEnum,
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;

export const CreateBlockSchema = z.object({
  blockedUserId: z.string().min(1, "Target user ID is required"),
  matchSessionId: z.string().optional(),
});

export type CreateBlockInput = z.infer<typeof CreateBlockSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });
