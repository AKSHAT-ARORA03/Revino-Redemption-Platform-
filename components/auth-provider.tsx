"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  companyName?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const timestamp = new Date().getTime(); // Add cache-busting parameter
      const response = await fetch(`/api/auth/me?t=${timestamp}`, {
        credentials: 'include', // Ensure cookies are sent
        cache: 'no-store', // Prevent caching
      })
      if (response.ok) {
        const userData = await response.json()
        console.log("Auth check successful:", userData);
        setUser(userData)
      } else {
        console.log("Auth check failed with status:", response.status);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null);
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    setLoading(true);
    await checkAuth();
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include" // Ensure cookies are sent
      })
      setUser(null)
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, logout, refresh }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
