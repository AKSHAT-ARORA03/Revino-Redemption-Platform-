"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, X, Clock } from "lucide-react"

interface CoinRequest {
  id: string
  type: string
  amount: number
  fromUserId?: string
  toUserId?: string
  description: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  userName?: string
  companyName?: string
}

export function CoinRequests() {
  const [requests, setRequests] = useState<CoinRequest[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/superadmin/coin-requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error)
    }
  }

  const handleRequest = async (requestId: string, action: "approve" | "reject") => {
    setLoading(true)
    try {
      const response = await fetch(`/api/superadmin/coin-requests/${requestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Request ${action}d successfully`,
        })
        fetchRequests()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Operation failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const processedRequests = requests.filter((r) => r.status !== "pending")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Pending Requests ({pendingRequests.length})</h3>
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No pending requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {request.userName} - {request.companyName}
                      </CardTitle>
                      <CardDescription>{request.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{request.amount.toLocaleString()} coins</p>
                      <p className="text-sm text-gray-500">
                        Requested on {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRequest(request.id, "approve")}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRequest(request.id, "reject")}
                        disabled={loading}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Processed Requests</h3>
        <div className="space-y-4">
          {processedRequests.slice(0, 5).map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {request.userName} - {request.companyName}
                    </p>
                    <p className="text-sm text-gray-500">{request.description}</p>
                    <p className="text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{request.amount.toLocaleString()} coins</p>
                    <Badge variant={request.status === "approved" ? "default" : "destructive"}>{request.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
