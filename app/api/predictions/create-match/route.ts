import { NextResponse } from 'next/server'
import { createWalletClient, http, parseEther, keccak256, toBytes } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { chilizSpicy } from '@/lib/config/chains'
import { PREDICTION_MARKET_ABI } from '@/lib/contracts/prediction-market-abi'

const PREDICTION_MARKET_ADDRESS = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { matchId, lockTime, matchTime } = body

    if (!matchId || !lockTime || !matchTime) {
      return NextResponse.json(
        { error: 'Missing required fields: matchId, lockTime, matchTime' },
        { status: 400 }
      )
    }

    if (!PRIVATE_KEY) {
      console.error('PRIVATE_KEY not set in environment')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create wallet client with owner account
    const account = privateKeyToAccount(PRIVATE_KEY)
    const walletClient = createWalletClient({
      account,
      chain: chilizSpicy,
      transport: http()
    })

    // Create match on-chain
    const hash = await walletClient.writeContract({
      address: PREDICTION_MARKET_ADDRESS,
      abi: PREDICTION_MARKET_ABI,
      functionName: 'createMatch',
      args: [
        matchId,
        BigInt(lockTime),
        BigInt(matchTime)
      ]
    })

    // Generate the match ID hash (same way contract does it)
    const matchIdHash = keccak256(toBytes(matchId + matchTime.toString()))

    return NextResponse.json({
      success: true,
      transactionHash: hash,
      matchIdHash,
      message: 'Match created on-chain successfully'
    })

  } catch (error: any) {
    console.error('Error creating match on-chain:', error)
    
    // Check if match already exists
    if (error.message?.includes('Match already exists')) {
      return NextResponse.json({
        success: true,
        message: 'Match already exists on-chain'
      })
    }

    return NextResponse.json(
      { error: 'Failed to create match on-chain', details: error.message },
      { status: 500 }
    )
  }
}

