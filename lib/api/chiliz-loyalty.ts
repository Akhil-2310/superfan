// Chiliz-native Loyalty Engine
// Computes loyalty scores from on-chain data and app activity

import { createPublicClient, http, type Address } from 'viem'
import { chilizMainnet, chilizSpicy } from '../config/chains'

interface LoyaltyScoreComponents {
  holdingsScore: number
  timeWeightedScore: number
  interactionScore: number
  totalScore: number
}

interface TokenHolding {
  balance: bigint
  firstAcquired: number
  lastTransfer: number
  transferCount: number
}

// ERC20 ABI for basic token operations
const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
] as const

// Initialize Chiliz RPC client
const chilizClient = createPublicClient({
  chain: chilizMainnet,
  transport: http('https://rpc.ankr.com/chiliz'),
})

const chilizTestnetClient = createPublicClient({
  chain: chilizSpicy,
  transport: http('https://spicy-rpc.chiliz.com'),
})

/**
 * Get current token balance for an address
 */
export async function getTokenBalance(
  tokenAddress: Address,
  userAddress: Address,
  testnet = false
): Promise<bigint> {
  const client = testnet ? chilizTestnetClient : chilizClient

  try {
    const balance = await client.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [userAddress],
    })
    return balance
  } catch (error) {
    console.error('Error fetching token balance:', error)
    return 0n
  }
}

/**
 * Get token transfer history for an address using RPC getLogs
 */
export async function getTokenTransferHistory(
  tokenAddress: Address,
  userAddress: Address,
  testnet = false
): Promise<TokenHolding> {
  const client = testnet ? chilizTestnetClient : chilizClient

  try {
    const currentBlock = await client.getBlockNumber()
    const fromBlock = currentBlock - 100000n // Last ~100k blocks

    // Get transfers TO the user (acquisitions)
    const logsTo = await client.getLogs({
      address: tokenAddress,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { type: 'address', indexed: true, name: 'from' },
          { type: 'address', indexed: true, name: 'to' },
          { type: 'uint256', indexed: false, name: 'value' },
        ],
      },
      args: {
        to: userAddress,
      },
      fromBlock,
      toBlock: currentBlock,
    })

    // Get transfers FROM the user (sales/transfers)
    const logsFrom = await client.getLogs({
      address: tokenAddress,
      event: {
        type: 'event',
        name: 'Transfer',
        inputs: [
          { type: 'address', indexed: true, name: 'from' },
          { type: 'address', indexed: true, name: 'to' },
          { type: 'uint256', indexed: false, name: 'value' },
        ],
      },
      args: {
        from: userAddress,
      },
      fromBlock,
      toBlock: currentBlock,
    })

    const allLogs = [...logsTo, ...logsFrom].sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
    )

    if (allLogs.length === 0) {
      return {
        balance: 0n,
        firstAcquired: Date.now(),
        lastTransfer: Date.now(),
        transferCount: 0,
      }
    }

    // Get block timestamps for first and last transfers
    const firstBlock = await client.getBlock({ blockNumber: allLogs[0].blockNumber })
    const lastBlock = await client.getBlock({
      blockNumber: allLogs[allLogs.length - 1].blockNumber,
    })

    const balance = await getTokenBalance(tokenAddress, userAddress, testnet)

    return {
      balance,
      firstAcquired: Number(firstBlock.timestamp) * 1000,
      lastTransfer: Number(lastBlock.timestamp) * 1000,
      transferCount: allLogs.length,
    }
  } catch (error) {
    console.error('Error fetching transfer history:', error)
    return {
      balance: 0n,
      firstAcquired: Date.now(),
      lastTransfer: Date.now(),
      transferCount: 0,
    }
  }
}

/**
 * Calculate holdings score based on token balance
 * Higher balance = higher score
 */
function calculateHoldingsScore(balance: bigint, decimals: number = 18): number {
  const balanceNumber = Number(balance) / Math.pow(10, decimals)
  
  // Logarithmic scale: score = log10(balance + 1) * 100
  // Examples:
  // 0 tokens = 0 points
  // 10 tokens = 100 points
  // 100 tokens = 200 points
  // 1000 tokens = 300 points
  const score = Math.floor(Math.log10(balanceNumber + 1) * 100)
  return Math.min(score, 1000) // Cap at 1000
}

