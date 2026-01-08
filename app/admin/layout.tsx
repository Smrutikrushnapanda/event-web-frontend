"use client"

import { useEffect, useState } from "react" // Added useState
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin-dashboard/layout/sidebar"
import Header from "@/components/admin-dashboard/layout/header"
import { useVolunteerAuthStore } from "@/store/auth-store"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, volunteer } = useVolunteerAuthStore()
  
  // 1. Add a state to track if Zustand has hydrated from localStorage
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // This effect runs only after the component mounts on the client
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // 2. ONLY redirect if hydration is complete AND user is not logged in
    if (isHydrated && (!isAuthenticated || !volunteer)) {
      router.replace("/login") // Use replace so they can't go "back" to admin
    }
  }, [isAuthenticated, volunteer, router, isHydrated])

  // 3. While checking hydration OR if not authenticated, show loader
  if (!isHydrated || !isAuthenticated || !volunteer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">
            Verifying Session...
          </p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden bg-background text-foreground">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <Header />
          <main className="flex-1 p-6 overflow-x-hidden bg-muted">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}