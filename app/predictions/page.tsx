"use client"

import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { useRouter } from "next/navigation"
import { parseEther, keccak256, toBytes, formatEther } from "viem"
import {
  Home,
  Zap,
  Trophy,
  User,
  Swords,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Flame,
  Award,
  ArrowRight,
  Calendar,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { fetchUpcomingMatches, UpcomingMatch } from "@/lib/api/fetch-matches"
import { PREDICTION_MARKET_ABI } from "@/lib/contracts/prediction-market-abi"
import { erc20Abi } from "viem"

const PREDICTION_MARKET_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`
const FANFI_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_FANFI_TOKEN as `0x${string}`

interface Match {
  id: string
  home_team: string
  away_team: string
  match_date: string
  league: string
  status: 'upcoming' | 'live' | 'finished'
}

interface Prediction {
  id: string
  match_id: string
  user_wallet: string
  predicted_winner: string
  confidence: number
  stake_amount: number
  created_at: string
  match?: Match
}

export default function PredictionsPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  
  const [matches, setMatches] = useState<UpcomingMatch[]>([])
  const [myPredictions, setMyPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'available' | 'my-predictions'>('available')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!isConnected || !address) {
      router.push('/onboarding')
      return
    }
    
    loadMatches()
    loadMyPredictions()
  }, [address, isConnected, refreshKey])

  const loadMatches = async () => {
    setLoading(true)
    try {
      // Fetch the same real matches as the dashboard
      const upcomingMatches = await fetchUpcomingMatches()
      setMatches(upcomingMatches)
    } catch (err) {
      console.error('Error loading matches:', err)
      setError('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const loadMyPredictions = async () => {
    if (!address || !PREDICTION_MARKET_ADDRESS) return
    
    try {
      // For now, we'll load predictions by checking each match
      // In production, you'd want to index this with The Graph or similar
      const predictions: Prediction[] = []
      
      // Get all matches from the smart contract
      const response = await fetch('/api/predictions/my-predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address })
      })
      
      if (response.ok) {
        const data = await response.json()
        setMyPredictions(data.predictions || [])
      }
    } catch (err) {
      console.error('Error loading predictions:', err)
    }
  }

  const handlePrediction = async (
    matchId: string, 
    winner: string, 
    confidence: number, 
    stakeAmount: number,
    homeTeam: string,
    awayTeam: string,
    matchDate: string,
    competition: string
  ) => {
    if (!address) {
      setError('Please connect your wallet first')
      return
    }
    
    setSubmitting(matchId)
    setError(null)
    setSuccess(null)
    
    try {
      // This will be handled by the MatchPredictionCard component
      // which has access to writeContract hooks
      setSuccess('Preparing transaction...')
    } catch (err: any) {
      console.error('Prediction error:', err)
      setError(err.message || 'Failed to submit prediction')
      setSubmitting(null)
    }
  }

  const getPredictionStatus = (prediction: Prediction): { label: string, color: string } => {
    // In a real app, you'd check match results
    return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' }
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'from-green-500 to-green-600'
    if (confidence >= 60) return 'from-blue-500 to-blue-600'
    if (confidence >= 40) return 'from-yellow-500 to-yellow-600'
    return 'from-red-500 to-red-600'
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E4E4E4]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <button className="p-2 hover:bg-[#F8F8F8] rounded-xl transition-colors">
                  <Home className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
                </button>
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-[#D500F9] to-[#7C4DFF] rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#141414]">Match Predictions</h1>
                <p className="text-xs text-[#6E6E6E]">Predict & Earn Rewards</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Messages */}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#D500F9] to-[#7C4DFF] rounded-3xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-6 h-6" strokeWidth={2} />
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-xs font-medium">Total</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{myPredictions.length}</p>
            <p className="text-sm opacity-90">Predictions Made</p>
          </div>

          <div className="bg-white border-2 border-[#E4E4E4] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" strokeWidth={2} />
              <div className="bg-green-100 rounded-full px-3 py-1">
                <span className="text-xs font-semibold text-green-700">Win Rate</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[#141414] mb-1">--</p>
            <p className="text-sm text-[#6E6E6E]">Coming Soon</p>
          </div>

          <div className="bg-white border-2 border-[#E4E4E4] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-6 h-6 text-[#FFB300]" strokeWidth={2} />
              <div className="bg-orange-100 rounded-full px-3 py-1">
                <span className="text-xs font-semibold text-orange-700">Rewards</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[#141414] mb-1">--</p>
            <p className="text-sm text-[#6E6E6E]">Tokens Earned</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedTab('available')}
            className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
              selectedTab === 'available'
                ? 'bg-gradient-to-r from-[#D500F9] to-[#7C4DFF] text-white'
                : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#E4E4E4]'
            }`}
          >
            <Target className="w-5 h-5 inline mr-2" />
            Available Matches
          </button>
          <button
            onClick={() => setSelectedTab('my-predictions')}
            className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
              selectedTab === 'my-predictions'
                ? 'bg-gradient-to-r from-[#D500F9] to-[#7C4DFF] text-white'
                : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#E4E4E4]'
            }`}
          >
            <Eye className="w-5 h-5 inline mr-2" />
            My Predictions ({myPredictions.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#D500F9] animate-spin" />
          </div>
        ) : (
          <>
            {selectedTab === 'available' ? (
              <div className="space-y-4">
                {matches.length === 0 ? (
                  <div className="text-center py-20">
                    <Target className="w-16 h-16 text-[#E4E4E4] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#141414] mb-2">No Matches Available</h3>
                    <p className="text-[#6E6E6E]">Check back soon for upcoming matches</p>
                  </div>
                ) : (
                  matches.map((match) => (
                    <MatchPredictionCard
                      key={match.id}
                      match={match}
                      onPredict={handlePrediction}
                      isSubmitting={submitting === match.id}
                      disabled={submitting !== null}
                      onSuccess={() => {
                        setSuccess('Prediction placed successfully! 🎯')
                        setRefreshKey(prev => prev + 1)
                        setTimeout(() => {
                          setSuccess(null)
                          setSelectedTab('my-predictions')
                        }, 2000)
                      }}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {myPredictions.length === 0 ? (
                  <div className="text-center py-20">
                    <Eye className="w-16 h-16 text-[#E4E4E4] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#141414] mb-2">No Predictions Yet</h3>
                    <p className="text-[#6E6E6E]">Start predicting matches to earn rewards!</p>
                    <button
                      onClick={() => setSelectedTab('available')}
                      className="mt-6 px-6 py-3 bg-gradient-to-r from-[#D500F9] to-[#7C4DFF] text-white font-semibold rounded-2xl hover:shadow-lg transition-all"
                    >
                      View Available Matches
                    </button>
                  </div>
                ) : (
                  myPredictions.map((prediction) => {
                    const status = getPredictionStatus(prediction)
                    const displayWinner = prediction.predicted_winner === 'home' 
                      ? prediction.match?.home_team 
                      : prediction.predicted_winner === 'away' 
                        ? prediction.match?.away_team 
                        : prediction.predicted_winner
                    
                    return (
                      <div
                        key={prediction.id}
                        className="bg-white border-2 border-[#E4E4E4] rounded-3xl p-6 hover:border-[#D500F9] transition-all"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#D500F9] to-[#7C4DFF] rounded-xl flex items-center justify-center">
                              <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-[#141414]">
                                {prediction.match?.home_team} vs {prediction.match?.away_team}
                              </h3>
                              <p className="text-sm text-[#6E6E6E]">
                                {new Date(prediction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
                            {status.label}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-[#6E6E6E] mb-1">Your Prediction</p>
                            <p className="font-bold text-[#D500F9]">{displayWinner}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6E6E6E] mb-1">Bet Amount</p>
                            <p className="font-bold text-[#141414]">{prediction.stake_amount} FANFI</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6E6E6E] mb-1">Potential Win</p>
                            <p className="font-bold text-green-600">
                              {(prediction.stake_amount * 1.8).toFixed(0)} FANFI
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6E6E6E] mb-1">Profit</p>
                            <p className="font-bold text-green-600">
                              +{(prediction.stake_amount * 0.8).toFixed(0)} FANFI
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#E4E4E4] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-around py-4">
            <Link href="/dashboard">
              <button className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#FF1744] transition-colors">
                <Home className="w-6 h-6" strokeWidth={2} />
                <span className="text-xs font-medium">Home</span>
              </button>
            </Link>
            <Link href="/engage">
              <button className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#FF1744] transition-colors">
                <Zap className="w-6 h-6" strokeWidth={2} />
                <span className="text-xs font-medium">Engage</span>
              </button>
            </Link>
            <Link href="/defi">
              <button className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#FF1744] transition-colors">
                <TrendingUp className="w-6 h-6" strokeWidth={2} />
                <span className="text-xs font-medium">DeFi</span>
              </button>
            </Link>
            <Link href="/duels">
              <button className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#FF1744] transition-colors">
                <Swords className="w-6 h-6" strokeWidth={2} />
                <span className="text-xs font-medium">Duels</span>
              </button>
            </Link>
            <Link href="/profile">
              <button className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#FF1744] transition-colors">
                <User className="w-6 h-6" strokeWidth={2} />
                <span className="text-xs font-medium">Profile</span>
              </button>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}

// Match Prediction Card Component
function MatchPredictionCard({
  match,
  onPredict,
  isSubmitting,
  disabled,
  onSuccess,
}: {
  match: UpcomingMatch
  onPredict: (
    matchId: string, 
    winner: string, 
    confidence: number, 
    stakeAmount: number,
    homeTeam: string,
    awayTeam: string,
    matchDate: string,
    competition: string
  ) => void
  isSubmitting: boolean
  disabled: boolean
  onSuccess?: () => void
}) {
  const { address } = useAccount()
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null)
  const [stakeAmount, setStakeAmount] = useState(10)
  const [isApproving, setIsApproving] = useState(false)
  const [isPredicting, setIsPredicting] = useState(false)
  const [txStatus, setTxStatus] = useState<string>('')
  const [matchIdHash, setMatchIdHash] = useState<`0x${string}` | null>(null)

  const { writeContract: approveTokens, data: approveHash } = useWriteContract()
  const { writeContract: placePrediction, data: predictHash } = useWriteContract()

  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  const { isLoading: isPredictConfirming } = useWaitForTransactionReceipt({
    hash: predictHash,
  })

  const handleSubmit = async () => {
    if (!selectedWinner || !address) return
    
    try {
      // Step 0: Ensure match exists on-chain
      setTxStatus('Creating match on-chain...')
      
      const now = Math.floor(Date.now() / 1000)
      const lockTime = now + 3600 // Lock in 1 hour
      const matchTime = now + 7200 // Match in 2 hours

      const createMatchRes = await fetch('/api/predictions/create-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          lockTime,
          matchTime
        })
      })

      if (!createMatchRes.ok) {
        throw new Error('Failed to create match on-chain')
      }

      const createMatchData = await createMatchRes.json()
      setMatchIdHash(createMatchData.matchIdHash || keccak256(toBytes(match.id + matchTime.toString())))

      setIsApproving(true)
      setTxStatus('Approving FANFI tokens...')

      // Step 1: Approve FANFI tokens
      await approveTokens({
        address: FANFI_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [PREDICTION_MARKET_ADDRESS, parseEther(stakeAmount.toString())]
      })

      // Wait for approval confirmation
      setTxStatus('Waiting for approval...')
      // The useWaitForTransactionReceipt hook will handle this
      
    } catch (err: any) {
      console.error('Approval error:', err)
      setTxStatus('')
      setIsApproving(false)
      alert('Failed to approve tokens: ' + err.message)
    }
  }

  // After approval is confirmed, place prediction
  useEffect(() => {
    if (approveHash && !isApproveConfirming && isApproving) {
      placePredictionOnChain()
    }
  }, [approveHash, isApproveConfirming])

  const placePredictionOnChain = async () => {
    if (!selectedWinner || !address || !matchIdHash) return

    try {
      setIsApproving(false)
      setIsPredicting(true)
      setTxStatus('Placing prediction on-chain...')

      // Determine outcome: 1=Home, 2=Away, 3=Draw
      let outcome = 1
      if (selectedWinner === match.awayTeam) {
        outcome = 2
      } else if (selectedWinner.toLowerCase() === 'draw') {
        outcome = 3
      }

      await placePrediction({
        address: PREDICTION_MARKET_ADDRESS,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'predict',
        args: [matchIdHash, outcome, parseEther(stakeAmount.toString())]
      })

      setTxStatus('Waiting for confirmation...')
      
    } catch (err: any) {
      console.error('Prediction error:', err)
      setTxStatus('')
      setIsPredicting(false)
      alert('Failed to place prediction: ' + err.message)
    }
  }

  // After prediction is confirmed
  useEffect(() => {
    if (predictHash && !isPredictConfirming && isPredicting) {
      setTxStatus('Success! Prediction placed on-chain 🎯')
      setIsPredicting(false)
      setSelectedWinner(null)
      setTimeout(() => setTxStatus(''), 3000)
      
      // Trigger success callback to refresh predictions list
      if (onSuccess) {
        onSuccess()
      }
    }
  }, [predictHash, isPredictConfirming, onSuccess])

  const potentialReward = stakeAmount * 1.8 // Simple 1.8x multiplier
  const isProcessing = isApproving || isPredicting || isApproveConfirming || isPredictConfirming

  return (
    <div className="bg-white border-2 border-[#E4E4E4] rounded-3xl p-6 hover:border-[#D500F9] transition-all">
      {/* Transaction Status */}
      {txStatus && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[#D500F9]/10 to-[#7C4DFF]/10 border border-[#D500F9]/20">
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 text-[#D500F9] animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            )}
            <span className="text-sm font-medium text-[#141414]">{txStatus}</span>
          </div>
        </div>
      )}

      {/* Match Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-gradient-to-br from-[#D500F9] to-[#7C4DFF] rounded-lg px-3 py-1">
              <span className="text-xs font-bold text-white">{match.competition}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6E6E6E]">
            <Calendar className="w-4 h-4" />
            <span>{match.date} • {match.time}</span>
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => setSelectedWinner(match.homeTeam)}
          disabled={disabled}
          className={`w-full p-4 rounded-2xl font-semibold transition-all text-left ${
            selectedWinner === match.homeTeam
              ? 'bg-gradient-to-br from-[#D500F9] to-[#7C4DFF] text-white shadow-lg scale-105'
              : 'bg-[#F8F8F8] text-[#141414] hover:bg-[#E4E4E4] border-2 border-transparent hover:border-[#D500F9]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{match.homeFlag}</span>
              <span className="text-lg">{match.homeTeam}</span>
            </div>
            {selectedWinner === match.homeTeam && (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
        </button>

        <div className="flex items-center justify-center py-2">
          <span className="text-[#6E6E6E] font-bold text-sm">VS</span>
        </div>

        <button
          onClick={() => setSelectedWinner(match.awayTeam)}
          disabled={disabled}
          className={`w-full p-4 rounded-2xl font-semibold transition-all text-left ${
            selectedWinner === match.awayTeam
              ? 'bg-gradient-to-br from-[#D500F9] to-[#7C4DFF] text-white shadow-lg scale-105'
              : 'bg-[#F8F8F8] text-[#141414] hover:bg-[#E4E4E4] border-2 border-transparent hover:border-[#D500F9]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{match.awayFlag}</span>
              <span className="text-lg">{match.awayTeam}</span>
            </div>
            {selectedWinner === match.awayTeam && (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
        </button>
      </div>

      {/* Stake Amount */}
      {selectedWinner && (
        <div className="space-y-4 mt-6 pt-6 border-t-2 border-[#E4E4E4]">
          <div>
            <label className="block text-sm font-medium text-[#6E6E6E] mb-2">
              Bet Amount (FANFI)
            </label>
            <div className="flex gap-2 mb-3">
              {[10, 25, 50, 100].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setStakeAmount(amount)}
                  className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-all ${
                    stakeAmount === amount
                      ? 'bg-gradient-to-br from-[#D500F9] to-[#7C4DFF] text-white'
                      : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#E4E4E4]'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="10"
              max="500"
              step="10"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-[#E4E4E4] rounded-2xl font-bold text-[#141414] focus:outline-none focus:border-[#D500F9]"
              placeholder="Custom amount"
            />
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 mb-1">Potential Win</p>
                <p className="text-2xl font-bold text-green-600">
                  {potentialReward.toFixed(0)} FANFI
                </p>
              </div>
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 pt-2 border-t border-green-200">
              <p className="text-xs text-green-700">
                Profit: <span className="font-bold">+{(potentialReward - stakeAmount).toFixed(0)} FANFI</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isProcessing || disabled}
            className="w-full bg-gradient-to-r from-[#D500F9] to-[#7C4DFF] text-white font-bold py-4 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isApproving || isApproveConfirming ? 'Approving...' : 'Placing Bet...'}
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                Place Bet on {selectedWinner}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

