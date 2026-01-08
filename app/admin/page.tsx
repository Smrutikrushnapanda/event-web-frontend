"use client"

import { useEffect, useState } from "react"
import { RegistrationsTable } from "@/components/admin-dashboard/tables/registration-table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Users,
  FileText,
  Calendar,
  Utensils,
  Coffee,
  Shield,
  Loader2,
} from "lucide-react"
import { registrationApi, StatisticsResponse, ExportStatsResponse } from "@/lib/api"

export default function AdminDashboardPage() {
  const [statistics, setStatistics] = useState<StatisticsResponse | null>(null)
  const [exportStats, setExportStats] = useState<ExportStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatistics()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStatistics, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [stats, exportData] = await Promise.all([
        registrationApi.getStatistics(),
        registrationApi.getExportStats(),
      ])
      
      setStatistics(stats)
      setExportStats(exportData)
    } catch (err: any) {
      console.error('Error fetching statistics:', err)
      setError(err.message || 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  // Calculate attendance rate
  const calculateAttendanceRate = (count: number, total: number) => {
    if (total === 0) return "0.0"
    return ((count / total) * 100).toFixed(1)
  }

  // Calculate average sessions per person
  const calculateAvgSessions = () => {
    if (!statistics || statistics.totalAttendees === 0) return "0.0"
    return (statistics.checkIns.session / statistics.totalAttendees).toFixed(1)
  }

  if (loading && !statistics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading statistics...</span>
      </div>
    )
  }

  if (error && !statistics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={fetchStatistics}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    )
  }

  const totalRegistrations = statistics?.totalRegistrations || 0
  const totalEntry = statistics?.checkIns.entry || 0
  const totalLunch = statistics?.checkIns.lunch || 0
  const totalDinner = statistics?.checkIns.dinner || 0
  const totalSession = statistics?.checkIns.session || 0
  const totalBlocks = exportStats?.totalBlocks || 0

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Registration */}
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Registration
            </CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRegistrations.toLocaleString()}</div>
            <p className="text-xs mt-1 text-muted-foreground">
              Total participants registered
            </p>
          </CardContent>
        </Card>

        {/* Total Entry */}
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entry
            </CardTitle>
            <FileText className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEntry.toLocaleString()}</div>
            <p className="text-xs mt-1 text-muted-foreground">
              <span className="text-orange-600 font-medium">
                {calculateAttendanceRate(totalEntry, totalRegistrations)}%
              </span>{" "}
              of registrations
            </p>
          </CardContent>
        </Card>

        {/* Total Lunch */}
        <Card className="shadow-sm border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Lunch
            </CardTitle>
            <Utensils className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLunch.toLocaleString()}</div>
            <p className="text-xs mt-1 text-muted-foreground">
              <span className="text-green-600 font-medium">
                {calculateAttendanceRate(totalLunch, totalRegistrations)}%
              </span>{" "}
              attendance rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row of Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Dinner */}
        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Dinner
            </CardTitle>
            <Coffee className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDinner.toLocaleString()}</div>
            <p className="text-xs mt-1 text-muted-foreground">
              <span className="text-green-600 font-medium">
                {calculateAttendanceRate(totalDinner, totalRegistrations)}%
              </span>{" "}
              attendance rate
            </p>
          </CardContent>
        </Card>

        {/* Total Session Attendee */}
        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Session Attendee
            </CardTitle>
            <Calendar className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSession.toLocaleString()}</div>
            <p className="text-xs mt-1 text-muted-foreground">
              Average{" "}
              <span className="text-blue-600 font-medium">
                {calculateAvgSessions()}
              </span>{" "}
              sessions per person
            </p>
          </CardContent>
        </Card>

        {/* Total Block Participate */}
        <Card className="shadow-sm border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Block Participate
            </CardTitle>
            <Shield className="h-5 w-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalBlocks.toLocaleString()}</div>
            <p className="text-xs mt-1 text-muted-foreground">
              Unique blocks represented
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Registrations Table */}
      <RegistrationsTable />
    </div>
  )
}