"use client"

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
  TrendingUp,
  Activity,
} from "lucide-react"

export default function AdminDashboardPage() {
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
            <div className="text-3xl font-bold">1,250</div>
            <p className="text-xs mt-1 text-muted-foreground">
              <span className="text-green-600 font-medium">+12%</span> from last event
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
            <div className="text-3xl font-bold">1,180</div>
            <p className="text-xs mt-1 text-muted-foreground">
              <span className="text-orange-600 font-medium">94.4%</span> of registrations
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
            <div className="text-3xl font-bold">950</div>
            <p className="text-xs mt-1 text-muted-foreground">
              <span className="text-green-600 font-medium">80.5%</span> attendance rate
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
            <div className="text-3xl font-bold">920</div>
            <p className="text-xs mt-1 text-muted-foreground">
              <span className="text-green-600 font-medium">78.0%</span> attendance rate
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
            <div className="text-3xl font-bold">1,050</div>
            <p className="text-xs mt-1 text-muted-foreground">
              Average <span className="text-blue-600 font-medium">2.8</span> sessions per person
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
            <div className="text-3xl font-bold">320</div>
            <p className="text-xs mt-1 text-muted-foreground">
              <span className="text-green-600 font-medium">25.6%</span> of total registrations
            </p>
          </CardContent>
        </Card>
      </div>
<RegistrationsTable/>
    </div>
  )
}