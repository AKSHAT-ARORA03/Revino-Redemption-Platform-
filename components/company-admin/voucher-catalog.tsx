"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Gift, Search, Filter } from "lucide-react"

interface Voucher {
  id: string
  title: string
  description: string
  category: string
  coinValue: number
  expiryDate: string
  isActive: boolean
}

export function VoucherCatalog() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")

  useEffect(() => {
    fetchVouchers()
  }, [])

  useEffect(() => {
    filterVouchers()
  }, [vouchers, searchTerm, categoryFilter, priceFilter])

  const fetchVouchers = async () => {
    try {
      const response = await fetch("/api/vouchers")
      if (response.ok) {
        const data = await response.json()
        const activeVouchers = data.filter((v: Voucher) => v.isActive)
        setVouchers(activeVouchers)
      }
    } catch (error) {
      console.error("Failed to fetch vouchers:", error)
    }
  }

  const filterVouchers = () => {
    let filtered = vouchers

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (voucher) =>
          voucher.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.description.toLowerCase().includes(searchTerm.toLowerCase()),
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

  const categories = [...new Set(vouchers.map((v) => v.category))]
  const priceRanges = [
    { value: "low", label: "1-100 coins" },
    { value: "medium", label: "101-500 coins" },
    { value: "high", label: "500+ coins" },
  ]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search vouchers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
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
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Prices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            {priceRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Gift className="h-4 w-4 text-blue-600 mr-2" />
              <div>
                <p className="text-2xl font-bold">{filteredVouchers.length}</p>
                <p className="text-xs text-muted-foreground">Available Vouchers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-green-600 mr-2" />
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Badge className="h-4 w-4 text-purple-600 mr-2" />
              <div>
                <p className="text-2xl font-bold">
                  {filteredVouchers.length > 0 ? Math.min(...filteredVouchers.map((v) => v.coinValue)) : 0}-
                  {filteredVouchers.length > 0 ? Math.max(...filteredVouchers.map((v) => v.coinValue)) : 0}
                </p>
                <p className="text-xs text-muted-foreground">Coin Range</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voucher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVouchers.map((voucher) => (
          <Card key={voucher.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{voucher.title}</CardTitle>
                <Badge variant="secondary">{voucher.coinValue} coins</Badge>
              </div>
              <CardDescription>{voucher.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium">{voucher.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valid Until:</span>
                  <span className="text-sm">{new Date(voucher.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVouchers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No vouchers found matching your criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Recommendation Box */}
      {filteredVouchers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">💡 Distribution Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              Based on available vouchers, consider distributing{" "}
              <strong>{Math.ceil(Math.min(...filteredVouchers.map((v) => v.coinValue)) * 1.2)} coins</strong> per
              employee to allow them to purchase at least one voucher with some flexibility.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
