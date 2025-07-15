import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUsers, getCoinTransactions, getVouchers, getVoucherPurchases, getRedemptionCodes } from "@/lib/data"
import { Coins, Users, Gift, Activity } from "lucide-react"

export async function DashboardStats() {
  const [users, transactions, vouchers, purchases, codes] = await Promise.all([
    getUsers(),
    getCoinTransactions(),
    getVouchers(),
    getVoucherPurchases(),
    getRedemptionCodes(),
  ])

  const superadmin = users.find((u) => u.role === "superadmin")
  const companyAdmins = users.filter((u) => u.role === "company_admin")
  const employees = users.filter((u) => u.role === "employee")
  const activeVouchers = vouchers.filter((v) => v.isActive)
  const redeemedCodes = codes.filter((c) => c.isRedeemed)

  const stats = [
    {
      title: "Total Coins",
      value: superadmin?.coinBalance?.toLocaleString() || "0",
      description: "Available in wallet",
      icon: Coins,
      color: "text-blue-600",
    },
    {
      title: "Companies",
      value: companyAdmins.length.toString(),
      description: "Registered companies",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Active Vouchers",
      value: activeVouchers.length.toString(),
      description: "Available for purchase",
      icon: Gift,
      color: "text-purple-600",
    },
    {
      title: "Codes Redeemed",
      value: redeemedCodes.length.toString(),
      description: "Total codes redeemed",
      icon: Activity,
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
