import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { AuthRedirect } from "@/components/auth-redirect"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Reward System Platform",
  description: "Complete reward management system for companies and employees",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster />
          <AuthRedirect />
        </AuthProvider>
      </body>
    </html>
  )
}
