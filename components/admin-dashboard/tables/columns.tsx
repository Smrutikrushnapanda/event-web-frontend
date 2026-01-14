"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, QrCode, Eye, MoreHorizontal, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface CheckIn {
  id: string;
  type: "entry" | "lunch" | "dinner" | "session";
  scannedBy: string | null;
  wasDelegate: boolean;
  scannedAt: string;
  registrationId: string;
}

export interface Registration {
  id: string;
  qrCode: string;
  name: string;
  village: string;
  district: string;
  block: string;
  mobile: string;
  aadhaarOrId: string;
  gender: 'male' | 'female' | 'others';
  caste: 'general' | 'obc' | 'sc' | 'st';
  category: string;
  behalfName: string | null;
  behalfMobile: string | null;
  behalfGender: 'male' | 'female' | 'others' | null;
  isBehalfAttending: boolean;
  checkIns: CheckIn[];
  createdAt: string;
}

export const createColumns = (
  onViewDetails: (registration: Registration) => void,
  onEditRegistration: (registration: Registration) => void,
  pageIndex: number,
  pageSize: number
): ColumnDef<Registration>[] => [
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
      const isBehalfAttending = row.original.isBehalfAttending
      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("name")}</span>
            {isBehalfAttending && row.original.behalfName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Behalf: {row.original.behalfName}</span>
              </div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "qrCode",
    header: "QR Code",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <QrCode className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-sm">{row.getValue("qrCode")}</span>
      </div>
    ),
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
  },
  {
    accessorKey: "village",
    header: "Village",
  },
  {
    accessorKey: "block",
    header: "Block & District",
    cell: ({ row }) => (
      <div>
        <div>{row.original.block}</div>
        <div className="text-xs text-muted-foreground">{row.original.district}</div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue("category")}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Registered On",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return (
        <div>
          <div>{date.toLocaleDateString()}</div>
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
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onViewDetails(row.original)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEditRegistration(row.original)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Registration
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]