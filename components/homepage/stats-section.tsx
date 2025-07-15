import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Gift, Building, Award, TrendingUp, Star } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "50,000+",
      label: "Active Users",
      description: "Employees using our platform",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Gift,
      value: "500+",
      label: "Available Vouchers",
      description: "Across all categories",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Building,
      value: "1,200+",
      label: "Companies",
      description: "Trust our platform",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Award,
      value: "2M+",
      label: "Rewards Distributed",
      description: "Total value delivered",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: TrendingUp,
      value: "98%",
      label: "Satisfaction Rate",
      description: "Employee happiness",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Platform Rating",
      description: "Based on user reviews",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="text-lg px-4 py-2 mb-4">
            Platform Statistics
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of companies that have transformed their employee engagement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`${stat.bgColor} p-3 rounded-xl`}>
                      <IconComponent className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-lg font-semibold text-gray-700">{stat.label}</div>
                      <div className="text-sm text-gray-500">{stat.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
