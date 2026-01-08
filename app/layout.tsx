import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Event Registration Portal",
  description: "Streamlined event registration system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <div className="flex min-h-screen flex-col">
          <div className="print:hidden">
            
          </div>
          <Toaster />
          <main className="flex-1">{children}</main>
          <div className="print:hidden">

          </div>
        </div>
      </body>
    </html>
  );
}