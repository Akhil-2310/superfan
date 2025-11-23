"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, TrendingUp, Zap, Swords, User } from "lucide-react"

export function Footer() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/engage", label: "Engage", icon: Zap },
    { href: "/defi", label: "DeFi", icon: TrendingUp },
    { href: "/duels", label: "Duels", icon: Swords },
    { href: "/profile", label: "Profile", icon: User },
  ]

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + "/")
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E4E4E4] z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  active ? "text-[#FF1744]" : "text-[#6E6E6E] hover:text-[#FF1744]"
                }`}
              >
                {active && item.href !== "/profile" ? (
                  <div className="bg-gradient-to-br from-[#FF1744] to-[#D500F9] p-3 rounded-2xl shadow-lg">
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                ) : (
                  <Icon className="w-6 h-6" strokeWidth={2} />
                )}
                <span className={`text-xs font-medium ${active ? "font-bold" : ""}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </footer>
  )
}

