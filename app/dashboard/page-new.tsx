"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
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
  Swords,
  Activity,
  Shield,
  Calendar,
  Clock,
  PlayCircle,
} from "lucide-react"
import Link from "next/link"
import { calculateReputationFromTransactions, getReputationTier } from "@/lib/api/chiliz-reputation"
import { formatEther } from "viem"
import { supabase } from "@/lib/supabase/client"
import { getCountryFlag } from "@/lib/api/self-data-parser"
import { checkIfLastUser } from "@/lib/api/simple-self-reader"

// Sample upcoming matches (in a real app, fetch from API)
const upcomingMatches = [
  {
    id: 1,
    homeTeam: "Argentina",
    awayTeam: "Brazil",
    homeFlag: "🇦🇷",
    awayFlag: "🇧🇷",
    date: "Today",
    time: "20:00",
    competition: "World Cup Qualifier",
    isLive: false,
  },
  {
    id: 2,
    homeTeam: "France",
    awayTeam: "Spain",
    homeFlag: "🇫🇷",
    awayFlag: "🇪🇸",
    date: "Tomorrow",
    time: "18:30",
    competition: "UEFA Nations League",
    isLive: false,
  },
  {
    id: 3,
    homeTeam: "Italy",
    awayTeam: "Germany",
    homeFlag: "🇮🇹",
    awayFlag: "🇩🇪",
    date: "Live Now",
    time: "45'",
    competition: "Friendly",
    isLive: true,
  },
]

