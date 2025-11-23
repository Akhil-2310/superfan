import { Home, Zap, Trophy, User, Swords, ArrowLeft, TrendingUp, Flame, Shield } from "lucide-react"
import Link from "next/link"

export default function BoostersPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E4E4E4] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href="/duels"
            className="text-[#6E6E6E] hover:text-[#121212] transition-colors"
            aria-label="Back to Fan Duels"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-[#121212] text-2xl font-bold">Boosters</h1>
            <p className="text-[#6E6E6E] text-sm">Multiply your rewards and level up faster.</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Booster Cards */}
          <div className="space-y-4">
            {/* Token Multiplier */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-7 h-7 text-[#CE1141]" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#121212] text-lg font-bold mb-2">Token Multiplier</h3>
                  <p className="text-[#6E6E6E] text-sm mb-4">+20% Token Earnings for 24 hours</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#121212] text-xl font-bold">100 FT</span>
                      <span className="text-[#6E6E6E] text-sm">Price</span>
                    </div>
                    <button className="bg-[#CE1141] text-white font-semibold py-2 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                      Activate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* XP Booster */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Flame className="w-7 h-7 text-[#CE1141]" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#121212] text-lg font-bold mb-2">XP Booster</h3>
                  <p className="text-[#6E6E6E] text-sm mb-4">2× XP for 12 hours</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#121212] text-xl font-bold">80 FT</span>
                      <span className="text-[#6E6E6E] text-sm">Price</span>
                    </div>
                    <button className="bg-[#CE1141] text-white font-semibold py-2 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                      Activate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Saver */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-[#CE1141]" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#121212] text-lg font-bold mb-2">Streak Saver</h3>
                  <p className="text-[#6E6E6E] text-sm mb-4">Protect your streak if you miss a day</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#121212] text-xl font-bold">50 FT</span>
                      <span className="text-[#6E6E6E] text-sm">Price</span>
                    </div>
                    <button className="bg-[#CE1141] text-white font-semibold py-2 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                      Activate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 mt-8">
            <h3 className="text-[#121212] text-base font-bold mb-3">How Boosters Work</h3>
            <ul className="space-y-2 text-[#6E6E6E] text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#CE1141] font-bold">•</span>
                <span>Boosters are activated immediately after purchase</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CE1141] font-bold">•</span>
                <span>Only one booster of each type can be active at a time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CE1141] font-bold">•</span>
                <span>Booster timers continue even when you're offline</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#CE1141] font-bold">•</span>
                <span>Stack multiple booster types for maximum effect</span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E4E4] shadow-lg">
        <div className="max-w-2xl mx-auto px-2 py-3 flex items-center justify-around">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
          >
            <Home className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <Link
            href="/engage"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
          >
            <Zap className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Engage</span>
          </Link>
          <Link href="/duels" className="flex flex-col items-center gap-1 text-[#CE1141] group" aria-current="page">
            <Swords className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Fan Duels</span>
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
