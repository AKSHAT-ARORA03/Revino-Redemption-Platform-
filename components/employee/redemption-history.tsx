"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Gift } from "lucide-react"

interface RedemptionRecord {
  id: string
  voucherTitle: string
  voucherDescription: string
  voucherCategory: string
  coinValue: number
  redeemedAt: string
  assignedAt: string
}

export function RedemptionHistory() {
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([])
  const [filteredRedemptions, setFilteredRedemptions] = useState<RedemptionRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchRedemptions()
  }, [])

  useEffect(() => {
    filterRedemptions()
  }, [redemptions, searchTerm])

  const fetchRedemptions = async () => {
    try {
      const response = await fetch("/api/employee/redemption-history")
      if (response.ok) {
        const data = await response.json()
        setRedemptions(data)
      }
    } catch (error) {
      console.error("Failed to fetch redemption history:", error)
    }
  }

  const filterRedemptions = () => {
    if (!searchTerm) {
      setFilteredRedemptions(redemptions)
    } else {
      const filtered = redemptions.filter(
        (redemption) =>
          redemption.voucherTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          redemption.voucherCategory.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredRedemptions(filtered)
    }
  }

  const totalValue = redemptions.reduce((sum, r) => sum + r.coinValue, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Total Redemptions: {redemptions.length}</h3>
          <p className="text-sm text-gray-600">Total Value: {totalValue.toLocaleString()} coins</p>
        </div>
        <Input
          placeholder="Search redemptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="space-y-4">
        {filteredRedemptions.map((redemption) => (
          <Card key={redemption.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium">{redemption.voucherTitle}</h4>
                    <Badge variant="secondary">{redemption.coinValue} coins</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{redemption.voucherDescription}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Category: {redemption.voucherCategory}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Assigned: {new Date(redemption.assignedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Redeemed</p>
                  <p className="text-xs text-gray-500">{new Date(redemption.redeemedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRedemptions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              {searchTerm ? "No redemptions found matching your search" : "No redemptions yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
