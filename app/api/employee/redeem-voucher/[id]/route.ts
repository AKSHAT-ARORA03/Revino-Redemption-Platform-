import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getVoucherPurchases, saveVoucherPurchases, logActivity, getVouchers } from "@/lib/data"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth("employee")
    const { id } = params

    const [purchases, vouchers] = await Promise.all([getVoucherPurchases(), getVouchers()])

    const purchaseIndex = purchases.findIndex((p) => p.id === id && p.employeeId === user.id && !p.isRedeemed)

    if (purchaseIndex === -1) {
      return NextResponse.json({ error: "Voucher not found or already redeemed" }, { status: 404 })
    }

    // Mark as redeemed
    purchases[purchaseIndex].isRedeemed = true
    purchases[purchaseIndex].redeemedAt = new Date().toISOString()

    await saveVoucherPurchases(purchases)

    const voucher = vouchers.find((v) => v.id === purchases[purchaseIndex].voucherId)
    await logActivity(user.id, "voucher_redeem", `Redeemed voucher: ${voucher?.title || "Unknown Voucher"}`)

    return NextResponse.json({
      message: "Voucher redeemed successfully",
      purchase: purchases[purchaseIndex],
    })
  } catch (error) {
    console.error("Redeem voucher error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
