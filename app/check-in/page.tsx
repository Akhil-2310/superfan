"use client"

import { ChevronLeft, QrCode, Shield, Trophy } from "lucide-react"
import Link from "next/link"

export default function CheckInPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-[#F8F8F8] px-4 py-6 rounded-b-3xl border-b border-[#E4E4E4]">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[#121212] hover:text-[#6E6E6E] transition-colors mb-4"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </Link>
          <h1 className="text-[#121212] text-2xl font-bold mb-1">Stadium Check-in</h1>
          <p className="text-[#6E6E6E]">Verify your attendance</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Stadium Label */}
        <div className="text-center mb-6">
          <p className="text-[#6E6E6E] text-lg">Home Stadium</p>
        </div>

        {/* QR Code Scanner Frame */}
        <section className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-3xl p-8 mb-6 shadow-sm">
          <div className="aspect-square bg-white border-2 border-[#E4E4E4] rounded-2xl flex items-center justify-center mb-6">
            {/* QR Code Placeholder */}
            <div className="w-48 h-48 text-[#6E6E6E]">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Top-left corner */}
                <rect x="10" y="10" width="15" height="15" rx="3" fill="currentColor" />
                <rect x="13" y="13" width="3" height="3" fill="currentColor" />
                <rect x="17" y="13" width="3" height="3" fill="currentColor" />
                <circle cx="19.5" cy="19.5" r="1.5" fill="currentColor" />

                {/* Top-right corner */}
                <rect x="75" y="10" width="15" height="15" rx="3" fill="currentColor" />
                <circle cx="82.5" cy="17.5" r="1.5" fill="currentColor" />
                <rect x="84" y="20" width="3" height="3" fill="currentColor" />

                {/* Center dots */}
                <circle cx="50" cy="40" r="2" fill="currentColor" />
                <circle cx="60" cy="45" r="2" fill="currentColor" />
                <circle cx="40" cy="50" r="2" fill="currentColor" />
                <circle cx="55" cy="55" r="2" fill="currentColor" />

                {/* Bottom-left corner */}
                <rect x="10" y="75" width="15" height="15" rx="3" fill="currentColor" />
                <rect x="13" y="80" width="6" height="3" fill="currentColor" />
                <circle cx="20" cy="85" r="1.5" fill="currentColor" />

                {/* Bottom-right area */}
                <path d="M75 75 L90 75 L90 85 L80 85 L80 90 L75 90 Z" fill="currentColor" />
                <circle cx="85" cy="85" r="2" fill="currentColor" />
              </svg>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-[#121212] text-xl font-semibold mb-2">Scan Stadium QR Code</h2>
            <p className="text-[#6E6E6E] text-sm">Position the QR code within the frame</p>
          </div>
        </section>

        {/* Start Scanning Button */}
        <Link
          href="/check-in/success"
          className="w-full bg-[#CE1141] hover:bg-[#B50F38] text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 mb-6 shadow-sm"
        >
          <QrCode className="w-5 h-5" strokeWidth={2} />
          Start Scanning
        </Link>

        {/* Verified Check-in Info Box */}
        <section className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-5 h-5 text-green-600" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-[#121212] font-semibold mb-2">Verified Check-in</h3>
              <p className="text-[#6E6E6E] text-sm leading-relaxed">
                Self verifies you're a real human at the stadium location
              </p>
            </div>
          </div>
        </section>

        {/* Rewards Preview */}
        <div className="text-center mb-6">
          <p className="text-[#6E6E6E] text-lg">You'll earn:</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Points Card */}
          <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-yellow-600" strokeWidth={2} />
            </div>
            <p className="text-[#121212] text-2xl font-bold mb-1">+1,000</p>
            <p className="text-[#6E6E6E] text-sm">Points</p>
          </div>

          {/* Tokens Card */}
          <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-blue-600" strokeWidth={2} />
            </div>
            <p className="text-[#121212] text-2xl font-bold mb-1">+250</p>
            <p className="text-[#6E6E6E] text-sm">Tokens</p>
          </div>
        </div>
      </main>
    </div>
  )
}
