import { Suspense } from "react"
import RedeemCouponClient from "./RedeemCouponClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift } from "lucide-react"

export default function RedeemCouponPage() {
  return (
    <Suspense fallback={<RedeemCouponLoading />}>
      <RedeemCouponClient />
    </Suspense>
  )
}

function RedeemCouponLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Gift className="h-6 w-6" />
              Redeem Coupon
            </CardTitle>
            <CardDescription>
              Loading coupon redemption...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}