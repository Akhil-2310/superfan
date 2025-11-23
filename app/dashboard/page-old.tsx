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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { calculateReputationFromTransactions, getReputationTier } from "@/lib/api/chiliz-reputation"
import { formatEther } from "viem"
import { supabase } from "@/lib/supabase/client"
import { getCountryFlag } from "@/lib/api/self-data-parser"
import { checkIfLastUser } from "@/lib/api/simple-self-reader"

// No dummy data - will show real activity when implemented

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
      
      if (error) {
        console.error('Error loading user data:', error)
      } else {
        console.log('Loaded user data from DB:', data)
        setUserData(data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const loadContractName = async () => {
    if (!address) return
    
    try {
      console.log('🔍 Loading name from Self contract...')
      const result = await checkIfLastUser(address)
      
      if (result.isLastUser && result.name) {
        console.log('✅ You are the last verified user! Name:', result.name)
        setContractName(result.name)
        
        // Save to database
        await supabase
          .from('users')
          .update({ verified_name: result.name })
          .eq('wallet_address', address)
        
        // Reload user data to show updated name
        loadUserData()
      } else {
        console.log('ℹ️  Not the last verified user')
      }
    } catch (error) {
      console.error('Error loading contract name:', error)
    }
  }

  const loadReputation = async () => {
    if (!address) return
    
    try {
      console.log('Calculating reputation for:', address)
      // Use real Chiliz Spicy testnet transactions
      const rep = await calculateReputationFromTransactions(address, true) // true = testnet
      console.log('Reputation calculated:', rep)
      setReputation(rep)
    } catch (error) {
      console.error('Error loading reputation:', error)
    } finally {
      setLoading(false)
    }
  }

  const tier = reputation ? getReputationTier(reputation.reputationScore) : null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Notification Banner */}
      <Link href="/reward">
        <aside className="bg-[#FFF8F0] border border-[#E4E4E4] rounded-2xl mx-4 mt-4 p-4 flex items-center justify-between cursor-pointer hover:bg-[#FFF0E0] transition-colors shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F7D020] rounded-full flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-[#121212]" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[#121212] font-semibold text-sm md:text-base">Congratulations, you earned a reward!</p>
              <p className="text-[#6E6E6E] text-xs md:text-sm">Tap to view your NFT</p>
            </div>
          </div>
          <button className="text-[#CE1141] hover:text-[#A00F35] transition-colors" aria-label="View notifications">
            <Bell className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
          </button>
        </aside>
      </Link>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Self Verification Status */}
            {userData?.self_verified && (
              <section className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5" strokeWidth={2} />
                  <h2 className="text-sm font-medium">Identity Verified</h2>
                </div>
                <div className="space-y-3">
                  {/* Name from contract or database */}
                  {(contractName || userData?.verified_name) && (
                    <div>
                      <p className="text-white/70 text-xs mb-1">Name</p>
                      <p className="font-bold text-lg">{contractName || userData.verified_name}</p>
                      <p className="text-white/60 text-xs mt-1">
                        {contractName ? 'From Self.xyz Contract' : 'From Database'}
                      </p>
                    </div>
                  )}
                  
                  {/* Nationality */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {getCountryFlag(userData?.nationality || 'unknown')}
                    </span>
                    <div>
                      <p className="font-semibold capitalize">
                        {userData?.nationality || 'Unknown'}
                      </p>
                      <p className="text-white/80 text-xs">Verified by Self.xyz</p>
                    </div>
                  </div>
                  
                  {/* Minimum age */}
                  {userData?.verified_age && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/20">
                      <span className="text-white/70 text-xs">Age Verified</span>
                      <span className="font-semibold">{userData.verified_age}+</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Fan Tokens Card - Real Balance */}
            <section className="bg-gradient-to-br from-[#0033A0] via-[#002D8F] to-[#F7D020] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5" strokeWidth={2} />
                <h2 className="text-sm font-medium">Fan Tokens</h2>
              </div>
              <p className="text-5xl font-bold mb-3">{userData?.total_tokens || 0}</p>
              <div className="flex items-center gap-1 text-green-300 text-sm">
                <TrendingUp className="w-4 h-4" strokeWidth={2} />
                <span className="font-medium">
                  {userData?.total_tokens > 0 ? '+' : ''}FANFI Token
                </span>
              </div>

              {/* Token Image */}
              {userData?.nationality && userData.nationality !== 'unknown' && (
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-32 h-32 opacity-20">
                  <div className="text-8xl">
                    {getCountryFlag(userData.nationality)}
                  </div>
                </div>
              )}
            </section>


            {/* Chiliz Reputation Card */}
            <section className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-[#CE1141]" strokeWidth={2} />
                <h2 className="text-[#121212] font-semibold">Chiliz Reputation</h2>
                <span className="ml-auto text-xs text-[#6E6E6E]">Spicy Testnet</span>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="w-8 h-8 border-4 border-[#E4E4E4] border-t-[#CE1141] rounded-full animate-spin mx-auto"></div>
                  <p className="text-[#6E6E6E] text-xs mt-2">Analyzing transactions...</p>
                </div>
              ) : reputation && tier ? (
                <div className="space-y-4">
                  {/* Reputation Score */}
                  <div className="text-center py-4 bg-white rounded-xl border-2" style={{ borderColor: tier.color }}>
                    <p className="text-4xl font-bold text-[#121212] mb-1">
                      {reputation.reputationScore}
                    </p>
                    <p 
                      className="text-sm font-semibold"
                      style={{ color: tier.color }}
                    >
                      {tier.tier}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6E6E6E] text-sm">Total Transactions</span>
                      <span className="text-[#121212] font-semibold">{reputation.totalTransactions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6E6E6E] text-sm">Successful</span>
                      <span className="text-green-600 font-semibold">{reputation.successfulTransactions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6E6E6E] text-sm">Account Age</span>
                      <span className="text-[#121212] font-semibold">{reputation.accountAge} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6E6E6E] text-sm">Total Value</span>
                      <span className="text-[#121212] font-semibold text-xs">
                        {formatEther(reputation.totalValueTransferred).slice(0, 8)} CHZ
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#E4E4E4]">
                      <span className="text-[#6E6E6E] text-sm font-semibold">Staking Multiplier</span>
                      <span className="text-[#CE1141] font-bold text-lg">
                        {tier.tier === 'Legend' ? '3.0x' : tier.tier === 'Champion' ? '2.0x' : tier.tier === 'Pro' ? '1.5x' : tier.tier === 'Fan' ? '1.2x' : '1.0x'}
                      </span>
                    </div>
                  </div>

                  {reputation.totalTransactions === 0 && (
                    <div className="bg-[#FFF8F0] border border-[#F7D020] rounded-lg p-3">
                      <p className="text-[#121212] text-xs">
                        Make transactions on Chiliz Spicy to build your reputation!
                      </p>
                    </div>
                  )}

                  <Link href="/profile" className="block">
                    <button className="w-full bg-[#CE1141] hover:bg-[#B01038] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                      View Transaction History
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-[#6E6E6E] text-sm mb-2">
                    {address ? 'Loading reputation...' : 'Connect wallet to see reputation'}
                  </p>
                </div>
              )}
            </section>

            {/* Staking Rewards Card */}
            <Link href="/staking">
              <section className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#121212] font-semibold">Staking Rewards</h2>
                <span className="px-3 py-1 bg-[#CE1141] text-white text-xs font-medium rounded-full">Chiliz Earn</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E] text-sm">Staked</span>
                  <span className="text-[#A0A0A0] text-sm">—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6E6E] text-sm">Annual Yield</span>
                  <span className="text-[#A0A0A0] text-sm">0.00%</span>
                </div>
              </div>
            </section>
            </Link>
          </aside>

          {/* Center Content - Coming Soon */}
          <section className="lg:col-span-9 space-y-6">
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 bg-white border border-[#E4E4E4] rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-10 h-10 text-[#CE1141]" strokeWidth={2} />
                </div>
                <h2 className="text-[#121212] text-2xl font-bold">More Features Coming Soon</h2>
                <p className="text-[#6E6E6E] text-lg">
                  Activity timeline, rewards, and leaderboard features are being built.
                </p>
                <div className="flex gap-3 justify-center pt-4">
                  <Link href="/engage">
                    <button className="bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                      Engage & Earn
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E4E4] shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-[#CE1141] group" aria-current="page">
            <Home className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Home</span>
          </button>
          <Link
            href="/engage"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
          >
            <Zap className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Engage</span>
          </Link>
          <Link
            href="/duels"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
          >
            <Swords className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Fan Duels</span>
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
