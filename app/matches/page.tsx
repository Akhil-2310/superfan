"use client"

import { useState, useEffect } from "react"
import { Home, Zap, Trophy, User, Calendar, Users, ArrowRight, Tv } from "lucide-react"
import Link from "next/link"
import { useAccount } from "wagmi"

interface Match {
  id: string
  matchId: string
  league: string
  homeTeam: string
  awayTeam: string
  date: string
  time?: string
  status: 'upcoming' | 'live' | 'completed'
  homeScore?: number
  awayScore?: number
  country: string
}

export default function MatchesPage() {
  const { address } = useAccount()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [country, setCountry] = useState('argentina')

  useEffect(() => {
    loadMatches()
  }, [country])

  const loadMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/matches?country=${country}&demo=true`)
      const data = await response.json()
      
      if (data.success) {
        setMatches(data.data)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-red-700 text-xs font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            LIVE
          </span>
        )
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-medium">
            Upcoming
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-gray-700 text-xs font-medium">
            Completed
          </span>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E4E4E4] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[#121212] text-2xl font-bold mb-2">Match Center</h1>
          <p className="text-[#6E6E6E] text-sm">Join watch rooms and earn Fan Tokens</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Stats Banner */}
          <div className="bg-gradient-to-br from-[#0033A0] to-[#CE1141] rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Watch Together</h2>
                <p className="text-white/80 text-sm">Join rooms, chat with fans, earn rewards</p>
              </div>
              <Tv className="w-12 h-12 opacity-80" strokeWidth={1.5} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-2xl font-bold">{matches.length}</p>
                <p className="text-white/70 text-xs">Matches</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {matches.filter(m => m.status === 'live').length}
                </p>
                <p className="text-white/70 text-xs">Live Now</p>
              </div>
              <div>
                <p className="text-2xl font-bold">+50</p>
                <p className="text-white/70 text-xs">Tokens/Room</p>
              </div>
            </div>
          </div>

          {/* Matches List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#F8F8F8] rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-[#E4E4E4] rounded w-1/4 mb-4"></div>
                  <div className="h-8 bg-[#E4E4E4] rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match, index) => (
                <Link
                  key={`${match.id}-${index}`}
                  href={`/watch-room/${match.matchId}`}
                  className="block bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[#6E6E6E] text-sm mb-1">{match.league}</p>
                      {getStatusBadge(match.status)}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-[#6E6E6E] text-sm">
                        <Calendar className="w-4 h-4" strokeWidth={2} />
                        <span>{formatDate(match.date)}</span>
                      </div>
                      {match.time && (
                        <p className="text-[#6E6E6E] text-sm mt-1">{match.time}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-[#121212] text-xl font-bold">{match.homeTeam}</h3>
                    </div>
                    <div className="px-4">
                      {match.status === 'live' || match.status === 'completed' ? (
                        <div className="text-center">
                          <p className="text-[#121212] text-2xl font-bold">
                            {match.homeScore} - {match.awayScore}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[#6E6E6E] text-lg font-medium">vs</p>
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      <h3 className="text-[#121212] text-xl font-bold">{match.awayTeam}</h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#E4E4E4]">
                    <div className="flex items-center gap-2 text-[#6E6E6E] text-sm">
                      <Users className="w-4 h-4" strokeWidth={2} />
                      <span>
                        {Math.floor(Math.random() * 500) + 100} watching
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#CE1141] font-medium">
                      <span className="text-sm">Join Room</span>
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && matches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#6E6E6E] text-lg">No matches available</p>
              <p className="text-[#A0A0A0] text-sm mt-2">Check back later for new matches</p>
            </div>
          )}
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

