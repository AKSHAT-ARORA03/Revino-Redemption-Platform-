import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import {
  getUserById,
  updateUser,
  getCoupons,
  updateCoupon,
  addCoinTransaction,
  logActivity,
} from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    // Check if user is logged in
    if (!user) {
      return NextResponse.json({ error: "You must be logged in to redeem a coupon" }, { status: 401 })
    }
    
    // Parse request body
    const { code } = await request.json()
    
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }
    
    // Get all coupons
    const coupons = await getCoupons()
    
    // Find the coupon with the matching code
    const couponIndex = coupons.findIndex((c) => c.code.toUpperCase() === code.toUpperCase())
    
    if (couponIndex === -1) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 })
    }
    
    const coupon = coupons[couponIndex]
    
    // Check if coupon is already used
    if (coupon.isUsed) {
      return NextResponse.json({ error: "This coupon has already been redeemed" }, { status: 400 })
    }
    
    // Get current user
    const currentUser = await getUserById(user.id)
    
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Mark coupon as used
    coupons[couponIndex].isUsed = true
    coupons[couponIndex].userId = user.id
    coupons[couponIndex].redeemedAt = new Date().toISOString()
    
    // Update user's coin balance
    const newBalance = currentUser.coinBalance + coupon.value
    currentUser.coinBalance = newBalance
    
    // Save changes
    await Promise.all([
      updateCoupon(coupons[couponIndex]),
      updateUser(currentUser),
      addCoinTransaction({
        id: `coupon-${Date.now()}`,
        type: "coupon",
        amount: coupon.value,
        fromUserId: "system",
        toUserId: user.id,
        status: "completed",
        description: `Coupon code ${code} redeemed`,
        createdAt: new Date().toISOString(),
      }),
      logActivity({
        id: `activity-${Date.now()}`,
        userId: user.id,
        action: "redeem_coupon",
        details: `Redeemed coupon code ${code} for ${coupon.value} coins`,
        timestamp: new Date().toISOString(),
      }),
    ])
    
    console.log(`✅ User ${user.email} redeemed coupon ${code} for ${coupon.value} coins`)
    
    return NextResponse.json({
      success: true,
      coinAmount: coupon.value,
      newBalance,
    })
  } catch (error) {
    console.error("❌ Error redeeming coupon:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}