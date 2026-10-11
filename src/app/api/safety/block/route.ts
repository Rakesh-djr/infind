import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { CreateBlockSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parseResult = CreateBlockSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.flatten() },
      { status: 422 }
    );
  }

  const { blockedUserId } = parseResult.data;

  if (user.id === blockedUserId) {
    return NextResponse.json({ error: "You cannot block yourself" }, { status: 400 });
  }

  try {
    const block = await prisma.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: user.id,
          blockedId: blockedUserId,
        },
      },
      create: {
        blockerId: user.id,
        blockedId: blockedUserId,
      },
      update: {},
    });

    return NextResponse.json({
      message: "User blocked successfully",
      blockId: block.id,
    });
  } catch (error) {
    console.error("[BLOCK_USER_ERROR]", error);
    return NextResponse.json({ error: "Failed to block user" }, { status: 500 });
  }
}
