import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import {
  getUserById,
  updateUser,
  getRedemptionCodes,
  updateRedemptionCode,
  addCoinTransaction,
  logActivity,
} from "@/lib/data"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth("employee")
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Redemption code is required" }, { status: 400 })
    }

    const codes = await getRedemptionCodes()

    // Find the redemption code - check only code validity and redemption status
    // Updated to allow any authenticated user to redeem a valid code
    const codeIndex = codes.findIndex(
      (c) => c.code === code.toUpperCase() && !c.isRedeemed
    )

    if (codeIndex === -1) {
      // Check if code exists but has been redeemed
      const codeExists = codes.find((c) => c.code === code.toUpperCase())
      if (codeExists) {
        if (codeExists.isRedeemed) {
          return NextResponse.json({ error: "This code has already been redeemed" }, { status: 400 })
        }
      }
      return NextResponse.json({ error: "Invalid redemption code" }, { status: 404 })
    }

    const redemptionCode = codes[codeIndex]

    // Check if code is expired
    if (new Date() > new Date(redemptionCode.expiresAt)) {
      return NextResponse.json({ error: "Redemption code has expired" }, { status: 400 })
    }

    // 💰 STEP 1: Get current employee and ADD coins
    const currentUser = await getUserById(user.id)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const previousBalance = currentUser.coinBalance
    currentUser.coinBalance += redemptionCode.coinAmount // ➕ ADD coins to employee
    await updateUser(currentUser)

    // 🔒 STEP 2: Mark code as redeemed (prevent double redemption)
    const redemptionCodeToUpdate = codes[codeIndex]
    redemptionCodeToUpdate.isRedeemed = true
    redemptionCodeToUpdate.redeemedAt = new Date().toISOString()
    // Store the ID and email of the user who redeemed the code (for audit trail)
    redemptionCodeToUpdate.redeemedById = user.id
    redemptionCodeToUpdate.redeemedByEmail = user.email
    await updateRedemptionCode(redemptionCodeToUpdate)

    // 📝 STEP 3: Create transaction record for employee
    await addCoinTransaction({
      type: "redeem_code",
      amount: redemptionCode.coinAmount,
      toUserId: user.id,
      description: `Redeemed code ${code} for ${redemptionCode.coinAmount} coins (ADDED)`,
      status: "completed",
    })

    await logActivity(user.id, "code_redeem", `Redeemed code ${code} for ${redemptionCode.coinAmount} coins`)

    console.log(
      `✅ Employee ${user.email} redeemed code ${code} for ${redemptionCode.coinAmount} coins. Balance: ${previousBalance} → ${currentUser.coinBalance}`,
    )

    return NextResponse.json({
      message: "Code redeemed successfully",
      coinAmount: redemptionCode.coinAmount,
      newBalance: currentUser.coinBalance,
      previousBalance,
    })
  } catch (error) {
    console.error("❌ Redeem code error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
