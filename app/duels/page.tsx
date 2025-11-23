"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import {
  Home,
  Zap,
  Trophy,
  User,
  Swords,
  ArrowRight,
  Target,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

interface Duel {
  id: string
  creator_wallet: string
  opponent_wallet: string | null
  duel_type: 'prediction' | 'trivia' | 'score'
  stake_amount: number
  challenge_data: any
  status: 'open' | 'active' | 'completed' | 'cancelled'
  winner_wallet: string | null
  result_data: any
  created_at: string
  started_at: string | null
  completed_at: string | null
}

export default function FanDuelsPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [duels, setDuels] = useState<Duel[]>([])
  const [myDuels, setMyDuels] = useState<Duel[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'open' | 'my'>('open')

  useEffect(() => {
    if (!isConnected) {
      router.push('/onboarding')
      return
    }
    loadDuels()
  }, [isConnected, address])

  const loadDuels = async () => {
    setLoading(true)
    try {
      // Load open duels
      const { data: openDuels, error: openError } = await supabase
        .from('duels')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(10)

      if (openError) throw openError
      setDuels(openDuels || [])

      // Load my duels if wallet connected
      if (address) {
        const { data: userDuels, error: userError } = await supabase
          .from('duels')
          .select('*')
          .or(`creator_wallet.eq.${address},opponent_wallet.eq.${address}`)
          .order('created_at', { ascending: false })
          .limit(10)

        if (userError) throw userError
        setMyDuels(userDuels || [])
      }
    } catch (error) {
      console.error('Error loading duels:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDuelTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction':
        return <Target className="w-5 h-5" strokeWidth={2} />
      case 'trivia':
        return <Sparkles className="w-5 h-5" strokeWidth={2} />
      case 'score':
        return <TrendingUp className="w-5 h-5" strokeWidth={2} />
      default:
        return <Swords className="w-5 h-5" strokeWidth={2} />
    }
  }

  const getDuelTypeColor = (type: string) => {
    switch (type) {
      case 'prediction':
        return 'bg-blue-500'
      case 'trivia':
        return 'bg-purple-500'
      case 'score':
        return 'bg-green-500'
      default:
        return 'bg-[#CE1141]'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Open
          </span>
        )
      case 'active':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            Active
          </span>
        )
      case 'completed':
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
            Completed
          </span>
        )
      case 'cancelled':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  const formatWalletAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleJoinDuel = async (duelId: string) => {
    if (!address) return

    try {
      const response = await fetch('/api/duels/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duelId, opponentWallet: address }),
      })

      if (response.ok) {
        router.push(`/duels/${duelId}`)
      }
    } catch (error) {
      console.error('Error joining duel:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E4E4E4] px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-[#121212] text-2xl font-bold">Fan Duels</h1>
              <p className="text-[#6E6E6E] text-sm">Challenge other fans, stake tokens, win rewards</p>
            </div>
            <Link href="/duels/create">
              <button className="bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
                <Plus className="w-5 h-5" strokeWidth={2} />
                <span className="hidden md:inline">Create Duel</span>
              </button>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('open')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'open'
                  ? 'bg-[#CE1141] text-white'
                  : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#F0F0F0]'
              }`}
            >
              Open Duels
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'my'
                  ? 'bg-[#CE1141] text-white'
                  : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#F0F0F0]'
              }`}
            >
              My Duels
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* How Duels Work */}
          <div className="bg-gradient-to-br from-[#CE1141] to-[#B01038] rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-xl font-bold mb-3">How Duels Work</h2>
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex-1 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Plus className="w-6 h-6" strokeWidth={2} />
                </div>
                <p className="text-white/90">Create or Join</p>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              <div className="flex-1 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Swords className="w-6 h-6" strokeWidth={2} />
                </div>
                <p className="text-white/90">Stake Tokens</p>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              <div className="flex-1 text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6" strokeWidth={2} />
                </div>
                <p className="text-white/90">Winner Takes All</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-[#CE1141] mx-auto mb-4" />
              <p className="text-[#6E6E6E]">Loading duels...</p>
            </div>
          ) : (
            <>
              {/* Open Duels Tab */}
              {activeTab === 'open' && (
                <div className="space-y-4">
                  {duels.length === 0 ? (
                    <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-12 text-center">
                      <Swords className="w-16 h-16 text-[#6E6E6E] mx-auto mb-4" strokeWidth={1.5} />
                      <h3 className="text-[#121212] text-lg font-bold mb-2">No Open Duels</h3>
                      <p className="text-[#6E6E6E] mb-6">Be the first to create a duel!</p>
                      <Link href="/duels/create">
                        <button className="bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                          Create Duel
                        </button>
                      </Link>
                    </div>
                  ) : (
                    duels.map((duel) => (
                      <Link href={`/duels/${duel.id}`} key={duel.id}>
                        <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 ${getDuelTypeColor(duel.duel_type)} rounded-xl flex items-center justify-center text-white`}>
                                {getDuelTypeIcon(duel.duel_type)}
                              </div>
                              <div>
                                <h3 className="text-[#121212] font-bold capitalize">{duel.duel_type} Duel</h3>
                                <p className="text-[#6E6E6E] text-sm">
                                  by {formatWalletAddress(duel.creator_wallet)}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(duel.status)}
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[#6E6E6E] text-sm">Stake</p>
                              <p className="text-[#121212] font-bold text-lg">{duel.stake_amount} FANFI</p>
                            </div>
                            {duel.creator_wallet.toLowerCase() !== address?.toLowerCase() && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleJoinDuel(duel.id)
                                }}
                                className="bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                              >
                                Join Duel
                              </button>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}

              {/* My Duels Tab */}
              {activeTab === 'my' && (
                <div className="space-y-4">
                  {myDuels.length === 0 ? (
                    <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-12 text-center">
                      <Trophy className="w-16 h-16 text-[#6E6E6E] mx-auto mb-4" strokeWidth={1.5} />
                      <h3 className="text-[#121212] text-lg font-bold mb-2">No Duels Yet</h3>
                      <p className="text-[#6E6E6E] mb-6">Create or join a duel to get started!</p>
                      <Link href="/duels/create">
                        <button className="bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                          Create Duel
                        </button>
                      </Link>
                    </div>
                  ) : (
                    myDuels.map((duel) => (
                      <Link href={`/duels/${duel.id}`} key={duel.id}>
                        <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 ${getDuelTypeColor(duel.duel_type)} rounded-xl flex items-center justify-center text-white`}>
                                {getDuelTypeIcon(duel.duel_type)}
                              </div>
                              <div>
                                <h3 className="text-[#121212] font-bold capitalize">{duel.duel_type} Duel</h3>
                                <p className="text-[#6E6E6E] text-sm">
                                  {duel.opponent_wallet ? (
                                    <>vs {formatWalletAddress(duel.opponent_wallet)}</>
                                  ) : (
                                    'Waiting for opponent...'
                                  )}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(duel.status)}
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[#6E6E6E] text-sm">Stake</p>
                              <p className="text-[#121212] font-bold text-lg">{duel.stake_amount} FANFI</p>
                            </div>
                            {duel.status === 'completed' && duel.winner_wallet && (
                              <div className="flex items-center gap-2">
                                {duel.winner_wallet.toLowerCase() === address?.toLowerCase() ? (
                                  <>
                                    <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2} />
                                    <span className="text-green-600 font-semibold">You Won!</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-5 h-5 text-red-600" strokeWidth={2} />
                                    <span className="text-red-600 font-semibold">You Lost</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Link href="/engage">
              <div className="bg-white border border-[#E4E4E4] rounded-xl p-4 hover:border-[#CE1141] transition-colors">
                <Zap className="w-6 h-6 text-[#CE1141] mb-2" strokeWidth={2} />
                <h3 className="text-[#121212] font-bold mb-1">Quests</h3>
                <p className="text-[#6E6E6E] text-sm">Complete daily challenges</p>
              </div>
            </Link>
            <Link href="/predictions">
              <div className="bg-white border border-[#E4E4E4] rounded-xl p-4 hover:border-[#CE1141] transition-colors">
                <Target className="w-6 h-6 text-[#CE1141] mb-2" strokeWidth={2} />
                <h3 className="text-[#121212] font-bold mb-1">Predictions</h3>
                <p className="text-[#6E6E6E] text-sm">Bet on match outcomes</p>
              </div>
            </Link>
            <Link href="/tournament">
              <div className="bg-white border border-[#E4E4E4] rounded-xl p-4 hover:border-[#CE1141] transition-colors">
                <Trophy className="w-6 h-6 text-[#CE1141] mb-2" strokeWidth={2} />
                <h3 className="text-[#121212] font-bold mb-1">Tournament</h3>
                <p className="text-[#6E6E6E] text-sm">Seasonal competition</p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E4E4] shadow-lg">
        <div className="max-w-2xl mx-auto px-2 py-3 flex items-center justify-around">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors"
          >
            <Home className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>
          <Link
            href="/engage"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors"
          >
            <Zap className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Engage</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-[#CE1141]">
            <Swords className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Duels</span>
          </div>
          <Link
            href="/leaderboard"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors"
          >
            <Trophy className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Leaderboard</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors"
          >
            <User className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
