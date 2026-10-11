import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Forbidden: Admin or Moderator access required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || undefined;

  const reports = await prisma.report.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: {
      reporter: {
        select: { id: true, username: true, displayName: true },
      },
      reported: {
        select: { id: true, username: true, displayName: true, status: true },
      },
      moderator: {
        select: { id: true, username: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ reports });
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const { reportId, status, resolutionNotes } = body || {};

  if (!reportId || !status || !["RESOLVED", "DISMISSED"].includes(status)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      resolutionNotes: resolutionNotes || null,
      moderatorId: user.id,
      resolvedAt: new Date(),
    },
  });

  // Audit record
  await prisma.moderationAudit.create({
    data: {
      adminId: user.id,
      actionType: status === "RESOLVED" ? "RESOLVE_REPORT" : "DISMISS_REPORT",
      targetUserId: report.reportedId,
      metadata: JSON.stringify({ reportId, resolutionNotes }),
    },
  });

  return NextResponse.json({ message: "Report updated", report });
}
