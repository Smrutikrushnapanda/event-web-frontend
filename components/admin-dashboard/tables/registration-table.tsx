"use client"

import { useState, useEffect, useMemo } from "react"
import { DataTable } from "./data-table"
import { createColumns, Registration } from "./columns"
import { registrationApi, UpdateRegistrationData } from "../../../lib/api"
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Filter, 
  MapPin,
  Building,
  Search,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { odishaDistricts, odishaBlocks } from "../../../lib/odisha-data"

interface Filters {
  search: string;
  district: string;
  block: string;
}

export function RegistrationsTable() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)
  
  // Edit form state
  const [editLoading, setEditLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateRegistrationData>({})
  const [editDistrict, setEditDistrict] = useState<string>("")
  
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    search: '',
    district: 'all',
    block: 'all'
  })

  // Get blocks based on selected district (for filters)
  const availableBlocks = useMemo(() => {
    if (filters.district === 'all') {
      const allBlocks = registrations
        .map(r => r.block)
        .filter(Boolean)
        .filter((block, index, self) => self.indexOf(block) === index)
        .sort()
      return allBlocks
    }
    return odishaBlocks[filters.district] || []
  }, [filters.district, registrations])

  // Get blocks for edit form
  const editAvailableBlocks = editDistrict ? odishaBlocks[editDistrict] || [] : []

  useEffect(() => {
    fetchRegistrations()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [filters, registrations])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await registrationApi.getAll()
      setRegistrations(data)
      setFilteredRegistrations(data)
    } catch (err: any) {
      console.error('Failed to fetch registrations:', err)
      setError(err.message || 'Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...registrations]

    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(reg =>
        reg.name?.toLowerCase().includes(searchTerm) ||
        reg.mobile?.includes(searchTerm) ||
        reg.village?.toLowerCase().includes(searchTerm) ||
        reg.qrCode?.toLowerCase().includes(searchTerm) ||
        reg.aadhaarOrId?.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.district !== 'all') {
      filtered = filtered.filter(reg => reg.district === filters.district)
    }

    if (filters.block !== 'all') {
      filtered = filtered.filter(reg => reg.block === filters.block)
    }

    setFilteredRegistrations(filtered)
    setPageIndex(0)
  }

  const handleViewDetails = (registration: Registration) => {
    setSelectedRegistration(registration)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEditRegistration = (registration: Registration) => {
    setSelectedRegistration(registration)
    setModalMode('edit')
    setFormData({
      name: registration.name,
      village: registration.village,
      district: registration.district,
      block: registration.block,
      mobile: registration.mobile,
      aadhaarOrId: registration.aadhaarOrId,
      gender: registration.gender,
      caste: registration.caste,
      category: registration.category,
    })
    setEditDistrict(registration.district)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRegistration(null)
    setModalMode('view')
    setFormData({})
    setEditDistrict("")
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
      district: 'all',
      block: 'all'
    })
  }

  const handleInputChange = (field: keyof UpdateRegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDistrictChange = (district: string) => {
    setEditDistrict(district)
    setFormData(prev => ({ 
      ...prev, 
      district,
      block: ''
    }))
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRegistration) return

    try {
      setEditLoading(true)
      await registrationApi.update(selectedRegistration.id, formData)
      
      alert('✅ Registration updated successfully!')
      await fetchRegistrations()
      handleCloseModal()
    } catch (error: any) {
      console.error('Update failed:', error)
      alert(`❌ Update failed: ${error.message}`)
    } finally {
      setEditLoading(false)
    }
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search.trim()) count++
    if (filters.district !== 'all') count++
    if (filters.block !== 'all') count++
    return count
  }, [filters])

  const columns = createColumns(
    handleViewDetails,
    handleEditRegistration,
    pageIndex,
    pageSize
  )

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
    <>
      <div className="w-full rounded-lg border shadow-lg p-6 bg-card">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">
              Registrations Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view all event registrations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {filteredRegistrations.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Filtered Registrations
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, village, Aadhaar..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10"
                />
              </div>
            </div>

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
                  {odishaDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Block
              </label>
              <Select
                value={filters.block}
                onValueChange={(value) => handleFilterChange('block', value)}
                disabled={filters.district === 'all' && availableBlocks.length === 0}
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
                    {filters.district === 'all' ? 'All blocks' : `All blocks in ${filters.district}`}
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

          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
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
            </div>
          )}
        </div>

        <DataTable 
          columns={columns} 
          data={filteredRegistrations} 
          pageIndex={pageIndex}
          onPageIndexChange={setPageIndex}
        />
      </div>

      {/* Single Dialog for View & Edit */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'view' ? 'Registration Details' : 'Edit Registration'}
            </DialogTitle>
          </DialogHeader>

          {modalMode === 'view' && selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">QR Code</p>
                  <p className="font-semibold">{selectedRegistration.qrCode ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-semibold">{selectedRegistration.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Village</p>
                  <p className="font-semibold">{selectedRegistration.village ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">District</p>
                  <p className="font-semibold">{selectedRegistration.district ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Block</p>
                  <p className="font-semibold">{selectedRegistration.block ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                  <p className="font-semibold">{selectedRegistration.mobile ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p className="font-semibold capitalize">{selectedRegistration.gender ?? "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Caste</p>
                  <p className="font-semibold uppercase">{selectedRegistration.caste ?? "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Aadhaar / ID</p>
                  <p className="font-semibold">{selectedRegistration.aadhaarOrId ?? "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="font-semibold">{selectedRegistration.category ?? "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Registered On</p>
                  <p className="font-semibold">
                    {new Date(selectedRegistration.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {modalMode === 'edit' && selectedRegistration && (
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  disabled={editLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  maxLength={10}
                  value={formData.mobile || ''}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  required
                  disabled={editLoading}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                <Input
                  id="aadhaar"
                  type="text"
                  maxLength={12}
                  value={formData.aadhaarOrId || ''}
                  onChange={(e) => handleInputChange('aadhaarOrId', e.target.value)}
                  required
                  disabled={editLoading}
                  placeholder="12-digit Aadhaar"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="village">Village *</Label>
                <Input
                  id="village"
                  value={formData.village || ''}
                  onChange={(e) => handleInputChange('village', e.target.value)}
                  required
                  disabled={editLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Select
                  value={formData.district || ''}
                  onValueChange={handleDistrictChange}
                  disabled={editLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {odishaDistricts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="block">Block *</Label>
                <Select
                  value={formData.block || ''}
                  onValueChange={(value) => handleInputChange('block', value)}
                  disabled={editLoading || !editDistrict}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={editDistrict ? "Select block" : "Select district first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {editAvailableBlocks.map((block) => (
                      <SelectItem key={block} value={block}>
                        {block}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender || ''}
                  onValueChange={(value) => handleInputChange('gender', value as any)}
                  disabled={editLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caste">Caste Category *</Label>
                <Select
                  value={formData.caste || ''}
                  onValueChange={(value) => handleInputChange('caste', value as any)}
                  disabled={editLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select caste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="obc">OBC</SelectItem>
                    <SelectItem value="sc">SC</SelectItem>
                    <SelectItem value="st">ST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  disabled={editLoading}
                  placeholder="e.g., Fisheries & Animal Resources Development"
                />
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={editLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Registration'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}