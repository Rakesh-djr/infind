import { describe, it, expect, afterAll } from "vitest";
import prisma from "../../src/lib/prisma";
import { normalizeUsername } from "../../src/lib/validations";
import { hashPassword } from "../../src/lib/auth";

describe("Database User Registration & Uniqueness Integration Tests", () => {
  const testUsernameOriginal = "TestUser_Unique99";
  const testNormalized = normalizeUsername(testUsernameOriginal);

  afterAll(async () => {
    // Cleanup test record
    await prisma.user.deleteMany({
      where: { normalizedUsername: testNormalized },
    });
    await prisma.$disconnect();
  });

  it("successfully creates a user with unique normalized username", async () => {
    // Clean any previous test run
    await prisma.user.deleteMany({
      where: { normalizedUsername: testNormalized },
    });

    const hash = await hashPassword("ValidPassword123!");
    const user = await prisma.user.create({
      data: {
        username: testUsernameOriginal,
        normalizedUsername: testNormalized,
        displayName: testUsernameOriginal,
        passwordHash: hash,
        role: "USER",
        status: "ACTIVE",
      },
    });

    expect(user.id).toBeDefined();
    expect(user.normalizedUsername).toBe(testNormalized);
  });

  it("strictly rejects a duplicate user registration with identical or case-variant username", async () => {
    const hash = await hashPassword("AnotherPassword123!");

    // Attempting to register 'testuser_unique99' or 'TESTUSER_UNIQUE99' must fail due to unique constraint
    await expect(
      prisma.user.create({
        data: {
          username: "TESTUSER_UNIQUE99",
          normalizedUsername: normalizeUsername("TESTUSER_UNIQUE99"),
          displayName: "TESTUSER_UNIQUE99",
          passwordHash: hash,
        },
      })
    ).rejects.toThrow();
  });
});
