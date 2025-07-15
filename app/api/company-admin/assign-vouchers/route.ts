import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import {
  getUsers,
  saveUsers,
  createUser,
  getVouchers,
  getVoucherAssignments,
  saveVoucherAssignments,
  getCoinTransactions,
  saveCoinTransactions,
  logActivity,
} from "@/lib/data"
import { sendEmail, generateVoucherAssignmentEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth("company_admin")
    const { voucherId, employees } = await request.json()

    if (!voucherId || !employees || !Array.isArray(employees)) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    // Get current data
    const [users, vouchers, assignments, transactions] = await Promise.all([
      getUsers(),
      getVouchers(),
      getVoucherAssignments(),
      getCoinTransactions(),
    ])

    // Find the purchased voucher transaction
    const purchaseTransaction = transactions.find(
      (t) =>
        t.type === "purchase" &&
        t.fromUserId === user.id &&
        t.description.includes(voucherId) &&
        t.status === "completed",
    )

    if (!purchaseTransaction) {
      return NextResponse.json({ error: "Voucher not found or not purchased" }, { status: 404 })
    }

    const voucher = vouchers.find((v) => v.id === voucherId)
    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 })
    }

    const currentUser = users.find((u) => u.id === user.id)
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let assignedCount = 0
    const newAssignments = []
    const newUsers = []

    for (const employee of employees) {
      if (!employee.name || !employee.email) continue

      // Check if employee already exists
      let employeeUser = users.find((u) => u.email === employee.email)

      // If employee doesn't exist, create them
      if (!employeeUser) {
        const newEmployee = await createUser({
          name: employee.name,
          email: employee.email,
          password: "temp123", // Temporary password - employee should change on first login
          role: "employee",
          coinBalance: 0,
        })
        employeeUser = newEmployee
        newUsers.push(newEmployee)

        await logActivity(
          user.id,
          "employee_create",
          `Created employee account for ${employee.name} (${employee.email})`,
        )
      }

      // Create voucher assignment
      const assignment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        voucherId: voucher.id,
        employeeId: employeeUser.id,
        companyAdminId: user.id,
        assignedAt: new Date().toISOString(),
        isRedeemed: false,
      }

      newAssignments.push(assignment)
      assignedCount++

      // Send email notification
      try {
        const emailHtml = generateVoucherAssignmentEmail(
          employee.name,
          voucher.title,
          currentUser.companyName || "Your Company",
        )

        await sendEmail(employee.email, `New Voucher Assigned: ${voucher.title}`, emailHtml)
      } catch (emailError) {
        console.error("Failed to send email to", employee.email, emailError)
      }
    }

    // Save all assignments
    const updatedAssignments = [...assignments, ...newAssignments]
    await saveVoucherAssignments(updatedAssignments)

    // Update users if new employees were created
    if (newUsers.length > 0) {
      const updatedUsers = [...users, ...newUsers]
      await saveUsers(updatedUsers)
    }

    // Mark the purchase transaction as assigned
    const transactionIndex = transactions.findIndex((t) => t.id === purchaseTransaction.id)
    if (transactionIndex !== -1) {
      transactions[transactionIndex].description += ` - Assigned to ${assignedCount} employees`
      await saveCoinTransactions(transactions)
    }

    await logActivity(user.id, "voucher_assign", `Assigned ${voucher.title} to ${assignedCount} employees`)

    return NextResponse.json({
      message: "Vouchers assigned successfully",
      assignedCount,
      newEmployeesCreated: newUsers.length,
    })
  } catch (error) {
    console.error("Assignment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
