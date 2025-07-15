import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, logActivity } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, companyName } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (role === "superadmin") {
      return NextResponse.json({ error: "Cannot register as superadmin" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = await createUser({
      name,
      email,
      password, // In production, hash this password
      role,
      companyName: role === "company_admin" ? companyName : undefined,
      coinBalance: 0,
    })

    await logActivity(newUser.id, "register", `New user registered: ${email} as ${role}`)

    return NextResponse.json({
      message: "Registration successful",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
