"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import {
  Trophy,
  Users,
  Clock,
  ArrowLeft,
  Swords,
  Crown,
  TrendingUp,
  Shield,
  Flame,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { formatDistanceToNow } from "date-fns"

interface Duel {
  id: string
  title: string
  creator_wallet: string
  creator_team: string
  opponent_wallet: string | null
  opponent_team: string | null
  match_id: string
  stake_amount: number
  status: string
  created_at: string
  started_at: string | null
  winner_wallet: string | null
}

export default function DuelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { address } = useAccount()
  const [duel, setDuel] = useState<Duel | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadDuel()
    }
  }, [params.id])

  const loadDuel = async () => {
    try {
      const { data, error } = await supabase
        .from('duels')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setDuel(data)
    } catch (error) {
      console.error('Error loading duel:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinDuel = async () => {
    if (!address || !duel) return

    setJoining(true)
    try {
      const response = await fetch(`/api/duels/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duelId: duel.id,
          wallet: address,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to join duel')
      }

      // Reload duel data
      await loadDuel()
      alert('Successfully joined the duel! 🎉')
    } catch (error: any) {
      console.error('Error joining duel:', error)
      alert(error.message || 'Failed to join duel')
    } finally {
      setJoining(false)
    }
  }

  const getTeamFlag = (team: string) => {
    const flags: Record<string, string> = {
      'argentina': '🇦🇷',
      'france': '🇫🇷',
      'germany': '🇩🇪',
      'italy': '🇮🇹',
    }
    return flags[team.toLowerCase()] || '⚽'
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-500'
      case 'active':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E4E4E4] border-t-[#CE1141] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!duel) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <Swords className="w-16 h-16 text-[#6E6E6E] mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-[#121212] mb-2">Duel Not Found</h1>
          <p className="text-[#6E6E6E] mb-6">This duel doesn't exist or has been removed.</p>
          <Link href="/duels">
            <button className="bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold py-3 px-6 rounded-xl transition-colors">
              Back to Duels
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const isCreator = address?.toLowerCase() === duel.creator_wallet.toLowerCase()
  const isOpponent = address?.toLowerCase() === duel.opponent_wallet?.toLowerCase()
  const canJoin = !isCreator && !isOpponent && duel.status === 'open' && address
  const isWinner = address?.toLowerCase() === duel.winner_wallet?.toLowerCase()

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/duels"
            className="inline-flex items-center gap-2 text-[#6E6E6E] hover:text-[#121212] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            <span className="font-medium">Back to Duels</span>
          </Link>
        </div>

        {/* Main Duel Card */}
        <div className="bg-gradient-to-br from-[#CE1141] to-[#B01038] rounded-2xl p-8 text-white shadow-xl mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Swords className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{duel.title}</h1>
                <p className="text-white/80 text-sm">Match ID: {duel.match_id}</p>
              </div>
            </div>
            <span className={`${getStatusColor(duel.status)} px-4 py-1.5 rounded-full text-sm font-semibold uppercase`}>
              {duel.status}
            </span>
          </div>

          {/* Teams Face-off */}
          <div className="grid grid-cols-3 gap-4 items-center mb-6">
            {/* Creator */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
              <div className="text-5xl mb-3">{getTeamFlag(duel.creator_team)}</div>
              <p className="text-sm text-white/70 mb-1">Creator</p>
              <p className="font-bold text-lg capitalize mb-2">{duel.creator_team}</p>
              <p className="text-xs text-white/60 font-mono">
                {duel.creator_wallet.slice(0, 6)}...{duel.creator_wallet.slice(-4)}
              </p>
              {isCreator && (
                <span className="inline-block mt-2 bg-yellow-400/20 border border-yellow-400/30 text-yellow-200 px-3 py-1 rounded-full text-xs font-semibold">
                  You
                </span>
              )}
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-black">VS</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4" strokeWidth={2} />
                <p className="text-lg font-bold">{duel.stake_amount} FANFI</p>
              </div>
            </div>

            {/* Opponent */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
              {duel.opponent_wallet ? (
                <>
                  <div className="text-5xl mb-3">{getTeamFlag(duel.opponent_team || '')}</div>
                  <p className="text-sm text-white/70 mb-1">Opponent</p>
                  <p className="font-bold text-lg capitalize mb-2">{duel.opponent_team}</p>
                  <p className="text-xs text-white/60 font-mono">
                    {duel.opponent_wallet.slice(0, 6)}...{duel.opponent_wallet.slice(-4)}
                  </p>
                  {isOpponent && (
                    <span className="inline-block mt-2 bg-yellow-400/20 border border-yellow-400/30 text-yellow-200 px-3 py-1 rounded-full text-xs font-semibold">
                      You
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="text-5xl mb-3 opacity-30">❓</div>
                  <p className="text-sm text-white/70 mb-1">Opponent</p>
                  <p className="font-bold text-lg mb-2">Waiting...</p>
                  <p className="text-xs text-white/60">Be the first to join!</p>
                </>
              )}
            </div>
          </div>

          {/* Winner Banner */}
          {duel.status === 'completed' && duel.winner_wallet && (
            <div className="bg-yellow-400/20 backdrop-blur-sm border-2 border-yellow-400/30 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-yellow-300" strokeWidth={2.5} />
                <p className="text-lg font-bold">
                  {isWinner ? '🎉 You Won!' : `Winner: ${duel.winner_wallet.slice(0, 6)}...${duel.winner_wallet.slice(-4)}`}
                </p>
                <Crown className="w-6 h-6 text-yellow-300" strokeWidth={2.5} />
              </div>
            </div>
          )}

          {/* Join Button */}
          {canJoin && (
            <button
              onClick={handleJoinDuel}
              disabled={joining}
              className="w-full bg-white hover:bg-white/90 text-[#CE1141] font-bold py-4 rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#CE1141]/30 border-t-[#CE1141] rounded-full animate-spin"></div>
                  Joining Duel...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Swords className="w-5 h-5" strokeWidth={2.5} />
                  Join Duel for {duel.stake_amount} FANFI
                </span>
              )}
            </button>
          )}

          {!address && duel.status === 'open' && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <p className="text-white/90">Connect your wallet to join this duel</p>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Time Info */}
          <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#CE1141]" strokeWidth={2} />
              <h3 className="font-bold text-[#121212]">Time Info</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[#6E6E6E] text-sm mb-1">Created</p>
                <p className="text-[#121212] font-semibold">
                  {formatDistanceToNow(new Date(duel.created_at), { addSuffix: true })}
                </p>
              </div>
              {duel.started_at && (
                <div>
                  <p className="text-[#6E6E6E] text-sm mb-1">Started</p>
                  <p className="text-[#121212] font-semibold">
                    {formatDistanceToNow(new Date(duel.started_at), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Prize Pool */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5" strokeWidth={2.5} />
              <h3 className="font-bold">Prize Pool</h3>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black">{duel.stake_amount * 2}</p>
              <p className="text-white/90 text-sm">FANFI Tokens</p>
              <p className="text-white/70 text-xs">Winner takes all! 🏆</p>
            </div>
          </div>
        </div>

        {/* Back to Duels */}
        <div className="mt-6 text-center">
          <Link href="/duels">
            <button className="text-[#CE1141] hover:underline font-semibold">
              ← Browse More Duels
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

