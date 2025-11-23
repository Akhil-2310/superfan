// Chiliz Transaction-Based Reputation System
// Calculates reputation from actual on-chain transactions

import { createPublicClient, http, type Address, type Hash } from 'viem'
import { chilizMainnet, chilizSpicy } from '../config/chains'

export interface TransactionData {
  hash: Hash
  from: Address
  to: Address | null
  value: bigint
  gasUsed: bigint
  timestamp: number
  blockNumber: bigint
  status: 'success' | 'failed'
}

export interface ReputationScore {
  totalTransactions: number
  successfulTransactions: number
  totalValueTransferred: bigint
  totalGasSpent: bigint
  firstTransactionDate: number
  lastTransactionDate: number
  accountAge: number // days
  averageTransactionValue: bigint
  reputationScore: number // 0-1000
}

// Initialize Chiliz clients
const chilizClient = createPublicClient({
  chain: chilizMainnet,
  transport: http('https://rpc.ankr.com/chiliz'),
})

const chilizTestnetClient = createPublicClient({
  chain: chilizSpicy,
  transport: http('https://spicy-rpc.chiliz.com'),
})

/**
 * Get transaction details
 */
export async function getTransaction(
  txHash: Hash,
  testnet = false
): Promise<TransactionData | null> {
  const client = testnet ? chilizTestnetClient : chilizClient

  try {
    const transaction = await client.getTransaction({ hash: txHash })
    const receipt = await client.getTransactionReceipt({ hash: txHash })
    const block = await client.getBlock({ blockNumber: transaction.blockNumber })

    return {
      hash: transaction.hash,
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      gasUsed: receipt.gasUsed,
      timestamp: Number(block.timestamp) * 1000,
      blockNumber: transaction.blockNumber,
      status: receipt.status === 'success' ? 'success' : 'failed',
    }
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return null
  }
}

/**
 * Get transaction receipt (definitive gas fees)
 */
export async function getTransactionReceipt(
  txHash: Hash,
  testnet = false
) {
  const client = testnet ? chilizTestnetClient : chilizClient

  try {
    return await client.getTransactionReceipt({ hash: txHash })
  } catch (error) {
    console.error('Error fetching transaction receipt:', error)
    return null
  }
}

/**
 * Get basic account info using only RPC calls
 * Block explorer API is not reliable, so we use direct RPC
 */
export async function getAccountInfo(
  address: Address,
  testnet = false
): Promise<{
  transactionCount: number
  balance: bigint
  hasActivity: boolean
}> {
  const client = testnet ? chilizTestnetClient : chilizClient

  try {
    console.log('📊 Fetching account info from Chiliz RPC...')
    
    // Get transaction count (nonce) - this is the number of transactions sent
    const transactionCount = await client.getTransactionCount({ address })
    
    // Get balance
    const balance = await client.getBalance({ address })
    
    console.log('✅ Account info:', {
      address,
      transactionCount,
      balance: balance.toString(),
      hasActivity: transactionCount > 0 || balance > 0n
    })

    return {
      transactionCount,
      balance,
      hasActivity: transactionCount > 0 || balance > 0n,
    }
  } catch (error) {
    console.error('Error fetching account info:', error)
    return {
      transactionCount: 0,
      balance: 0n,
      hasActivity: false,
    }
  }
}

/**
 * Calculate reputation score from transactions
 */
