import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        preference: user.preference
          ? {
              preferredCountries: JSON.parse(user.preference.preferredCountries || "[]"),
              preferredLanguages: JSON.parse(user.preference.preferredLanguages || "[]"),
              interests: JSON.parse(user.preference.interests || "[]"),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("[AUTH_ME_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
