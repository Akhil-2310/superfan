"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import {
  ChevronLeft,
  Shield,
  Wallet,
  Bell,
  Moon,
  LogOut,
  ChevronRight,
  Edit2,
  CheckCircle,
  Calendar,
  Trophy,
  TrendingUp,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { getCountryFlag } from "@/lib/api/self-data-parser"
import { checkIfLastUser } from "@/lib/api/simple-self-reader"
import { calculateReputationFromTransactions, getReputationTier } from "@/lib/api/chiliz-reputation"
import { formatEther } from "viem"

export default function ProfilePage() {
  const { address } = useAccount()
  const [userData, setUserData] = useState<any>(null)
  const [contractName, setContractName] = useState<string | null>(null)
  const [reputation, setReputation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)

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

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Identity Verification */}
            {userData?.self_verified && (
              <section className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5" strokeWidth={2} />
                  <h3 className="font-semibold">Identity</h3>
                </div>
                {(contractName || userData?.verified_name) && (
                  <p className="text-lg font-bold mb-1">{contractName || userData.verified_name}</p>
                )}
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <span className="text-xl">{getCountryFlag(userData?.nationality || 'unknown')}</span>
                  <span className="capitalize">{userData?.nationality || 'Unknown'}</span>
                </p>
                {userData?.verified_age && (
                  <p className="text-white/70 text-xs mt-2">Age: {userData.verified_age}+</p>
                )}
              </section>
            )}

            {/* Fan Tokens */}
            <section className="bg-gradient-to-br from-[#0033A0] to-[#002D8F] rounded-xl p-5 text-white shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5" strokeWidth={2} />
                <h3 className="font-semibold">Fan Tokens</h3>
              </div>
              <p className="text-3xl font-bold mb-1">{userData?.total_tokens || 0}</p>
              <p className="text-white/80 text-sm flex items-center gap-1">
                <TrendingUp className="w-4 h-4" strokeWidth={2} />
                FANFI Token
              </p>
            </section>

            {/* Reputation */}
            {!loading && reputation && tier ? (
              <section className="bg-gradient-to-br from-[#F7D020] to-[#FFA500] rounded-xl p-5 text-white shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5" strokeWidth={2} />
                  <h3 className="font-semibold">Reputation</h3>
                </div>
                <p className="text-3xl font-bold mb-1">{reputation.reputationScore}</p>
                <p className="text-white/90 text-sm font-semibold">{tier.tier}</p>
              </section>
            ) : (
              <section className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-5">
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-4 border-[#E4E4E4] border-t-[#CE1141] rounded-full animate-spin"></div>
                </div>
              </section>
            )}
          </div>

          {/* Detailed Reputation Stats */}
          {!loading && reputation && tier && (
            <section className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6 shadow-sm">
              <h3 className="text-[#121212] font-bold text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#CE1141]" strokeWidth={2} />
                Chiliz Reputation Details
                <span className="ml-auto text-xs text-[#6E6E6E] font-normal">Spicy Testnet</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[#6E6E6E] text-sm mb-1">Transactions</p>
                  <p className="text-[#121212] font-bold text-xl">{reputation.totalTransactions}</p>
                </div>
                <div>
                  <p className="text-[#6E6E6E] text-sm mb-1">Successful</p>
                  <p className="text-green-600 font-bold text-xl">{reputation.successfulTransactions}</p>
                </div>
                <div>
                  <p className="text-[#6E6E6E] text-sm mb-1">Account Age</p>
                  <p className="text-[#121212] font-bold text-xl">{reputation.accountAge}d</p>
                </div>
                <div>
                  <p className="text-[#6E6E6E] text-sm mb-1">Multiplier</p>
                  <p className="text-[#CE1141] font-bold text-xl">
                    {tier.tier === 'Legend' ? '3.0x' : tier.tier === 'Champion' ? '2.0x' : tier.tier === 'Pro' ? '1.5x' : tier.tier === 'Fan' ? '1.2x' : '1.0x'}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E4E4E4]">
                <p className="text-[#6E6E6E] text-sm mb-1">Total Value Transferred</p>
                <p className="text-[#121212] font-semibold">{formatEther(reputation.totalValueTransferred).slice(0, 8)} CHZ</p>
              </div>
            </section>
          )}


          {/* Team Section */}
          <section className="space-y-4">
            <h3 className="text-[#6E6E6E] text-sm font-semibold uppercase tracking-wider px-2">Favorite Team</h3>

            {userData?.preferred_team ? (
              <div className="bg-gradient-to-br from-[#0033A0] via-[#002D8F] to-[#F7D020] rounded-xl p-6 shadow-md">
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
                      <p className="text-white font-bold text-lg capitalize">{userData.preferred_team}</p>
                      <p className="text-white/80 text-sm">Your Favorite Team</p>
                    </div>
                  </div>
                </div>
                <Link href="/choose-team">
                  <button className="w-full bg-white hover:bg-white/90 text-[#0033A0] font-semibold py-3 rounded-lg transition-colors shadow-sm">
                    Change Team
                  </button>
                </Link>
              </div>
            ) : (
              <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-6 text-center">
                <p className="text-[#6E6E6E] mb-4">No team selected yet</p>
                <Link href="/choose-team">
                  <button className="bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                    Choose Your Team
                  </button>
                </Link>
              </div>
            )}
          </section>

          {/* Security Section */}
          <section className="space-y-4">
            <h3 className="text-[#6E6E6E] text-sm font-semibold uppercase tracking-wider px-2">Security</h3>

            {/* Wallet Connection */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <p className="text-[#121212] font-semibold">Wallet Connection</p>
                    <p className="text-[#6E6E6E] text-sm font-mono">
                      {address ? `${address.slice(0, 6)}...${address.slice(-6)}` : 'Not connected'}
                    </p>
                  </div>
                </div>
                {address && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-green-700 text-xs font-medium">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                    Connected
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* App Preferences Section */}
          <section className="space-y-4">
            <h3 className="text-[#6E6E6E] text-sm font-semibold uppercase tracking-wider px-2">App Preferences</h3>

            {/* Notifications Toggle */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <p className="text-[#121212] font-semibold">Notifications</p>
                    <p className="text-[#6E6E6E] text-sm">Receive updates and alerts</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notificationsEnabled ? "bg-[#CE1141]" : "bg-[#D6D6D6]"
                  }`}
                  aria-label="Toggle notifications"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      notificationsEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white border border-[#E4E4E4] rounded-lg flex items-center justify-center">
                    <Moon className="w-5 h-5 text-[#6E6E6E]" strokeWidth={2} />
                  </div>
                  <div className="text-left">
                    <p className="text-[#121212] font-semibold">Dark Mode</p>
                    <p className="text-[#6E6E6E] text-sm">Adjust app appearance</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkModeEnabled(!darkModeEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    darkModeEnabled ? "bg-[#CE1141]" : "bg-[#D6D6D6]"
                  }`}
                  aria-label="Toggle dark mode"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      darkModeEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Logout Button */}
          <button className="w-full bg-white border-2 border-[#CE1141] hover:bg-[#CE1141] rounded-xl p-4 flex items-center justify-center gap-3 text-[#CE1141] hover:text-white transition-colors shadow-sm group">
            <LogOut className="w-5 h-5" strokeWidth={2} />
            <span className="font-semibold">Log Out</span>
          </button>
        </div>
      </main>
    </div>
  )
}
