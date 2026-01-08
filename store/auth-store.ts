// store/volunteer-auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Volunteer } from '@/lib/api'

interface VolunteerAuthState {
  volunteer: Volunteer | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (volunteer: Volunteer, token: string) => void
  logout: () => void
  updateVolunteer: (volunteer: Volunteer) => void
}

export const useVolunteerAuthStore = create<VolunteerAuthState>()(
  persist(
    (set) => ({
      volunteer: null,
      accessToken: null,
      isAuthenticated: false,
      
      login: (volunteer, token) =>
        set({
          volunteer,
          accessToken: token,
          isAuthenticated: true,
        }),
      
      logout: () =>
        set({
          volunteer: null,
          accessToken: null,
          isAuthenticated: false,
        }),
      
      updateVolunteer: (volunteer) =>
        set({ volunteer }),
    }),
    {
      name: 'volunteer-auth-storage',
    }
  )
)