"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract } from "wagmi"
import {
  ChevronLeft,
  Shield,
  Trophy,
  Activity,
  Coins,
  Sparkles,
  Star,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { getCountryFlag } from "@/lib/api/self-data-parser"
import { checkIfLastUser } from "@/lib/api/simple-self-reader"
import { calculateReputationFromTransactions, getReputationTier } from "@/lib/api/chiliz-reputation"
import { formatEther } from "viem"

// Contract addresses
const FANFI_TOKEN_ADDRESS = "0xCee0c15B42EEb44491F588104bbC46812115dBB0" as `0x${string}`
const SUPERFAN_TOKEN_ADDRESS = "0xB6B9918C5880f7a1A4C65c4C4B6297956B4c39AD" as `0x${string}`

const ERC20_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export default function ProfilePage() {
  const { address } = useAccount()
  const [userData, setUserData] = useState<any>(null)
  const [contractName, setContractName] = useState<string | null>(null)
  const [reputation, setReputation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Read on-chain FANFI balance
  const { data: fanfiBalance } = useReadContract({
    address: FANFI_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Read on-chain SuperFan balance
  const { data: superfanBalance } = useReadContract({
    address: SUPERFAN_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const fanfiAmount = fanfiBalance ? Number(formatEther(fanfiBalance)) : 0
  const superfanAmount = superfanBalance ? Number(formatEther(superfanBalance)) : 0

  useEffect(() => {
    if (address) {
      loadUserData()
      loadContractName()
      loadReputation()
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

  const tier = reputation ? getReputationTier(reputation.reputationScore) : null

  return (
    <div className="min-h-screen bg-white text-[#121212]">
      {/* Header Banner */}
      <header className="bg-white px-4 py-6 border-b border-[#E4E4E4]">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#6E6E6E] hover:text-[#121212] transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-[#121212]">Profile & Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <section className="bg-gradient-to-br from-[#CE1141] to-[#B01038] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <span className="text-3xl">{getCountryFlag(userData?.nationality || 'unknown')}</span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">
                  {contractName || userData?.verified_name || 'User'}
                </h2>
                <p className="text-white/80 capitalize">{userData?.nationality || 'Unknown'} Fan</p>
              </div>
              {userData?.self_verified && (
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4" strokeWidth={2} />
                    <span className="text-sm font-semibold">Verified</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Wallet className="w-4 h-4" strokeWidth={2} />
              <span className="font-mono">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</span>
            </div>
          </section>

          {/* Token Balances - Hero Section */}
          <section className="bg-gradient-to-br from-[#CE1141] via-[#B01038] to-[#8B0D2E] rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Coins className="w-6 h-6" strokeWidth={2.5} />
              <h3 className="font-bold text-xl">Token Portfolio</h3>
              <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">On-Chain</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* FANFI Balance */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">FANFI Token</p>
                    <p className="text-xs text-white/60">Engagement Rewards</p>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">{fanfiAmount.toFixed(2)}</p>
                <div className="flex items-center gap-1 text-white/70 text-xs">
                  <TrendingUp className="w-3 h-3" strokeWidth={2} />
                  <span>Primary Token</span>
                </div>
              </div>

              {/* SuperFan Balance */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 hover:bg-white/15 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">SuperFan Token</p>
                    <p className="text-xs text-white/60">Staking Rewards</p>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">{superfanAmount.toFixed(2)}</p>
                <div className="flex items-center gap-1 text-white/70 text-xs">
                  <Star className="w-3 h-3" strokeWidth={2} />
                  <span>Yield Token</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Total Portfolio Value</p>
                  <p className="text-2xl font-bold">{(fanfiAmount + superfanAmount).toFixed(2)} Tokens</p>
                </div>
                <Link href="/defi">
                  <button className="bg-white hover:bg-white/90 text-[#CE1141] font-bold py-3 px-6 rounded-xl transition-colors shadow-lg">
                    Stake Now →
                  </button>
                </Link>
              </div>
            </div>
          </section>

          {/* Reputation - Enhanced Display */}
          {!loading && reputation && tier ? (
            <section className="bg-gradient-to-br from-[#F7D020] via-[#FFA500] to-[#FF6B00] rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-6 h-6" strokeWidth={2.5} />
                  <h3 className="font-bold text-xl">Chiliz Reputation</h3>
                </div>
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">Spicy Testnet</span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Score */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <p className="text-white/80 text-sm mb-2 font-medium">Reputation Score</p>
                  <p className="text-6xl font-black mb-2">{reputation.reputationScore}</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                      {tier.tier}
                    </span>
                    <span className="text-sm text-white/80">
                      {tier.tier === 'Legend' ? '🏆' : tier.tier === 'Champion' ? '🥇' : tier.tier === 'Pro' ? '⭐' : tier.tier === 'Fan' ? '🌟' : '✨'}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <p className="text-white/70 text-xs mb-1">Transactions</p>
                    <p className="text-2xl font-bold">{reputation.totalTransactions}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <p className="text-white/70 text-xs mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-green-300">
                      {reputation.totalTransactions > 0 
                        ? Math.round((reputation.successfulTransactions / reputation.totalTransactions) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <p className="text-white/70 text-xs mb-1">Account Age</p>
                    <p className="text-2xl font-bold">{reputation.accountAge}d</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <p className="text-white/70 text-xs mb-1">Multiplier</p>
                    <p className="text-2xl font-bold text-yellow-300">
                      {tier.tier === 'Legend' ? '3.0x' : tier.tier === 'Champion' ? '2.0x' : tier.tier === 'Pro' ? '1.5x' : tier.tier === 'Fan' ? '1.2x' : '1.0x'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Total Value Transferred</p>
                    <p className="text-xl font-bold">{formatEther(reputation.totalValueTransferred).slice(0, 8)} CHZ</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-sm mb-1">Next Tier</p>
                    <p className="text-lg font-bold">
                      {tier.tier === 'Rookie' ? 'Fan (50+)' : tier.tier === 'Fan' ? 'Pro (150+)' : tier.tier === 'Pro' ? 'Champion (300+)' : tier.tier === 'Champion' ? 'Legend (500+)' : 'Max Level! 🎉'}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-gradient-to-br from-[#F8F8F8] to-[#F0F0F0] border-2 border-dashed border-[#E4E4E4] rounded-2xl p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-[#E4E4E4] border-t-[#CE1141] rounded-full animate-spin mb-4"></div>
                <p className="text-[#6E6E6E] font-medium">Loading reputation data...</p>
              </div>
            </section>
          )}

          {/* Identity Verification - Compact */}
          {userData?.self_verified && (
            <section className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <Shield className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Identity Verified ✓</h3>
                    <p className="text-white/80 text-sm flex items-center gap-2">
                      <span className="text-xl">{getCountryFlag(userData?.nationality || 'unknown')}</span>
                      <span className="capitalize">{userData?.nationality || 'Unknown'}</span>
                      {userData?.verified_age && <span className="text-white/60">• {userData.verified_age}+</span>}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Favorite Team Section */}
          {userData?.preferred_team && (
            <section className="bg-gradient-to-br from-[#0033A0] via-[#002D8F] to-[#F7D020] rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <span className="text-3xl">
                      {userData.preferred_team === 'argentina' && '🇦🇷'}
                      {userData.preferred_team === 'france' && '🇫🇷'}
                      {userData.preferred_team === 'germany' && '🇩🇪'}
                      {userData.preferred_team === 'italy' && '🇮🇹'}
                    </span>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Favorite Team</p>
                    <p className="text-white font-bold text-lg capitalize">{userData.preferred_team}</p>
                  </div>
                </div>
                <Link href="/choose-team">
                  <button className="bg-white hover:bg-white/90 text-[#0033A0] font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm text-sm">
                    Change
                  </button>
                </Link>
              </div>
            </section>
          )}

          {/* Quick Actions */}
          <section className="grid grid-cols-2 gap-4">
            <Link href="/leaderboard" className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-6 hover:shadow-md transition-shadow text-center">
              <Trophy className="w-8 h-8 text-[#CE1141] mx-auto mb-2" strokeWidth={2} />
              <p className="font-semibold text-[#121212]">Leaderboard</p>
              <p className="text-[#6E6E6E] text-xs mt-1">See rankings</p>
            </Link>
            <Link href="/engage" className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-6 hover:shadow-md transition-shadow text-center">
              <Coins className="w-8 h-8 text-[#CE1141] mx-auto mb-2" strokeWidth={2} />
              <p className="font-semibold text-[#121212]">Earn More</p>
              <p className="text-[#6E6E6E] text-xs mt-1">Complete quests</p>
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}
