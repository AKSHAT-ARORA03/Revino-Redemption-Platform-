import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getCoinTransactions, getUsers } from "@/lib/data"

export async function GET() {
  try {
    await requireAuth("superadmin")

    const [transactions, users] = await Promise.all([getCoinTransactions(), getUsers()])

    // Get coin request transactions
    const coinRequests = transactions
      .filter((t) => t.type === "request")
      .map((transaction) => {
        const user = users.find((u) => u.id === transaction.fromUserId)
        return {
          ...transaction,
          userName: user?.name || "Unknown User",
          companyName: user?.companyName || "Unknown Company",
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(coinRequests)
  } catch (error) {
    console.error("Error fetching coin requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
