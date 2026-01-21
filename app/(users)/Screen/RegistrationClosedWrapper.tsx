"use client";

import RegistrationPage from "./RegistrationPage";

export default function RegistrationClosedWrapper() {
  return (
    <div className="relative min-h-screen">
      {/* Background page (visible) */}
      <div className="pointer-events-none select-none">
        <RegistrationPage />
      </div>

      {/* Overlay */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* dark blur backdrop */}
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

        {/* Center card */}
        <div className="relative mx-4 w-full max-w-xl rounded-2xl border border-white/10 bg-white/10 p-6 md:p-10 shadow-2xl">
          <div className="text-center space-y-3">
            <p className="text-white/80 text-sm md:text-base font-medium">
              Matsya Pranee Samavesh Odisha 2026
            </p>

            <h1 className="text-white text-2xl md:text-4xl font-extrabold tracking-tight">
              Registration Closed
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
