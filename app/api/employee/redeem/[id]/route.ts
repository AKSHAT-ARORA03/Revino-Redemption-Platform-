import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getVoucherAssignments, saveVoucherAssignments, logActivity, getVouchers } from "@/lib/data"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth("employee")
    const { id } = params

    const [assignments, vouchers] = await Promise.all([getVoucherAssignments(), getVouchers()])

    const assignmentIndex = assignments.findIndex((a) => a.id === id && a.employeeId === user.id && !a.isRedeemed)

    if (assignmentIndex === -1) {
      return NextResponse.json({ error: "Voucher not found or already redeemed" }, { status: 404 })
    }

    // Mark as redeemed
    assignments[assignmentIndex].isRedeemed = true
    assignments[assignmentIndex].redeemedAt = new Date().toISOString()

    await saveVoucherAssignments(assignments)

    const voucher = vouchers.find((v) => v.id === assignments[assignmentIndex].voucherId)
    await logActivity(user.id, "voucher_redeem", `Redeemed voucher: ${voucher?.title || "Unknown Voucher"}`)

    return NextResponse.json({
      message: "Voucher redeemed successfully",
      assignment: assignments[assignmentIndex],
    })
  } catch (error) {
    console.error("Redeem voucher error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
