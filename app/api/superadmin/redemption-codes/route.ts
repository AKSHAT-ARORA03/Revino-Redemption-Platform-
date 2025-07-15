import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getRedemptionCodes, getUsers } from "@/lib/data"

export async function GET() {
  try {
    await requireAuth("superadmin")

    const [codes, users] = await Promise.all([getRedemptionCodes(), getUsers()])

    // Enhance codes with additional details
    const enhancedCodes = codes.map((code) => {
      const companyAdmin = users.find((u) => u.id === code.companyAdminId)
      const now = new Date()
      const expiryDate = new Date(code.expiresAt)
      const isExpired = now > expiryDate
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      return {
        ...code,
        companyAdminName: companyAdmin?.name || "Unknown Admin",
        companyName: companyAdmin?.companyName || "Unknown Company",
        isExpired,
        daysUntilExpiry: Math.max(0, daysUntilExpiry),
      }
    })

    // Sort by creation date (newest first)
    enhancedCodes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(enhancedCodes)
  } catch (error) {
    console.error("Error fetching redemption codes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
