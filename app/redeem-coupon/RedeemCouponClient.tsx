"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Coins, Gift, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"
import { useRouter, useSearchParams } from "next/navigation"

export default function RedeemCouponClient() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ amount: number; newBalance: number } | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if we're returning from login with a pending code
  useEffect(() => {
    // First check URL params
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl && user) {
      setCode(codeFromUrl)
    } else {
      // Then check session storage
      const pendingCode = sessionStorage.getItem('pendingCouponCode')
      if (pendingCode && user) {
        setCode(pendingCode)
        sessionStorage.removeItem('pendingCouponCode')
      }
    }
  }, [searchParams, user])

  // Format the code as user types (AB12-CD34-EF56-GH78)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
    
    // Add dashes after every 4 characters
    if (value.length > 4) {
      value = value.slice(0, 4) + "-" + value.slice(4)
    }
    if (value.length > 9) {
      value = value.slice(0, 9) + "-" + value.slice(9)
    }
    if (value.length > 14) {
      value = value.slice(0, 14) + "-" + value.slice(14)
    }
    
    // Limit to 19 characters (16 alphanumeric + 3 dashes)
    if (value.length <= 19) {
      setCode(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    // Check if user is logged in
    if (!user) {
      // Save the code in session storage and redirect to login
      sessionStorage.setItem('pendingCouponCode', code)
      // Include the code in the return URL
      router.push(`/login?returnUrl=${encodeURIComponent(`/redeem-coupon?code=${code}`)}`)
      return
    }
    
    // Validate code format
    const codeWithoutDashes = code.replace(/-/g, "")
    if (codeWithoutDashes.length !== 16) {
      setError("Please enter a valid 16-digit code")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/employee/redeem-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeWithoutDashes }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess({
          amount: data.coinAmount,
          newBalance: data.newBalance,
        })
        toast({
          title: "Success!",
          description: `You've redeemed ${data.coinAmount} coins!`,
        })
      } else {
        setError(data.error || "Failed to redeem coupon")
        toast({
          title: "Redemption failed",
          description: data.error || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error redeeming coupon:", error)
      setError("An unexpected error occurred. Please try again.")
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Gift className="h-6 w-6" />
              Redeem Coupon
            </CardTitle>
            <CardDescription>
              Enter your 16-digit coupon code to redeem rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  placeholder="AB12-CD34-EF56-GH78"
                  value={code}
                  onChange={handleCodeChange}
                  className="text-center tracking-wider font-mono text-lg"
                />
                <p className="text-xs text-gray-500">
                  Enter the 16-digit code from your coupon
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <Coins className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    You've redeemed {success.amount} coins! Your new balance is {success.newBalance} coins.
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading || code.replace(/-/g, "").length !== 16}>
                {loading ? "Processing..." : "Redeem Coupon"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}