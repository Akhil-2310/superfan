"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, TrendingUp, Zap, Swords, Flame } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/defi", label: "DeFi", icon: TrendingUp },
    { href: "/engage", label: "Engage", icon: Zap },
    { href: "/duels", label: "Duels", icon: Swords },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + "/")
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E4E4E4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF1744] to-[#D500F9] rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-[#141414]">SuperFan</h1>
              <p className="text-xs text-[#6E6E6E]">Sports x DeFi</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#FF1744] to-[#D500F9] text-white shadow-lg"
                      : "text-[#6E6E6E] hover:bg-[#F8F8F8] hover:text-[#141414]"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-2 rounded-xl transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#FF1744] to-[#D500F9] text-white"
                      : "text-[#6E6E6E] hover:bg-[#F8F8F8]"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </Link>
              )
            })}
          </div>

          {/* Wallet Connect - Always visible */}
          <div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

