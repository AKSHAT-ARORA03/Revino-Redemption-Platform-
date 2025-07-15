import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { addCoinTransaction, logActivity } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth("company_admin")
    const { amount, reason } = await request.json()

    if (!amount || amount <= 0 || !reason) {
      return NextResponse.json({ error: "Amount and reason are required" }, { status: 400 })
    }

    const requestTransaction = await addCoinTransaction({
      type: "request",
      amount,
      fromUserId: user.id,
      description: reason,
      status: "pending",
    })

    await logActivity(user.id, "coin_request", `Requested ${amount} coins: ${reason}`)

    console.log(`Company admin ${user.email} requested ${amount} coins`)

    return NextResponse.json({
      message: "Coin request submitted successfully",
      transaction: requestTransaction,
    })
  } catch (error) {
    console.error("Request coins error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
