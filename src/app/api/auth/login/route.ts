import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { LoginInputSchema, normalizeUsername } from "@/lib/validations";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parseResult = LoginInputSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { username, password } = parseResult.data;
    const normalized = normalizeUsername(username);

    const user = await prisma.user.findUnique({
      where: { normalizedUsername: normalized },
    });

    if (!user) {
      // Use generic error to prevent username enumeration attacks
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === "BANNED") {
      return NextResponse.json(
        { error: "This account has been permanently suspended for violations of our Community Guidelines." },
        { status: 403 }
      );
    }

    if (user.status === "SUSPENDED" && user.suspendedUntil) {
      if (user.suspendedUntil > new Date()) {
        return NextResponse.json(
          {
            error: `Your account is temporarily suspended until ${user.suspendedUntil.toLocaleDateString()}. Reason: ${user.suspensionReason || "Policy violation"}`,
          },
          { status: 403 }
        );
      } else {
        // Automatically reinstate expired suspension
        await prisma.user.update({
          where: { id: user.id },
          data: { status: "ACTIVE", suspensionReason: null, suspendedUntil: null },
        });
      }
    }

    // Create new session token and set HTTP-only cookie
    await createSession(user.id);

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
