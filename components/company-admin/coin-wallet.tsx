"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Coins, Plus, RefreshCw } from "lucide-react"

interface CoinWalletProps {
  onBalanceUpdate?: (newBalance: number) => void
}

export function CoinWallet({ onBalanceUpdate }: CoinWalletProps) {
  const [coinBalance, setCoinBalance] = useState(0)
  const [requestAmount, setRequestAmount] = useState("")
  const [requestReason, setRequestReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCoinBalance()
  }, [])

  const fetchCoinBalance = async () => {
    setRefreshing(true)
    try {
      const response = await fetch("/api/company-admin/wallet", {
        credentials: "include" // Ensure cookies are sent
      })
      if (response.ok) {
        const data = await response.json()
        setCoinBalance(data.balance)
        // Notify parent component about balance update
        onBalanceUpdate?.(data.balance)
      } else {
        console.error("Failed to fetch coin balance:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch coin balance:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleCoinRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestAmount || Number.parseInt(requestAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/company-admin/request-coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify({
          amount: Number.parseInt(requestAmount),
          reason: requestReason,
        }),
      })

      if (response.ok) {
        toast({
          title: "Request submitted",
          description: "Your coin request has been sent to the admin for approval",
        })
        setDialogOpen(false)
        setRequestAmount("")
        setRequestReason("")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Request failed",
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Current Balance
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCoinBalance}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{coinBalance.toLocaleString()} coins</div>
          <p className="text-sm text-gray-500 mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request More Coins</CardTitle>
          <CardDescription>Submit a request to the admin for additional coins</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Request Coins
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Coins</DialogTitle>
                <DialogDescription>Submit a request for additional coins from the admin</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCoinRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Explain why you need these coins"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
