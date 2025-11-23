import {
    Home,
    Zap,
    Trophy,
    User,
    Swords,
    ArrowRight,
    CheckSquare,
    Target,
    Sparkles,
    TrendingUp,
    ZapIcon,
  } from "lucide-react"
  import Link from "next/link"
  
  export default function FanDuelsPage() {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-[#E4E4E4] px-4 py-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <div>
              <h1 className="text-[#121212] text-2xl font-bold">Fan Duels</h1>
              <p className="text-[#6E6E6E] text-sm">Compete in challenges and missions to earn rewards.</p>
            </div>
          </div>
        </header>
  
        {/* Main Content */}
        <main className="flex-1 px-4 py-8 pb-24">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* How Duels Work Card */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
              <h2 className="text-[#121212] text-xl font-bold mb-4">How Duels Work</h2>
              <p className="text-[#6E6E6E] text-sm mb-6">
                Choose an opponent, stake tokens, complete challenges, winner takes the prize.
              </p>
  
              {/* Visual Diagram */}
              <div className="flex items-center justify-between gap-4 py-6">
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 bg-white border border-[#E4E4E4] rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-[#6E6E6E]" strokeWidth={2} />
                  </div>
                  <div className="text-xs text-[#6E6E6E] font-medium">Choose Opponent</div>
                </div>
  
                <ArrowRight className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
  
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 bg-white border border-[#E4E4E4] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Swords className="w-8 h-8 text-[#CE1141]" strokeWidth={2} />
                  </div>
                  <div className="text-xs text-[#6E6E6E] font-medium">Stake Tokens</div>
                </div>
  
                <ArrowRight className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
  
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 bg-white border border-[#E4E4E4] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-8 h-8 text-[#CE1141]" strokeWidth={2} />
                  </div>
                  <div className="text-xs text-[#6E6E6E] font-medium">Winner Takes Prize</div>
                </div>
              </div>
            </div>
  
            {/* Main Challenge Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quests Card */}
              <Link href="/quests" className="block h-full">
                <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-[#CE1141] group h-full flex flex-col">
                  <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#CE1141] transition-colors">
                    <CheckSquare
                      className="w-6 h-6 text-[#CE1141] group-hover:text-white transition-colors"
                      strokeWidth={2}
                    />
                  </div>
                  <h3 className="text-[#121212] text-lg font-bold mb-2">Quests</h3>
                  <p className="text-[#6E6E6E] text-sm mb-6 flex-1">Complete daily & weekly challenges.</p>
                  <button className="w-full bg-[#CE1141] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                    Play Quests
                  </button>
                </div>
              </Link>
  
              {/* Matchday Missions Card */}
              <Link href="/missions" className="block h-full">
                <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-[#CE1141] group h-full flex flex-col">
                  <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#CE1141] transition-colors">
                    <Target className="w-6 h-6 text-[#CE1141] group-hover:text-white transition-colors" strokeWidth={2} />
                  </div>
                  <h3 className="text-[#121212] text-lg font-bold mb-2">Matchday Missions</h3>
                  <p className="text-[#6E6E6E] text-sm mb-6 flex-1">Live missions during games.</p>
                  <button className="w-full bg-[#CE1141] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                    Enter Live Missions
                  </button>
                </div>
              </Link>
  
              {/* Seasonal Tournaments Card */}
              <Link href="/tournament" className="block h-full">
                <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-[#CE1141] group h-full flex flex-col">
                  <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#CE1141] transition-colors">
                    <Trophy className="w-6 h-6 text-[#CE1141] group-hover:text-white transition-colors" strokeWidth={2} />
                  </div>
                  <h3 className="text-[#121212] text-lg font-bold mb-2">Seasonal Tournaments</h3>
                  <p className="text-[#6E6E6E] text-sm mb-6 flex-1">Compete to climb the leaderboard.</p>
                  <button className="w-full bg-[#CE1141] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                    Join Tournament
                  </button>
                </div>
              </Link>
            </div>
  
            {/* Boosters Widget */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#CE1141]" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-[#121212] text-xl font-bold">Boosters</h2>
                  <p className="text-[#6E6E6E] text-sm">Multiply your Fan Token rewards.</p>
                </div>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* Token Multiplier */}
                <Link href="/boosters" className="block">
                  <div className="bg-white border border-[#E4E4E4] rounded-xl p-4 hover:border-[#CE1141] transition-colors group">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-[#CE1141]" strokeWidth={2} />
                      <h3 className="text-[#121212] text-sm font-bold">Token Multiplier</h3>
                    </div>
                    <p className="text-[#6E6E6E] text-xs mb-3">+20% earnings for 24h</p>
                    <button className="w-full bg-[#CE1141] text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-[#B01038] transition-colors">
                      Buy
                    </button>
                  </div>
                </Link>
  
                {/* XP Boost */}
                <Link href="/boosters" className="block">
                  <div className="bg-white border border-[#E4E4E4] rounded-xl p-4 hover:border-[#CE1141] transition-colors group">
                    <div className="flex items-center gap-2 mb-2">
                      <ZapIcon className="w-5 h-5 text-[#CE1141]" strokeWidth={2} />
                      <h3 className="text-[#121212] text-sm font-bold">XP Boost</h3>
                    </div>
                    <p className="text-[#6E6E6E] text-xs mb-3">2× XP for 12 hours</p>
                    <button className="w-full bg-[#CE1141] text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-[#B01038] transition-colors">
                      Buy
                    </button>
                  </div>
                </Link>
  
                {/* Boost Fan Tokens */}
                <Link href="/boosters" className="block">
                  <div className="bg-white border border-[#E4E4E4] rounded-xl p-4 hover:border-[#CE1141] transition-colors group">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-[#CE1141]" strokeWidth={2} />
                      <h3 className="text-[#121212] text-sm font-bold">Boost Fan Tokens</h3>
                    </div>
                    <p className="text-[#6E6E6E] text-xs mb-3">Buy more tokens now</p>
                    <button className="w-full bg-[#CE1141] text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-[#B01038] transition-colors">
                      Buy
                    </button>
                  </div>
                </Link>
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
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
            <Link
              href="/engage"
              className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
            >
              <Zap className="w-6 h-6" strokeWidth={2} />
              <span className="text-xs font-medium">Engage</span>
            </Link>
            <button className="flex flex-col items-center gap-1 text-[#CE1141] group" aria-current="page">
              <Swords className="w-6 h-6" strokeWidth={2} />
              <span className="text-xs font-medium">Fan Duels</span>
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
  