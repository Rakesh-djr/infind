import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, verifyPassword, hashPassword } from "@/lib/auth";
import { ChangePasswordSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parseResult = ChangePasswordSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { currentPassword, newPassword } = parseResult.data;

  // Retrieve user password hash
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!fullUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isCurrentValid = await verifyPassword(currentPassword, fullUser.passwordHash);
  if (!isCurrentValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return NextResponse.json({ message: "Password updated successfully" });
}
