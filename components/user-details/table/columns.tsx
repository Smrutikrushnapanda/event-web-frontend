"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

export interface CheckIn {
  id: string;
  type: "entry" | "lunch" | "dinner" | "session";
  scannedBy: string | null;
  wasBehalf: boolean;
  scannedAt: string;
  registrationId: string;
  checkInDate: string; // Added: Format YYYY-MM-DD
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
  hasEntryCheckIn: boolean;
  hasLunchCheckIn: boolean;
  hasDinnerCheckIn: boolean;
  hasSessionCheckIn: boolean;
  checkIns: CheckIn[];
  createdAt: string;
}

const CheckInBadge = ({ checked }: { checked: boolean }) => (
  checked ? (
    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
      <CheckCircle className="w-3 h-3" />
    </Badge>
  ) : (
    <Badge variant="outline">
      <XCircle className="w-3 h-3" />
    </Badge>
  )
)

export const createRegistrationColumns = (
  pageIndex: number,
  pageSize: number
): ColumnDef<Registration>[] => [
  {
    id: "slNo",
    header: "Sl No",
    cell: ({ row }) => {
      const serialNumber = pageIndex * pageSize + row.index + 1
      return <div className="font-medium">{serialNumber}</div>
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "block",
    header: "Block",
    cell: ({ row }) => <div>{row.getValue("block")}</div>,
  },
  {
    accessorKey: "district",
    header: "District",
    cell: ({ row }) => <div>{row.getValue("district")}</div>,
  },
  {
    accessorKey: "hasEntryCheckIn",
    header: "Entry",
    cell: ({ row }) => (
      <CheckInBadge checked={row.getValue("hasEntryCheckIn")} />
    ),
  },
  {
    accessorKey: "hasLunchCheckIn",
    header: "Lunch",
    cell: ({ row }) => (
      <CheckInBadge checked={row.getValue("hasLunchCheckIn")} />
    ),
  },
  {
    accessorKey: "hasDinnerCheckIn",
    header: "Dinner",
    cell: ({ row }) => (
      <CheckInBadge checked={row.getValue("hasDinnerCheckIn")} />
    ),
  },
  {
    accessorKey: "hasSessionCheckIn",
    header: "Session",
    cell: ({ row }) => (
      <CheckInBadge checked={row.getValue("hasSessionCheckIn")} />
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string
      return (
        <div className="max-w-[200px] truncate" title={category}>
          {category}
        </div>
      )
    },
  },
]