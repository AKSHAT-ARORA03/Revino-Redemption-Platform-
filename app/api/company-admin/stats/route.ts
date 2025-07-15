import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getUsers, getCoinTransactions, getRedemptionCodes } from '@/lib/data'

export async function GET() {
  const user = await getAuthUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (user.role !== 'company_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const [allUsers, transactions, codes] = await Promise.all([
      getUsers(), 
      getCoinTransactions(), 
      getRedemptionCodes()
    ])

    const currentUser = allUsers.find((u) => u.id === user.id)
    const coinBalance = currentUser?.coinBalance || 0

    const userTransactions = transactions.filter(
      (t) => t.fromUserId === user.id || t.toUserId === user.id
    )
    const coinRequests = userTransactions.filter((t) => t.type === "request")
    const distributionTransactions = userTransactions.filter((t) => t.type === "redeem_code")
    const userCodes = codes.filter((c) => c.companyAdminId === user.id)
    const redeemedCodes = userCodes.filter((c) => c.isRedeemed)

    const stats = [
      {
        title: "Coin Balance",
        value: coinBalance.toLocaleString(),
        description: "Available coins",
        icon: "coins",
        color: "text-blue-600",
      },
      {
        title: "Coin Requests",
        value: coinRequests.length.toString(),
        description: "Total requests made",
        icon: "send",
        color: "text-green-600",
      },
      {
        title: "Codes Sent",
        value: userCodes.length.toString(),
        description: "To employees",
        icon: "users",
        color: "text-purple-600",
      },
      {
        title: "Codes Redeemed",
        value: redeemedCodes.length.toString(),
        description: "By employees",
        icon: "gift",
        color: "text-orange-600",
      },
    ]

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching company stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company stats' },
      { status: 500 }
    )
  }
}
