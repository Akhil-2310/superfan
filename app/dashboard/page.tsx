"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract } from "wagmi"
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
import { fetchUpcomingMatches, type UpcomingMatch } from "@/lib/api/fetch-matches"

// Contract addresses and ABIs for on-chain balance
const FANFI_TOKEN_ADDRESS = "0xCee0c15B42EEb44491F588104bbC46812115dBB0" as `0x${string}`

const ERC20_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export default function DashboardPage() {
  const { address } = useAccount()
  const [reputation, setReputation] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [contractName, setContractName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([])
  const [matchesLoading, setMatchesLoading] = useState(true)

  // ===== READ REAL FANFI BALANCE FROM BLOCKCHAIN =====
  const { data: fanfiBalance } = useReadContract({
    address: FANFI_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Parse balance to readable format
  const totalTokens = fanfiBalance ? parseFloat(formatEther(fanfiBalance)) : 0

  useEffect(() => {
    if (address) {
      loadUserData()
      loadReputation()
      loadContractName()
    }
    loadMatches()
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

  const loadMatches = async () => {
    setMatchesLoading(true)
    try {
      const matches = await fetchUpcomingMatches()
      setUpcomingMatches(matches.slice(0, 3)) // Take only 3 matches for dashboard
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setMatchesLoading(false)
    }
  }

  const tier = reputation ? getReputationTier(reputation.reputationScore) : null

  return (
    <div className="min-h-screen bg-white text-[#121212]">
      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
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
                      <p className="text-white/70 text-xs">FANFI Tokens</p>
                      <p className="font-bold text-lg">{totalTokens.toFixed(2)}</p>
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
                <Link href="/duels">
                  <button className="w-full bg-white hover:bg-gray-50 border border-[#E4E4E4] rounded-lg p-3 flex items-center gap-3 text-left transition-colors">
                    <Swords className="w-5 h-5 text-[#3B99FC]" strokeWidth={2} />
                    <span className="text-sm font-medium">Duels</span>
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
            {matchesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-[#E4E4E4] border-t-[#CE1141] rounded-full animate-spin"></div>
              </div>
            ) : upcomingMatches.length > 0 ? (
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
                    <Link href={`/watch-room/${match.id}`}>
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
                    </Link>
                  </div>
                </article>
                ))}
              </div>
            ) : (
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

