import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getVoucherAssignments, getVouchers } from "@/lib/data"

export async function GET() {
  try {
    const user = await requireAuth("employee")

    const [assignments, vouchers] = await Promise.all([getVoucherAssignments(), getVouchers()])

    // Get redeemed assignments for this employee
    const redeemedAssignments = assignments.filter((a) => a.employeeId === user.id && a.isRedeemed)

    // Enhance with voucher details
    const redemptionHistory = redeemedAssignments.map((assignment) => {
      const voucher = vouchers.find((v) => v.id === assignment.voucherId)
      return {
        id: assignment.id,
        voucherTitle: voucher?.title || "Unknown Voucher",
        voucherDescription: voucher?.description || "",
        voucherCategory: voucher?.category || "",
        coinValue: voucher?.coinValue || 0,
        redeemedAt: assignment.redeemedAt!,
        assignedAt: assignment.assignedAt,
      }
    })

    // Sort by redemption date (newest first)
    redemptionHistory.sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime())

    return NextResponse.json(redemptionHistory)
  } catch (error) {
    console.error("Error fetching redemption history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
