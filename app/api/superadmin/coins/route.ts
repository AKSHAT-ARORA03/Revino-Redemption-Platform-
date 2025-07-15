import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getUserById, updateUser, addCoinTransaction, logActivity } from "@/lib/data"

export async function GET() {
  try {
    const user = await requireAuth("superadmin")
    const currentUser = await getUserById(user.id)

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`✅ Superadmin balance check: ${currentUser.coinBalance}`)
    return NextResponse.json({ balance: currentUser.coinBalance })
  } catch (error) {
    console.error("❌ Error fetching superadmin balance:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth("superadmin")
    const { operation, amount } = await request.json()

    console.log(`🔄 Superadmin ${operation} operation: ${amount} coins`)

    if (!operation || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid operation or amount" }, { status: 400 })
    }

    const currentUser = await getUserById(user.id)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currentBalance = currentUser.coinBalance
    console.log(`📊 Current balance: ${currentBalance}`)

    if (operation === "add") {
      currentUser.coinBalance = currentBalance + amount
    } else if (operation === "remove") {
      if (currentBalance < amount) {
        return NextResponse.json({ error: "Insufficient coins" }, { status: 400 })
      }
      currentUser.coinBalance = currentBalance - amount
    } else {
      return NextResponse.json({ error: "Invalid operation" }, { status: 400 })
    }

    console.log(`💰 New balance: ${currentUser.coinBalance}`)

    // Update user in database
    await updateUser(currentUser)

    // Log transaction
    await addCoinTransaction({
      type: operation === "add" ? "add" : "remove",
      amount,
      fromUserId: operation === "remove" ? user.id : undefined,
      toUserId: operation === "add" ? user.id : undefined,
      description: `${operation === "add" ? "Added" : "Removed"} ${amount} coins to/from superadmin wallet`,
      status: "completed",
    })

    await logActivity(
      user.id,
      `coin_${operation}`,
      `${operation === "add" ? "Added" : "Removed"} ${amount} coins. New balance: ${currentUser.coinBalance}`,
    )

    console.log(`✅ Superadmin ${operation} completed. New balance: ${currentUser.coinBalance}`)

    return NextResponse.json({
      message: "Operation successful",
      newBalance: currentUser.coinBalance,
    })
  } catch (error) {
    console.error("❌ Coin operation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
