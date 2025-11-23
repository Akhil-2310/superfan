"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  Zap,
  Trophy,
  User,
  Swords,
  TrendingUp,
  Crown,
  Medal,
  Award,
  Flame,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { getCountryFlag } from "@/lib/api/self-data-parser"

interface LeaderboardEntry {
  wallet_address: string
  verified_name: string | null
  nationality: string | null
  total_tokens: number
  fan_score: number
  streak_days: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all')

  useEffect(() => {
    loadLeaderboard()
  }, [timeframe])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('wallet_address, verified_name, nationality, total_tokens, fan_score, streak_days')
        .order('total_tokens', { ascending: false })
        .limit(100)

      if (error) throw error
      setLeaderboard(data || [])
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" strokeWidth={2} />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" strokeWidth={2} />
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" strokeWidth={2} />
      default:
        return <span className="text-[#6E6E6E] font-bold text-lg">#{rank}</span>
    }
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300'
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300'
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300'
      default:
        return 'bg-white border-[#E4E4E4]'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[#E4E4E4] px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-[#121212] text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-7 h-7 text-[#CE1141]" strokeWidth={2} />
                Leaderboard
              </h1>
              <p className="text-[#6E6E6E] text-sm">Top fans ranked by tokens earned</p>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe('all')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                timeframe === 'all'
                  ? 'bg-[#CE1141] text-white'
                  : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#F0F0F0]'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                timeframe === 'week'
                  ? 'bg-[#CE1141] text-white'
                  : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#F0F0F0]'
              }`}
              disabled
            >
              This Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                timeframe === 'month'
                  ? 'bg-[#CE1141] text-white'
                  : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#F0F0F0]'
              }`}
              disabled
            >
              This Month
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top 3 Podium */}
          {!loading && leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <div className="flex flex-col items-center pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-3 border-4 border-white shadow-lg">
                  <Medal className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-center">
                  <p className="text-2xl mb-1">{getCountryFlag(leaderboard[1].nationality || '')}</p>
                  <p className="font-bold text-[#121212] truncate max-w-[100px]">
                    {leaderboard[1].verified_name || `${leaderboard[1].wallet_address.slice(0, 6)}...`}
                  </p>
                  <p className="text-green-600 font-bold text-lg">{leaderboard[1].total_tokens} FANFI</p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <Crown className="w-12 h-12 text-yellow-500 mb-2 animate-bounce" strokeWidth={2} />
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mb-3 border-4 border-white shadow-xl">
                  <Trophy className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-center">
                  <p className="text-3xl mb-1">{getCountryFlag(leaderboard[0].nationality || '')}</p>
                  <p className="font-bold text-[#121212] text-lg truncate max-w-[100px]">
                    {leaderboard[0].verified_name || `${leaderboard[0].wallet_address.slice(0, 6)}...`}
                  </p>
                  <p className="text-green-600 font-bold text-xl">{leaderboard[0].total_tokens} FANFI</p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center pt-12">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mb-3 border-4 border-white shadow-lg">
                  <Medal className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-center">
                  <p className="text-xl mb-1">{getCountryFlag(leaderboard[2].nationality || '')}</p>
                  <p className="font-bold text-[#121212] truncate max-w-[100px]">
                    {leaderboard[2].verified_name || `${leaderboard[2].wallet_address.slice(0, 6)}...`}
                  </p>
                  <p className="text-green-600 font-bold">{leaderboard[2].total_tokens} FANFI</p>
                </div>
              </div>
            </div>
          )}

          {/* Rewards Banner */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-6">
            <h3 className="font-bold text-xl mb-3">🏆 Top Performer Rewards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <p className="font-bold">#1 Champion</p>
                <p>• Exclusive NFT Badge</p>
                <p>• Free Team Merch</p>
                <p>• 5,000 FANFI Bonus</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <p className="font-bold">#2-3 Elite</p>
                <p>• Elite NFT Badge</p>
                <p>• 50% Off Merch</p>
                <p>• 2,000 FANFI Bonus</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <p className="font-bold">#4-10 Top Fans</p>
                <p>• Top Fan NFT</p>
                <p>• 25% Off Merch</p>
                <p>• 500 FANFI Bonus</p>
              </div>
            </div>
          </div>

          {/* Full Leaderboard */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-[#CE1141] mx-auto mb-4" />
                <p className="text-[#6E6E6E]">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-12 text-center">
                <Trophy className="w-16 h-16 text-[#6E6E6E] mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-[#121212] text-lg font-bold mb-2">No Rankings Yet</h3>
                <p className="text-[#6E6E6E]">Start earning tokens to appear on the leaderboard!</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry.wallet_address}
                  className={`${getRankBg(index + 1)} border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-3xl">{getCountryFlag(entry.nationality || '')}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#121212] font-bold truncate">
                        {entry.verified_name || `${entry.wallet_address.slice(0, 10)}...${entry.wallet_address.slice(-4)}`}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-[#6E6E6E]">
                        <span className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" strokeWidth={2} />
                          {entry.streak_days} day streak
                        </span>
                        <span>Score: {entry.fan_score}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-bold text-lg">{entry.total_tokens}</p>
                    <p className="text-[#6E6E6E] text-sm">FANFI</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E4E4] shadow-lg">
        <div className="max-w-2xl mx-auto px-2 py-3 flex items-center justify-around">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors">
            <Home className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <Link href="/engage" className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors">
            <Zap className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Engage</span>
          </Link>
          <Link href="/duels" className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors">
            <Swords className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Duels</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-[#CE1141]">
            <Trophy className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Leaderboard</span>
          </div>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors">
            <User className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
