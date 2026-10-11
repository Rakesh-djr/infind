import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { RegisterInputSchema, normalizeUsername } from "@/lib/validations";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const parseResult = RegisterInputSchema.safeParse(body);
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

    // Explicit pre-check for better UX
    const existing = await prisma.user.findUnique({
      where: { normalizedUsername: normalized },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Username is already taken. Please choose another username.",
          field: "username",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user and initial preference atomically
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: username.trim(),
          normalizedUsername: normalized,
          displayName: username.trim(),
          passwordHash,
          role: "USER",
          status: "ACTIVE",
          preference: {
            create: {
              preferredCountries: "[]",
              preferredLanguages: "[]",
              interests: "[]",
            },
          },
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      return newUser;
    });

    // Create session and set HTTP-only cookie
    await createSession(user.id);

    return NextResponse.json(
      {
        message: "Registration successful",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Username is already taken. Please choose another username.",
          field: "username",
        },
        { status: 409 }
      );
    }

    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
