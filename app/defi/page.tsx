"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { useRouter } from "next/navigation"
import {
  Home,
  Zap,
  Trophy,
  User,
  Swords,
  TrendingUp,
  Coins,
  Percent,
  Clock,
  Award,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  Flame,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { formatEther, parseEther } from "viem"
import { STAKING_POOL_ABI, ERC20_ABI } from "@/lib/contracts/staking-abi"
import { ConnectButton } from "@rainbow-me/rainbowkit"

// Contract addresses
const FANFI_TOKEN_ADDRESS = "0xCee0c15B42EEb44491F588104bbC46812115dBB0" as `0x${string}`
const SUPERFAN_TOKEN_ADDRESS = "0xB6B9918C5880f7a1A4C65c4C4B6297956B4c39AD" as `0x${string}`
const STAKING_POOL_ADDRESS = "0x7A08F64Ed4A17440a3744D6D9C53E6516Bf067AC" as `0x${string}`

export default function DeFiPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  
  // UI state
  const [stakeAmount, setStakeAmount] = useState<string>("")
  const [unstakeAmount, setUnstakeAmount] = useState<string>("")
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake')
  const [txStatus, setTxStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Write hooks
  const { writeContract: writeApprove, data: approveHash } = useWriteContract()
  const { writeContract: writeStake, data: stakeHash } = useWriteContract()
  const { writeContract: writeUnstake, data: unstakeHash } = useWriteContract()
  const { writeContract: writeClaim, data: claimHash } = useWriteContract()

  // Transaction receipts
  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash })
  const { isLoading: isStaking } = useWaitForTransactionReceipt({ hash: stakeHash })
  const { isLoading: isUnstaking } = useWaitForTransactionReceipt({ hash: unstakeHash })
  const { isLoading: isClaiming } = useWaitForTransactionReceipt({ hash: claimHash })

  // Read FANFI balance
  const { data: fanfiBalance, refetch: refetchFanfiBalance } = useReadContract({
    address: FANFI_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Read SuperFan balance
  const { data: superfanBalance, refetch: refetchSuperfanBalance } = useReadContract({
    address: SUPERFAN_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Read FANFI allowance
  const { data: fanfiAllowance, refetch: refetchAllowance } = useReadContract({
    address: FANFI_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, STAKING_POOL_ADDRESS] : undefined,
  })

  // Read user stake info
  const { data: userStakeInfo, refetch: refetchStakeInfo } = useReadContract({
    address: STAKING_POOL_ADDRESS,
    abi: STAKING_POOL_ABI,
    functionName: 'getUserStakeInfo',
    args: address ? [address] : undefined,
  })

  // Read pool stats
  const { data: poolStats } = useReadContract({
    address: STAKING_POOL_ADDRESS,
    abi: STAKING_POOL_ABI,
    functionName: 'getPoolStats',
  })

  // Refresh all data
  const refreshData = () => {
    refetchFanfiBalance()
    refetchSuperfanBalance()
    refetchAllowance()
    refetchStakeInfo()
  }

  useEffect(() => {
    if (stakeHash || unstakeHash || claimHash || approveHash) {
      // Refresh data after transactions
      setTimeout(refreshData, 2000)
      
      // Track staking action for quest completion (only for stake, not unstake)
      if (stakeHash && address && stakeAmount) {
        setTimeout(() => {
          fetch('/api/staking/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wallet: address,
              action: 'stake',
              amount: parseFloat(stakeAmount),
            }),
          }).catch(err => console.error('Failed to track staking:', err))
        }, 3000) // Wait 3s for transaction to fully settle
      }
    }
  }, [stakeHash, unstakeHash, claimHash, approveHash, address, stakeAmount])

  // Parse user stake info
  const stakedAmount = userStakeInfo ? formatEther(userStakeInfo[0]) : "0"
  const pendingRewards = userStakeInfo ? formatEther(userStakeInfo[2]) : "0"
  const totalClaimed = userStakeInfo ? formatEther(userStakeInfo[3]) : "0"
  const reputationMultiplier = userStakeInfo ? Number(userStakeInfo[4]) / 1000 : 1.0
  const watchTime = userStakeInfo ? Number(userStakeInfo[5]) / 3600 : 0 // Convert seconds to hours
  const effectiveAPY = userStakeInfo ? Number(userStakeInfo[6]) / 100 : 10

  const handleApprove = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setTxStatus({ type: 'error', message: 'Please enter a valid amount' })
      return
    }
    
    try {
      setTxStatus(null)
      writeApprove({
        address: FANFI_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [STAKING_POOL_ADDRESS, parseEther(stakeAmount)],
      })
    } catch (error: any) {
      console.error("Approve error:", error)
      setTxStatus({ type: 'error', message: error.message || 'Failed to approve' })
    }
  }

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setTxStatus({ type: 'error', message: 'Please enter a valid amount' })
      return
    }
    
    try {
      setTxStatus(null)
      writeStake({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'stake',
        args: [parseEther(stakeAmount)],
      })
      setStakeAmount("")
      setTxStatus({ type: 'success', message: 'Stake transaction submitted!' })
    } catch (error: any) {
      console.error("Staking error:", error)
      setTxStatus({ type: 'error', message: error.message || 'Failed to stake' })
    }
  }

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setTxStatus({ type: 'error', message: 'Please enter a valid amount' })
      return
    }
    
    try {
      setTxStatus(null)
      writeUnstake({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'unstake',
        args: [parseEther(unstakeAmount)],
      })
      setUnstakeAmount("")
      setTxStatus({ type: 'success', message: 'Unstake transaction submitted!' })
    } catch (error: any) {
      console.error("Unstaking error:", error)
      setTxStatus({ type: 'error', message: error.message || 'Failed to unstake' })
    }
  }

  const handleClaim = async () => {
    try {
      setTxStatus(null)
      writeClaim({
        address: STAKING_POOL_ADDRESS,
        abi: STAKING_POOL_ABI,
        functionName: 'claimRewards',
      })
      setTxStatus({ type: 'success', message: 'Claim transaction submitted!' })
    } catch (error: any) {
      console.error("Claim error:", error)
      setTxStatus({ type: 'error', message: error.message || 'Failed to claim' })
    }
  }

  // Check if user needs to approve
  const needsApproval = fanfiAllowance && stakeAmount 
    ? BigInt(fanfiAllowance.toString()) < parseEther(stakeAmount)
    : true

  const isLoading = isApproving || isStaking || isUnstaking || isClaiming

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white">
        {/* Connect Wallet Message */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#FF1744] to-[#D500F9] rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-[#141414] mb-2">Connect Your Wallet</h2>
            <p className="text-[#6E6E6E] mb-6">Connect your wallet to start staking and earning rewards</p>
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Message */}
        {txStatus && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
            txStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {txStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className={txStatus.type === 'success' ? 'text-green-800 font-medium' : 'text-red-800 font-medium'}>
              {txStatus.message}
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Your Staked FANFI */}
          <div className="bg-gradient-to-br from-[#FF1744] to-[#D500F9] rounded-3xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Coins className="w-6 h-6" strokeWidth={2} />
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-xs font-medium">Staked</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{parseFloat(stakedAmount).toFixed(2)}</p>
            <p className="text-sm opacity-90">FANFI Tokens</p>
          </div>

          {/* Pending Rewards */}
          <div className="bg-white border-2 border-[#E4E4E4] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-6 h-6 text-[#FF1744]" strokeWidth={2} />
              <div className="bg-green-100 rounded-full px-3 py-1">
                <span className="text-xs font-semibold text-green-700">Pending</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[#141414] mb-1">{parseFloat(pendingRewards).toFixed(4)}</p>
            <p className="text-sm text-[#6E6E6E]">SuperFan Tokens</p>
          </div>

          {/* Effective APY */}
          <div className="bg-white border-2 border-[#E4E4E4] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Percent className="w-6 h-6 text-[#D500F9]" strokeWidth={2} />
              <div className="bg-purple-100 rounded-full px-3 py-1">
                <span className="text-xs font-semibold text-purple-700">APY</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[#141414] mb-1">{effectiveAPY.toFixed(2)}%</p>
            <p className="text-sm text-[#6E6E6E]">
              <span className="text-green-600">↑ {reputationMultiplier.toFixed(1)}x</span> Rep Boost
            </p>
          </div>

          {/* Total Claimed */}
          <div className="bg-white border-2 border-[#E4E4E4] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-6 h-6 text-[#FF9100]" strokeWidth={2} />
              <div className="bg-orange-100 rounded-full px-3 py-1">
                <span className="text-xs font-semibold text-orange-700">Claimed</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[#141414] mb-1">{parseFloat(totalClaimed).toFixed(2)}</p>
            <p className="text-sm text-[#6E6E6E]">SuperFan Earned</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stake/Unstake Card */}
          <div className="lg:col-span-2 bg-white border-2 border-[#E4E4E4] rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#141414]">Manage Staking</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('stake')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === 'stake'
                      ? 'bg-gradient-to-r from-[#FF1744] to-[#D500F9] text-white'
                      : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#E4E4E4]'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4 inline mr-2" />
                  Stake
                </button>
                <button
                  onClick={() => setActiveTab('unstake')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === 'unstake'
                      ? 'bg-gradient-to-r from-[#FF1744] to-[#D500F9] text-white'
                      : 'bg-[#F8F8F8] text-[#6E6E6E] hover:bg-[#E4E4E4]'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 inline mr-2" />
                  Unstake
                </button>
              </div>
            </div>

            {activeTab === 'stake' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6E6E6E] mb-2">
                    Amount to Stake
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 border-2 border-[#E4E4E4] rounded-2xl text-xl font-bold text-[#141414] focus:outline-none focus:border-[#FF1744] transition-colors"
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => setStakeAmount(formatEther(fanfiBalance || BigInt(0)))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#FF1744] hover:text-[#D500F9] transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-[#6E6E6E]">
                    Available: <span className="font-semibold text-[#141414]">{parseFloat(formatEther(fanfiBalance || BigInt(0))).toFixed(2)} FANFI</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  {needsApproval ? (
                    <button
                      onClick={handleApprove}
                      disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                      className="flex-1 bg-gradient-to-r from-[#FFB300] to-[#FF6F00] text-white font-bold py-4 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isApproving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Approve FANFI
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleStake}
                      disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                      className="flex-1 bg-gradient-to-r from-[#FF1744] to-[#D500F9] text-white font-bold py-4 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isStaking ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Staking...
                        </>
                      ) : (
                        <>
                          <ArrowDownLeft className="w-5 h-5" />
                          Stake FANFI
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6E6E6E] mb-2">
                    Amount to Unstake
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 border-2 border-[#E4E4E4] rounded-2xl text-xl font-bold text-[#141414] focus:outline-none focus:border-[#FF1744] transition-colors"
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => setUnstakeAmount(stakedAmount)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#FF1744] hover:text-[#D500F9] transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-[#6E6E6E]">
                    Staked: <span className="font-semibold text-[#141414]">{parseFloat(stakedAmount).toFixed(2)} FANFI</span>
                  </p>
                </div>

                <button
                  onClick={handleUnstake}
                  disabled={isLoading || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                  className="w-full bg-gradient-to-r from-[#FF1744] to-[#D500F9] text-white font-bold py-4 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUnstaking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Unstaking...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-5 h-5" />
                      Unstake & Claim Rewards
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Claim Rewards Button */}
            {parseFloat(pendingRewards) > 0 && (
              <div className="mt-6 pt-6 border-t-2 border-[#E4E4E4]">
                <button
                  onClick={handleClaim}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#00E676] to-[#00C853] text-white font-bold py-4 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Award className="w-5 h-5" />
                      Claim {parseFloat(pendingRewards).toFixed(4)} SuperFan
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Balances */}
            <div className="bg-white border-2 border-[#E4E4E4] rounded-3xl p-6">
              <h3 className="text-lg font-bold text-[#141414] mb-4">Your Balances</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#F8F8F8] rounded-xl">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#FF1744]" />
                    <span className="font-medium text-[#141414]">FANFI</span>
                  </div>
                  <span className="font-bold text-[#141414]">
                    {parseFloat(formatEther(fanfiBalance || BigInt(0))).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#F8F8F8] rounded-xl">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#D500F9]" />
                    <span className="font-medium text-[#141414]">SuperFan</span>
                  </div>
                  <span className="font-bold text-[#141414]">
                    {parseFloat(formatEther(superfanBalance || BigInt(0))).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Boosts */}
            <div className="bg-gradient-to-br from-[#FF1744]/10 to-[#D500F9]/10 border-2 border-[#FF1744]/20 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-[#141414] mb-4">Active Boosts</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#FF1744]" />
                    <span className="text-sm font-medium text-[#141414]">Reputation</span>
                  </div>
                  <span className="font-bold text-[#FF1744]">{reputationMultiplier.toFixed(1)}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-[#D500F9]" />
                    <span className="text-sm font-medium text-[#141414]">Watch Time</span>
                  </div>
                  <span className="font-bold text-[#D500F9]">{watchTime.toFixed(1)}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#00C853]" />
                    <span className="text-sm font-medium text-[#141414]">Watch Bonus</span>
                  </div>
                  <span className="font-bold text-[#00C853]">+{(watchTime * 0.1).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-[#F8F8F8] rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-[#6E6E6E]" />
                <h3 className="text-lg font-bold text-[#141414]">How It Works</h3>
              </div>
              <ul className="space-y-2 text-sm text-[#6E6E6E]">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF1744] font-bold">1.</span>
                  <span>Stake FANFI to earn SuperFan rewards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF1744] font-bold">2.</span>
                  <span>Rewards accrue every second based on APY</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF1744] font-bold">3.</span>
                  <span>Higher reputation = Higher APY multiplier</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF1744] font-bold">4.</span>
                  <span>Watch matches to boost your APY further</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF1744] font-bold">5.</span>
                  <span>No lockup period - withdraw anytime!</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
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
              <button className="flex flex-col items-center gap-1 text-[#FF1744]">
                <div className="bg-gradient-to-br from-[#FF1744] to-[#D500F9] p-3 rounded-2xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold">DeFi</span>
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
