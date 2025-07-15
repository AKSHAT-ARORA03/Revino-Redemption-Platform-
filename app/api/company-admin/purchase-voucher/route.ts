import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getUsers, saveUsers, getVouchers, getCoinTransactions, saveCoinTransactions, logActivity } from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth("company_admin")
    const { voucherId } = await request.json()

    if (!voucherId) {
      return NextResponse.json({ error: "Voucher ID is required" }, { status: 400 })
    }

    const [users, vouchers, transactions] = await Promise.all([getUsers(), getVouchers(), getCoinTransactions()])

    const voucher = vouchers.find((v) => v.id === voucherId && v.isActive)
    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found or inactive" }, { status: 404 })
    }

    const userIndex = users.findIndex((u) => u.id === user.id)
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (users[userIndex].coinBalance < voucher.coinValue) {
      return NextResponse.json({ error: "Insufficient coins" }, { status: 400 })
    }

    // Deduct coins from user
    users[userIndex].coinBalance -= voucher.coinValue
    await saveUsers(users)

    // Create purchase transaction
    const transaction = {
      id: Date.now().toString(),
      type: "purchase" as const,
      amount: voucher.coinValue,
      fromUserId: user.id,
      description: `Purchased voucher: ${voucher.title} (voucher ID: ${voucher.id})`,
      status: "completed" as const,
      createdAt: new Date().toISOString(),
    }

    const updatedTransactions = [...transactions, transaction]
    await saveCoinTransactions(updatedTransactions)

    await logActivity(user.id, "voucher_purchase", `Purchased voucher: ${voucher.title} for ${voucher.coinValue} coins`)

    return NextResponse.json({
      message: "Voucher purchased successfully",
      newBalance: users[userIndex].coinBalance,
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
