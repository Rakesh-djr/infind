import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  hashSessionToken,
} from "../../src/lib/auth";

describe("Authentication & Cryptographic Utilities", () => {
  it("hashes password with Argon2id and verifies correctly", async () => {
    const password = "SuperSecretPassword123!";
    const hash = await hashPassword(password);

    // Verify it is an Argon2id format string
    expect(hash).toContain("$argon2id$");

    // Verify correct password returns true
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);

    // Verify incorrect password returns false
    const isInvalid = await verifyPassword("WrongPassword123!", hash);
    expect(isInvalid).toBe(false);
  });

  it("produces distinct hashes for the same password due to salting", async () => {
    const password = "IdenticalPassword99";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
    expect(await verifyPassword(password, hash1)).toBe(true);
    expect(await verifyPassword(password, hash2)).toBe(true);
  });

  it("generates a high-entropy 64-character hex session token", () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });

  it("hashes session token deterministically with SHA-256 for storage", () => {
    const token = generateSessionToken();
    const hashA = hashSessionToken(token);
    const hashB = hashSessionToken(token);

    expect(hashA).toBe(hashB);
    expect(hashA).toHaveLength(64); // 256 bits = 64 hex characters
  });
});
