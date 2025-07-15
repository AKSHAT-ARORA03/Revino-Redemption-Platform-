import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getUserById } from "@/lib/data"

export async function GET() {
  try {
    const user = await requireAuth("company_admin")
    const currentUser = await getUserById(user.id)

    if (!currentUser) {
      console.log(`❌ User not found: ${user.id}`)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`✅ Company admin ${user.email} balance: ${currentUser.coinBalance}`)
    return NextResponse.json({ balance: currentUser.coinBalance })
  } catch (error) {
    console.error("❌ Error fetching company admin wallet:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
