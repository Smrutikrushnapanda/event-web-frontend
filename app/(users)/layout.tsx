"use client"

import Footer from "@/components/Footer"
import Header from "@/components/Header"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div className="flex min-h-screen w-full overflow-x-hidden bg-background text-foreground">
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <main className="flex-1 p-6 overflow-x-hidden bg-muted">
            <Header />
            {children}
            <Footer/>
          </main>
        </div>
      </div>
  )
}
