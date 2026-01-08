// volunteers-table.tsx
"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { VolunteersDataTable } from "./data-table"
import { createVolunteerColumns } from "./columns"
import { VolunteerDetailModal } from "../volunteer-detail-modal"
import { ApproveVolunteerModal } from "../approve-volunteer-modal"
import { getVolunteers, approveVolunteer, Volunteer } from "../../../lib/api"
import { Loader2, AlertCircle, RefreshCw, Users, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function VolunteersTable() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null)
  const [volunteerToApprove, setVolunteerToApprove] = useState<Volunteer | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)

  // Fetch volunteers from API
  useEffect(() => {
    fetchVolunteers()
  }, [])

  const fetchVolunteers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getVolunteers()
      setVolunteers(data)
      toast.success("Volunteers loaded successfully")
    } catch (err: any) {
      console.error('Failed to fetch volunteers:', err)
      setError(err.message || 'Failed to load volunteers')
      toast.error("Failed to load volunteers", {
        description: err.message || "Please try again later"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (volunteer: Volunteer) => {
    setSelectedVolunteer(volunteer)
    setIsViewModalOpen(true)
  }

  const handleApproveClick = (volunteer: Volunteer) => {
    setVolunteerToApprove(volunteer)
    setIsApproveModalOpen(true)
  }

  const handleApproveVolunteer = async (volunteerId: string, assignedRole: string) => {
    try {
      const approvedVolunteer = await approveVolunteer(volunteerId, {
        approvedBy: "Super Admin",
        assignedRole,
      })

      // Update the volunteers list
      setVolunteers((prev) =>
        prev.map((v) => (v.id === volunteerId ? approvedVolunteer : v))
      )

      toast.success("Volunteer Approved", {
        description: `${approvedVolunteer.name} has been approved as ${assignedRole}`,
      })
    } catch (err: any) {
      console.error('Failed to approve volunteer:', err)
      toast.error("Approval Failed", {
        description: err.message || "Failed to approve volunteer",
      })
      throw err
    }
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedVolunteer(null)
  }

  const handleCloseApproveModal = () => {
    setIsApproveModalOpen(false)
    setVolunteerToApprove(null)
  }

  // Calculate statistics
  const stats = {
    total: volunteers.length,
    pending: volunteers.filter((v) => v.status === "pending").length,
    approved: volunteers.filter((v) => v.status === "approved").length,
  }

  // Create columns with handlers and pagination info
  const columns = createVolunteerColumns(
    handleViewDetails,
    handleApproveClick,
    pageIndex,
    pageSize
  )

  if (loading) {
    return (
      <div className="w-full rounded-lg border shadow-lg p-12 bg-card">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">
            Loading volunteers...
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
              onClick={fetchVolunteers}
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
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">
              Volunteer Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and approve event volunteers
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVolunteers}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volunteers</p>
                <p className="text-3xl font-bold text-primary">{stats.total}</p>
              </div>
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
        </div>

        {/* Table */}
        <VolunteersDataTable columns={columns} data={volunteers} />
      </div>

      {/* Modals */}
      <VolunteerDetailModal
        volunteer={selectedVolunteer}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
      />

      <ApproveVolunteerModal
        volunteer={volunteerToApprove}
        isOpen={isApproveModalOpen}
        onClose={handleCloseApproveModal}
        onApprove={handleApproveVolunteer}
      />
    </>
  )
}