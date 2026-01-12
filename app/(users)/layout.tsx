"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background overflow-x-hidden">

      {/* Header */}
      <Header />

      {/* Content */}
      <main className="flex-1 w-full bg-muted">
        <div className="w-full px-6 py-4">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
