import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getCoinTransactions, saveCoinTransactions, transferCoins, logActivity } from "@/lib/data"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth("superadmin")
    const { action } = await request.json()
    const { id } = params

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const transactions = await getCoinTransactions()
    const transactionIndex = transactions.findIndex(
      (t) => t.id === id && t.type === "request" && t.status === "pending",
    )

    if (transactionIndex === -1) {
      return NextResponse.json({ error: "Request not found or already processed" }, { status: 404 })
    }

    const transaction = transactions[transactionIndex]

    // Update transaction status
    transactions[transactionIndex].status = action === "approve" ? "approved" : "rejected"

    if (action === "approve" && transaction.fromUserId) {
      try {
        // Transfer coins from superadmin to requesting user
        await transferCoins(
          user.id,
          transaction.fromUserId,
          transaction.amount,
          `Approved coin request: ${transaction.description}`,
        )

        await logActivity(
          user.id,
          "coin_approve",
          `Approved ${transaction.amount} coins for user ${transaction.fromUserId}`,
        )
      } catch (transferError) {
        console.error("Transfer error:", transferError)
        return NextResponse.json({ error: "Transfer failed: " + transferError }, { status: 400 })
      }
    } else {
      await logActivity(user.id, "coin_reject", `Rejected coin request: ${transaction.description}`)
    }

    await saveCoinTransactions(transactions)

    return NextResponse.json({
      message: `Request ${action}d successfully`,
      transaction: transactions[transactionIndex],
    })
  } catch (error) {
    console.error("Process request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
