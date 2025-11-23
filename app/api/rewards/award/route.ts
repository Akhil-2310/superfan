import { NextRequest, NextResponse } from 'next/server'
import { awardReward, canReceiveReward } from '@/lib/api/rewards'
import type { RewardAction } from '@/lib/api/rewards'
import type { Address } from 'viem'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, walletAddress, action, metadata, cooldownMinutes } = body

    if (!userId || !walletAddress || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userId, walletAddress, action',
        },
        { status: 400 }
      )
    }

    // Check cooldown if specified
    if (cooldownMinutes && cooldownMinutes > 0) {
      const canReceive = await canReceiveReward(userId, action as RewardAction, cooldownMinutes)
      
      if (!canReceive) {
        return NextResponse.json(
          {
            success: false,
            error: 'Reward on cooldown',
            cooldownMinutes,
          },
          { status: 429 }
        )
      }
    }

    const result = await awardReward(
      userId,
      walletAddress as Address,
      action as RewardAction,
      metadata || {}
    )

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to award reward',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      tokens: result.tokens,
      points: result.points,
      action,
    })
  } catch (error) {
    console.error('Error in reward endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

