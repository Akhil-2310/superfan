"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Target,
  Sparkles,
  TrendingUp,
  Loader2,
  Info,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

const DUEL_TYPES = [
  {
    id: 'prediction',
    name: 'Match Prediction',
    icon: Target,
    description: 'Predict the outcome of an upcoming match',
    color: 'bg-blue-500',
  },
  {
    id: 'trivia',
    name: 'Fan Trivia',
    icon: Sparkles,
    description: 'Test your knowledge of team history',
    color: 'bg-purple-500',
  },
  {
    id: 'score',
    name: 'Score Challenge',
    icon: TrendingUp,
    description: 'Predict the exact score of a match',
    color: 'bg-green-500',
  },
]

const STAKE_AMOUNTS = [50, 100, 250, 500, 1000]

export default function CreateDuelPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [selectedType, setSelectedType] = useState<string>('')
  const [stakeAmount, setStakeAmount] = useState<number>(100)
  const [challengeData, setChallengeData] = useState({
    matchId: '',
    question: '',
    options: ['', '', ''],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateDuel = async () => {
    if (!address || !isConnected) {
      setError('Please connect your wallet')
      return
    }

    if (!selectedType) {
      setError('Please select a duel type')
      return
    }

    if (stakeAmount < 50) {
      setError('Minimum stake is 50 FANFI')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/duels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: address, // Fixed: API expects 'wallet', not 'creatorWallet'
          duelType: selectedType,
          stakeAmount: stakeAmount,
          challengeData: challengeData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create duel')
      }

      // Redirect to duels page
      router.push('/duels')
    } catch (err: any) {
      console.error('Error creating duel:', err)
      setError(err.message || 'Failed to create duel. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#121212] mb-4">Connect Your Wallet</h2>
          <p className="text-[#6E6E6E] mb-6">You need to connect your wallet to create a duel</p>
          <Link href="/onboarding">
            <button className="bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold py-3 px-6 rounded-xl">
              Connect Wallet
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[#E4E4E4] px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/duels"
            className="inline-flex items-center gap-2 text-[#6E6E6E] hover:text-[#121212] transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm font-medium">Back to Duels</span>
          </Link>
          <h1 className="text-[#121212] text-2xl font-bold">Create a Duel</h1>
          <p className="text-[#6E6E6E] text-sm">Challenge other fans to compete</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <p className="text-blue-900 text-sm font-medium">How it works</p>
              <p className="text-blue-700 text-sm mt-1">
                Create a duel, stake your tokens, and wait for an opponent. Winner takes all!
              </p>
            </div>
          </div>

          {/* Select Duel Type */}
          <section>
            <h2 className="text-[#121212] text-lg font-bold mb-4">Select Duel Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DUEL_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`border-2 rounded-xl p-6 text-left transition-all ${
                      selectedType === type.id
                        ? 'border-[#CE1141] bg-red-50'
                        : 'border-[#E4E4E4] bg-white hover:border-[#CE1141]/50'
                    }`}
                  >
                    <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                      <Icon className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <h3 className="text-[#121212] font-bold mb-1">{type.name}</h3>
                    <p className="text-[#6E6E6E] text-sm">{type.description}</p>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Select Stake Amount */}
          <section>
            <h2 className="text-[#121212] text-lg font-bold mb-4">Stake Amount</h2>
            <div className="grid grid-cols-5 gap-3">
              {STAKE_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setStakeAmount(amount)}
                  className={`border-2 rounded-lg py-4 font-bold transition-all ${
                    stakeAmount === amount
                      ? 'border-[#CE1141] bg-red-50 text-[#CE1141]'
                      : 'border-[#E4E4E4] bg-white text-[#121212] hover:border-[#CE1141]/50'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
            <p className="text-[#6E6E6E] text-sm mt-3">
              Winner receives: <span className="font-bold text-[#121212]">{stakeAmount * 2} FANFI</span>
            </p>
          </section>

          {/* Challenge Details (Optional for now) */}
          {selectedType && (
            <section className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-6">
              <h2 className="text-[#121212] text-lg font-bold mb-3">Challenge Details</h2>
              <p className="text-[#6E6E6E] text-sm mb-4">
                Your duel will be created and visible to all fans. First to accept will become your opponent!
              </p>
              <div className="bg-white rounded-lg p-4 border border-[#E4E4E4]">
                <p className="text-[#121212] font-semibold mb-2">Duel Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6E6E6E]">Type:</span>
                    <span className="text-[#121212] font-medium capitalize">{selectedType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6E6E]">Stake:</span>
                    <span className="text-[#121212] font-medium">{stakeAmount} FANFI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6E6E6E]">Prize:</span>
                    <span className="text-green-600 font-bold">{stakeAmount * 2} FANFI</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={handleCreateDuel}
            disabled={!selectedType || loading}
            className={`w-full text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
              !selectedType || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#CE1141] hover:bg-[#B01038] shadow-md'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Duel...
              </>
            ) : (
              'Create Duel'
            )}
          </button>
        </div>
      </main>
    </div>
  )
}

