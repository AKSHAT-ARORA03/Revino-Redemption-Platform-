import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getCoinTransactions, getVouchers } from "@/lib/data"

export async function GET() {
  try {
    const user = await requireAuth("company_admin")

    const [transactions, vouchers] = await Promise.all([getCoinTransactions(), getVouchers()])

    // Get purchase transactions for this user
    const purchaseTransactions = transactions.filter(
      (t) => t.type === "purchase" && t.fromUserId === user.id && t.status === "completed",
    )

    const purchasedVouchers = purchaseTransactions.map((transaction) => {
      const voucherId = transaction.description.match(/voucher ID: (\w+)/)?.[1]
      const voucher = vouchers.find((v) => v.id === voucherId)

      return {
        id: transaction.id,
        voucherId: voucherId,
        voucherTitle: voucher?.title || "Unknown Voucher",
        purchasedAt: transaction.createdAt,
        isAssigned: transaction.description.includes("Assigned to"),
      }
    })

    return NextResponse.json(purchasedVouchers)
  } catch (error) {
    console.error("Error fetching purchased vouchers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
