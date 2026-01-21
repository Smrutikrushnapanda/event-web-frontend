"use client"

import { useState, useEffect, useMemo } from "react"
import { RegistrationsDataTable } from "@/components/user-details/table/data-table"
import { createRegistrationColumns, Registration } from "@/components/user-details/table/columns"
import { registrationApi } from "@/lib/api"
import { odishaDistricts, odishaBlocks, odishaCategory } from "@/lib/odisha-data"
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Filter, 
  MapPin,
  Building,
  Search,
  X,
  Layers,
  Users,
  CheckCircle,
  Coffee,
  Utensils,
  Calendar,
  Download,
  FileSpreadsheet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Filters {
  search: string;
  category: string;
  district: string;
  block: string;
  date: string; // Format: YYYY-MM-DD or 'all'
}

export default function UserDetails() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)
  
  // Export states
  const [isExporting, setIsExporting] = useState(false)
  const [exportDate, setExportDate] = useState<string>('all')
  
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: 'all',
    district: 'all',
    block: 'all',
    date: 'all'
  })

  // Process registrations to compute check-in flags from checkIns array
  const processRegistrations = (data: Registration[]): Registration[] => {
    return data.map(registration => {
      const hasEntryCheckIn = registration.checkIns.some(ci => ci.type === 'entry')
      const hasLunchCheckIn = registration.checkIns.some(ci => ci.type === 'lunch')
      const hasDinnerCheckIn = registration.checkIns.some(ci => ci.type === 'dinner')
      const hasSessionCheckIn = registration.checkIns.some(ci => ci.type === 'session')

      return {
        ...registration,
        hasEntryCheckIn,
        hasLunchCheckIn,
        hasDinnerCheckIn,
        hasSessionCheckIn
      }
    })
  }

  // Extract available dates from check-ins (from scannedAt timestamps)
  const availableDates = useMemo(() => {
    const dates = new Set<string>()
    registrations.forEach(reg => {
      reg.checkIns.forEach(checkIn => {
        if (checkIn.scannedAt) {
          // Extract date from scannedAt timestamp (YYYY-MM-DD)
          const date = checkIn.scannedAt.split('T')[0]
          dates.add(date)
        }
      })
    })
    return Array.from(dates).sort((a, b) => b.localeCompare(a)) // Latest first
  }, [registrations])

  // Calculate attendance statistics (date-aware)
  const attendanceStats = useMemo(() => {
    const selectedDate = filters.date
    
    let relevantRegistrations = filteredRegistrations

    // If a specific date is selected, filter check-ins by that date
    if (selectedDate !== 'all') {
      // Count registrations that have check-ins on the selected date (extracted from scannedAt)
      const entryCount = filteredRegistrations.filter(r => 
        r.checkIns.some(ci => {
          const scannedDate = ci.scannedAt ? ci.scannedAt.split('T')[0] : null
          return ci.type === 'entry' && scannedDate === selectedDate
        })
      ).length

      const lunchCount = filteredRegistrations.filter(r => 
        r.checkIns.some(ci => {
          const scannedDate = ci.scannedAt ? ci.scannedAt.split('T')[0] : null
          return ci.type === 'lunch' && scannedDate === selectedDate
        })
      ).length

      const dinnerCount = filteredRegistrations.filter(r => 
        r.checkIns.some(ci => {
          const scannedDate = ci.scannedAt ? ci.scannedAt.split('T')[0] : null
          return ci.type === 'dinner' && scannedDate === selectedDate
        })
      ).length

      const sessionCount = filteredRegistrations.filter(r => 
        r.checkIns.some(ci => {
          const scannedDate = ci.scannedAt ? ci.scannedAt.split('T')[0] : null
          return ci.type === 'session' && scannedDate === selectedDate
        })
      ).length

      const total = filteredRegistrations.length

      return {
        entry: { 
          count: entryCount, 
          percentage: total > 0 ? Math.round((entryCount / total) * 100) : 0
        },
        lunch: { 
          count: lunchCount, 
          percentage: total > 0 ? Math.round((lunchCount / total) * 100) : 0
        },
        dinner: { 
          count: dinnerCount, 
          percentage: total > 0 ? Math.round((dinnerCount / total) * 100) : 0
        },
        session: { 
          count: sessionCount, 
          percentage: total > 0 ? Math.round((sessionCount / total) * 100) : 0
        }
      }
    }

    // If 'all' dates, use the existing hasXCheckIn flags
    const total = filteredRegistrations.length
    
    if (total === 0) {
      return {
        entry: { count: 0, percentage: 0 },
        lunch: { count: 0, percentage: 0 },
        dinner: { count: 0, percentage: 0 },
        session: { count: 0, percentage: 0 }
      }
    }

    const entryCount = filteredRegistrations.filter(r => r.hasEntryCheckIn).length
    const lunchCount = filteredRegistrations.filter(r => r.hasLunchCheckIn).length
    const dinnerCount = filteredRegistrations.filter(r => r.hasDinnerCheckIn).length
    const sessionCount = filteredRegistrations.filter(r => r.hasSessionCheckIn).length

    return {
      entry: { 
        count: entryCount, 
        percentage: Math.round((entryCount / total) * 100) 
      },
      lunch: { 
        count: lunchCount, 
        percentage: Math.round((lunchCount / total) * 100) 
      },
      dinner: { 
        count: dinnerCount, 
        percentage: Math.round((dinnerCount / total) * 100) 
      },
      session: { 
        count: sessionCount, 
        percentage: Math.round((sessionCount / total) * 100) 
      }
    }
  }, [filteredRegistrations, filters.date])

  // Use predefined categories from odisha-data.ts
  const uniqueCategories = odishaCategory

  // Use predefined districts from odisha-data.ts
  const uniqueDistricts = odishaDistricts

  // Get blocks based on selected district from odisha-data.ts
  const availableBlocks = useMemo(() => {
    if (filters.district === 'all') {
      // Return empty array when no district is selected
      return []
    }
    // Return blocks for the selected district
    return odishaBlocks[filters.district] || []
  }, [filters.district])

  useEffect(() => {
    fetchRegistrations()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [filters, registrations])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await registrationApi.getAll()
      // Process data to compute check-in flags
      const processedData = processRegistrations(data)
      setRegistrations(processedData)
      setFilteredRegistrations(processedData)
    } catch (err: any) {
      console.error('Failed to fetch registrations:', err)
      setError(err.message || 'Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...registrations]

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(reg =>
        reg.name?.toLowerCase().includes(searchTerm) ||
        reg.mobile?.includes(searchTerm) ||
        reg.qrCode?.toLowerCase().includes(searchTerm)
      )
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(reg => reg.category === filters.category)
    }

    // District filter
    if (filters.district !== 'all') {
      filtered = filtered.filter(reg => reg.district === filters.district)
    }

    // Block filter
    if (filters.block !== 'all') {
      filtered = filtered.filter(reg => reg.block === filters.block)
    }

    // Date filter - filter registrations that have check-ins on the selected date (from scannedAt)
    if (filters.date !== 'all') {
      filtered = filtered.filter(reg => 
        reg.checkIns.some(checkIn => {
          const scannedDate = checkIn.scannedAt ? checkIn.scannedAt.split('T')[0] : null
          return scannedDate === filters.date
        })
      )
    }

    setFilteredRegistrations(filtered)
    setPageIndex(0)
  }

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    if (key === 'district') {
      setFilters(prev => ({ ...prev, block: 'all' }))
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      district: 'all',
      block: 'all',
      date: 'all'
    })
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search.trim()) count++
    if (filters.category !== 'all') count++
    if (filters.district !== 'all') count++
    if (filters.block !== 'all') count++
    if (filters.date !== 'all') count++
    return count
  }, [filters])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  // ✅ UPDATED: Export for single date only
  const handleExportAttendance = async () => {
    try {
      setIsExporting(true)

      // Validate that a date is selected
      if (exportDate === 'all') {
        alert('Please select a specific date to export')
        return
      }

      await registrationApi.exportAttendance({
        date: exportDate,
        district: filters.district !== 'all' ? filters.district : undefined,
        block: filters.block !== 'all' ? filters.block : undefined,
      })

      console.log('✅ Attendance report exported successfully')
    } catch (err: any) {
      console.error('Export error:', err)
      alert(err.message || 'Failed to export attendance report')
    } finally {
      setIsExporting(false)
    }
  }

  const columns = createRegistrationColumns(pageIndex, pageSize)

  if (loading) {
    return (
      <div className="w-full rounded-lg border shadow-lg p-12 bg-card">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">
            Loading registrations...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full rounded-lg border shadow-lg p-6 bg-card">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRegistrations}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full rounded-lg border shadow-lg p-6 bg-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">
            Registrations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            View all event registrations and check-in status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-bold text-primary flex items-center gap-2">
              <Users className="h-8 w-8" />
              {filteredRegistrations.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {activeFilterCount > 0 ? 'Filtered' : 'Total'} Registrations
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRegistrations}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* ✅ UPDATED: Export Section with Single Date Dropdown */}
      <Card className="mb-6 border-2 border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Export Attendance Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Select Date *
              </label>
              <Select
                value={exportDate}
                onValueChange={setExportDate}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose date to export" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" disabled>
                    Select a date
                  </SelectItem>
                  {availableDates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {formatDate(date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info Text */}
            <div className="flex items-end">
              <div className="text-sm text-muted-foreground space-y-1">
                {exportDate !== 'all' && (
                  <div className="text-green-700 font-medium">
                    📅 Exporting: {formatDate(exportDate)}
                  </div>
                )}
                {filters.district !== 'all' && (
                  <div>📍 District: <strong>{filters.district}</strong></div>
                )}
                {filters.block !== 'all' && (
                  <div>🏢 Block: <strong>{filters.block}</strong></div>
                )}
                {filters.district === 'all' && filters.block === 'all' && exportDate === 'all' && (
                  <span className="text-xs text-muted-foreground">
                    Select date and optionally filter by district/block
                  </span>
                )}
              </div>
            </div>

            {/* Export Button */}
            <div className="flex items-end">
              <Button
                onClick={handleExportAttendance}
                disabled={isExporting || exportDate === 'all'}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export Excel
                  </>
                )}
              </Button>
            </div>
          </div>

          {exportDate === 'all' && (
            <div className="mt-3 text-sm text-orange-700 bg-orange-100 p-2 rounded">
              ⚠️ Please select a specific date to export attendance report
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Entry Card */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Entry Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {attendanceStats.entry.count}
                </div>
                <div className="text-sm text-muted-foreground">
                  of {filteredRegistrations.length} total
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {attendanceStats.entry.percentage}%
                </div>
                <div className="text-xs text-muted-foreground">Attendance</div>
              </div>
            </div>
            <Progress 
              value={attendanceStats.entry.percentage} 
              className="h-2 mt-3 [&>div]:bg-blue-600"
            />
            {filters.date !== 'all' && (
              <div className="mt-2 text-xs text-blue-600 font-medium">
                📅 {formatDate(filters.date)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lunch Card */}
        <Card className="border-2 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Coffee className="h-5 w-5 text-green-600" />
              Lunch Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {attendanceStats.lunch.count}
                </div>
                <div className="text-sm text-muted-foreground">
                  of {filteredRegistrations.length} total
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {attendanceStats.lunch.percentage}%
                </div>
                <div className="text-xs text-muted-foreground">Attendance</div>
              </div>
            </div>
            <Progress 
              value={attendanceStats.lunch.percentage} 
              className="h-2 mt-3 [&>div]:bg-green-600"
            />
            {filters.date !== 'all' && (
              <div className="mt-2 text-xs text-green-600 font-medium">
                📅 {formatDate(filters.date)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dinner Card */}
        <Card className="border-2 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Utensils className="h-5 w-5 text-orange-600" />
              Dinner Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {attendanceStats.dinner.count}
                </div>
                <div className="text-sm text-muted-foreground">
                  of {filteredRegistrations.length} total
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {attendanceStats.dinner.percentage}%
                </div>
                <div className="text-xs text-muted-foreground">Attendance</div>
              </div>
            </div>
            <Progress 
              value={attendanceStats.dinner.percentage} 
              className="h-2 mt-3 [&>div]:bg-orange-600"
            />
            {filters.date !== 'all' && (
              <div className="mt-2 text-xs text-orange-600 font-medium">
                📅 {formatDate(filters.date)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Card */}
        <Card className="border-2 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Session Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {attendanceStats.session.count}
                </div>
                <div className="text-sm text-muted-foreground">
                  of {filteredRegistrations.length} total
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {attendanceStats.session.percentage}%
                </div>
                <div className="text-xs text-muted-foreground">Attendance</div>
              </div>
            </div>
            <Progress 
              value={attendanceStats.session.percentage} 
              className="h-2 mt-3 [&>div]:bg-purple-600"
            />
            {filters.date !== 'all' && (
              <div className="mt-2 text-xs text-purple-600 font-medium">
                📅 {formatDate(filters.date)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Date Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </label>
            <Select
              value={filters.date}
              onValueChange={(value) => handleFilterChange('date', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                {availableDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {formatDate(date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Name, mobile, QR code..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Category
            </label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              District
            </label>
            <Select
              value={filters.district}
              onValueChange={(value) => handleFilterChange('district', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All districts</SelectItem>
                {uniqueDistricts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Block */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Block
            </label>
            <Select
              value={filters.block}
              onValueChange={(value) => handleFilterChange('block', value)}
              disabled={filters.district === 'all'}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={
                  filters.district === 'all' 
                    ? "Select district first" 
                    : "Select block"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  All blocks in {filters.district}
                </SelectItem>
                {availableBlocks.map((block) => (
                  <SelectItem key={block} value={block}>
                    {block}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
            {filters.date !== 'all' && (
              <Badge variant="secondary" className="gap-1 pl-2">
                Date: {formatDate(filters.date)}
                <button
                  onClick={() => handleFilterChange('date', 'all')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.search && (
              <Badge variant="secondary" className="gap-1 pl-2">
                Search: {filters.search.length > 20 ? `${filters.search.substring(0, 20)}...` : filters.search}
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.category !== 'all' && (
              <Badge variant="secondary" className="gap-1 pl-2">
                Category: {filters.category}
                <button
                  onClick={() => handleFilterChange('category', 'all')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.district !== 'all' && (
              <Badge variant="secondary" className="gap-1 pl-2">
                District: {filters.district}
                <button
                  onClick={() => handleFilterChange('district', 'all')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.block !== 'all' && (
              <Badge variant="secondary" className="gap-1 pl-2">
                Block: {filters.block}
                <button
                  onClick={() => handleFilterChange('block', 'all')}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Data Table */}
      <RegistrationsDataTable 
        columns={columns} 
        data={filteredRegistrations} 
        pageIndex={pageIndex}
        onPageIndexChange={setPageIndex}
      />
    </div>
  )
}