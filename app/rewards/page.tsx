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
  Gift,
  Award,
  ShoppingBag,
  Loader2,
  CheckCircle,
  Star,
  Crown,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

export default function RewardsPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [userData, setUserData] = useState<any>(null)
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (!isConnected) {
      router.push('/onboarding')
      return
    }
    loadUserData()
  }, [isConnected, address])

  const loadUserData = async () => {
    if (!address) return
    
    setLoading(true)
    try {
      // Get user data
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address)
        .single()

      setUserData(user)

      // Get user rank
      const { data: allUsers } = await supabase
        .from('users')
        .select('wallet_address, total_tokens')
        .order('total_tokens', { ascending: false })

      const rank = (allUsers || []).findIndex(u => u.wallet_address === address) + 1
      setLeaderboardRank(rank)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEligibleRewards = () => {
    if (!leaderboardRank) return []

    const rewards = []

    if (leaderboardRank === 1) {
      rewards.push({
        id: 'champion_nft',
        title: 'Champion NFT Badge',
        description: 'Exclusive golden NFT for #1 fan',
        type: 'nft',
        icon: Crown,
        color: 'from-yellow-400 to-yellow-600',
      })
      rewards.push({
        id: 'free_merch',
        title: 'Free Team Merch',
        description: 'Choose any item from our store',
        type: 'merch',
        discount: 100,
        icon: Gift,
        color: 'from-purple-500 to-pink-500',
      })
    } else if (leaderboardRank <= 3) {
      rewards.push({
        id: 'elite_nft',
        title: 'Elite NFT Badge',
        description: 'Silver NFT for top 3 fans',
        type: 'nft',
        icon: Trophy,
        color: 'from-gray-300 to-gray-500',
      })
      rewards.push({
        id: 'merch_discount_50',
        title: '50% Off Merch',
        description: 'Half price on any merch item',
        type: 'merch',
        discount: 50,
        icon: ShoppingBag,
        color: 'from-blue-500 to-purple-500',
      })
    } else if (leaderboardRank <= 10) {
      rewards.push({
        id: 'topfan_nft',
        title: 'Top Fan NFT',
        description: 'Bronze NFT for top 10 fans',
        type: 'nft',
        icon: Award,
        color: 'from-orange-400 to-orange-600',
      })
      rewards.push({
        id: 'merch_discount_25',
        title: '25% Off Merch',
        description: 'Quarter off any merch item',
        type: 'merch',
        discount: 25,
        icon: ShoppingBag,
        color: 'from-green-500 to-teal-500',
      })
    }

    return rewards
  }

  const handleClaimNFT = async (rewardId: string) => {
    if (!address) return

    setClaiming(true)
    try {
      // TODO: Call smart contract to mint NFT
      // const contract = new ethers.Contract(NFT_ADDRESS, ABI, signer)
      // await contract.mint(address, rewardId)

      // For now, just record in database
      await supabase.from('nft_claims').insert({
        user_wallet: address,
        nft_type: rewardId,
        claimed_at: new Date().toISOString(),
      })

      alert('NFT claimed! Check your wallet soon.')
    } catch (error) {
      console.error('Error claiming NFT:', error)
      alert('Failed to claim NFT')
    } finally {
      setClaiming(false)
    }
  }

  const handleMerchRedeem = (discount: number) => {
    // Redirect to merch store with discount code
    const code = `FANFI${discount}`
    alert(`Use code: ${code} at checkout for ${discount}% off!`)
  }

  const eligibleRewards = getEligibleRewards()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[#E4E4E4] px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[#121212] text-2xl font-bold flex items-center gap-2">
            <Gift className="w-7 h-7 text-[#CE1141]" strokeWidth={2} />
            Rewards
          </h1>
          <p className="text-[#6E6E6E] text-sm">Claim your NFTs and merch rewards</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-[#CE1141] mx-auto mb-4" />
              <p className="text-[#6E6E6E]">Loading rewards...</p>
            </div>
          ) : (
            <>
              {/* Your Rank Card */}
              <div className="bg-gradient-to-br from-[#CE1141] to-[#B01038] rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-lg font-bold mb-2">Your Leaderboard Rank</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-bold">#{leaderboardRank || 'N/A'}</p>
                    <p className="text-white/80 text-sm mt-1">{userData?.total_tokens || 0} FANFI Earned</p>
                  </div>
                  <Trophy className="w-16 h-16 text-white/30" strokeWidth={1.5} />
                </div>
              </div>

              {/* Eligible Rewards */}
              {eligibleRewards.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-[#121212] text-xl font-bold">Your Rewards</h2>
                  {eligibleRewards.map((reward) => {
                    const Icon = reward.icon
                    return (
                      <div
                        key={reward.id}
                        className={`bg-gradient-to-r ${reward.color} rounded-2xl p-6 text-white shadow-lg`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                              <Icon className="w-6 h-6" strokeWidth={2} />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{reward.title}</h3>
                              <p className="text-white/80 text-sm">{reward.description}</p>
                            </div>
                          </div>
                          <CheckCircle className="w-6 h-6" strokeWidth={2} />
                        </div>
                        {reward.type === 'nft' ? (
                          <button
                            onClick={() => handleClaimNFT(reward.id)}
                            disabled={claiming}
                            className="w-full bg-white hover:bg-white/90 text-[#121212] font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                          >
                            {claiming ? 'Claiming...' : 'Claim NFT'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMerchRedeem(reward.discount!)}
                            className="w-full bg-white hover:bg-white/90 text-[#121212] font-bold py-3 rounded-xl transition-colors"
                          >
                            Get {reward.discount}% Discount Code
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-12 text-center">
                  <Star className="w-16 h-16 text-[#6E6E6E] mx-auto mb-4" strokeWidth={1.5} />
                  <h3 className="text-[#121212] text-lg font-bold mb-2">No Rewards Yet</h3>
                  <p className="text-[#6E6E6E] mb-6">
                    Climb to the top 10 on the leaderboard to unlock rewards!
                  </p>
                  <Link href="/engage">
                    <button className="bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold py-3 px-6 rounded-xl">
                      Start Earning
                    </button>
                  </Link>
                </div>
              )}

              {/* How It Works */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-blue-900 font-bold mb-4">How Rewards Work</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">1</span>
                    <p><strong>Earn FANFI tokens</strong> by completing quests, making predictions, and winning duels</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">2</span>
                    <p><strong>Climb the leaderboard</strong> - your total tokens determine your rank</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">3</span>
                    <p><strong>Unlock rewards</strong> - top 10 fans get exclusive NFTs and merch discounts</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">4</span>
                    <p><strong>Claim anytime</strong> - rewards are always available for top performers</p>
                  </div>
                </div>
              </div>
            </>
          )}
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
          <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors">
            <Trophy className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Leaderboard</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-[#CE1141]">
            <Gift className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Rewards</span>
          </div>
        </div>
      </nav>
    </div>
  )
}