/**
 * Calculate time-weighted score based on holding duration
 * Longer holding = higher score
 */
function calculateTimeWeightedScore(
  firstAcquired: number,
  lastTransfer: number
): number {
  const now = Date.now()
  const holdingDurationDays = (now - firstAcquired) / (1000 * 60 * 60 * 24)
  const daysSinceLastActivity = (now - lastTransfer) / (1000 * 60 * 60 * 24)

  // Base score from holding duration (1 point per day, capped at 365)
  const durationScore = Math.min(holdingDurationDays, 365)

  // Bonus for long-term holding (no recent transfers)
  const loyaltyBonus = daysSinceLastActivity > 30 ? 100 : 0

  return Math.floor(durationScore + loyaltyBonus)
}

/**
 * Calculate interaction score based on transfer frequency
 * More activity = higher engagement score
 */
function calculateInteractionScore(transferCount: number): number {
  // Score: 10 points per transfer, capped at 300
  return Math.min(transferCount * 10, 300)
}

/**
 * Calculate app activity score from off-chain signals
 */
export function calculateAppActivityScore(params: {
  watchRoomsJoined: number
  messagesPosted: number
  pollsVoted: number
  checkIns: number
  watchTimeMinutes: number
}): number {
  const {
    watchRoomsJoined,
    messagesPosted,
    pollsVoted,
    checkIns,
    watchTimeMinutes,
  } = params

  const roomScore = watchRoomsJoined * 50
  const chatScore = messagesPosted * 5
  const pollScore = pollsVoted * 20
  const checkInScore = checkIns * 100
  const watchScore = Math.floor(watchTimeMinutes / 10) * 10

  return roomScore + chatScore + pollScore + checkInScore + watchScore
}

/**
 * Main function: Calculate comprehensive loyalty score
 */
export async function calculateLoyaltyScore(
  tokenAddress: Address,
  userAddress: Address,
  appActivity: {
    watchRoomsJoined: number
    messagesPosted: number
    pollsVoted: number
    checkIns: number
    watchTimeMinutes: number
  },
  testnet = false
): Promise<LoyaltyScoreComponents> {
  try {
    // Get on-chain data
    const holding = await getTokenTransferHistory(tokenAddress, userAddress, testnet)

    // Calculate on-chain scores
    const holdingsScore = calculateHoldingsScore(holding.balance)
    const timeWeightedScore = calculateTimeWeightedScore(
      holding.firstAcquired,
      holding.lastTransfer
    )
    const onChainInteractionScore = calculateInteractionScore(holding.transferCount)

    // Calculate off-chain app score
    const appScore = calculateAppActivityScore(appActivity)

    // Combine scores
    const interactionScore = onChainInteractionScore + appScore
    const totalScore = holdingsScore + timeWeightedScore + interactionScore

    return {
      holdingsScore,
      timeWeightedScore,
      interactionScore,
      totalScore,
    }
  } catch (error) {
    console.error('Error calculating loyalty score:', error)
    return {
      holdingsScore: 0,
      timeWeightedScore: 0,
      interactionScore: 0,
      totalScore: 0,
    }
  }
}

/**
 * Calculate loyalty multiplier for staking rewards
 * Higher loyalty = higher APY multiplier
 */
export function calculateLoyaltyMultiplier(totalScore: number): number {
  // Base multiplier: 1.0x
  // Every 500 points adds 0.1x
  // Max multiplier: 3.0x (at 10,000 points)
  const multiplier = 1.0 + Math.floor(totalScore / 500) * 0.1
  return Math.min(multiplier, 3.0)
}

/**
 * Demo/Mock function for hackathon testing
 */
export function generateDemoLoyaltyScore(
  userWallet: Address
): LoyaltyScoreComponents {
  // Generate deterministic but varied scores based on wallet address
  const seed = parseInt(userWallet.slice(2, 10), 16)
  
  return {
    holdingsScore: (seed % 500) + 200,
    timeWeightedScore: (seed % 300) + 100,
    interactionScore: (seed % 400) + 150,
    totalScore: (seed % 1000) + 500,
  }
}

