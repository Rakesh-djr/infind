import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { CreateReportSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parseResult = CreateReportSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.flatten() },
      { status: 422 }
    );
  }

  const { reportedUserId, matchSessionId, category, description } = parseResult.data;

  if (user.id === reportedUserId) {
    return NextResponse.json({ error: "You cannot report yourself" }, { status: 400 });
  }

  try {
    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        reportedId: reportedUserId,
        matchSessionId: matchSessionId || null,
        category,
        description: description || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        message: "Report submitted successfully. Our safety team will review it promptly.",
        reportId: report.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REPORT_USER_ERROR]", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
