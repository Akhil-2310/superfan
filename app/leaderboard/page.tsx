"use client"

import { ChevronLeft, TrendingUp, TrendingDown, Trophy, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"

const leaderboardData = [
  {
    rank: 1,
    name: "Alex Johnson",
    points: 8450,
    badges: ["🏟️", "⭐", "🎫"],
    change: 2,
    changeDirection: "up" as const,
  },
  {
    rank: 2,
    name: "Sarah Martinez",
    points: 7890,
    badges: ["🏟️", "⭐"],
    change: 1,
    changeDirection: "down" as const,
  },
  {
    rank: 3,
    name: "Mike Chen",
    points: 7234,
    badges: ["⭐", "🎫"],
    change: 1,
    changeDirection: "up" as const,
  },
  {
    rank: 4,
    name: "Emma Wilson",
    points: 6890,
    badges: ["🏟️"],
    change: 0,
    changeDirection: null,
  },
  {
    rank: 5,
    name: "Mira Bianchi",
    points: 6450,
    badges: ["🏟️", "⭐"],
    change: 1,
    changeDirection: "up" as const,
    isCurrentUser: true,
    newAchievement: "Stadium Attendance Verified",
  },
  {
    rank: 6,
    name: "David Park",
    points: 5890,
    badges: ["⭐"],
    change: 2,
    changeDirection: "down" as const,
  },
]

type TabValue = "week" | "season" | "alltime"

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("week")

  return (
    <div className="min-h-screen bg-white pb-6">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 border-b border-[#E4E4E4]">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#6E6E6E] hover:text-[#121212] transition-colors mb-4"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2} />
        </Link>
        <h1 className="text-[#121212] text-3xl font-bold">Leaderboard</h1>
        <p className="text-[#6E6E6E] mt-1">Top fans competition</p>
      </header>

      {/* Tabs */}
      <nav className="px-4 mb-6 mt-4">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setActiveTab("week")}
            className={`py-3 px-4 rounded-xl font-semibold text-sm transition-colors shadow-sm ${
              activeTab === "week"
                ? "bg-[#CE1141] text-white"
                : "bg-[#F8F8F8] text-[#121212] border border-[#E4E4E4] hover:bg-[#F0F0F0]"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setActiveTab("season")}
            className={`py-3 px-4 rounded-xl font-semibold text-sm transition-colors shadow-sm ${
              activeTab === "season"
                ? "bg-[#CE1141] text-white"
                : "bg-[#F8F8F8] text-[#121212] border border-[#E4E4E4] hover:bg-[#F0F0F0]"
            }`}
          >
            This Season
          </button>
          <button
            onClick={() => setActiveTab("alltime")}
            className={`py-3 px-4 rounded-xl font-semibold text-sm transition-colors shadow-sm ${
              activeTab === "alltime"
                ? "bg-[#CE1141] text-white"
                : "bg-[#F8F8F8] text-[#121212] border border-[#E4E4E4] hover:bg-[#F0F0F0]"
            }`}
          >
            All-Time
          </button>
        </div>
      </nav>

      {/* Leaderboard List */}
      <main className="px-4 space-y-3">
        {leaderboardData.map((user) => (
          <article
            key={user.rank}
            className={`rounded-2xl p-5 shadow-sm ${
              user.isCurrentUser ? "bg-[#F8F8F8] border-2 border-[#CE1141]" : "bg-[#F8F8F8] border border-[#E4E4E4]"
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Rank Icon */}
              <div className="flex-shrink-0">
                {user.rank === 1 && <Trophy className="w-8 h-8 text-[#F7D020]" strokeWidth={2} fill="#F7D020" />}
                {user.rank === 2 && <Trophy className="w-8 h-8 text-[#A0A0A0]" strokeWidth={2} fill="#A0A0A0" />}
                {user.rank === 3 && <Trophy className="w-8 h-8 text-[#CD7F32]" strokeWidth={2} fill="#CD7F32" />}
                {user.rank > 3 && (
                  <span className="text-[#6E6E6E] font-bold text-xl w-8 text-center block">#{user.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="w-12 h-12 bg-[#E4E4E4] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.isCurrentUser ? (
                  <Image
                    src="/images/mira-bianchi.webp"
                    alt="Mira Bianchi"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-[#6E6E6E]" strokeWidth={2} />
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[#121212] font-semibold text-lg">{user.name}</h3>
                  {user.isCurrentUser && (
                    <span className="px-2 py-0.5 bg-blue-100 border border-blue-600 rounded-md text-blue-700 text-xs font-medium">
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[#6E6E6E] text-sm">{user.points.toLocaleString()} points</p>
                  <div className="flex items-center gap-1">
                    {user.badges.map((badge, index) => (
                      <span key={index} className="text-sm">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rank Change */}
              {user.changeDirection && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {user.changeDirection === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={2} />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" strokeWidth={2} />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      user.changeDirection === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {user.change}
                  </span>
                </div>
              )}
              {user.isCurrentUser && user.newAchievement && (
                <div className="flex items-center gap-1 text-yellow-600 flex-shrink-0">
                  <span className="text-xl">⭐</span>
                  <span className="text-xs font-medium">New!</span>
                </div>
              )}
            </div>

            {/* Achievement Badge for Current User */}
            {user.isCurrentUser && user.newAchievement && (
              <div className="mt-4 pt-4 border-t border-[#E4E4E4]">
                <div className="flex items-center gap-2 text-yellow-600">
                  <span className="text-lg">⭐</span>
                  <span className="text-sm font-medium">{user.newAchievement}</span>
                  <span className="text-lg">⭐</span>
                </div>
              </div>
            )}
          </article>
        ))}
      </main>
    </div>
  )
}
