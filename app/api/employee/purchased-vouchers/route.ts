import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getVoucherPurchases, getVouchers } from "@/lib/data"

export async function GET() {
  try {
    const user = await requireAuth("employee")

    const [purchases, vouchers] = await Promise.all([getVoucherPurchases(), getVouchers()])

    // Get purchases for this employee
    const userPurchases = purchases.filter((p) => p.employeeId === user.id)

    // Enhance with voucher details
    const enhancedPurchases = userPurchases.map((purchase) => {
      const voucher = vouchers.find((v) => v.id === purchase.voucherId)
      return {
        id: purchase.id,
        voucherId: purchase.voucherId,
        voucherTitle: voucher?.title || "Unknown Voucher",
        voucherDescription: voucher?.description || "",
        voucherCategory: voucher?.category || "",
        coinValue: voucher?.coinValue || 0,
        expiryDate: voucher?.expiryDate || "",
        purchasedAt: purchase.purchasedAt,
        isRedeemed: purchase.isRedeemed,
        redeemedAt: purchase.redeemedAt,
      }
    })

    return NextResponse.json(enhancedPurchases)
  } catch (error) {
    console.error("Error fetching purchased vouchers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
