import prisma from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";

async function main() {
  console.log("🌱 Seeding InFind database...");

  // 1. Initial Administrator Account
  const adminUsername = process.env.INITIAL_ADMIN_USERNAME || "admin";
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "InFindSecureAdmin2026!";
  const adminHash = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { normalizedUsername: adminUsername.toLowerCase() },
    update: { role: "ADMIN", status: "ACTIVE" },
    create: {
      username: adminUsername,
      normalizedUsername: adminUsername.toLowerCase(),
      displayName: "InFind Administrator",
      passwordHash: adminHash,
      role: "ADMIN",
      status: "ACTIVE",
      preference: {
        create: {
          preferredCountries: JSON.stringify(["US", "GB", "CA"]),
          preferredLanguages: JSON.stringify(["en"]),
          interests: JSON.stringify(["tech", "gaming", "music"]),
        },
      },
    },
  });
  console.log(`✅ Administrator ready: @${admin.username}`);

  // 2. Sample User 1: Alex
  const user1Hash = await hashPassword("InFindAlex123!");
  const user1 = await prisma.user.upsert({
    where: { normalizedUsername: "alex_dev" },
    update: {},
    create: {
      username: "Alex_Dev",
      normalizedUsername: "alex_dev",
      displayName: "Alex Rivers",
      passwordHash: user1Hash,
      role: "USER",
      status: "ACTIVE",
      preference: {
        create: {
          preferredCountries: JSON.stringify(["US", "CA"]),
          preferredLanguages: JSON.stringify(["en"]),
          interests: JSON.stringify(["coding", "music", "cinema"]),
        },
      },
    },
  });
  console.log(`✅ Test User 1 ready: @${user1.username}`);

  // 3. Sample User 2: Sam
  const user2Hash = await hashPassword("InFindSam123!");
  const user2 = await prisma.user.upsert({
    where: { normalizedUsername: "sam_connect" },
    update: {},
    create: {
      username: "Sam_Connect",
      normalizedUsername: "sam_connect",
      displayName: "Sam Taylor",
      passwordHash: user2Hash,
      role: "USER",
      status: "ACTIVE",
      preference: {
        create: {
          preferredCountries: JSON.stringify(["US", "DE"]),
          preferredLanguages: JSON.stringify(["en"]),
          interests: JSON.stringify(["cinema", "photography", "travel"]),
        },
      },
    },
  });
  console.log(`✅ Test User 2 ready: @${user2.username}`);

  // 4. Sample moderation report for admin dashboard
  const existingReport = await prisma.report.findFirst();
  if (!existingReport) {
    await prisma.report.create({
      data: {
        reporterId: user1.id,
        reportedId: user2.id,
        category: "SPAM",
        description: "Testing automated message advertising a commercial link.",
        status: "PENDING",
      },
    });
    console.log("✅ Seeded sample moderation report");
  }

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
