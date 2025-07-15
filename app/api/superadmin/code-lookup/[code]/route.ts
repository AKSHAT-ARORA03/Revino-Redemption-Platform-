import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getRedemptionCodes, getUsers } from "@/lib/data"

export async function GET(request: Request, { params }: { params: { code: string } }) {
  try {
    await requireAuth("superadmin")

    const { code } = params
    const [codes, users] = await Promise.all([getRedemptionCodes(), getUsers()])

    const foundCode = codes.find((c) => c.code.toUpperCase() === code.toUpperCase())

    if (!foundCode) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 })
    }

    const companyAdmin = users.find((u) => u.id === foundCode.companyAdminId)
    const now = new Date()
    const expiryDate = new Date(foundCode.expiresAt)
    const isExpired = now > expiryDate
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const enhancedCode = {
      ...foundCode,
      companyAdminName: companyAdmin?.name || "Unknown Admin",
      companyName: companyAdmin?.companyName || "Unknown Company",
      isExpired,
      daysUntilExpiry: Math.max(0, daysUntilExpiry),
    }

    return NextResponse.json(enhancedCode)
  } catch (error) {
    console.error("Error looking up code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
