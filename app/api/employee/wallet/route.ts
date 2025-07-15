import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getUserById } from "@/lib/data"

export async function GET() {
  try {
    const user = await requireAuth("employee")
    const currentUser = await getUserById(user.id)

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`✅ Employee ${user.email} balance: ${currentUser.coinBalance}`)
    return NextResponse.json({ balance: currentUser.coinBalance })
  } catch (error) {
    console.error("❌ Error fetching employee wallet:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
