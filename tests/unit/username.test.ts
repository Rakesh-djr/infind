import { describe, it, expect } from "vitest";
import { normalizeUsername, UsernameSchema } from "../../src/lib/validations";

describe("Username Normalization and Validation", () => {
  it("normalizes usernames to lowercase", () => {
    expect(normalizeUsername("Buddy123")).toBe("buddy123");
    expect(normalizeUsername("ALEX_DEV")).toBe("alex_dev");
    expect(normalizeUsername("Sam_Connect")).toBe("sam_connect");
  });

  it("trims surrounding whitespace during normalization", () => {
    expect(normalizeUsername("  spaced_user  ")).toBe("spaced_user");
    expect(normalizeUsername("\tUser_123\n")).toBe("user_123");
  });

  it("treats variations of the same name identically", () => {
    const userA = normalizeUsername("PlayerOne");
    const userB = normalizeUsername("playerone");
    const userC = normalizeUsername("  PLAYERONE  ");
    expect(userA).toBe(userB);
    expect(userB).toBe(userC);
  });

  it("accepts valid usernames between 3 and 20 characters with underscores", () => {
    expect(UsernameSchema.safeParse("user_123").success).toBe(true);
    expect(UsernameSchema.safeParse("abc").success).toBe(true);
    expect(UsernameSchema.safeParse("twenty_char_username").success).toBe(true);
  });

  it("rejects usernames shorter than 3 characters", () => {
    const result = UsernameSchema.safeParse("ab");
    expect(result.success).toBe(false);
  });

  it("rejects usernames longer than 20 characters", () => {
    const result = UsernameSchema.safeParse("this_username_is_way_too_long");
    expect(result.success).toBe(false);
  });

  it("rejects usernames with invalid symbols or spaces", () => {
    expect(UsernameSchema.safeParse("user@name").success).toBe(false);
    expect(UsernameSchema.safeParse("user name").success).toBe(false);
    expect(UsernameSchema.safeParse("user-name").success).toBe(false);
    expect(UsernameSchema.safeParse("user!").success).toBe(false);
  });
});
