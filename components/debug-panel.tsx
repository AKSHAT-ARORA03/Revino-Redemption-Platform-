"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchDebugInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug")
      if (response.ok) {
        const data = await response.json()
        setDebugInfo(data)
      }
    } catch (error) {
      console.error("Debug fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Debug Panel</CardTitle>
        <CardDescription>Check data persistence and file system</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={fetchDebugInfo} disabled={loading} className="mb-4">
          {loading ? "Loading..." : "Check Data Files"}
        </Button>

        {debugInfo && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Data Directory:</h4>
              <p className="text-sm text-gray-600">{debugInfo.dataDirectory}</p>
            </div>

            <div>
              <h4 className="font-semibold">File Counts:</h4>
              <ul className="text-sm">
                <li>Users: {debugInfo.users}</li>
                <li>Transactions: {debugInfo.transactions}</li>
                <li>Vouchers: {debugInfo.vouchers}</li>
              </ul>
            </div>

            {debugInfo.superadmin && (
              <div>
                <h4 className="font-semibold">Superadmin:</h4>
                <p className="text-sm">
                  Balance: {debugInfo.superadmin.coinBalance} coins (Last updated: {debugInfo.superadmin.lastUpdated})
                </p>
              </div>
            )}

            <div>
              <h4 className="font-semibold">All Users:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo.allUsers, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
