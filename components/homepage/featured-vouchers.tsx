"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, Coins, ExternalLink } from "lucide-react"
import type { SerializedVoucher } from "@/lib/data"
import Link from "next/link"

interface FeaturedVouchersProps {
  vouchers: SerializedVoucher[]
}

export function FeaturedVouchers({ vouchers }: FeaturedVouchersProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1)
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2)
      } else {
        setVisibleCount(3)
      }
    }

    updateVisibleCount()
    window.addEventListener("resize", updateVisibleCount)
    return () => window.removeEventListener("resize", updateVisibleCount)
  }, [])

  useEffect(() => {
    if (vouchers.length > visibleCount) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % (vouchers.length - visibleCount + 1))
      }, 4000)
      return () => clearInterval(timer)
    }
  }, [vouchers.length, visibleCount])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (vouchers.length - visibleCount + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + vouchers.length - visibleCount + 1) % (vouchers.length - visibleCount + 1))
  }

  if (vouchers.length === 0) return null

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="h-6 w-6 text-yellow-500 fill-current" />
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Featured Brand Rewards
            </Badge>
            <Star className="h-6 w-6 text-yellow-500 fill-current" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Premium Brand Vouchers</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover exclusive rewards from your favorite brands - Amazon, Netflix, Starbucks, and more!
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              }}
            >
              {vouchers.map((voucher) => (
                <div key={voucher.id} className="flex-shrink-0 px-3" style={{ width: `${100 / visibleCount}%` }}>
                  <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 overflow-hidden">
                    <div className="relative">
                      <img
                        src={voucher.imageUrl || "/placeholder.svg?height=200&width=300"}
                        alt={voucher.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=200&width=300"
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 text-yellow-900">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Featured
                        </Badge>
                      </div>
                      {voucher.brand && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="outline" className="bg-white/90 text-gray-800 font-semibold">
                            {voucher.brand}
                          </Badge>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2">
                        <Badge className="bg-blue-600 text-white font-bold">
                          <Coins className="h-3 w-3 mr-1" />
                          {voucher.coinValue}
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">{voucher.title}</CardTitle>
                      <CardDescription className="text-gray-600 line-clamp-2">{voucher.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-sm">
                          {voucher.category}
                        </Badge>
                        {voucher.originalPrice && (
                          <span className="text-sm text-green-600 font-semibold">Worth {voucher.originalPrice}</span>
                        )}
                      </div>

                      <div className="text-sm text-gray-500 mb-4">
                        Valid until: {new Date(voucher.expiryDate).toLocaleDateString()}
                      </div>

                      <Link href="/login">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get Started to Redeem
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {vouchers.length > visibleCount && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-lg hover:shadow-xl text-gray-700 p-3 rounded-full transition-all z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-lg hover:shadow-xl text-gray-700 p-3 rounded-full transition-all z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
