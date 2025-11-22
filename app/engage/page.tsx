"use client"

import { Home, Zap, Trophy, User, Tv, Twitter, ShoppingBag, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"

const engageActions = [
  {
    id: 1,
    icon: Tv,
    title: "Watch a Game",
    subtitle: "Connect your TV provider to verify viewing.",
    reward: "+300 Fan Tokens",
    cta: "Connect TV Provider",
    href: "#",
  },
  {
    id: 2,
    icon: Twitter,
    title: "Post on Social",
    subtitle: "Connect your X account to verify posts.",
    reward: "+200 Fan Tokens",
    cta: "Connect X Account",
    href: "#",
  },
  {
    id: 3,
    icon: ShoppingBag,
    title: "Buy Team Merch",
    subtitle: "Link your NFT purchase receipt to earn rewards.",
    reward: "+500 Fan Tokens",
    cta: "Link NFT Receipt",
    href: "#",
  },
  {
    id: 4,
    icon: MapPin,
    title: "Check In at Game",
    subtitle: "Verify your match attendance.",
    reward: "+1,000 Fan Tokens",
    cta: "Scan QR to Check In",
    href: "/check-in",
  },
]

const recentActivity = [
  { action: "Stadium Check-in", tokens: 1000, time: "2 hours ago" },
  { action: "X Post Verified", tokens: 200, time: "1 day ago" },
  { action: "TV Provider Connected", tokens: 300, time: "3 days ago" },
]

export default function EngagePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E4E4E4] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[#6E6E6E] hover:text-[#121212] transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-[#121212] text-2xl font-bold">Engage & Earn</h1>
            <p className="text-[#6E6E6E] text-sm">Complete actions to earn Fan Tokens</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Action Cards Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {engageActions.map((action) => (
              <article
                key={action.id}
                className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col h-full">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-white border border-[#E4E4E4] rounded-2xl flex items-center justify-center mb-4">
                    <action.icon className="w-7 h-7 text-[#121212]" strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <h3 className="text-[#121212] text-xl font-bold mb-2">{action.title}</h3>
                  <p className="text-[#6E6E6E] text-sm mb-4 flex-1">{action.subtitle}</p>

                  {/* Reward */}
                  <p className="text-[#CE1141] font-semibold text-sm mb-4">{action.reward}</p>

                  {/* CTA Button */}
                  <Link href={action.href} className="block w-full">
                    <button className="w-full bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold py-3 rounded-xl transition-colors">
                      {action.cta}
                    </button>
                  </Link>
                </div>
              </article>
            ))}
          </section>

          {/* Recent Engagement Activity */}
          <section className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
            <h2 className="text-[#121212] text-xl font-bold mb-6">Recent Engagement Activity</h2>
            <div className="space-y-0">
              {recentActivity.map((item, index) => (
                <div
                  key={index}
                  className={`py-4 flex items-center justify-between ${
                    index !== recentActivity.length - 1 ? "border-b border-[#E4E4E4]" : ""
                  }`}
                >
                  <div>
                    <p className="text-[#121212] font-medium mb-1">{item.action}</p>
                    <p className="text-[#6E6E6E] text-sm">{item.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#CE1141] font-semibold">+{item.tokens}</p>
                    <p className="text-[#6E6E6E] text-xs">Fan Tokens</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E4E4] shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-around">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
          >
            <Home className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <button className="flex flex-col items-center gap-1 text-[#CE1141] group" aria-current="page">
            <Zap className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Engage</span>
          </button>
          <Link
            href="/leaderboard"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
          >
            <Trophy className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Leaderboard</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
          >
            <User className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
