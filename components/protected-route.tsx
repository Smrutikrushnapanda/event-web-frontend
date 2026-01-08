// components/protected-route.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useVolunteerAuthStore } from "@/store/auth-store"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, volunteer } = useVolunteerAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !volunteer) {
      router.push("/volunteer/login")
    }
  }, [isAuthenticated, volunteer, router])

  if (!isAuthenticated || !volunteer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}