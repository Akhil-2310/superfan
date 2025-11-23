import { Home, Zap, Trophy, User, Gamepad2, ArrowLeft, ListChecks, Swords, Timer, Rocket } from "lucide-react"
import Link from "next/link"

export default function GamesPage() {
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
            <h1 className="text-[#121212] text-2xl font-bold">Game Hub</h1>
            <p className="text-[#6E6E6E] text-sm">Play, compete, and complete challenges to earn Fan Tokens.</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 pb-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Daily & Weekly Quests Card */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center mb-4">
                <ListChecks className="w-6 h-6 text-[#CE1141]" strokeWidth={2} />
              </div>
              <h3 className="text-[#121212] text-lg font-bold mb-2">Quests</h3>
              <p className="text-[#6E6E6E] text-sm mb-4">Complete tasks to earn tokens</p>
              {/* Progress bar placeholder */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-[#6E6E6E] mb-2">
                  <span>Daily Progress</span>
                  <span>3/5 completed</span>
                </div>
                <div className="w-full bg-white rounded-full h-2 border border-[#E4E4E4]">
                  <div className="bg-[#CE1141] h-full rounded-full" style={{ width: "60%" }} />
                </div>
              </div>
              <Link href="/quests" className="block">
                <button className="w-full bg-[#CE1141] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                  View Quests
                </button>
              </Link>
            </div>

            {/* Fan Duels Card */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center mb-4">
                <Swords className="w-6 h-6 text-[#CE1141]" strokeWidth={2} />
              </div>
              <h3 className="text-[#121212] text-lg font-bold mb-2">Fan Duels</h3>
              <p className="text-[#6E6E6E] text-sm mb-6">Stake tokens and challenge other fans</p>
              <div className="mb-4 pt-6">
                <div className="text-[#6E6E6E] text-xs mb-1">Active Duels</div>
                <div className="text-[#121212] text-2xl font-bold">12</div>
              </div>
              <Link href="/duels" className="block">
                <button className="w-full bg-[#CE1141] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                  Start Duel
                </button>
              </Link>
            </div>

            {/* Matchday Missions Card */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center mb-4">
                <Timer className="w-6 h-6 text-[#CE1141]" strokeWidth={2} />
              </div>
              <h3 className="text-[#121212] text-lg font-bold mb-2">Matchday Missions</h3>
              <p className="text-[#6E6E6E] text-sm mb-4">Live challenges active during the game</p>
              {/* Countdown timer placeholder */}
              <div className="mb-4">
                <div className="text-[#6E6E6E] text-xs mb-1">Next match in</div>
                <div className="text-[#121212] text-2xl font-bold">2d 14h 32m</div>
              </div>
              <Link href="/missions" className="block">
                <button className="w-full bg-[#CE1141] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                  Start Mission
                </button>
              </Link>
            </div>

            {/* Seasonal Tournament Card */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-[#CE1141]" strokeWidth={2} />
              </div>
              <h3 className="text-[#121212] text-lg font-bold mb-2">Tournament</h3>
              <p className="text-[#6E6E6E] text-sm mb-6">Compete to climb the seasonal leaderboard</p>
              <div className="mb-4 pt-6">
                <div className="text-[#6E6E6E] text-xs mb-1">Your Rank</div>
                <div className="text-[#121212] text-2xl font-bold">#47</div>
              </div>
              <Link href="/tournament" className="block">
                <button className="w-full bg-[#CE1141] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                  Join Tournament
                </button>
              </Link>
            </div>

            {/* Boosters Card */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-[#CE1141]" strokeWidth={2} />
              </div>
              <h3 className="text-[#121212] text-lg font-bold mb-2">Boosters</h3>
              <p className="text-[#6E6E6E] text-sm mb-6">Multiply your rewards</p>
              <div className="mb-4 pt-6">
                <div className="text-[#6E6E6E] text-xs mb-1">Active Booster</div>
                <div className="text-[#121212] text-2xl font-bold">2x</div>
              </div>
              <Link href="/boosters" className="block">
                <button className="w-full bg-[#CE1141] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                  Activate Boosters
                </button>
              </Link>
            </div>
          </div>

          {/* Game Economy Overview */}
          <div className="mt-12">
            <h2 className="text-[#121212] text-xl font-bold mb-6">Game Economy Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Tokens Earned */}
              <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
                <div className="text-[#6E6E6E] text-sm mb-2">Tokens Earned</div>
                <div className="text-[#121212] text-3xl font-bold">12,450</div>
                <div className="text-[#CE1141] text-xs mt-1">+1,250 this week</div>
              </div>

              {/* Tokens Spent */}
              <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
                <div className="text-[#6E6E6E] text-sm mb-2">Tokens Spent</div>
                <div className="text-[#121212] text-3xl font-bold">3,200</div>
                <div className="text-[#6E6E6E] text-xs mt-1">On games & duels</div>
              </div>

              {/* NFTs Collected */}
              <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
                <div className="text-[#6E6E6E] text-sm mb-2">NFTs Collected</div>
                <div className="text-[#121212] text-3xl font-bold">7</div>
                <div className="text-[#6E6E6E] text-xs mt-1">Exclusive rewards</div>
              </div>

              {/* Active Streak */}
              <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
                <div className="text-[#6E6E6E] text-sm mb-2">Active Streak</div>
                <div className="text-[#121212] text-3xl font-bold">12 days</div>
                <div className="text-[#CE1141] text-xs mt-1">Keep it going!</div>
              </div>
            </div>
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
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/engage"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
          >
            <Zap className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Engage</span>
          </Link>
          <button className="flex flex-col items-center gap-1 text-[#CE1141] group" aria-current="page">
            <Gamepad2 className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Games</span>
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
