import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getVouchers, saveVoucher, logActivity } from "@/lib/data"

export async function GET() {
  try {
    await requireAuth("superadmin")
    const vouchers = await getVouchers()
    return NextResponse.json(vouchers)
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth("superadmin")
    const { title, description, category, coinValue, expiryDate, isActive } = await request.json()

    if (!title || !description || !category || !coinValue || !expiryDate) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const newVoucher = {
      id: Date.now().toString(),
      title,
      description,
      category,
      coinValue,
      expiryDate,
      isActive: isActive ?? true,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
    }

    await saveVoucher(newVoucher)
    await logActivity(user.id, "voucher_create", `Created voucher: ${title}`)

    return NextResponse.json(newVoucher)
  } catch (error) {
    console.error("Create voucher error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
