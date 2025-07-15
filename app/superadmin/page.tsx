import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CoinManagement } from "@/components/superadmin/coin-management"
import { VoucherManagement } from "@/components/superadmin/voucher-management"
import { CoinRequests } from "@/components/superadmin/coin-requests"
import { ActivityLogs } from "@/components/superadmin/activity-logs"
import { DashboardStats } from "@/components/superadmin/dashboard-stats"
import { DebugPanel } from "@/components/debug-panel"
import { requireAuth } from "@/lib/auth"
import { CodeTracking } from "@/components/superadmin/code-tracking"

export default async function SuperadminDashboard() {
  await requireAuth("superadmin")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Superadmin Dashboard</h1>
          <p className="text-gray-600">Manage the entire reward system</p>
        </div>

        <Suspense fallback={<div>Loading stats...</div>}>
          <DashboardStats />
        </Suspense>

        <DebugPanel />

        <Tabs defaultValue="coins" className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="coins">Coin Management</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="requests">Coin Requests</TabsTrigger>
            <TabsTrigger value="codes">Code Tracking</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="coins">
            <Card>
              <CardHeader>
                <CardTitle>Coin Wallet Management</CardTitle>
                <CardDescription>Manage your coin inventory and track distributions</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading...</div>}>
                  <CoinManagement />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers">
            <Card>
              <CardHeader>
                <CardTitle>Voucher Management</CardTitle>
                <CardDescription>Create, edit, and manage vouchers available in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading...</div>}>
                  <VoucherManagement />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Coin Requests</CardTitle>
                <CardDescription>Review and approve coin requests from companies</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading...</div>}>
                  <CoinRequests />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codes">
            <Card>
              <CardHeader>
                <CardTitle>Redemption Code Tracking</CardTitle>
                <CardDescription>Track all redemption codes, their status, and usage details</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading...</div>}>
                  <CodeTracking />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>Monitor all system activities and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading...</div>}>
                  <ActivityLogs />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
