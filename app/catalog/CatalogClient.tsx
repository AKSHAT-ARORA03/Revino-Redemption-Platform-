"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Coins, Search, Filter } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface Voucher {
  id: string
  title: string
  description: string
  category: string
  coinValue: number
  expiryDate: string
  isActive: boolean
}

export default function CatalogClient() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchVouchers()
  }, [])

  useEffect(() => {
    filterVouchers()
  }, [vouchers, searchTerm, categoryFilter, priceFilter])

  const fetchVouchers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/vouchers")
      if (response.ok) {
        const data = await response.json()
        const activeVouchers = data.filter((v: Voucher) => v.isActive)
        setVouchers(activeVouchers)
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(activeVouchers.map((v: Voucher) => v.category))
        )
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error("Failed to fetch vouchers:", error)
      toast({
        title: "Error",
        description: "Failed to load vouchers. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterVouchers = () => {
    let filtered = vouchers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (voucher) =>
          voucher.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((voucher) => voucher.category === categoryFilter)
    }

    // Price filter
    if (priceFilter !== "all") {
      switch (priceFilter) {
        case "low":
          filtered = filtered.filter((voucher) => voucher.coinValue <= 100)
          break
        case "medium":
          filtered = filtered.filter((voucher) => voucher.coinValue > 100 && voucher.coinValue <= 500)
          break
        case "high":
          filtered = filtered.filter((voucher) => voucher.coinValue > 500)
          break
      }
    }

    setFilteredVouchers(filtered)
  }

  const handleRedeemClick = (voucherId: string) => {
    // Check if user is logged in using the useAuth hook
    if (!user) {
      // Redirect to login page with return URL to this specific voucher
      router.push(`/login?returnUrl=${encodeURIComponent(`/catalog?redeem=${voucherId}`)}`)
      return;
    }
    
    // If user is logged in, redirect to purchase page
    router.push(`/employee/purchase-voucher/${voucherId}`)
  }
  
  // Check if we need to redirect to a specific voucher after login
  useEffect(() => {
    const redeemVoucherId = searchParams.get('redeem')
    if (redeemVoucherId && user) {
      // User is logged in and has a voucher ID in the URL
      // Redirect to purchase page
      router.push(`/employee/purchase-voucher/${redeemVoucherId}`)
    }
  }, [searchParams, user, router])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reward Catalog</h1>
        <p className="text-gray-600">Browse available rewards and vouchers</p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search vouchers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="low">Low (≤ 100)</SelectItem>
              <SelectItem value="medium">Medium (101-500)</SelectItem>
              <SelectItem value="high">High (> 500)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVouchers.map((voucher) => (
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
                    onClick={() => handleRedeemClick(voucher.id)}
                    className="w-full flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Redeem Reward
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredVouchers.length === 0 && (
            <div className="col-span-1 md:col-span-3">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-500">
                    No vouchers found matching your criteria. Try adjusting your filters.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}