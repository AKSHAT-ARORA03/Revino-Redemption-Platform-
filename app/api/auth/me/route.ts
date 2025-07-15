import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"

export const dynamic = 'force-dynamic'; // Never cache this route

export async function GET() {
  try {
    console.log("Checking authentication status...");
    const user = await getAuthUser()

    if (!user) {
      console.log("Auth check: No authenticated user found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log(`Auth check: Found authenticated user ${user.name} (${user.role})`);
    return NextResponse.json(user)
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
