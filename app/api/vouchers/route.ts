import { NextResponse } from "next/server"
import { getVouchers } from "@/lib/data"

export async function GET() {
  try {
    const vouchers = await getVouchers()
    return NextResponse.json(vouchers)
  } catch (error) {
    console.error("Error fetching vouchers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
