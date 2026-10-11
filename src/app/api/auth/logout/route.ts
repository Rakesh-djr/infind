import { NextResponse } from "next/server";
import { revokeCurrentSession } from "@/lib/auth";

export async function POST() {
  try {
    await revokeCurrentSession();
    return NextResponse.json({ message: "Successfully logged out" });
  } catch (error) {
    console.error("[LOGOUT_ERROR]", error);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
