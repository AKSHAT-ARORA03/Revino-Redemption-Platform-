import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import {
  getUsers,
  saveUsers,
  getRedemptionCodes,
  saveRedemptionCodes,
  generateRedemptionCode,
  getCoinTransactions,
  saveCoinTransactions,
  logActivity,
  type RedemptionCode,
} from "@/lib/data"
import { sendEmail, generateRedemptionCodeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting coin distribution process...")

    const user = await requireAuth("company_admin")
    console.log(`✅ Authenticated user: ${user.email}`)

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { employees, coinAmount } = body

    console.log(`📊 Distribution request: ${coinAmount} coins to ${employees?.length || 0} employees`)

    // Validate input data
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      console.log("❌ Invalid employees data")
      return NextResponse.json({ error: "Invalid or empty employees list" }, { status: 400 })
    }

    if (!coinAmount || typeof coinAmount !== "number" || coinAmount <= 0) {
      console.log("❌ Invalid coin amount")
      return NextResponse.json({ error: "Invalid coin amount" }, { status: 400 })
    }

    // Get data with error handling
    let users, codes, transactions
    try {
      ;[users, codes, transactions] = await Promise.all([getUsers(), getRedemptionCodes(), getCoinTransactions()])
    } catch (dataError) {
      console.error("❌ Error fetching data:", dataError)
      return NextResponse.json({ error: "Failed to fetch system data" }, { status: 500 })
    }

    const currentUser = users.find((u) => u.id === user.id)
    if (!currentUser) {
      console.log("❌ User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const totalCost = employees.length * coinAmount
    console.log(`💰 Total cost: ${totalCost} coins, Current balance: ${currentUser.coinBalance}`)

    // Check if company has enough coins
    if (currentUser.coinBalance < totalCost) {
      console.log("❌ Insufficient coins - BLOCKING distribution")
      return NextResponse.json(
        {
          error: `Insufficient coins. Need ${totalCost} coins, but only have ${currentUser.coinBalance}`,
        },
        { status: 400 },
      )
    }

    // Deduct coins from company admin immediately
    const userIndex = users.findIndex((u) => u.id === user.id)
    users[userIndex].coinBalance -= totalCost

    try {
      await saveUsers(users)
      console.log(`✅ DEDUCTED ${totalCost} coins from ${user.email}. New balance: ${users[userIndex].coinBalance}`)
    } catch (saveError) {
      console.error("❌ Error saving user data:", saveError)
      return NextResponse.json({ error: "Failed to update user balance" }, { status: 500 })
    }

    let sentCount = 0
    const newCodes = []

    // Create codes and send emails
    for (const employee of employees) {
      if (!employee.name || !employee.email || !employee.email.includes("@")) {
        console.log(`⚠️ Skipping invalid employee: ${JSON.stringify(employee)}`)
        continue
      }

      try {
        // Generate redemption code - now async with 16-character format
        const code = await generateRedemptionCode()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiry

        const redemptionCode: RedemptionCode = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          code,
          coinAmount,
          employeeEmail: employee.email,
          employeeName: employee.name,
          companyAdminId: user.id,
          isRedeemed: false,
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          emailSent: false,
          emailStatus: "Pending"
        }

        newCodes.push(redemptionCode)

        // Send email and handle response
        const emailHtml = generateRedemptionCodeEmail(
          employee.name,
          code,
          coinAmount,
          currentUser.companyName || "Your Company",
        )

        // Track email status in the redemption code object
        const emailResult = await sendEmail(employee.email, `You've Received ${coinAmount} Coins!`, emailHtml)
        
        // Add email status to the redemption code for tracking
        redemptionCode.emailSent = emailResult.success;
        redemptionCode.emailStatus = emailResult.message;
        
        if (emailResult.success) {
          sentCount++;
          console.log(`📧 Email sent to ${employee.email} with code ${code}`)
        } else {
          console.error(`❌ Failed to send email to ${employee.email}: ${emailResult.message}`)
          // Continue processing other employees even if one email fails
        }
      } catch (codeError) {
        console.error(`❌ Error processing employee ${employee.email}:`, codeError)
        continue
      }
    }

    // Save redemption codes
    try {
      const updatedCodes = [...codes, ...newCodes]
      await saveRedemptionCodes(updatedCodes)
      console.log(`✅ Saved ${newCodes.length} redemption codes`)
    } catch (saveError) {
      console.error("❌ Error saving redemption codes:", saveError)
      return NextResponse.json({ error: "Failed to save redemption codes" }, { status: 500 })
    }

    // Create transaction record
    try {
      const transaction = {
        id: Date.now().toString(),
        type: "redeem_code" as const,
        amount: totalCost,
        fromUserId: user.id,
        description: `Distributed ${coinAmount} coins each to ${employees.length} employees (DEDUCTED)`,
        status: "completed" as const,
        createdAt: new Date().toISOString(),
      }

      const updatedTransactions = [...transactions, transaction]
      await saveCoinTransactions(updatedTransactions)

      await logActivity(user.id, "coin_distribute", `Distributed ${totalCost} coins to ${employees.length} employees`)
    } catch (transactionError) {
      console.error("❌ Error saving transaction:", transactionError)
      // Don't fail the request for transaction logging errors
    }

    // Count failed emails
    const failedEmails = newCodes.filter(code => !code.emailSent).length;
    
    console.log(`✅ Distribution completed: ${sentCount} emails sent, ${failedEmails} emails failed, ${newCodes.length} codes created`)

    return NextResponse.json({
      message: "Coins distributed successfully",
      sentCount,
      totalCost,
      codesCreated: newCodes.length,
      emailsFailed: failedEmails,
      remainingBalance: users[userIndex].coinBalance,
    })
  } catch (error) {
    console.error("❌ Distribution error:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : "Please try again",
      },
      { status: 500 },
    )
  }
}
