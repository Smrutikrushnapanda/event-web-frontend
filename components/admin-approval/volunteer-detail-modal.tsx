// volunteer-detail-modal.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Mail, MapPin, Briefcase, Calendar, CheckCircle, Clock } from "lucide-react"
import { Volunteer } from "./volunteers-api"

interface VolunteerDetailModalProps {
  volunteer: Volunteer | null
  isOpen: boolean
  onClose: () => void
}

export function VolunteerDetailModal({
  volunteer,
  isOpen,
  onClose,
}: VolunteerDetailModalProps) {
  if (!volunteer) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Volunteer Details</DialogTitle>
          <DialogDescription>
            Complete information for {volunteer.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo & Status Section */}
          <div className="flex items-center justify-between p-6 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              {volunteer.photoUrl ? (
                <img
                  src={volunteer.photoUrl}
                  alt={volunteer.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold">{volunteer.name}</h3>
                {volunteer.assignedRole && (
                  <p className="text-muted-foreground">{volunteer.assignedRole}</p>
                )}
              </div>
            </div>
            
            <Badge
              variant={
                volunteer.status === "approved"
                  ? "default"
                  : volunteer.status === "pending"
                  ? "secondary"
                  : "destructive"
              }
              className="text-lg px-4 py-2 capitalize"
            >
              {volunteer.status}
            </Badge>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Age</label>
                <p className="font-medium">{volunteer.age} years</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Gender</label>
                <p className="font-medium">{volunteer.gender}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Mobile Number
                </label>
                <p className="font-medium">{volunteer.mobile}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email Address
                </label>
                <p className="font-medium break-all">{volunteer.email}</p>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">District</label>
                <p className="font-medium">{volunteer.district}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Block</label>
                <p className="font-medium">{volunteer.block}</p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-muted-foreground">Address</label>
                <p className="font-medium">{volunteer.address}</p>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Professional Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Department</label>
                <p className="font-medium">{volunteer.department}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Experience</label>
                <p className="font-medium capitalize">{volunteer.experience}</p>
              </div>

              {volunteer.assignedRole && (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm text-muted-foreground">Assigned Role</label>
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {volunteer.assignedRole}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Approval Information */}
          {volunteer.status === "approved" && volunteer.approvedBy && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Approval Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Approved By</label>
                  <p className="font-medium">{volunteer.approvedBy}</p>
                </div>

                {volunteer.approvedAt && (
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Approved On</label>
                    <p className="font-medium">
                      {new Date(volunteer.approvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Application Date */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Applied on {new Date(volunteer.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}