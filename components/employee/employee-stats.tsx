import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthUser } from "@/lib/auth"
import { getUsers, getRedemptionCodes, getVoucherPurchases } from "@/lib/data"
import { Gift, Calendar, Award, TrendingUp } from "lucide-react"

export async function EmployeeStats() {
  const user = await getAuthUser()
  if (!user) return null

  const [allUsers, codes, purchases] = await Promise.all([getUsers(), getRedemptionCodes(), getVoucherPurchases()])

  const currentUser = allUsers.find((u) => u.id === user.id)
  const coinBalance = currentUser?.coinBalance || 0

  const userCodes = codes.filter((c) => c.employeeEmail === user.email)
  const redeemedCodes = userCodes.filter((c) => c.isRedeemed)
  const userPurchases = purchases.filter((p) => p.employeeId === user.id)
  const redeemedVouchers = userPurchases.filter((p) => p.isRedeemed)

  const stats = [
    {
      title: "Coin Balance",
      value: coinBalance.toLocaleString(),
      description: "Available coins",
      icon: Gift,
      color: "text-blue-600",
    },
    {
      title: "Codes Redeemed",
      value: redeemedCodes.length.toString(),
      description: "Total codes used",
      icon: Award,
      color: "text-green-600",
    },
    {
      title: "Vouchers Purchased",
      value: userPurchases.length.toString(),
      description: "Total purchases",
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Vouchers Redeemed",
      value: redeemedVouchers.length.toString(),
      description: "Used vouchers",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
