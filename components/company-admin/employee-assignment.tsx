"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload, Users } from "lucide-react"
import Papa from "papaparse"

interface PurchasedVoucher {
  id: string
  voucherId: string
  voucherTitle: string
  purchasedAt: string
  isAssigned: boolean
}

export function EmployeeAssignment() {
  const [purchasedVouchers, setPurchasedVouchers] = useState<PurchasedVoucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPurchasedVouchers()
  }, [])

  const fetchPurchasedVouchers = async () => {
    try {
      const response = await fetch("/api/company-admin/purchased-vouchers")
      if (response.ok) {
        const data = await response.json()
        setPurchasedVouchers(data.filter((v: PurchasedVoucher) => !v.isAssigned))
      }
    } catch (error) {
      console.error("Failed to fetch purchased vouchers:", error)
    }
  }

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

  const handleAssignment = async () => {
    if (!selectedVoucher || !csvFile) {
      toast({
        title: "Missing information",
        description: "Please select a voucher and upload a CSV file",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      Papa.parse(csvFile, {
        header: true,
        complete: async (results) => {
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

          const response = await fetch("/api/company-admin/assign-vouchers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              voucherId: selectedVoucher,
              employees: validEmployees,
            }),
          })

          if (response.ok) {
            const result = await response.json()
            toast({
              title: "Assignment successful",
              description: `Vouchers assigned to ${result.assignedCount} employees`,
            })
            setSelectedVoucher("")
            setCsvFile(null)
            fetchPurchasedVouchers()
          } else {
            const error = await response.json()
            toast({
              title: "Assignment failed",
              description: error.error || "Something went wrong",
              variant: "destructive",
            })
          }
          setLoading(false)
        },
        error: () => {
          toast({
            title: "CSV parsing error",
            description: "Failed to parse CSV file",
            variant: "destructive",
          })
          setLoading(false)
        },
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Vouchers: {purchasedVouchers.length}
          </CardTitle>
          <CardDescription>Vouchers you've purchased that haven't been assigned yet</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign Vouchers to Employees</CardTitle>
          <CardDescription>Select a voucher and upload a CSV file with employee details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voucher">Select Voucher</Label>
            <Select value={selectedVoucher} onValueChange={setSelectedVoucher}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a voucher to assign" />
              </SelectTrigger>
              <SelectContent>
                {purchasedVouchers.map((voucher) => (
                  <SelectItem key={voucher.id} value={voucher.id}>
                    {voucher.voucherTitle} - Purchased on {new Date(voucher.purchasedAt).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv">Upload Employee CSV</Label>
            <Input id="csv" type="file" accept=".csv" onChange={handleFileChange} />
            <p className="text-sm text-gray-500">CSV should contain columns: name, email</p>
          </div>

          <Button
            onClick={handleAssignment}
            disabled={loading || !selectedVoucher || !csvFile}
            className="w-full flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {loading ? "Assigning..." : "Assign Vouchers"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Format Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="text-sm">
              {`name,email
John Doe,john@company.com
Jane Smith,jane@company.com
Bob Johnson,bob@company.com`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
