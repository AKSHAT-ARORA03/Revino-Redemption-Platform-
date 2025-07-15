import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getVoucherAssignments, getVouchers } from "@/lib/data"

export async function GET() {
  try {
    const user = await requireAuth("employee")

    const [assignments, vouchers] = await Promise.all([getVoucherAssignments(), getVouchers()])

    // Get assignments for this employee
    const userAssignments = assignments.filter((a) => a.employeeId === user.id)

    // Enhance with voucher details
    const enhancedAssignments = userAssignments.map((assignment) => {
      const voucher = vouchers.find((v) => v.id === assignment.voucherId)
      return {
        id: assignment.id,
        voucherId: assignment.voucherId,
        voucherTitle: voucher?.title || "Unknown Voucher",
        voucherDescription: voucher?.description || "",
        voucherCategory: voucher?.category || "",
        coinValue: voucher?.coinValue || 0,
        expiryDate: voucher?.expiryDate || "",
        assignedAt: assignment.assignedAt,
        isRedeemed: assignment.isRedeemed,
        redeemedAt: assignment.redeemedAt,
      }
    })

    return NextResponse.json(enhancedAssignments)
  } catch (error) {
    console.error("Error fetching employee vouchers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
