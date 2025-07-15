"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Coins, Search, Filter, Grid, List, ExternalLink, Star } from "lucide-react"
import type { SerializedVoucher } from "@/lib/data"
import Link from "next/link"

interface VoucherShowcaseProps {
  vouchers: SerializedVoucher[]
}

export function VoucherShowcase({ vouchers }: VoucherShowcaseProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showCount, setShowCount] = useState(12)

  // Filter vouchers
  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      voucher.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.brand?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || voucher.category === categoryFilter
    const matchesBrand = brandFilter === "all" || voucher.brand === brandFilter

    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "low" && voucher.coinValue <= 200) ||
      (priceFilter === "medium" && voucher.coinValue > 200 && voucher.coinValue <= 500) ||
      (priceFilter === "high" && voucher.coinValue > 500)

    return matchesSearch && matchesCategory && matchesPrice && matchesBrand
  })

  const categories = [...new Set(vouchers.map((v) => v.category))]
  const brands = [...new Set(vouchers.map((v) => v.brand).filter(Boolean) as string[])]
  const displayedVouchers = filteredVouchers.slice(0, showCount)

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Complete Brand Collection</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our extensive collection of vouchers from top brands across all categories
          </p>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search brands, vouchers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
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

            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">1-200 coins</SelectItem>
                <SelectItem value="medium">201-500 coins</SelectItem>
                <SelectItem value="high">500+ coins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {displayedVouchers.length} of {filteredVouchers.length} vouchers
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>
                  {searchTerm && `"${searchTerm}" • `}
                  {categoryFilter !== "all" && `${categoryFilter} • `}
                  {brandFilter !== "all" && `${brandFilter} • `}
                  {priceFilter !== "all" && `${priceFilter} price`}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Voucher Grid/List */}
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
          }
        >
          {displayedVouchers.map((voucher) => (
            <Card
              key={voucher.id}
              className={`hover:shadow-lg transition-all duration-300 overflow-hidden ${
                viewMode === "list" ? "flex flex-row" : ""
              }`}
            >
              {viewMode === "grid" ? (
                <>
                  <div className="relative">
                    <img
                      src={voucher.imageUrl || "/placeholder.svg?height=200&width=300"}
                      alt={voucher.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                    <div className="absolute top-2 left-2 flex gap-2">
                      {voucher.featured && (
                        <Badge className="bg-yellow-500 text-yellow-900">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      )}
                      {voucher.brand && (
                        <Badge variant="outline" className="bg-white/90 text-gray-800 font-semibold">
                          {voucher.brand}
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <Badge className="bg-blue-600 text-white font-bold">
                        <Coins className="h-3 w-3 mr-1" />
                        {voucher.coinValue}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold line-clamp-2">{voucher.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{voucher.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">{voucher.category}</Badge>
                      {voucher.originalPrice && (
                        <span className="text-sm text-green-600 font-semibold">{voucher.originalPrice}</span>
                      )}
                    </div>
                    <Link href="/login">
                      <Button className="w-full" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </>
              ) : (
                <div className="flex w-full">
                  <div className="relative">
                    <img
                      src={voucher.imageUrl || "/placeholder.svg?height=120&width=120"}
                      alt={voucher.title}
                      className="w-24 h-24 object-cover rounded-lg m-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=120&width=120"
                      }}
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{voucher.title}</h3>
                        {voucher.brand && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {voucher.brand}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {voucher.featured && (
                          <Badge className="bg-yellow-500 text-yellow-900">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-blue-600 font-bold">
                          <Coins className="h-4 w-4" />
                          {voucher.coinValue}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2 line-clamp-2">{voucher.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{voucher.category}</Badge>
                        {voucher.originalPrice && (
                          <span className="text-sm text-green-600 font-semibold">Worth {voucher.originalPrice}</span>
                        )}
                      </div>
                      <Link href="/login">
                        <Button size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Load More */}
        {filteredVouchers.length > showCount && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => setShowCount((prev) => prev + 12)} className="px-8">
              Load More Vouchers
            </Button>
          </div>
        )}

        {filteredVouchers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No vouchers found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </section>
  )
}
