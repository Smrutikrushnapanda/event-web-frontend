// approve-volunteer-modal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";
import { Volunteer } from "./volunteers-api";

interface ApproveVolunteerModalProps {
  volunteer: Volunteer | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (volunteerId: string, assignedRole: string) => Promise<void>;
}

const VOLUNTEER_ROLES = [
  "Registration Desk",
  "Food Stall Staff",
  "Entry Gate Manager",
  "Session Coordinator",
  "Kit Distribution",
  "Guest Relations",
  "Technical Support",
  "Transport Coordinator",
  "Medical Support",
  "Admin",
];

export function ApproveVolunteerModal({
  volunteer,
  isOpen,
  onClose,
  onApprove,
}: ApproveVolunteerModalProps) {
  const [assignedRole, setAssignedRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!volunteer || !assignedRole) return;

    try {
      setIsSubmitting(true);
      await onApprove(volunteer.id, assignedRole);
      setAssignedRole("");
      onClose();
    } catch (error) {
      console.error("Failed to approve volunteer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAssignedRole("");
      onClose();
    }
  };

  if (!volunteer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Approve Volunteer
          </DialogTitle>
          <DialogDescription>
            Assign a role to approve {volunteer.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Volunteer Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg font-bold">
                {volunteer.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>

            <div>
              <p className="font-medium">{volunteer.name}</p>
              <p className="text-sm text-muted-foreground">{volunteer.email}</p>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Assigned Role *</Label>
            <Select value={assignedRole} onValueChange={setAssignedRole}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {VOLUNTEER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the role this volunteer will be assigned to
            </p>
          </div>

          {/* Department Info */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Department:</span>
              <span className="font-medium">{volunteer.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Experience:</span>
              <span className="font-medium capitalize">
                {volunteer.experience}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">
                {volunteer.block}, {volunteer.district}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApprove}
            disabled={!assignedRole || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Approve Volunteer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
