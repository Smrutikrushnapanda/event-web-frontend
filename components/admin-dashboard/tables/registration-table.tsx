// registrations-table.tsx
"use client"

import { useState, useEffect } from "react"
import { DataTable } from "./data-table"
import { createColumns, Registration } from "./columns"
import { registrationApi } from "../../../lib/api"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function RegistrationsTable() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize] = useState(10)

  // Fetch registrations from API
  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await registrationApi.getAll()
      setRegistrations(data)
    } catch (err: any) {
      console.error('Failed to fetch registrations:', err)
      setError(err.message || 'Failed to load registrations')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (registration: Registration) => {
    setSelectedRegistration(registration)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRegistration(null)
  }

  // Create columns with view handler and pagination info
  const columns = createColumns(handleViewDetails, pageIndex, pageSize)

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
                {registrations.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Registrations
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

        <DataTable columns={columns} data={registrations} />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div>
                <strong>Name:</strong> {selectedRegistration.name}
              </div>
              <div>
                <strong>Email:</strong> {selectedRegistration.email}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}