export async function calculateReputationFromTransactions(
  address: Address,
  testnet = false
): Promise<ReputationScore> {
  console.log('🔍 Calculating reputation for:', address)
  
  const accountInfo = await getAccountInfo(address, testnet)

  if (!accountInfo.hasActivity) {
    console.log('⚠️  No activity found for address')
    return {
      totalTransactions: 0,
      successfulTransactions: 0,
      totalValueTransferred: 0n,
      totalGasSpent: 0n,
      firstTransactionDate: Date.now(),
      lastTransactionDate: Date.now(),
      accountAge: 0,
      averageTransactionValue: 0n,
      reputationScore: 0,
    }
  }

  console.log('✅ Account has activity!')

  const { transactionCount, balance } = accountInfo

  // Use transaction count and balance to calculate reputation
  const totalTransactions = transactionCount
  const successfulTransactions = transactionCount // Assume sent transactions succeeded

  // Estimate account age: roughly 1 tx per week = active user
  const estimatedWeeks = Math.max(1, transactionCount)
  const accountAge = Math.floor(estimatedWeeks * 7) // Convert to days

  // Calculate reputation score (0-1000)
  let score = 0

  // 1. Total Transactions (max 400 points) - 40 points per transaction, cap at 10
  score += Math.min(totalTransactions * 40, 400)

  // 2. Balance (max 300 points) - logarithmic scale
  const balanceInEther = Number(balance) / 1e18
  if (balanceInEther > 0) {
    score += Math.min(Math.log10(balanceInEther * 100 + 1) * 100, 300)
  }

  // 3. Account Age (max 200 points) - based on estimated activity
  score += Math.min(accountAge * 2, 200)

  // 4. Activity Level (max 100 points) - bonus for having any activity
  if (totalTransactions > 0) score += 50
  if (balance > 0n) score += 50

  // Cap score at 1000
  score = Math.min(Math.max(score, 0), 1000)

  console.log('📊 Reputation calculated:', {
    totalTransactions,
    balance: balance.toString(),
    accountAge,
    reputationScore: score,
  })

  return {
    totalTransactions,
    successfulTransactions,
    totalValueTransferred: balance, // Use current balance as proxy
    totalGasSpent: 0n, // Not available without full tx history
    firstTransactionDate: Date.now() - accountAge * 24 * 60 * 60 * 1000, // Estimate
    lastTransactionDate: Date.now(),
    accountAge,
    averageTransactionValue: totalTransactions > 0 ? balance / BigInt(totalTransactions) : 0n,
    reputationScore: Math.round(score),
  }
}

/**
 * Get reputation tier based on score
 */
export function getReputationTier(score: number): {
  tier: string
  color: string
  benefits: string[]
} {
  if (score >= 800) {
    return {
      tier: 'Legend',
      color: '#F7D020',
      benefits: [
        '3x staking multiplier',
        'Exclusive events access',
        'Priority customer support',
        'Special NFT rewards',
      ],
    }
  } else if (score >= 600) {
    return {
      tier: 'Champion',
      color: '#CE1141',
      benefits: [
        '2x staking multiplier',
        'Early access to features',
        'Bonus token rewards',
      ],
    }
  } else if (score >= 400) {
    return {
      tier: 'Pro',
      color: '#0033A0',
      benefits: ['1.5x staking multiplier', 'Access to pro features', 'Weekly bonuses'],
    }
  } else if (score >= 200) {
    return {
      tier: 'Fan',
      color: '#6E6E6E',
      benefits: ['1.2x staking multiplier', 'Standard rewards', 'Community access'],
    }
  } else {
    return {
      tier: 'Rookie',
      color: '#A0A0A0',
      benefits: ['1x staking multiplier', 'Basic rewards', 'Getting started guide'],
    }
  }
}

/**
 * Demo reputation for testing
 */
export function generateDemoReputation(address: Address): ReputationScore {
  const seed = parseInt(address.slice(2, 10), 16)

  return {
    totalTransactions: (seed % 100) + 50,
    successfulTransactions: (seed % 100) + 45,
    totalValueTransferred: BigInt((seed % 1000) + 100) * 10n ** 18n,
    totalGasSpent: BigInt((seed % 100) + 10) * 10n ** 15n,
    firstTransactionDate: Date.now() - (seed % 365) * 24 * 60 * 60 * 1000,
    lastTransactionDate: Date.now() - (seed % 7) * 24 * 60 * 60 * 1000,
    accountAge: (seed % 365) + 30,
    averageTransactionValue: BigInt((seed % 10) + 1) * 10n ** 17n,
    reputationScore: (seed % 800) + 200,
  }
}

