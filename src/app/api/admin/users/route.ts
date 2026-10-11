import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() || "";

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { username: { contains: query } },
            { normalizedUsername: { contains: query.toLowerCase() } },
          ],
        }
      : undefined,
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      status: true,
      suspensionReason: true,
      suspendedUntil: true,
      createdAt: true,
      _count: {
        select: {
          reportsReceived: true,
          blocksReceived: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Superadmin privilege required" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { targetUserId, action, reason, durationDays } = body || {};

  if (!targetUserId || !action) {
    return NextResponse.json({ error: "Target user ID and action are required" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!target) {
    return NextResponse.json({ error: "Target user not found" }, { status: 404 });
  }

  // Prevent modifying another admin
  if (target.role === "ADMIN" && target.id !== user.id) {
    return NextResponse.json({ error: "Cannot take action on another administrator" }, { status: 400 });
  }

  let updatedStatus = target.status;
  let suspendedUntil: Date | null = null;

  if (action === "BAN") {
    updatedStatus = "BANNED";
  } else if (action === "SUSPEND") {
    updatedStatus = "SUSPENDED";
    const days = typeof durationDays === "number" && durationDays > 0 ? durationDays : 7;
    suspendedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  } else if (action === "REINSTATE") {
    updatedStatus = "ACTIVE";
    suspendedUntil = null;
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      status: updatedStatus,
      suspensionReason: action === "REINSTATE" ? null : reason || "Admin action",
      suspendedUntil,
    },
  });

  // If user is banned or suspended, revoke all their active sessions immediately
  if (updatedStatus === "BANNED" || updatedStatus === "SUSPENDED") {
    await prisma.session.updateMany({
      where: { userId: targetUserId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // Record audit log
  await prisma.moderationAudit.create({
    data: {
      adminId: user.id,
      actionType: `${action}_USER`,
      targetUserId,
      metadata: JSON.stringify({ reason, durationDays, previousStatus: target.status }),
    },
  });

  return NextResponse.json({
    message: `User status updated to ${updatedStatus}`,
    status: updatedStatus,
  });
}
