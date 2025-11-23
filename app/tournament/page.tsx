import { Home, Zap, Trophy, User, Swords, ArrowLeft, Medal, Crown, Star, Award } from "lucide-react"
import Link from "next/link"

export default function TournamentPage() {
  const leaderboardData = [
    { rank: 1, username: "Alex Johnson", score: 8450, badge: "crown" },
    { rank: 2, username: "Sarah Martinez", score: 7890, badge: "medal" },
    { rank: 3, username: "Mike Chen", score: 7234, badge: "medal" },
    { rank: 4, username: "Emma Wilson", score: 6890, badge: "star" },
    { rank: 5, username: "Mira Bianchi", score: 6450, badge: "star" },
    { rank: 6, username: "David Park", score: 5890, badge: "star" },
    { rank: 7, username: "Lisa Rodriguez", score: 5670, badge: "none" },
    { rank: 8, username: "Tom Anderson", score: 5440, badge: "none" },
    { rank: 9, username: "Anna Kim", score: 5320, badge: "none" },
    { rank: 10, username: "Chris Taylor", score: 5100, badge: "none" },
  ]

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
            <h1 className="text-[#121212] text-2xl font-bold">Season Tournament</h1>
            <p className="text-[#6E6E6E] text-sm">Compete to be the top fan</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Tournament Info Card */}
          <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-[#CE1141]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h2 className="text-[#121212] text-lg font-bold mb-3">Tournament Details</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#CE1141] rounded-full" />
                    <span className="text-[#6E6E6E]">Season ends in</span>
                    <span className="text-[#121212] font-semibold">6 days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#CE1141] rounded-full" />
                    <span className="text-[#6E6E6E]">Top 50 earn</span>
                    <span className="text-[#121212] font-semibold">exclusive NFTs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#CE1141] rounded-full" />
                    <span className="text-[#6E6E6E]">Winner gets</span>
                    <span className="text-[#121212] font-semibold">VIP match experience</span>
                  </div>
                </div>
                <button className="w-full md:w-auto bg-[#CE1141] text-white font-semibold py-3 px-8 rounded-xl hover:bg-[#B01038] transition-colors">
                  Join Tournament
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div>
            <h2 className="text-[#121212] text-xl font-bold mb-4">Current Rankings</h2>
            <div className="bg-white border border-[#E4E4E4] rounded-2xl overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="bg-[#F8F8F8] border-b border-[#E4E4E4] px-6 py-4 grid grid-cols-12 gap-4 text-sm font-semibold text-[#6E6E6E]">
                <div className="col-span-2">Rank</div>
                <div className="col-span-5">Username</div>
                <div className="col-span-3 text-right">Score</div>
                <div className="col-span-2 text-center">Badge</div>
              </div>

              {/* Table Rows */}
              <div>
                {leaderboardData.map((row, index) => (
                  <div
                    key={row.rank}
                    className={`px-6 py-4 grid grid-cols-12 gap-4 items-center border-b border-[#E4E4E4] last:border-b-0 ${
                      index % 2 === 0 ? "bg-white" : "bg-[#F8F8F8]"
                    } ${row.username === "Mira Bianchi" ? "bg-[#FEF2F2]" : ""}`}
                  >
                    {/* Rank */}
                    <div className="col-span-2">
                      <span className="text-[#121212] font-bold text-lg">#{row.rank}</span>
                    </div>

                    {/* Username */}
                    <div className="col-span-5">
                      <span className="text-[#121212] font-medium">{row.username}</span>
                      {row.username === "Mira Bianchi" && (
                        <span className="ml-2 text-[#CE1141] text-xs font-semibold">(You)</span>
                      )}
                    </div>

                    {/* Score */}
                    <div className="col-span-3 text-right">
                      <span className="text-[#121212] font-bold">{row.score.toLocaleString()}</span>
                      <span className="text-[#6E6E6E] text-sm ml-1">pts</span>
                    </div>

                    {/* Badge */}
                    <div className="col-span-2 flex justify-center">
                      {row.badge === "crown" && (
                        <div className="w-8 h-8 bg-[#FFD700] border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                          <Crown className="w-5 h-5 text-[#121212]" strokeWidth={2} />
                        </div>
                      )}
                      {row.badge === "medal" && (
                        <div className="w-8 h-8 bg-[#C0C0C0] border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                          <Medal className="w-5 h-5 text-[#121212]" strokeWidth={2} />
                        </div>
                      )}
                      {row.badge === "star" && (
                        <div className="w-8 h-8 bg-[#CE1141] border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4 text-white fill-white" strokeWidth={2} />
                        </div>
                      )}
                      {row.badge === "none" && (
                        <div className="w-8 h-8 bg-[#F8F8F8] border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-[#D6D6D6]" strokeWidth={2} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How to Earn Points */}
          <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#121212] text-lg font-bold mb-4">How to Earn Points</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#CE1141] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <div className="text-[#121212] font-semibold">Complete Quests</div>
                  <div className="text-[#6E6E6E] text-sm">Earn up to 500 points per quest</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#CE1141] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <div className="text-[#121212] font-semibold">Win Fan Duels</div>
                  <div className="text-[#6E6E6E] text-sm">Earn points based on stake amount</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#CE1141] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <div className="text-[#121212] font-semibold">Participate in Matchday Missions</div>
                  <div className="text-[#6E6E6E] text-sm">Live challenges during games</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#CE1141] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <div>
                  <div className="text-[#121212] font-semibold">Maintain Daily Streak</div>
                  <div className="text-[#6E6E6E] text-sm">Bonus points for consistency</div>
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
          <Link
            href="/duels"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
          >
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
