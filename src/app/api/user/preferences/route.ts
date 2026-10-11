import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { MatchingFiltersSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pref = await prisma.userPreference.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({
    preferences: {
      preferredCountries: JSON.parse(pref?.preferredCountries || "[]"),
      preferredLanguages: JSON.parse(pref?.preferredLanguages || "[]"),
      interests: JSON.parse(pref?.interests || "[]"),
    },
  });
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parseResult = MatchingFiltersSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.flatten() },
      { status: 422 }
    );
  }

  const { preferredCountries, preferredLanguages, interests } = parseResult.data;

  const updated = await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: {
      preferredCountries: JSON.stringify(preferredCountries),
      preferredLanguages: JSON.stringify(preferredLanguages),
      interests: JSON.stringify(interests),
    },
    create: {
      userId: user.id,
      preferredCountries: JSON.stringify(preferredCountries),
      preferredLanguages: JSON.stringify(preferredLanguages),
      interests: JSON.stringify(interests),
    },
  });

  return NextResponse.json({
    message: "Preferences updated",
    preferences: {
      preferredCountries: JSON.parse(updated.preferredCountries),
      preferredLanguages: JSON.parse(updated.preferredLanguages),
      interests: JSON.parse(updated.interests),
    },
  });
}