export default function DashboardPage() {
  const { address } = useAccount()
  const [reputation, setReputation] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [contractName, setContractName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (address) {
      loadUserData()
      loadReputation()
      loadContractName()
    }
  }, [address])

  const loadUserData = async () => {
    if (!address) return
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address)
        .single()
      
      if (!error && data) {
        setUserData(data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const loadReputation = async () => {
    if (!address) return
    
    try {
      const rep = await calculateReputationFromTransactions(address, true)
      setReputation(rep)
    } catch (error) {
      console.error('Error loading reputation:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadContractName = async () => {
    if (!address) return
    
    try {
      const result = await checkIfLastUser(address)
      if (result.isLastUser && result.name) {
        setContractName(result.name)
      }
    } catch (error) {
      console.error('Error loading contract name:', error)
    }
  }

  const tier = reputation ? getReputationTier(reputation.reputationScore) : null

  return (
    <div className="min-h-screen bg-white text-[#121212]">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-[#E4E4E4] px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#CE1141] rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl text-[#121212] hidden md:block">FanFi</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-[#CE1141] font-semibold flex items-center gap-2">
                <Home className="w-5 h-5" strokeWidth={2} />
                Dashboard
              </Link>
              <Link href="/engage" className="text-[#6E6E6E] hover:text-[#121212] flex items-center gap-2 transition-colors">
                <Zap className="w-5 h-5" strokeWidth={2} />
                Engage
              </Link>
              <Link href="/fan-duels" className="text-[#6E6E6E] hover:text-[#121212] flex items-center gap-2 transition-colors">
                <Swords className="w-5 h-5" strokeWidth={2} />
                Fan Duels
              </Link>
            </div>
          </div>
          <Link href="/profile">
            <button className="flex items-center gap-2 bg-[#F8F8F8] hover:bg-[#F0F0F0] border border-[#E4E4E4] rounded-xl px-4 py-2 transition-colors">
              <User className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
              <span className="hidden md:inline text-sm font-medium">Profile</span>
            </button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Quick Stats */}
          <aside className="lg:col-span-3 space-y-4">
            {/* Quick Profile Card */}
            {userData && (
              <Link href="/profile">
                <section className="bg-gradient-to-br from-[#CE1141] to-[#B01038] rounded-xl p-5 text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <span className="text-2xl">{getCountryFlag(userData?.nationality || 'unknown')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{contractName || userData.verified_name || 'User'}</p>
                      <p className="text-white/80 text-xs">View Profile →</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/20">
                    <div>
                      <p className="text-white/70 text-xs">Tokens</p>
                      <p className="font-bold text-lg">{userData.total_tokens || 0}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs">Rep Score</p>
                      <p className="font-bold text-lg">{reputation?.reputationScore || 0}</p>
                    </div>
                  </div>
                </section>
              </Link>
            )}

            {/* Quick Actions */}
            <section className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-5 shadow-sm">
              <h3 className="text-[#121212] font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#CE1141]" strokeWidth={2} />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link href="/engage">
                  <button className="w-full bg-white hover:bg-gray-50 border border-[#E4E4E4] rounded-lg p-3 flex items-center gap-3 text-left transition-colors">
                    <Zap className="w-5 h-5 text-[#CE1141]" strokeWidth={2} />
                    <span className="text-sm font-medium">Engage & Earn</span>
                  </button>
                </Link>
                <Link href="/fan-duels">
                  <button className="w-full bg-white hover:bg-gray-50 border border-[#E4E4E4] rounded-lg p-3 flex items-center gap-3 text-left transition-colors">
                    <Swords className="w-5 h-5 text-[#3B99FC]" strokeWidth={2} />
                    <span className="text-sm font-medium">Fan Duels</span>
                  </button>
                </Link>
                <Link href="/staking">
                  <button className="w-full bg-white hover:bg-gray-50 border border-[#E4E4E4] rounded-lg p-3 flex items-center gap-3 text-left transition-colors">
                    <Trophy className="w-5 h-5 text-[#16A34A]" strokeWidth={2} />
                    <span className="text-sm font-medium">Stake Tokens</span>
                  </button>
                </Link>
              </div>
            </section>
          </aside>

          {/* Center - Upcoming Matches */}
          <section className="lg:col-span-9 space-y-6">
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-[#121212] text-2xl font-bold mb-1">Matches</h2>
                <p className="text-[#6E6E6E]">Live and upcoming games</p>
              </div>
              <Link href="/matches">
                <button className="text-[#CE1141] hover:underline text-sm font-semibold">
                  View All →
                </button>
              </Link>
            </header>

            {/* Matches Grid */}
            <div className="space-y-4">
              {upcomingMatches.map((match, index) => (
                <article
                  key={`${match.id}-${index}`}
                  className={`bg-[#F8F8F8] border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${
                    match.isLive ? 'border-red-500 bg-red-50/50' : 'border-[#E4E4E4]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#6E6E6E]" strokeWidth={2} />
                      <span className="text-[#6E6E6E] text-sm">{match.competition}</span>
                    </div>
                    {match.isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500 rounded-full text-white text-xs font-bold animate-pulse">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        LIVE
                      </span>
                    ) : (
                      <span className="text-[#6E6E6E] text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" strokeWidth={2} />
                        {match.date} • {match.time}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    {/* Home Team */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-16 h-16 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center">
                        <span className="text-3xl">{match.homeFlag}</span>
                      </div>
                      <div>
                        <p className="text-[#121212] font-bold text-lg">{match.homeTeam}</p>
                        <p className="text-[#6E6E6E] text-sm">Home</p>
                      </div>
                    </div>

                    {/* VS */}
                    <div className="px-4">
                      <p className="text-[#6E6E6E] font-bold text-lg">VS</p>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <div className="text-right">
                        <p className="text-[#121212] font-bold text-lg">{match.awayTeam}</p>
                        <p className="text-[#6E6E6E] text-sm">Away</p>
                      </div>
                      <div className="w-16 h-16 bg-white border border-[#E4E4E4] rounded-xl flex items-center justify-center">
                        <span className="text-3xl">{match.awayFlag}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-4 border-t border-[#E4E4E4]">
                    {match.isLive ? (
                      <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <PlayCircle className="w-5 h-5" strokeWidth={2} />
                        Watch Live
                      </button>
                    ) : (
                      <button className="w-full bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold py-3 rounded-xl transition-colors">
                        Join Watch Room
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Empty State if no matches */}
            {upcomingMatches.length === 0 && (
              <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-12 text-center">
                <Calendar className="w-16 h-16 text-[#6E6E6E] mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-[#121212] text-xl font-bold mb-2">No Upcoming Matches</h3>
                <p className="text-[#6E6E6E]">Check back later for new games!</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

