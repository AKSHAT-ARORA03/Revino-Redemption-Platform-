import { NextResponse } from "next/server"
import { clearAuthCookie, getAuthUser } from "@/lib/auth"
import { logActivity } from "@/lib/data"

export const dynamic = 'force-dynamic'; // Never cache this route

export async function POST() {
  try {
    const user = await getAuthUser();
    
    // Clear the auth-user cookie
    await clearAuthCookie();
    
    // Log activity if we know who is logging out
    if (user) {
      await logActivity(user.id, "logout", `User logged out: ${user.email}`);
      console.log(`✅ User logged out: ${user.email}`);
    } else {
      console.log("✅ Anonymous logout");
    }

    return NextResponse.json({ message: "Logout successful" })
  } catch (error) {
    console.error("❌ Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
