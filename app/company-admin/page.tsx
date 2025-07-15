"use client"

import { Suspense, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CoinWallet } from "@/components/company-admin/coin-wallet"
import { EmployeeCoinDistribution } from "@/components/company-admin/employee-coin-distribution"
import { VoucherCatalog } from "@/components/company-admin/voucher-catalog"
import { CompanyStats } from "@/components/company-admin/company-stats"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Coins, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CompanyAdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [coinBalance, setCoinBalance] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== "company_admin")) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user?.role === "company_admin") {
      fetchCoinBalance()
    }
  }, [user])

  const fetchCoinBalance = async () => {
    setRefreshing(true)
    try {
      const response = await fetch("/api/company-admin/wallet")
      if (response.ok) {
        const data = await response.json()
        setCoinBalance(data.balance)
      }
    } catch (error) {
      console.error("Failed to fetch coin balance:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleBalanceUpdate = (newBalance: number) => {
    setCoinBalance(newBalance)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!user || user.role !== "company_admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Live Balance */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Admin Dashboard</h1>
            <p className="text-gray-600">Manage your company's reward program</p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <Coins className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Current Balance</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-lg font-bold">
                        {coinBalance !== null ? coinBalance.toLocaleString() : "Loading..."} coins
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchCoinBalance}
                        disabled={refreshing}
                        className="h-6 w-6 p-0"
                      >
                        <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <CompanyStats />

        <Tabs defaultValue="wallet" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="wallet">Coin Wallet</TabsTrigger>
            <TabsTrigger value="vouchers">Available Vouchers</TabsTrigger>
            <TabsTrigger value="distribute">Distribute to Employees</TabsTrigger>
          </TabsList>

          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle>Coin Wallet</CardTitle>
                <CardDescription>View your coin balance and request more coins</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading...</div>}>
                  <CoinWallet onBalanceUpdate={handleBalanceUpdate} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers">
            <Card>
              <CardHeader>
                <CardTitle>Available Vouchers</CardTitle>
                <CardDescription>Browse vouchers to help decide coin distribution amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading...</div>}>
                  <VoucherCatalog />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribute">
            <Card>
              <CardHeader>
                <CardTitle>Distribute Coins to Employees</CardTitle>
                <CardDescription>Send redemption codes to employees via email</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading...</div>}>
                  <EmployeeCoinDistribution onDistributionComplete={handleBalanceUpdate} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
