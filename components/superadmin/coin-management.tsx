"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Coins, Plus, Minus } from "lucide-react"

export function CoinManagement() {
  const [coinBalance, setCoinBalance] = useState(0)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCoinBalance()
  }, [])

  const fetchCoinBalance = async () => {
    try {
      const response = await fetch("/api/superadmin/coins")
      if (response.ok) {
        const data = await response.json()
        setCoinBalance(data.balance)
      }
    } catch (error) {
      console.error("Failed to fetch coin balance:", error)
    }
  }

  const handleCoinOperation = async (operation: "add" | "remove") => {
    if (!amount || Number.parseInt(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/superadmin/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation,
          amount: Number.parseInt(amount),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCoinBalance(data.newBalance)
        setAmount("")
        toast({
          title: "Success",
          description: `${operation === "add" ? "Added" : "Removed"} ${amount} coins`,
        })
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Current Coin Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{coinBalance.toLocaleString()} coins</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Coins</CardTitle>
          <CardDescription>Add or remove coins from your wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleCoinOperation("add")} disabled={loading} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Coins
            </Button>
            <Button
              onClick={() => handleCoinOperation("remove")}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Minus className="h-4 w-4" />
              Remove Coins
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
