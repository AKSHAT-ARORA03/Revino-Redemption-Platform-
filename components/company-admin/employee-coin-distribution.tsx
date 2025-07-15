"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"
import Papa from "papaparse"

interface EmployeeCoinDistributionProps {
  onDistributionComplete?: (remainingBalance: number) => void
}

export function EmployeeCoinDistribution({ onDistributionComplete }: EmployeeCoinDistributionProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [coinAmount, setCoinAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid CSV file",
        variant: "destructive",
      })
    }
  }

  const handleDistribution = async () => {
    if (!csvFile || !coinAmount || Number.parseInt(coinAmount) <= 0) {
      toast({
        title: "Missing information",
        description: "Please select a CSV file and enter coin amount",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      Papa.parse(csvFile, {
        header: true,
        complete: async (results) => {
          try {
            const employees = results.data as Array<{
              name: string
              email: string
            }>

            // Validate CSV data
            const validEmployees = employees.filter((emp) => emp.name && emp.email && emp.email.includes("@"))

            if (validEmployees.length === 0) {
              toast({
                title: "Invalid CSV",
                description: "No valid employee records found in CSV",
                variant: "destructive",
              })
              setLoading(false)
              return
            }

            console.log("Sending distribution request:", {
              employees: validEmployees,
              coinAmount: Number.parseInt(coinAmount),
            })

            const response = await fetch("/api/company-admin/distribute-coins", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                employees: validEmployees,
                coinAmount: Number.parseInt(coinAmount),
              }),
            })

            console.log("Response status:", response.status)

            // Handle response
            if (!response.ok) {
              let errorMessage = "Something went wrong"
              try {
                const errorData = await response.json()
                console.error("Error response:", errorData)
                errorMessage = errorData.error || errorMessage
                if (errorData.details) {
                  console.error("Error details:", errorData.details)
                }
              } catch (jsonError) {
                console.error("Failed to parse error response:", jsonError)
                errorMessage = `Server error: ${response.status} ${response.statusText}`
              }

              toast({
                title: "Distribution failed",
                description: errorMessage,
                variant: "destructive",
              })
              setLoading(false)
              return
            }

            // Parse successful response
            const result = await response.json()
            console.log("Success response:", result)
            
            // Show notification for coin deduction
            toast({
              title: "Coins deducted successfully! 💰",
              description: `${result.totalCost} coins deducted from your balance. Remaining: ${result.remainingBalance} coins`,
            })
            
            // Show notification for email status after a short delay
            setTimeout(() => {
              if (result.sentCount > 0) {
                toast({
                  title: "Emails sent successfully! 📧",
                  description: `${result.sentCount} out of ${result.codesCreated} emails were sent successfully.`,
                  variant: result.sentCount === result.codesCreated ? "default" : "destructive",
                });
              } 
              
              if (result.emailsFailed && result.emailsFailed > 0) {
                setTimeout(() => {
                  toast({
                    title: "Some emails failed to send ⚠️",
                    description: `${result.emailsFailed} emails could not be delivered. Codes are still valid and can be viewed in the admin panel.`,
                    variant: "destructive",
                  });
                }, 1000);
              }
            }, 2000)

            // Notify parent component about the new balance
            onDistributionComplete?.(result.remainingBalance)

            setCsvFile(null)
            setCoinAmount("")

            // Reset file input
            const fileInput = document.getElementById("csv") as HTMLInputElement
            if (fileInput) {
              fileInput.value = ""
            }
          } catch (apiError) {
            console.error("API call error:", apiError)
            toast({
              title: "Distribution failed",
              description: "Failed to communicate with server. Please try again.",
              variant: "destructive",
            })
          } finally {
            setLoading(false)
          }
        },
        error: (parseError) => {
          console.error("CSV parsing error:", parseError)
          toast({
            title: "CSV parsing error",
            description: "Failed to parse CSV file. Please check the format.",
            variant: "destructive",
          })
          setLoading(false)
        },
      })
    } catch (error) {
      console.error("Distribution error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribute Coins to Employees</CardTitle>
        <CardDescription>Send redemption codes to employees via email</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="coinAmount">Coins per Employee</Label>
          <Input
            id="coinAmount"
            type="number"
            value={coinAmount}
            onChange={(e) => setCoinAmount(e.target.value)}
            placeholder="Enter coin amount"
            min="1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv">Upload Employee CSV</Label>
          <Input id="csv" type="file" accept=".csv" onChange={handleFileChange} />
          <p className="text-sm text-gray-500">CSV should contain columns: name, email</p>
        </div>

        <Button
          onClick={handleDistribution}
          disabled={loading || !csvFile || !coinAmount}
          className="w-full flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {loading ? "Sending..." : "Send Redemption Codes"}
        </Button>
      </CardContent>
    </Card>
  )
}
