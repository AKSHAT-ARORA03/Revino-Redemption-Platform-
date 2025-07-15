"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ActivityLog {
  id: string
  userId: string
  action: string
  details: string
  timestamp: string
  userName?: string
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchTerm, actionFilter])

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/superadmin/activity-logs")
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    }
  }

  const filterLogs = () => {
    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter)
    }

    setFilteredLogs(filtered)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "coin_add":
      case "coin_approve":
        return "default"
      case "coin_remove":
      case "coin_reject":
        return "destructive"
      case "voucher_create":
      case "voucher_purchase":
        return "secondary"
      case "voucher_redeem":
        return "outline"
      default:
        return "secondary"
    }
  }

  const uniqueActions = [...new Set(logs.map((log) => log.action))]

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="max-w-sm">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((action) => (
              <SelectItem key={action} value={action}>
                {action.replace("_", " ").toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getActionColor(log.action)}>{log.action.replace("_", " ").toUpperCase()}</Badge>
                    <span className="text-sm text-gray-500">{log.userName || "System"}</span>
                  </div>
                  <p className="text-sm">{log.details}</p>
                </div>
                <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No logs found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
