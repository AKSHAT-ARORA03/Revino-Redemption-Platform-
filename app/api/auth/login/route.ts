import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, initializeSuperadmin, logActivity } from "@/lib/data"
import { setAuthCookie } from "@/lib/auth"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'; // Never cache this route

export async function POST(request: NextRequest) {
  try {
    // Ensure superadmin exists
    await initializeSuperadmin()

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set auth cookie using our improved helper
    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
    }

    // Set the auth-user cookie with proper configuration
    await setAuthCookie(authUser);

    await logActivity(user.id, "login", `User logged in: ${user.email}`)

    console.log(`✅ User logged in: ${user.email} (Balance: ${user.coinBalance})`)

    // Return success response with user data
    return NextResponse.json({
      message: "Login successful",
      user: authUser,
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
