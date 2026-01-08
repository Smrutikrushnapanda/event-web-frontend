// components/admin-dashboard/layout/header.tsx
"use client"

import { Bell, Search, LogOut } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useVolunteerAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"

export default function Header() {
  const router = useRouter()
  const { volunteer, logout } = useVolunteerAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/volunteer/login")
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger className="-ml-2" />

      <div className="flex flex-1 items-center gap-4">
        {/* Search Bar */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 w-full"
          />
        </div>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="flex-col items-start gap-1 py-3">
                  <div className="font-medium">New approval request</div>
                  <div className="text-sm text-muted-foreground">
                    User John Doe submitted a new request
                  </div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex-col items-start gap-1 py-3">
                  <div className="font-medium">System update</div>
                  <div className="text-sm text-muted-foreground">
                    New features are now available
                  </div>
                  <div className="text-xs text-muted-foreground">5 hours ago</div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex-col items-start gap-1 py-3">
                  <div className="font-medium">User registered</div>
                  <div className="text-sm text-muted-foreground">
                    New user Jane Smith registered
                  </div>
                  <div className="text-xs text-muted-foreground">1 day ago</div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Volunteer Info Display */}
          {volunteer && (
            <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/50 rounded-lg border">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">{volunteer.mobile}</span>
                <span className="text-xs text-muted-foreground">
                  {volunteer.assignedRole || "Volunteer"}
                </span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}