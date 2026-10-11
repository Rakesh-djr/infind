import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UsernameSchema, normalizeUsername } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUsername = searchParams.get("username");

    if (!rawUsername) {
      return NextResponse.json({ available: false, error: "Username parameter is required" }, { status: 400 });
    }

    const parseResult = UsernameSchema.safeParse(rawUsername);
    if (!parseResult.success) {
      return NextResponse.json({
        available: false,
        validFormat: false,
        error: parseResult.error.issues[0]?.message || "Invalid format",
      });
    }

    const normalized = normalizeUsername(rawUsername);
    const existing = await prisma.user.findUnique({
      where: { normalizedUsername: normalized },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existing,
      validFormat: true,
      normalized,
    });
  } catch (error) {
    console.error("[CHECK_USERNAME_ERROR]", error);
    return NextResponse.json({ available: false, error: "Failed to verify username" }, { status: 500 });
  }
}
