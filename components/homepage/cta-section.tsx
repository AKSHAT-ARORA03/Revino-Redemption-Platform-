import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle, Users, Building, Gift } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  const features = [
    "Easy CSV upload for bulk distribution",
    "Real-time tracking and analytics",
    "Extensive voucher marketplace",
    "24/7 customer support",
    "Secure and reliable platform",
    "Custom branding options",
  ]

  const userTypes = [
    {
      icon: Building,
      title: "For Companies",
      description: "Manage rewards and boost employee engagement",
      link: "/register",
      color: "from-blue-600 to-purple-600",
    },
    {
      icon: Users,
      title: "For Employees",
      description: "Redeem codes and enjoy amazing rewards",
      link: "/register",
      color: "from-green-600 to-teal-600",
    },
    {
      icon: Gift,
      title: "For Admins",
      description: "Complete system control and management",
      link: "/login",
      color: "from-orange-600 to-red-600",
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2 mb-4">Ready to Get Started?</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Transform Your Workplace Today</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join thousands of companies already using our platform to create meaningful employee experiences
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {userTypes.map((type, index) => {
            const IconComponent = type.icon
            return (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <div className={`bg-gradient-to-r ${type.color} p-4 rounded-xl inline-block mb-4`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{type.title}</h3>
                  <p className="text-white/80 mb-4">{type.description}</p>
                  <Link href={type.link}>
                    <Button className="w-full bg-white text-gray-900 hover:bg-gray-100">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Grid */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Everything You Need to Succeed</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 text-white">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Browse Catalog CTA */}
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-white mb-6">Explore Our Extensive Rewards Collection</h3>
          <Link href="/catalog">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🎁 Browse Full Rewards Catalog
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Featured Categories */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { name: "Electronics", icon: "🔌" },
            { name: "Travel", icon: "✈️" },
            { name: "Dining", icon: "🍽️" },
            { name: "Wellness", icon: "🧘" }
          ].map((category, index) => (
            <Link href="/catalog" key={index}>
              <div className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 p-4 rounded-lg text-center cursor-pointer">
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="text-white font-medium">{category.name}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8">
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
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
          <p className="text-white/70 mt-4 text-sm">No credit card required • Free 30-day trial • Cancel anytime</p>
        </div>
      </div>
    </section>
  )
}
