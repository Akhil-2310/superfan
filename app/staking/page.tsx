"use client"

import { useState, useEffect } from "react"
import { Home, Zap, Trophy, User, ArrowLeft, TrendingUp, Lock, Unlock } from "lucide-react"
import Link from "next/link"
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { parseEther, formatEther, type Address } from "viem"
import { TEAM_FAN_TOKENS } from "@/lib/config/chains"

export default function StakingPage() {
  const { address, isConnected } = useAccount()
  const [stakeAmount, setStakeAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState<keyof typeof TEAM_FAN_TOKENS>('barcelona')
  
  // Demo data (replace with actual contract reads)
  const [stakingData, setStakingData] = useState({
    totalStaked: '1000',
    baseAPY: 10,
    loyaltyMultiplier: 1.5,
    effectiveAPY: 15,
    pendingRewards: '25.5',
    userStaked: '500',
  })

  const handleStake = async () => {
    if (!stakeAmount || !isConnected) return
    
    // In production, call actual staking contract
    alert(`Staking ${stakeAmount} ${TEAM_FAN_TOKENS[selectedToken].symbol} tokens`)
  }

  const handleUnstake = async () => {
    if (!stakingData.userStaked || !isConnected) return
    
    // In production, call actual staking contract
    alert(`Unstaking ${stakingData.userStaked} ${TEAM_FAN_TOKENS[selectedToken].symbol} tokens`)
  }

  const handleClaim = async () => {
    if (!stakingData.pendingRewards || !isConnected) return
    
    // In production, call actual staking contract
    alert(`Claiming ${stakingData.pendingRewards} ${TEAM_FAN_TOKENS[selectedToken].symbol} rewards`)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E4E4E4] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[#6E6E6E] hover:text-[#121212] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-[#121212] text-2xl font-bold">Chiliz Earn</h1>
            <p className="text-[#6E6E6E] text-sm">Stake fan tokens & earn rewards</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#0033A0] to-[#002D8F] rounded-2xl p-6 text-white">
              <p className="text-white/70 text-sm mb-2">Total Value Staked</p>
              <p className="text-3xl font-bold mb-1">{stakingData.totalStaked}</p>
              <p className="text-white/90 text-sm">
                {TEAM_FAN_TOKENS[selectedToken].symbol} Tokens
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#CE1141] to-[#B01038] rounded-2xl p-6 text-white">
              <p className="text-white/70 text-sm mb-2">Effective APY</p>
              <p className="text-3xl font-bold mb-1">{stakingData.effectiveAPY}%</p>
              <p className="text-white/90 text-sm">
                Base {stakingData.baseAPY}% × {stakingData.loyaltyMultiplier}x
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#F7D020] to-[#E5C01E] rounded-2xl p-6 text-[#121212]">
              <p className="text-[#121212]/70 text-sm mb-2">Pending Rewards</p>
              <p className="text-3xl font-bold mb-1">{stakingData.pendingRewards}</p>
              <p className="text-[#121212]/90 text-sm">
                {TEAM_FAN_TOKENS[selectedToken].symbol} Tokens
              </p>
            </div>
          </div>

          {/* Loyalty Multiplier Info */}
          <div className="bg-[#FFF8F0] border border-[#F7D020] rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#F7D020] rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-[#121212]" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="text-[#121212] font-bold mb-2">
                  Loyalty Multiplier: {stakingData.loyaltyMultiplier}x
                </h3>
                <p className="text-[#6E6E6E] text-sm mb-3">
                  Your loyalty score boosts your staking rewards! Hold tokens longer, engage more, and increase your multiplier up to 3.0x.
                </p>
                <Link href="/profile" className="text-[#CE1141] text-sm font-semibold hover:underline">
                  View Loyalty Score →
                </Link>
              </div>
            </div>
          </div>

          {/* Token Selection */}
          <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6">
            <h2 className="text-[#121212] text-xl font-bold mb-4">Select Fan Token</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(TEAM_FAN_TOKENS).slice(0, 8).map(([key, token]) => (
                <button
                  key={key}
                  onClick={() => setSelectedToken(key as keyof typeof TEAM_FAN_TOKENS)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedToken === key
                      ? 'border-[#CE1141] bg-[#CE1141]/10'
                      : 'border-[#E4E4E4] bg-white hover:border-[#CE1141]/50'
                  }`}
                >
                  <p className="text-[#121212] font-bold text-lg">{token.symbol}</p>
                  <p className="text-[#6E6E6E] text-xs mt-1 truncate">{token.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Staking Interface */}
          <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6">
            <h2 className="text-[#121212] text-xl font-bold mb-6">Stake Tokens</h2>
            
            {/* Your Stake Info */}
            <div className="bg-white rounded-xl p-4 mb-6 border border-[#E4E4E4]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#6E6E6E] text-sm">Your Staked Balance</span>
                <span className="text-[#121212] font-bold text-lg">
                  {stakingData.userStaked} {TEAM_FAN_TOKENS[selectedToken].symbol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6E6E6E] text-sm">Wallet Balance</span>
                <span className="text-[#121212] font-semibold">
                  1,500 {TEAM_FAN_TOKENS[selectedToken].symbol}
                </span>
              </div>
            </div>

            {/* Stake Input */}
            <div className="space-y-4">
              <div>
                <label className="text-[#6E6E6E] text-sm mb-2 block">Amount to Stake</label>
                <div className="relative">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-white border border-[#E4E4E4] rounded-xl px-4 py-3 text-[#121212] text-lg focus:outline-none focus:ring-2 focus:ring-[#CE1141]/30"
                  />
                  <button
                    onClick={() => setStakeAmount('1500')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#CE1141] text-sm font-semibold hover:underline"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStake}
                  disabled={!stakeAmount || !isConnected}
                  className="bg-[#CE1141] hover:bg-[#B01038] disabled:bg-[#E4E4E4] disabled:text-[#6E6E6E] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" strokeWidth={2} />
                  Stake
                </button>

                <button
                  onClick={handleUnstake}
                  disabled={!stakingData.userStaked || !isConnected}
                  className="bg-white hover:bg-[#F8F8F8] disabled:bg-[#E4E4E4] disabled:text-[#6E6E6E] text-[#121212] font-semibold py-3 rounded-xl transition-colors border-2 border-[#E4E4E4] flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" strokeWidth={2} />
                  Unstake
                </button>
              </div>
            </div>
          </div>

          {/* Claim Rewards */}
          <div className="bg-gradient-to-br from-[#F7D020] to-[#E5C01E] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#121212] font-bold text-lg mb-1">Claimable Rewards</h3>
                <p className="text-[#121212]/70 text-sm">
                  {stakingData.pendingRewards} {TEAM_FAN_TOKENS[selectedToken].symbol}
                </p>
              </div>
              <button
                onClick={handleClaim}
                disabled={!stakingData.pendingRewards || !isConnected}
                className="bg-[#121212] hover:bg-[#2E2E2E] disabled:bg-[#E4E4E4] disabled:text-[#6E6E6E] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Claim Rewards
              </button>
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-[#F8F8F8] border border-[#E4E4E4] rounded-2xl p-6">
            <h3 className="text-[#121212] font-bold mb-4">How Chiliz Earn Works</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#CE1141] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-[#121212] font-semibold">Stake Your Fan Tokens</p>
                  <p className="text-[#6E6E6E] text-sm">Lock your tokens to start earning rewards</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#CE1141] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-[#121212] font-semibold">Earn Boosted Rewards</p>
                  <p className="text-[#6E6E6E] text-sm">Your loyalty score multiplies your APY up to 3x</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#CE1141] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-[#121212] font-semibold">Claim Anytime</p>
                  <p className="text-[#6E6E6E] text-sm">Withdraw your stake and rewards whenever you want</p>
                </div>
              </div>
            </div>
          </div>

          {!isConnected && (
            <div className="bg-[#FFF8F0] border border-[#F7D020] rounded-2xl p-6 text-center">
              <p className="text-[#121212] font-semibold mb-4">Connect your wallet to start staking</p>
              <Link href="/connect-wallet">
                <button className="bg-[#CE1141] hover:bg-[#B01038] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                  Connect Wallet
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4E4E4] shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-around">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
          >
            <Home className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            href="/engage"
            className="flex flex-col items-center gap-1 text-[#6E6E6E] hover:text-[#121212] transition-colors group"
          >
            <Zap className="w-6 h-6" strokeWidth={2} />
            <span className="text-xs font-medium">Engage</span>
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

