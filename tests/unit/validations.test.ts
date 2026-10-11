import { describe, it, expect } from "vitest";
import {
  TextMessageSchema,
  MatchingFiltersSchema,
  CreateReportSchema,
  PasswordSchema,
} from "../../src/lib/validations";

describe("Input Validation Schemas", () => {
  it("enforces password minimum length of 8 and maximum of 128", () => {
    expect(PasswordSchema.safeParse("1234567").success).toBe(false);
    expect(PasswordSchema.safeParse("12345678").success).toBe(true);
    expect(PasswordSchema.safeParse("a".repeat(128)).success).toBe(true);
    expect(PasswordSchema.safeParse("a".repeat(129)).success).toBe(false);
  });

  it("enforces text message limits (1 to 500 characters)", () => {
    expect(TextMessageSchema.safeParse({ content: "" }).success).toBe(false);
    expect(TextMessageSchema.safeParse({ content: "   " }).success).toBe(false);
    expect(TextMessageSchema.safeParse({ content: "Hello stranger!" }).success).toBe(true);
    expect(TextMessageSchema.safeParse({ content: "a".repeat(500) }).success).toBe(true);
    expect(TextMessageSchema.safeParse({ content: "a".repeat(501) }).success).toBe(false);
  });

  it("validates report category enum and descriptions", () => {
    expect(
      CreateReportSchema.safeParse({
        reportedUserId: "usr_123",
        category: "HARASSMENT",
        description: "Sent abusive messages",
      }).success
    ).toBe(true);

    expect(
      CreateReportSchema.safeParse({
        reportedUserId: "usr_123",
        category: "INVALID_CATEGORY",
      }).success
    ).toBe(false);
  });

  it("validates matching filters schema", () => {
    const validFilters = {
      preferredCountries: ["US", "GB"],
      preferredLanguages: ["en", "es"],
      interests: ["gaming", "coding"],
    };
    expect(MatchingFiltersSchema.safeParse(validFilters).success).toBe(true);
  });
});
