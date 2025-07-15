"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Coins } from "lucide-react"

interface Voucher {
  id: string
  title: string
  description: string
  category: string
  coinValue: number
  expiryDate: string
  isActive: boolean
}

export function VoucherMarketplace() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [coinBalance, setCoinBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [vouchersRes, walletRes] = await Promise.all([fetch("/api/vouchers"), fetch("/api/employee/wallet")])

      if (vouchersRes.ok) {
        const vouchersData = await vouchersRes.json()
        setVouchers(vouchersData.filter((v: Voucher) => v.isActive))
      }

      if (walletRes.ok) {
        const walletData = await walletRes.json()
        setCoinBalance(walletData.balance)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  const handlePurchase = async (voucherId: string, coinValue: number) => {
    if (coinBalance < coinValue) {
      toast({
        title: "Insufficient coins",
        description: "You do not have enough coins for this purchase",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/employee/purchase-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherId }),
      })

      if (response.ok) {
        toast({
          title: "Purchase successful",
          description: "Voucher purchased successfully",
        })
        setCoinBalance((prev) => prev - coinValue)
      } else {
        const error = await response.json()
        toast({
          title: "Purchase failed",
          description: error.error || "Something went wrong",
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
            Your Balance: {coinBalance.toLocaleString()} coins
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vouchers.map((voucher) => (
          <Card key={voucher.id}>
            <CardHeader>
              <CardTitle className="text-lg">{voucher.title}</CardTitle>
              <CardDescription>{voucher.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm">{voucher.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cost:</span>
                    <Badge variant="secondary">{voucher.coinValue} coins</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expires:</span>
                    <span className="text-sm">{new Date(voucher.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handlePurchase(voucher.id, voucher.coinValue)}
                  disabled={loading || coinBalance < voucher.coinValue}
                  className="w-full flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {coinBalance < voucher.coinValue ? "Insufficient Coins" : "Purchase"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vouchers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No vouchers available for purchase</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
