"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { Coins, LogOut, RefreshCw } from "lucide-react"
import Link from "next/link"

// Helper function to get dashboard link based on user role
function getDashboardLink(role: string): string {
  switch (role) {
    case 'superadmin':
      return '/superadmin'
    case 'company_admin':
      return '/company-admin'
    case 'employee':
      return '/employee'
    default:
      return '/'
  }
}

// Helper function to get role-specific badge styling
function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'superadmin':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'company_admin':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'employee':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return ''
  }
}

// Helper function for logout button styling
function getLogoutButtonClass(role: string): string {
  switch (role) {
    case 'superadmin':
      return 'border-red-300 hover:bg-red-50 hover:text-red-800'
    case 'company_admin':
      return 'border-purple-300 hover:bg-purple-50 hover:text-purple-800'
    case 'employee':
      return 'border-green-300 hover:bg-green-50 hover:text-green-800'
    default:
      return ''
  }
}

export function Navbar() {
  const { user, logout } = useAuth()
  const [coinBalance, setCoinBalance] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchCoinBalance()
      // Set up periodic refresh every 30 seconds
      const interval = setInterval(fetchCoinBalance, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchCoinBalance = async () => {
    if (!user) return

    setRefreshing(true)
    try {
      let endpoint = ""
      switch (user.role) {
        case "superadmin":
          endpoint = "/api/superadmin/coins"
          break
        case "company_admin":
          endpoint = "/api/company-admin/wallet"
          break
        case "employee":
          endpoint = "/api/employee/wallet"
          break
        default:
          return
      }

      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setCoinBalance(data.balance)
      }
    } catch (error) {
      console.error("Failed to fetch coin balance:", error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link 
              href={user ? getDashboardLink(user.role) : "/"} 
              className="text-xl font-bold text-gray-900"
            >
              Reward System
            </Link>
            {user && (
              <Badge 
                variant="outline" 
                className={getRoleBadgeClass(user.role)}
              >
                {user.role.replace("_", " ").toUpperCase()}
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Live Coin Balance */}
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                  <Coins className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {coinBalance != null ? coinBalance.toLocaleString() : "..."} coins
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchCoinBalance}
                    disabled={refreshing}
                    className="h-6 w-6 p-0 hover:bg-blue-100"
                  >
                    <RefreshCw className={`h-3 w-3 text-blue-600 ${refreshing ? "animate-spin" : ""}`} />
                  </Button>
                </div>

                <span className="text-sm text-gray-600">
                  {user.name} {user.companyName && `(${user.companyName})`}
                </span>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout} 
                  className={`flex items-center gap-2 ${user ? getLogoutButtonClass(user.role) : ''}`}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-gray-900 border-gray-300 hover:bg-gray-50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
