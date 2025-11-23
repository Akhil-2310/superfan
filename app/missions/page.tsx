import {
    Home,
    Zap,
    Trophy,
    User,
    ArrowLeft,
    Clock,
    Sparkles,
    Users,
    BarChart3,
    MessageSquare,
    Swords,
  } from "lucide-react"
  import Link from "next/link"
  
  export default function MissionsPage() {
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
              <h1 className="text-[#121212] text-2xl font-bold">Matchday Missions</h1>
              <p className="text-[#6E6E6E] text-sm">Real-time challenges active during the game</p>
            </div>
          </div>
        </header>
  
        {/* Main Content */}
        <main className="flex-1 px-4 py-8 pb-24">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Timer Component */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#CE1141] rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-[#121212] text-lg font-bold">Live for the next 3 minutes!</div>
                    <div className="text-[#6E6E6E] text-sm">Complete missions before time runs out</div>
                  </div>
                </div>
                <div className="text-[#CE1141] text-3xl font-bold tabular-nums">02:47</div>
              </div>
            </div>
  
            {/* Rewards Banner */}
            <div className="bg-[#CE1141] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
                <p className="text-white text-lg font-semibold">
                  Earn up to <span className="font-bold">+300 Fan Tokens</span> for completing live missions
                </p>
              </div>
            </div>
  
            {/* Live Missions Cards */}
            <div className="space-y-4">
              {/* Mission 1: Predict Next Goal Scorer */}
              <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-[#CE1141]" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#121212] text-lg font-bold mb-2">Predict the Next Goal Scorer</h3>
                    <p className="text-[#6E6E6E] text-sm mb-4">
                      Select which player will score next to earn bonus tokens
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="bg-[#CE1141] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        +100 Tokens
                      </div>
                      <button className="bg-[#CE1141] text-white font-semibold py-2 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                        Select Player
                      </button>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Mission 2: Vote for Man of the Match */}
              <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-[#CE1141]" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#121212] text-lg font-bold mb-2">Vote for Man of the Match</h3>
                    <p className="text-[#6E6E6E] text-sm mb-4">Cast your vote for the best player of the match</p>
                    <div className="flex items-center justify-between">
                      <div className="bg-[#CE1141] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        +50 Tokens
                      </div>
                      <button className="bg-[#CE1141] text-white font-semibold py-2 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                        Vote Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Mission 3: Guess Final Score */}
              <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-[#CE1141]" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#121212] text-lg font-bold mb-2">Guess the Final Score</h3>
                    <p className="text-[#6E6E6E] text-sm mb-4">Predict the exact final score for bonus rewards</p>
                    <div className="flex items-center justify-between">
                      <div className="bg-[#CE1141] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        +75 Tokens
                      </div>
                      <button className="bg-[#CE1141] text-white font-semibold py-2 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                        Submit Prediction
                      </button>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Mission 4: Live Trivia */}
              <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-[#CE1141]" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#121212] text-lg font-bold mb-2">Live Trivia</h3>
                    <p className="text-[#6E6E6E] text-sm mb-4">Answer trivia questions about the match in real-time</p>
                    <div className="flex items-center justify-between">
                      <div className="bg-[#CE1141] text-white text-xs font-semibold px-3 py-1 rounded-full">
                        +75 Tokens
                      </div>
                      <button className="bg-[#CE1141] text-white font-semibold py-2 px-6 rounded-xl hover:bg-[#B01038] transition-colors">
                        Start Trivia
                      </button>
                    </div>
                  </div>
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
              <span className="text-xs font-medium">Dashboard</span>
            </Link>
            <Link
              href="/engage"
              className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
            >
              <Zap className="w-6 h-6" strokeWidth={2} />
              <span className="text-xs font-medium">Engage</span>
            </Link>
            <Link href="/duels" className="flex flex-col items-center gap-1 text-[#CE1141] group">
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
  