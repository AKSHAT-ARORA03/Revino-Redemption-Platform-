"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export function LogoutButton() {
  const { logout } = useAuth()

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      logout();
    }
  }

  return (
    <Button 
      variant="destructive" 
      size="default" 
      onClick={handleLogout} 
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
    >
      <LogOut className="h-5 w-5" />
      Sign Out
    </Button>
  )
}
