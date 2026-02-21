"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { loginVolunteer } from "@/lib/api"
import { useVolunteerAuthStore } from "@/store/auth-store"

export default function LoginPage() {
  const router = useRouter()
  // Destructure state properly
  const { login, isAuthenticated, volunteer } = useVolunteerAuthStore()
  
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // 1. Handle Hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // 2. Prevent logged-in users from seeing the login page
  useEffect(() => {
    if (isHydrated && isAuthenticated && volunteer) {
      router.replace("/admin")
    }
  }, [isHydrated, isAuthenticated, volunteer, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mobile || !password) {
      toast.error("Validation Error", { description: "Please fill in all fields" })
      return
    }

    if (mobile.length !== 10) {
      toast.error("Invalid Mobile", { description: "Mobile number must be 10 digits" })
      return
    }

    try {
      setIsLoading(true)
      const response = await loginVolunteer({ mobile, password })
      
      login(response.volunteer, response.accessToken)
      
      toast.success("Login Successful", {
        description: `Welcome back, ${response.volunteer.name}!`,
      })

      router.push("/admin")
    } catch (error: any) {
      toast.error("Login Failed", {
        description: error.message || "Invalid credentials",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 3. Show a loader or nothing while checking hydration to prevent UI flicker
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <User className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Sign in to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  if (value.length <= 10) setMobile(value)
                }}
                maxLength={10}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Authorized users only</p>
            <p className="mt-1">Contact admin if you have issues logging in</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
