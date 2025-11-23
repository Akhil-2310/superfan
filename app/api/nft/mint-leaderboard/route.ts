import { NextResponse } from 'next/server'
import { createWalletClient, http, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { chilizSpicy } from '@/lib/config/chains'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ACHIEVEMENTS_CONTRACT = process.env.NEXT_PUBLIC_ACHIEVEMENTS_CONTRACT as `0x${string}`
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`

// Minimal ABI for minting (matches deployed contract)
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
        "name": "metadata",
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
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
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

    console.log('NFT Mint Request:', wallet)

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    if (!PRIVATE_KEY) {
      console.error('PRIVATE_KEY not configured')
      return NextResponse.json(
        { error: 'Server configuration error: Missing PRIVATE_KEY' },
        { status: 500 }
      )
    }

    if (!ACHIEVEMENTS_CONTRACT) {
      console.error('ACHIEVEMENTS_CONTRACT not configured')
      return NextResponse.json(
        { error: 'Server configuration error: Missing ACHIEVEMENTS_CONTRACT' },
        { status: 500 }
      )
    }

    // 1. Verify user is actually #1 on leaderboard
    const { data: topUsers, error: leaderboardError } = await supabase
      .from('users')
      .select('wallet_address, total_tokens')
      .order('total_tokens', { ascending: false })
      .limit(1)

    if (leaderboardError) {
      console.error('Leaderboard error:', leaderboardError)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard', details: leaderboardError.message },
        { status: 500 }
      )
    }

    if (!topUsers || topUsers.length === 0) {
      return NextResponse.json(
        { error: 'No users found on leaderboard' },
        { status: 404 }
      )
    }

    const topUser = topUsers[0]
    console.log('Top user:', topUser.wallet_address, 'Tokens:', topUser.total_tokens)
    
    if (topUser.wallet_address.toLowerCase() !== wallet.toLowerCase()) {
      console.log('User is not #1:', wallet, 'vs', topUser.wallet_address)
      return NextResponse.json(
        { error: 'Only the #1 user can claim this NFT' },
        { status: 403 }
      )
    }

    console.log('User verified as #1, checking for existing claim...')

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
    }) as boolean

    console.log('Has achievement already:', hasAchievement)

    if (hasAchievement) {
      return NextResponse.json(
        { error: 'You already claimed this achievement' },
        { status: 400 }
      )
    }

    console.log('Minting NFT...')

    // 3. Mint the NFT
    const account = privateKeyToAccount(PRIVATE_KEY)
    console.log('Minter account:', account.address)
    
    // Check if this account is the owner of the contract
    const contractOwner = await publicClient.readContract({
      address: ACHIEVEMENTS_CONTRACT,
      abi: ACHIEVEMENTS_ABI,
      functionName: 'owner'
    }) as `0x${string}`
    
    console.log('Contract owner:', contractOwner)
    
    if (contractOwner.toLowerCase() !== account.address.toLowerCase()) {
      console.error('Account is not contract owner!')
      return NextResponse.json(
        { 
          error: 'Server account is not authorized to mint NFTs', 
          details: `Contract owner: ${contractOwner}, Minter: ${account.address}` 
        },
        { status: 500 }
      )
    }
    
    const walletClient = createWalletClient({
      account,
      chain: chilizSpicy,
      transport: http()
    })

    // Create metadata JSON string
    const metadata = JSON.stringify({
      name: 'Leaderboard Champion',
      description: `Achieved #1 rank on the SuperFan leaderboard with ${topUser.total_tokens} FANFI tokens!`,
      image: 'ipfs://QmLeaderboardChampion',
      attributes: [
        { trait_type: 'Rank', value: '1' },
        { trait_type: 'Tokens Earned', value: topUser.total_tokens.toString() },
        { trait_type: 'Achievement Type', value: 'Leaderboard Champion' },
        { trait_type: 'Rarity', value: 'Legendary' }
      ]
    })

    const hash = await walletClient.writeContract({
      address: ACHIEVEMENTS_CONTRACT,
      abi: ACHIEVEMENTS_ABI,
      functionName: 'mintAchievement',
      args: [
        wallet as `0x${string}`,
        3, // DUEL_CHAMPION (repurposed as Leaderboard Champion)
        3, // LEGENDARY rarity
        metadata
      ]
    })

    console.log('NFT minted! Transaction hash:', hash)

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
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { 
        error: 'Failed to mint NFT', 
        details: error.message || error.toString(),
        errorType: error.name,
        cause: error.cause?.toString()
      },
      { status: 500 }
    )
  }
}

