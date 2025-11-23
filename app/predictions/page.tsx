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

interface Match {
  id: string
  home_team: string
  away_team: string
  match_date: string
  league: string
  status: 'upcoming' | 'live' | 'finished'
  home_score?: number
  away_score?: number
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
  
  const [matches, setMatches] = useState<Match[]>([])
  const [myPredictions, setMyPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'available' | 'my-predictions'>('available')

  useEffect(() => {
    if (!isConnected || !address) {
      router.push('/onboarding')
      return
    }
    
    loadMatches()
    loadMyPredictions()
  }, [address, isConnected])

  const loadMatches = async () => {
    setLoading(true)
    try {
      // Fetch real upcoming matches from database
      const { data, error: fetchError } = await supabase
        .from('match_predictions')
        .select('match_id, match_home_team, match_away_team, match_date')
        .gte('match_date', new Date().toISOString())
        .order('match_date', { ascending: true })
        .limit(10)
      
      if (fetchError) {
        // If no matches in DB, fetch from API
        const response = await fetch(`/api/matches?country=global&limit=5`)
        const apiData = await response.json()
        
        if (apiData.matches && apiData.matches.length > 0) {
          const formattedMatches = apiData.matches.map((m: any) => ({
            id: m.id || m.idEvent,
            home_team: m.homeTeam || m.strHomeTeam,
            away_team: m.awayTeam || m.strAwayTeam,
            match_date: m.date || m.dateEvent,
            league: m.league || m.strLeague || 'Football',
            status: 'upcoming' as const,
          }))
          setMatches(formattedMatches)
        }
      } else if (data && data.length > 0) {
        // Use existing matches from predictions table
        const uniqueMatches = Array.from(
          new Map(data.map(item => [
            item.match_id,
            {
              id: item.match_id,
              home_team: item.match_home_team,
              away_team: item.match_away_team,
              match_date: item.match_date,
              league: 'Football',
              status: 'upcoming' as const,
            }
          ])).values()
        )
        setMatches(uniqueMatches as Match[])
      }
    } catch (err) {
      console.error('Error loading matches:', err)
      setError('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const loadMyPredictions = async () => {
    if (!address) return
    
    try {
      const { data, error: fetchError } = await supabase
        .from('match_predictions')
        .select('*')
        .eq('user_wallet', address)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (!fetchError && data) {
        setMyPredictions(data)
      }
    } catch (err) {
      console.error('Error loading predictions:', err)
    }
  }

  const handlePrediction = async (matchId: string, winner: string, confidence: number, stakeAmount: number) => {
    if (!address) return
    
    setSubmitting(matchId)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: address,
          matchId,
          predictedWinner: winner,
          confidence,
          stakeAmount,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit prediction')
      }
      
      setSuccess('Prediction submitted successfully!')
      loadMyPredictions()
      
      // Auto-dismiss success message
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Prediction error:', err)
      setError(err.message || 'Failed to submit prediction')
    } finally {
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
                              <h3 className="font-bold text-[#141414]">Match #{prediction.match_id}</h3>
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
                            <p className="text-xs text-[#6E6E6E] mb-1">Predicted Winner</p>
                            <p className="font-bold text-[#141414]">{prediction.predicted_winner}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6E6E6E] mb-1">Confidence</p>
                            <p className="font-bold text-[#141414]">{prediction.confidence}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6E6E6E] mb-1">Stake</p>
                            <p className="font-bold text-[#141414]">{prediction.stake_amount} FANFI</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6E6E6E] mb-1">Potential Reward</p>
                            <p className="font-bold text-green-600">
                              {(prediction.stake_amount * (prediction.confidence / 50)).toFixed(0)} FANFI
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
}: {
  match: Match
  onPredict: (matchId: string, winner: string, confidence: number, stakeAmount: number) => void
  isSubmitting: boolean
  disabled: boolean
}) {
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(70)
  const [stakeAmount, setStakeAmount] = useState(50)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = () => {
    if (!selectedWinner) return
    onPredict(match.id, selectedWinner, confidence, stakeAmount)
    setShowForm(false)
    setSelectedWinner(null)
  }

  const potentialReward = stakeAmount * (confidence / 50)

  return (
    <div className="bg-white border-2 border-[#E4E4E4] rounded-3xl p-6 hover:border-[#D500F9] transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D500F9] to-[#7C4DFF] rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[#141414]">{match.home_team} vs {match.away_team}</h3>
            <p className="text-sm text-[#6E6E6E] flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(match.match_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="bg-[#F8F8F8] rounded-full px-3 py-1">
          <span className="text-xs font-semibold text-[#6E6E6E]">{match.league}</span>
        </div>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-[#D500F9] to-[#7C4DFF] text-white font-bold py-3 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Target className="w-5 h-5 inline mr-2" />
          Make Prediction
        </button>
      ) : (
        <div className="space-y-4 mt-4 pt-4 border-t-2 border-[#E4E4E4]">
          <div>
            <label className="block text-sm font-medium text-[#6E6E6E] mb-2">Pick Winner</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedWinner(match.home_team)}
                className={`p-4 rounded-2xl font-semibold transition-all ${
                  selectedWinner === match.home_team
                    ? 'bg-gradient-to-br from-[#D500F9] to-[#7C4DFF] text-white'
                    : 'bg-[#F8F8F8] text-[#141414] hover:bg-[#E4E4E4]'
                }`}
              >
                {match.home_team}
              </button>
              <button
                onClick={() => setSelectedWinner(match.away_team)}
                className={`p-4 rounded-2xl font-semibold transition-all ${
                  selectedWinner === match.away_team
                    ? 'bg-gradient-to-br from-[#D500F9] to-[#7C4DFF] text-white'
                    : 'bg-[#F8F8F8] text-[#141414] hover:bg-[#E4E4E4]'
                }`}
              >
                {match.away_team}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6E6E6E] mb-2">
              Confidence: {confidence}%
            </label>
            <input
              type="range"
              min="50"
              max="99"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6E6E6E] mb-2">
              Stake Amount (FANFI)
            </label>
            <input
              type="number"
              min="50"
              max="1000"
              step="50"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-[#E4E4E4] rounded-2xl font-bold text-[#141414] focus:outline-none focus:border-[#D500F9]"
            />
          </div>

          <div className="bg-[#F8F8F8] rounded-2xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6E6E6E]">Potential Reward:</span>
              <span className="font-bold text-green-600">+{potentialReward.toFixed(0)} FANFI</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-[#F8F8F8] text-[#141414] font-bold py-3 rounded-2xl hover:bg-[#E4E4E4] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedWinner || isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#D500F9] to-[#7C4DFF] text-white font-bold py-3 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Submit Prediction
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

