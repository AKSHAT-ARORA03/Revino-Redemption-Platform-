"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Gift, Calendar } from "lucide-react"

interface PurchasedVoucher {
  id: string
  voucherId: string
  voucherTitle: string
  voucherDescription: string
  voucherCategory: string
  coinValue: number
  expiryDate: string
  purchasedAt: string
  isRedeemed: boolean
  redeemedAt?: string
}

export function EmployeeVouchers() {
  const [vouchers, setVouchers] = useState<PurchasedVoucher[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchVouchers()
  }, [])

  const fetchVouchers = async () => {
    try {
      const response = await fetch("/api/employee/purchased-vouchers")
      if (response.ok) {
        const data = await response.json()
        setVouchers(data)
      }
    } catch (error) {
      console.error("Failed to fetch vouchers:", error)
    }
  }

  const handleRedeem = async (purchaseId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/employee/redeem-voucher/${purchaseId}`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "Voucher redeemed",
          description: "Your voucher has been successfully redeemed",
        })
        fetchVouchers()
      } else {
        const error = await response.json()
        toast({
          title: "Redemption failed",
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

  const availableVouchers = vouchers.filter((v) => !v.isRedeemed)
  const redeemedVouchers = vouchers.filter((v) => v.isRedeemed)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Vouchers ({availableVouchers.length})</h3>
        {availableVouchers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No vouchers purchased yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableVouchers.map((voucher) => (
              <Card key={voucher.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{voucher.voucherTitle}</CardTitle>
                  <CardDescription>{voucher.voucherDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="text-sm">{voucher.voucherCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Value:</span>
                        <Badge variant="secondary">{voucher.coinValue} coins</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Expires:</span>
                        <span className="text-sm">{new Date(voucher.expiryDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Purchased:</span>
                        <span className="text-sm">{new Date(voucher.purchasedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRedeem(voucher.id)}
                      disabled={loading}
                      className="w-full flex items-center gap-2"
                    >
                      <Gift className="h-4 w-4" />
                      Redeem Voucher
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {redeemedVouchers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Recently Redeemed ({redeemedVouchers.slice(0, 3).length})</h3>
          <div className="space-y-2">
            {redeemedVouchers.slice(0, 3).map((voucher) => (
              <Card key={voucher.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{voucher.voucherTitle}</p>
                      <p className="text-sm text-gray-500">
                        Redeemed on {new Date(voucher.redeemedAt!).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Redeemed
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
