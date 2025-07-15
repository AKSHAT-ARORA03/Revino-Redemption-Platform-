"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Gift, Coins, Users, Award } from "lucide-react"

const heroSlides = [
  {
    title: "Transform Your Workplace Rewards",
    subtitle: "Empower your team with a comprehensive reward system",
    description: "Distribute coins, manage vouchers, and boost employee engagement with our all-in-one platform.",
    gradient: "from-blue-600 via-purple-600 to-indigo-800",
    icon: Gift,
  },
  {
    title: "Seamless Coin Distribution",
    subtitle: "Send rewards directly to your employees",
    description: "Upload CSV files, distribute coins instantly, and track redemptions in real-time.",
    gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    icon: Coins,
  },
  {
    title: "Engage Your Team",
    subtitle: "Build a culture of recognition and rewards",
    description: "Motivate employees with meaningful rewards and create lasting workplace satisfaction.",
    gradient: "from-orange-500 via-red-500 to-pink-600",
    icon: Users,
  },
  {
    title: "Premium Voucher Marketplace",
    subtitle: "Access hundreds of exciting rewards",
    description: "From gift cards to experiences, give your team the freedom to choose their perfect reward.",
    gradient: "from-violet-600 via-purple-600 to-fuchsia-700",
    icon: Award,
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const currentHero = heroSlides[currentSlide]
  const IconComponent = currentHero.icon

  return (
    <div className="relative overflow-hidden">
      <div className={`bg-gradient-to-br ${currentHero.gradient} transition-all duration-1000`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-white space-y-8">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <IconComponent className="h-4 w-4 mr-2" />
                  {currentHero.subtitle}
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">{currentHero.title}</h1>
                <p className="text-xl lg:text-2xl text-white/90 leading-relaxed">{currentHero.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-gray-900 px-8"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Slide indicators */}
              <div className="flex space-x-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSlide ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="text-center space-y-6">
                  <IconComponent className="h-24 w-24 text-white mx-auto" />
                  <div className="grid grid-cols-2 gap-4 text-white">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold">500+</div>
                      <div className="text-sm opacity-90">Active Vouchers</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold">10K+</div>
                      <div className="text-sm opacity-90">Happy Employees</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold">99%</div>
                      <div className="text-sm opacity-90">Satisfaction Rate</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-sm opacity-90">Support</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
