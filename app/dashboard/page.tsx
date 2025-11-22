"use client"

import {
  Bell,
  Home,
  Zap,
  Trophy,
  User,
  TrendingUp,
  Flame,
  Ticket,
  MessageSquare,
  ShoppingBag,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const activityItems = [
  {
    id: 1,
    icon: Ticket,
    title: "Match Ticket Redeemed",
    time: "2 hours ago",
    points: 500,
  },
  {
    id: 2,
    icon: MessageSquare,
    title: "Social Post Verified",
    time: "1 day ago",
    points: 100,
  },
  {
    id: 3,
    icon: ShoppingBag,
    title: "Merch Purchase Verified",
    time: "2 days ago",
    points: 300,
  },
  {
    id: 4,
    icon: MapPin,
    title: "Stadium Check-in",
    time: "5 days ago",
    points: 1000,
  },
]

const leaderboardUsers = [
  { rank: 1, name: "Alex Johnson", points: 8450 },
  { rank: 2, name: "Sarah Martinez", points: 7890 },
  { rank: 3, name: "Mike Chen", points: 7234 },
  { rank: 4, name: "Emma Wilson", points: 6890 },
  { rank: 5, name: "Mira Bianchi", points: 6450, isCurrentUser: true },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Notification Banner */}
      <Link href="/reward">
        <aside className="bg-[#FFF8F0] border border-[#E4E4E4] rounded-2xl mx-4 mt-4 p-4 flex items-center justify-between cursor-pointer hover:bg-[#FFF0E0] transition-colors shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F7D020] rounded-full flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-[#121212]" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[#121212] font-semibold text-sm md:text-base">Congratulations, you earned a reward!</p>
              <p className="text-[#6E6E6E] text-xs md:text-sm">Tap to view your NFT</p>
            </div>
          </div>
          <button className="text-[#CE1141] hover:text-[#A00F35] transition-colors" aria-label="View notifications">
            <Bell className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
          </button>
        </aside>
      </Link>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Fan Tokens Card */}
            <section className="bg-gradient-to-br from-[#0033A0] via-[#002D8F] to-[#F7D020] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5" strokeWidth={2} />
                <h2 className="text-sm font-medium">Fan Tokens</h2>
              </div>
              <p className="text-5xl font-bold mb-3">24,567</p>
              <div className="flex items-center gap-1 text-green-300 text-sm">
                <TrendingUp className="w-4 h-4" strokeWidth={2} />
                <span className="font-medium">+1,250 this week</span>
              </div>

              {/* Argentina Token Image */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-32 h-32 opacity-20">
                <Image
                  src="/images/argentina-token.svg"
                  alt="Argentina Fan Token"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                />
              </div>
            </section>

            {/* Check in at Stadium Button */}
            <Link href="/check-in" className="block w-full">
              <button className="w-full bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-sm">
                <MapPin className="w-5 h-5" strokeWidth={2} />
                Check in at Stadium
              </button>
            </Link>

            {/* User Profile Card */}
            <section className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#E4E4E4]">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#F7D020]">
                  <Image
                    src="/images/mira-bianchi.webp"
                    alt="Mira Bianchi"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[#121212] font-semibold">Mira Bianchi</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-medium">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Verified
                    </span>
                  </div>
                  <p className="text-[#6E6E6E] text-sm">Argentina</p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E]">FanScore</span>
                  <span className="text-[#121212] font-semibold text-lg">6,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E]">Rank</span>
                  <span className="text-[#121212] font-semibold text-lg">#5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E]">Streak</span>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" strokeWidth={2} />
                    <span className="text-[#121212] font-semibold text-lg">12 days</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Staking Rewards Card */}
            <section className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#121212] font-semibold">Staking Rewards</h2>
                <span className="px-3 py-1 bg-[#CE1141] text-white text-xs font-medium rounded-full">Chiliz Earn</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E] text-sm">Staked</span>
                  <span className="text-[#A0A0A0] text-sm">—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E] text-sm">Annual Yield</span>
                  <span className="text-[#A0A0A0] text-sm">0.00%</span>
                </div>
              </div>
            </section>
          </aside>

          {/* Center Activity Timeline */}
          <section className="lg:col-span-6 space-y-4">
            <header className="mb-6">
              <h2 className="text-[#121212] text-2xl font-bold mb-2">Activity Timeline</h2>
              <p className="text-[#6E6E6E]">Your verified fan actions</p>
            </header>

            <div className="space-y-4">
              {activityItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[#6E6E6E]" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#121212] font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-[#6E6E6E] text-sm mb-2">{item.time}</p>
                    <p className="text-[#CE1141] text-sm font-medium">
                      <Trophy className="w-4 h-4 inline mr-1" strokeWidth={2} />+{item.points} points
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-medium flex-shrink-0">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Verified
                  </span>
                </article>
              ))}
            </div>
          </section>

          {/* Right Leaderboard */}
          <aside className="lg:col-span-3 space-y-4">
            <header className="mb-6">
              <h2 className="text-[#121212] text-2xl font-bold mb-2">Leaderboard</h2>
              <p className="text-[#6E6E6E]">Top fans this week</p>
            </header>

            <div className="space-y-3">
              {leaderboardUsers.map((user) => (
                <div
                  key={user.rank}
                  className={`rounded-2xl p-4 flex items-center gap-3 ${
                    user.isCurrentUser
                      ? "bg-[#0033A0]/10 border-2 border-[#0033A0]"
                      : "bg-[#F8F8F8] border border-[#E4E4E4]"
                  } shadow-sm`}
                >
                  <span className="text-[#6E6E6E] font-semibold text-sm w-8">#{user.rank}</span>
                  <div className="w-10 h-10 bg-white border border-[#E4E4E4] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {user.isCurrentUser ? (
                      <Image
                        src="/images/mira-bianchi.webp"
                        alt="Mira Bianchi"
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#121212] font-medium truncate">{user.name}</p>
                    <p className="text-[#6E6E6E] text-xs">{user.points.toLocaleString()} pts</p>
                  </div>
                  {user.rank <= 3 && (
                    <Trophy className="w-5 h-5 text-[#F7D020] flex-shrink-0" strokeWidth={2} fill="#F7D020" />
                  )}
                </div>
              ))}
            </div>

            <Link href="/leaderboard" className="block w-full">
              <button className="w-full bg-[#CE1141] hover:bg-[#B01038] text-white text-sm font-semibold py-3 rounded-xl transition-colors shadow-sm">
                View Full Leaderboard
              </button>
            </Link>
          </aside>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E4E4] shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-[#CE1141] group" aria-current="page">
            <Home className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Home</span>
          </button>
          <Link
            href="/engage"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
          >
            <Zap className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Engage</span>
          </Link>
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
