// volunteers-columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle, User, Mail, Phone, MapPin } from "lucide-react"
import { Volunteer } from "../../../lib/api"

export const createVolunteerColumns = (
  onViewDetails: (volunteer: Volunteer) => void,
  onApprove: (volunteer: Volunteer) => void,
  pageIndex: number,
  pageSize: number
): ColumnDef<Volunteer>[] => [
  {
    id: "serial",
    header: "S.No",
    cell: ({ row }) => {
      const serialNumber = pageIndex * pageSize + row.index + 1
      return <div className="font-medium">{serialNumber}</div>
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          {row.original.photoUrl ? (
            <img
              src={row.original.photoUrl}
              alt={row.original.name}
              className="w-10 h-10 rounded-full object-cover border-2"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("name")}</span>
            {row.original.assignedRole && (
              <span className="text-xs text-muted-foreground">
                {row.original.assignedRole}
              </span>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "mobile",
    header: "Contact",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span>{row.original.mobile}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span className="truncate max-w-[150px]">{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "age",
    header: "Age & Gender",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.age} years</div>
        <div className="text-xs text-muted-foreground">{row.original.gender}</div>
      </div>
    ),
  },
  {
    accessorKey: "district",
    header: "Location",
    cell: ({ row }) => (
      <div className="flex items-start gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div>
          <div className="font-medium">{row.original.district}</div>
          <div className="text-xs text-muted-foreground">{row.original.block}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div className="max-w-[200px]">
        <div className="text-sm font-medium truncate">{row.getValue("department")}</div>
        <div className="text-xs text-muted-foreground">Exp: {row.original.experience}</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "approved"
              ? "default"
              : status === "pending"
              ? "secondary"
              : "destructive"
          }
          className="capitalize"
        >
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Applied On",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return (
        <div>
          <div className="text-sm">{date.toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">
            {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const volunteer = row.original
      // Only show approve button if status is "pending"
      const showApproveButton = volunteer.status === "pending"

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(volunteer)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
          
          {showApproveButton && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onApprove(volunteer)}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          )}
        </div>
      )
    },
  },
]