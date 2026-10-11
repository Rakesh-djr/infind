import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocks = await prisma.block.findMany({
    where: { blockerId: user.id },
    include: {
      blocked: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    blockedUsers: blocks.map((b) => ({
      id: b.id,
      blockedUserId: b.blocked.id,
      username: b.blocked.username,
      displayName: b.blocked.displayName,
      blockedAt: b.createdAt,
    })),
  });
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const blockedUserId = searchParams.get("userId");

  if (!blockedUserId) {
    return NextResponse.json({ error: "userId parameter is required" }, { status: 400 });
  }

  await prisma.block.deleteMany({
    where: {
      blockerId: user.id,
      blockedId: blockedUserId,
    },
  });

  return NextResponse.json({ message: "User unblocked successfully" });
}
