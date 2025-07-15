"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, Eye, Calendar, User, Building, Coins, Clock, CheckCircle, XCircle } from "lucide-react"

interface RedemptionCodeDetails {
  id: string
  code: string
  coinAmount: number
  employeeEmail: string
  employeeName: string
  companyAdminId: string
  companyAdminName: string
  companyName: string
  isRedeemed: boolean
  redeemedAt?: string
  createdAt: string
  expiresAt: string
  isExpired: boolean
  daysUntilExpiry: number
}

export function CodeTracking() {
  const [codes, setCodes] = useState<RedemptionCodeDetails[]>([])
  const [filteredCodes, setFilteredCodes] = useState<RedemptionCodeDetails[]>([])
  const [searchCode, setSearchCode] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCodes()
  }, [])

  useEffect(() => {
    filterCodes()
  }, [codes, searchCode, statusFilter, companyFilter])

  const fetchCodes = async () => {
    try {
      const response = await fetch("/api/superadmin/redemption-codes")
      if (response.ok) {
        const data = await response.json()
        setCodes(data)
      }
    } catch (error) {
      console.error("Failed to fetch codes:", error)
    }
  }

  const filterCodes = () => {
    let filtered = codes

    // Search by code
    if (searchCode) {
      filtered = filtered.filter(
        (code) =>
          code.code.toLowerCase().includes(searchCode.toLowerCase()) ||
          code.employeeEmail.toLowerCase().includes(searchCode.toLowerCase()) ||
          code.employeeName.toLowerCase().includes(searchCode.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "redeemed":
          filtered = filtered.filter((code) => code.isRedeemed)
          break
        case "pending":
          filtered = filtered.filter((code) => !code.isRedeemed && !code.isExpired)
          break
        case "expired":
          filtered = filtered.filter((code) => code.isExpired && !code.isRedeemed)
          break
      }
    }

    // Company filter
    if (companyFilter !== "all") {
      filtered = filtered.filter((code) => code.companyAdminId === companyFilter)
    }

    setFilteredCodes(filtered)
  }

  const handleCodeLookup = async () => {
    if (!searchCode.trim()) {
      toast({
        title: "Enter a code",
        description: "Please enter a redemption code to look up",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/superadmin/code-lookup/${searchCode.trim().toUpperCase()}`)
      if (response.ok) {
        const codeDetails = await response.json()
        // Highlight the found code in the list
        setStatusFilter("all")
        setCompanyFilter("all")
        setSearchCode(codeDetails.code)
        toast({
          title: "Code found",
          description: `Code ${codeDetails.code} details displayed below`,
        })
      } else {
        toast({
          title: "Code not found",
          description: "No redemption code found with that code",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to lookup code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (code: RedemptionCodeDetails) => {
    if (code.isRedeemed) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Redeemed
        </Badge>
      )
    } else if (code.isExpired) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      )
    }
  }

  // Create an object to store unique companies by ID
  const uniqueCompaniesMap = codes.reduce((acc, c) => {
    if (!acc[c.companyAdminId]) {
      acc[c.companyAdminId] = { id: c.companyAdminId, name: c.companyName };
    }
    return acc;
  }, {} as Record<string, { id: string, name: string }>);
  
  // Convert to array
  const companies = Object.values(uniqueCompaniesMap);
  const stats = {
    total: codes.length,
    redeemed: codes.filter((c) => c.isRedeemed).length,
    pending: codes.filter((c) => !c.isRedeemed && !c.isExpired).length,
    expired: codes.filter((c) => c.isExpired && !c.isRedeemed).length,
    totalValue: codes.reduce((sum, c) => sum + c.coinAmount, 0),
    redeemedValue: codes.filter((c) => c.isRedeemed).reduce((sum, c) => sum + c.coinAmount, 0),
  }

  return (
    <div className="space-y-6">
      {/* Quick Code Lookup */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Search className="h-5 w-5" />
            Quick Code Lookup
          </CardTitle>
          <CardDescription>Enter a specific redemption code to view its details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter redemption code (e.g., ABC123XY)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="font-mono text-center"
              />
            </div>
            <Button onClick={handleCodeLookup} disabled={loading}>
              <Eye className="h-4 w-4 mr-2" />
              {loading ? "Looking up..." : "Lookup"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Coins className="h-4 w-4 text-blue-600 mr-2" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Codes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <div>
                <p className="text-2xl font-bold">{stats.redeemed}</p>
                <p className="text-xs text-muted-foreground">Redeemed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-orange-600 mr-2" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-600 mr-2" />
              <div>
                <p className="text-2xl font-bold">{stats.expired}</p>
                <p className="text-xs text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label>Search Codes/Employees</Label>
          <Input
            placeholder="Search by code, employee name, or email..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="redeemed">Redeemed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Label>Company</Label>
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Value Summary */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.totalValue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Coins Distributed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.redeemedValue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Coins Redeemed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {(stats.totalValue - stats.redeemedValue).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Coins Pending/Expired</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Codes List */}
      <div className="space-y-4">
        {filteredCodes.map((code) => (
          <Card
            key={code.id}
            className={`${code.code === searchCode.toUpperCase() ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
          >
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-lg font-bold bg-gray-100 px-3 py-1 rounded">{code.code}</div>
                    {getStatusBadge(code)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">{code.coinAmount} coins</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span>{code.employeeName}</span>
                      <span className="text-gray-500">({code.employeeEmail})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-purple-600" />
                      <span>{code.companyName}</span>
                      <span className="text-gray-500">by {code.companyAdminName}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">Created: {new Date(code.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">
                        Expires: {new Date(code.expiresAt).toLocaleString()}
                        {!code.isExpired && !code.isRedeemed && (
                          <span className="ml-2 text-orange-600">({code.daysUntilExpiry} days left)</span>
                        )}
                      </span>
                    </div>

                    {code.isRedeemed && code.redeemedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          Redeemed: {new Date(code.redeemedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {code.isExpired && !code.isRedeemed && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-sm text-red-700">⚠️ This code has expired and cannot be redeemed</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCodes.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              {searchCode || statusFilter !== "all" || companyFilter !== "all"
                ? "No codes found matching your criteria"
                : "No redemption codes have been created yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
