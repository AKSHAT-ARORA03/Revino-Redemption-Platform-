"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Gift, CheckCircle } from "lucide-react"

export function RedeemCode() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastRedemption, setLastRedemption] = useState<{
    amount: number
    newBalance: number
  } | null>(null)
  const { toast } = useToast()

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      toast({
        title: "Invalid code",
        description: "Please enter a redemption code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/employee/redeem-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })

      if (response.ok) {
        const result = await response.json()
        setLastRedemption({
          amount: result.coinAmount,
          newBalance: result.newBalance,
        })
        toast({
          title: "Code redeemed successfully! 🎉",
          description: `${result.coinAmount} coins added to your wallet`,
        })
        setCode("")
        // Refresh the page to update coin balance across all components
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const error = await response.json()
        toast({
          title: "Redemption failed",
          description: error.error || "Invalid or expired code",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
            <Gift className="h-5 w-5" />
            Redeem Code
          </CardTitle>
          <CardDescription>Enter your redemption code to receive coins</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRedeem} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Redemption Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter your code (e.g., XXXX-XXXX-XXXX-XXXX)"
                maxLength={19}
                className="font-mono text-center text-lg tracking-wider"
              />
              <p className="text-xs text-gray-500">Code should be in format XXXX-XXXX-XXXX-XXXX and was sent to your email</p>
            </div>
            <Button type="submit" disabled={loading || !code.trim()} className="w-full">
              {loading ? "Redeeming..." : "Redeem Code"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {lastRedemption && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Successfully Redeemed!</h3>
                <p className="text-green-700">
                  You received <strong>{lastRedemption.amount} coins</strong>
                </p>
                <p className="text-sm text-green-600">
                  Your new balance: <strong>{lastRedemption.newBalance} coins</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How to Use Redemption Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Check your email for redemption codes sent by your company admin</li>
            <li>Enter the 16-character code in format XXXX-XXXX-XXXX-XXXX exactly as received</li>
            <li>Codes are case-insensitive and expire in 30 days</li>
            <li>Each code can only be used once</li>
            <li>Coins will be added to your wallet immediately</li>
            <li>Use your coins to purchase vouchers from the marketplace</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
