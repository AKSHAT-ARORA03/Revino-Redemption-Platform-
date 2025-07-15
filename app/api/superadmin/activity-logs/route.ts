import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getActivityLogs, getUsers } from "@/lib/data"

export async function GET() {
  try {
    await requireAuth("superadmin")

    const [logs, users] = await Promise.all([getActivityLogs(), getUsers()])

    // Enhance logs with user names
    const enhancedLogs = logs
      .map((log) => {
        const user = users.find((u) => u.id === log.userId)
        return {
          ...log,
          userName: user?.name || "Unknown User",
        }
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(enhancedLogs)
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
