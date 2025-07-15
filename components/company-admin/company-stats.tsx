"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Send, Users, Gift } from "lucide-react"

type StatItem = {
  title: string
  value: string
  description: string
  icon: any
  color: string
}

export function CompanyStats() {
  const [stats, setStats] = useState<StatItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/company-admin/stats")
        
        if (response.ok) {
          const data = await response.json()
          const iconMap = {
            "coins": Coins,
            "send": Send,
            "users": Users,
            "gift": Gift
          }
          
          // Map the icon strings to actual React components
          const statItems: StatItem[] = data.stats.map((stat: any) => ({
            ...stat,
            icon: iconMap[stat.icon as keyof typeof iconMap]
          }))
          
          setStats(statItems)
        } else {
          console.error("Failed to fetch company stats")
        }
      } catch (error) {
        console.error("Error fetching company stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 w-16 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-20 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon && <stat.icon className={`h-4 w-4 ${stat.color}`} />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
