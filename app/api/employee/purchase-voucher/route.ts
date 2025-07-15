import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import {
  getUserById,
  updateUser,
  getVouchers,
  getVoucherPurchases,
  saveVoucherPurchases,
  addCoinTransaction,
  logActivity,
} from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth("employee")
    const { voucherId } = await request.json()

    if (!voucherId) {
      return NextResponse.json({ error: "Voucher ID is required" }, { status: 400 })
    }

    const [currentUser, vouchers, purchases] = await Promise.all([
      getUserById(user.id),
      getVouchers(),
      getVoucherPurchases(),
    ])

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const voucher = vouchers.find((v) => v.id === voucherId && v.isActive)
    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found or inactive" }, { status: 404 })
    }

    if (currentUser.coinBalance < voucher.coinValue) {
      return NextResponse.json({ error: "Insufficient coins" }, { status: 400 })
    }

    // Deduct coins from user
    currentUser.coinBalance -= voucher.coinValue
    await updateUser(currentUser)

    // Create purchase record
    const purchase = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      voucherId: voucher.id,
      employeeId: user.id,
      purchasedAt: new Date().toISOString(),
      isRedeemed: false,
    }

    const updatedPurchases = [...purchases, purchase]
    await saveVoucherPurchases(updatedPurchases)

    // Create transaction record
    await addCoinTransaction({
      type: "purchase",
      amount: voucher.coinValue,
      fromUserId: user.id,
      description: `Purchased voucher: ${voucher.title}`,
      status: "completed",
    })

    await logActivity(user.id, "voucher_purchase", `Purchased voucher: ${voucher.title} for ${voucher.coinValue} coins`)

    console.log(
      `Employee ${user.email} purchased voucher ${voucher.title} for ${voucher.coinValue} coins. New balance: ${currentUser.coinBalance}`,
    )

    return NextResponse.json({
      message: "Voucher purchased successfully",
      newBalance: currentUser.coinBalance,
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
