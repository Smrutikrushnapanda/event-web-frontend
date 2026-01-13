"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GuestPass } from "@/lib/api"
import { UserPlus, CheckCircle, XCircle } from "lucide-react"

export const createGuestPassColumns = (
  onAssign: (pass: GuestPass) => void
): ColumnDef<GuestPass>[] => [
  {
    accessorKey: "qrCode",
    header: "QR Code",
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue("qrCode")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string
      return (
        <Badge
          variant={
            category === "DELEGATE"
              ? "default"
              : category === "VVIP"
              ? "secondary"
              : "outline"
          }
          className="capitalize"
        >
          {category}
        </Badge>
      )
    },
  },
  {
    accessorKey: "isAssigned",
    header: "Status",
    cell: ({ row }) => {
      const isAssigned = row.getValue("isAssigned") as boolean
      return (
        <Badge
          variant={isAssigned ? "default" : "outline"}
          className={isAssigned ? "bg-green-600" : ""}
        >
          {isAssigned ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Assigned
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Unassigned
            </>
          )}
        </Badge>
      )
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      return <div>{name || "-"}</div>
    },
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
    cell: ({ row }) => {
      const mobile = row.getValue("mobile") as string
      return <div>{mobile || "-"}</div>
    },
  },
  {
    id: "checkIns",
    header: "Check-ins",
    cell: ({ row }) => {
      const pass = row.original
      return (
        <div className="flex gap-1">
          {pass.hasEntryCheckIn && (
            <Badge variant="outline" className="text-xs">E</Badge>
          )}
          {pass.hasLunchCheckIn && (
            <Badge variant="outline" className="text-xs">L</Badge>
          )}
          {pass.hasDinnerCheckIn && (
            <Badge variant="outline" className="text-xs">D</Badge>
          )}
          {pass.hasSessionCheckIn && (
            <Badge variant="outline" className="text-xs">S</Badge>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const pass = row.original
      const isAssigned = pass.isAssigned

      return (
        <div className="flex items-center gap-2">
          {!isAssigned && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAssign(pass)}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Assign
            </Button>
          )}
        </div>
      )
    },
  },
]