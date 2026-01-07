import Link from "next/link";
import { Calendar } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <Calendar className="h-6 w-6 text-white" />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-gray-900">
              Event Portal
            </span>
            <span className="text-xs text-gray-500">
              Registration System
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
