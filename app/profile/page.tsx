"use client"

import { useState } from "react"
import {
  ChevronLeft,
  Shield,
  Wallet,
  Bell,
  Moon,
  LogOut,
  ChevronRight,
  Edit2,
  CheckCircle,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ProfilePage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)

  return (
    <div className="min-h-screen bg-white text-[#121212]">
      {/* Header Banner */}
      <header className="bg-white px-4 py-6 border-b border-[#E4E4E4]">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#6E6E6E] hover:text-[#121212] transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-[#121212]">Profile & Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Profile Card */}
          <section className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#F7D020] shadow-sm">
                <Image
                  src="/images/mira-bianchi.webp"
                  alt="Mira Bianchi"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[#121212] text-2xl font-bold mb-2">Mira Bianchi</h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-medium">
                    <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                    Self Verified
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#6E6E6E] text-sm">
                  <Calendar className="w-4 h-4" strokeWidth={2} />
                  <span>Joined March 2024</span>
                </div>
              </div>
            </div>
          </section>

          {/* Account Section */}
          <section className="space-y-4">
            <h3 className="text-[#6E6E6E] text-sm font-semibold uppercase tracking-wider px-2">Account</h3>

            {/* Edit Username */}
            <button className="w-full bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-4 flex items-center justify-between hover:border-[#CE1141] transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p className="text-[#121212] font-semibold">Edit Username</p>
                  <p className="text-[#6E6E6E] text-sm">Mira Bianchi</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
            </button>

            {/* KYC Status */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <p className="text-[#121212] font-semibold">KYC Status</p>
                    <p className="text-green-600 text-sm">Verified on Nov 15, 2024</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  Active
                </span>
              </div>
            </div>

            {/* Wallet Settings */}
            <button className="w-full bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-4 flex items-center justify-between hover:border-[#CE1141] transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p className="text-[#121212] font-semibold">Wallet Settings</p>
                  <p className="text-[#6E6E6E] text-sm">Manage your wallet</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
            </button>
          </section>

          {/* Team Section */}
          <section className="space-y-4">
            <h3 className="text-[#6E6E6E] text-sm font-semibold uppercase tracking-wider px-2">Team</h3>

            {/* Selected Team Card */}
            <div className="bg-gradient-to-br from-[#0033A0] via-[#002D8F] to-[#F7D020] rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <span className="text-white font-bold text-sm">AR</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Argentina</p>
                    <p className="text-white/80 text-sm">La Albiceleste</p>
                  </div>
                </div>
              </div>
              <p className="text-white/90 text-sm mb-4">National Team • Buenos Aires</p>
              <Link href="/choose-team">
                <button className="w-full bg-white hover:bg-white/90 text-[#0033A0] font-semibold py-3 rounded-lg transition-colors shadow-sm">
                  Change Team
                </button>
              </Link>
            </div>
          </section>

          {/* Security Section */}
          <section className="space-y-4">
            <h3 className="text-[#6E6E6E] text-sm font-semibold uppercase tracking-wider px-2">Security</h3>

            {/* Wallet Connection */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <p className="text-[#121212] font-semibold">Wallet Connection</p>
                    <p className="text-[#6E6E6E] text-sm">0x742d...f0bEb8</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                  Connected
                </span>
              </div>
              <button className="w-full bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold py-3 rounded-lg transition-colors shadow-sm">
                Reconnect Wallet
              </button>
            </div>
          </section>

          {/* App Preferences Section */}
          <section className="space-y-4">
            <h3 className="text-[#6E6E6E] text-sm font-semibold uppercase tracking-wider px-2">App Preferences</h3>

            {/* Notifications Toggle */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <p className="text-[#121212] font-semibold">Notifications</p>
                    <p className="text-[#6E6E6E] text-sm">Receive updates and alerts</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notificationsEnabled ? "bg-[#CE1141]" : "bg-[#D6D6D6]"
                  }`}
                  aria-label="Toggle notifications"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      notificationsEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                    <Moon className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <p className="text-[#121212] font-semibold">Dark Mode</p>
                    <p className="text-[#6E6E6E] text-sm">Adjust app appearance</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkModeEnabled(!darkModeEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkModeEnabled ? "bg-[#CE1141]" : "bg-[#D6D6D6]"
                  }`}
                  aria-label="Toggle dark mode"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      darkModeEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Logout Button */}
          <button className="w-full bg-white border-2 border-[#CE1141] hover:bg-[#CE1141] rounded-xl p-4 flex items-center justify-center gap-3 text-[#CE1141] hover:text-white transition-colors shadow-sm group">
            <LogOut className="w-5 h-5" strokeWidth={2} />
            <span className="font-semibold">Log Out</span>
          </button>
        </div>
      </main>
    </div>
  )
}
