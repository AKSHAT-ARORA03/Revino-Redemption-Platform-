import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getVouchers, saveVoucher, deleteVoucher, logActivity } from "@/lib/data"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth("superadmin")
    const { title, description, category, coinValue, expiryDate, isActive } = await request.json()
    const { id } = params

    if (!title || !description || !category || !coinValue || !expiryDate) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const vouchers = await getVouchers()
    const existingVoucher = vouchers.find((v) => v.id === id)

    if (!existingVoucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 })
    }

    const updatedVoucher = {
      ...existingVoucher,
      title,
      description,
      category,
      coinValue,
      expiryDate,
      isActive,
    }

    await saveVoucher(updatedVoucher)
    await logActivity(user.id, "voucher_update", `Updated voucher: ${title}`)

    return NextResponse.json(updatedVoucher)
  } catch (error) {
    console.error("Update voucher error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth("superadmin")
    const { id } = params

    const vouchers = await getVouchers()
    const voucher = vouchers.find((v) => v.id === id)

    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 })
    }

    await deleteVoucher(id)
    await logActivity(user.id, "voucher_delete", `Deleted voucher: ${voucher.title}`)

    return NextResponse.json({ message: "Voucher deleted successfully" })
  } catch (error) {
    console.error("Delete voucher error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
