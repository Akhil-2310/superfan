import { NextResponse } from 'next/server'
import { createWalletClient, http, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { chilizSpicy } from '@/lib/config/chains'
import { supabase } from '@/lib/supabase/client'

const ACHIEVEMENTS_CONTRACT = process.env.NEXT_PUBLIC_ACHIEVEMENTS_CONTRACT as `0x${string}`
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`

// Minimal ABI for minting
const ACHIEVEMENTS_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "enum FanFiAchievements.AchievementType",
        "name": "achievementType",
        "type": "uint8"
      },
      {
        "internalType": "enum FanFiAchievements.Rarity",
        "name": "rarity",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "imageUri",
        "type": "string"
      }
    ],
    "name": "mintAchievement",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "enum FanFiAchievements.AchievementType",
        "name": "achievementType",
        "type": "uint8"
      }
    ],
    "name": "hasAchievement",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wallet } = body

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    if (!PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // 1. Verify user is actually #1 on leaderboard
    const { data: topUsers, error: leaderboardError } = await supabase
      .from('users')
      .select('wallet_address, total_tokens')
      .order('total_tokens', { ascending: false })
      .limit(1)

    if (leaderboardError || !topUsers || topUsers.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    const topUser = topUsers[0]
    if (topUser.wallet_address.toLowerCase() !== wallet.toLowerCase()) {
      return NextResponse.json(
        { error: 'Only the #1 user can claim this NFT' },
        { status: 403 }
      )
    }

    // 2. Check if user already has this achievement
    const publicClient = createPublicClient({
      chain: chilizSpicy,
      transport: http()
    })

    const hasAchievement = await publicClient.readContract({
      address: ACHIEVEMENTS_CONTRACT,
      abi: ACHIEVEMENTS_ABI,
      functionName: 'hasAchievement',
      args: [wallet as `0x${string}`, 3] // 3 = DUEL_CHAMPION (repurposing for Leaderboard Champion)
    })

    if (hasAchievement) {
      return NextResponse.json(
        { error: 'You already claimed this achievement' },
        { status: 400 }
      )
    }

    // 3. Mint the NFT
    const account = privateKeyToAccount(PRIVATE_KEY)
    const walletClient = createWalletClient({
      account,
      chain: chilizSpicy,
      transport: http()
    })

    const hash = await walletClient.writeContract({
      address: ACHIEVEMENTS_CONTRACT,
      abi: ACHIEVEMENTS_ABI,
      functionName: 'mintAchievement',
      args: [
        wallet as `0x${string}`,
        3, // DUEL_CHAMPION (repurposed as Leaderboard Champion)
        3, // LEGENDARY rarity
        'Leaderboard Champion',
        `Achieved #1 rank on the SuperFan leaderboard with ${topUser.total_tokens} FANFI tokens!`,
        'ipfs://QmLeaderboardChampion' // You can update this with actual IPFS URL
      ]
    })

    // 4. Record in database
    await supabase
      .from('nft_claims')
      .insert({
        user_wallet: wallet,
        nft_type: 'leaderboard_champion',
        transaction_hash: hash,
        claimed_at: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      message: 'Legendary NFT minted successfully! 🏆'
    })

  } catch (error: any) {
    console.error('Error minting NFT:', error)
    return NextResponse.json(
      { error: 'Failed to mint NFT', details: error.message },
      { status: 500 }
    )
  }
}

