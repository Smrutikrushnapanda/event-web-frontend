// columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, User, QrCode, Eye } from "lucide-react"

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
  gp: string;
  district: string;
  block: string;
  mobile: string;
  aadhaarOrId: string;
  photoUrl: string | null;
  category: string;
  delegateName: string | null;
  delegateMobile: string | null;
  delegatePhotoUrl: string | null;
  isDelegateAttending: boolean;
  checkIns: CheckIn[];
  createdAt: string;
}

export const createColumns = (
  onViewDetails: (registration: Registration) => void,
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
      const isDelegateAttending = row.original.isDelegateAttending
      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue("name")}</span>
            {isDelegateAttending && row.original.delegateName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Delegate: {row.original.delegateName}</span>
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
    cell: ({ row }) => (
      <div>
        <div>{row.getValue("village")}</div>
        <div className="text-xs text-muted-foreground">{row.original.gp}</div>
      </div>
    ),
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
  // {
  //   id: "attendance",
  //   header: "Attendance",
  //   cell: ({ row }) => {
  //     const checkIns = row.original.checkIns
  //     const hasEntry = checkIns.some(c => c.type === "entry")
  //     const hasLunch = checkIns.some(c => c.type === "lunch")
  //     const hasDinner = checkIns.some(c => c.type === "dinner")
  //     const hasSession = checkIns.some(c => c.type === "session")
      
  //     return (
  //       <div className="flex gap-2 flex-wrap">
  //         <Badge variant={hasEntry ? "default" : "secondary"} className="gap-1">
  //           {hasEntry ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
  //           Entry
  //         </Badge>
  //         <Badge variant={hasLunch ? "default" : "secondary"} className="gap-1">
  //           {hasLunch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
  //           Lunch
  //         </Badge>
  //         <Badge variant={hasDinner ? "default" : "secondary"} className="gap-1">
  //           {hasDinner ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
  //           Dinner
  //         </Badge>
  //         <Badge variant={hasSession ? "default" : "secondary"} className="gap-1">
  //           {hasSession ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
  //           Session
  //         </Badge>
  //       </div>
  //     )
  //   },
  // },
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(row.original)}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
      )
    },
  },
]