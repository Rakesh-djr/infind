import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, verifyPassword, revokeCurrentSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const password = body?.password;

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password confirmation is required to delete account" }, { status: 400 });
  }

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!fullUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isValid = await verifyPassword(password, fullUser.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
  }

  // Revoke session cookie
  await revokeCurrentSession();

  // Delete user account (cascades sessions, preferences, etc.)
  await prisma.user.delete({
    where: { id: user.id },
  });

  return NextResponse.json({ message: "Account deleted successfully" });
}
