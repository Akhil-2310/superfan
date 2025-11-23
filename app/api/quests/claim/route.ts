import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { mintFanfiReward } from '@/lib/blockchain/mint-rewards'

// POST /api/quests/claim - Claim quest rewards (ON-CHAIN)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wallet, questId } = body

    if (!wallet || !questId) {
      return NextResponse.json(
        { error: 'Wallet and questId required' },
        { status: 400 }
      )
    }

    // Verify quest is completed but not claimed
    const { data: userQuest, error: questError } = await supabase
      .from('user_quests')
      .select('*, quests(*)')
      .eq('user_wallet', wallet)
      .eq('quest_id', questId)
      .eq('completed', true)
      .eq('reward_claimed', false)
      .single()

    if (questError || !userQuest) {
      return NextResponse.json(
        { error: 'Quest not found or already claimed' },
        { status: 404 }
      )
    }

    const rewardAmount = userQuest.quests.reward_amount
    const questTitle = userQuest.quests.title

    // ===== MINT TOKENS ON-CHAIN =====
    console.log(`🪙 Minting ${rewardAmount} FANFI to ${wallet} for quest: ${questTitle}`)
    
    const mintResult = await mintFanfiReward(
      wallet,
      rewardAmount,
      `Quest Reward: ${questTitle}`
    )

    if (!mintResult.success) {
      console.error('Failed to mint tokens:', mintResult.error)
      
      // If minting fails but it's because of missing config, continue (dev mode)
      if (!mintResult.error?.includes('not configured')) {
        return NextResponse.json(
          { error: `Failed to mint tokens: ${mintResult.error}` },
          { status: 500 }
        )
      }
    }

    // Mark reward as claimed in user_quests
    const { error: updateError } = await supabase
      .from('user_quests')
      .update({
        reward_claimed: true,
        reward_claimed_at: new Date().toISOString(),
      })
      .eq('user_wallet', wallet)
      .eq('quest_id', questId)

    if (updateError) {
      console.error('Error claiming reward:', updateError)
      return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 })
    }

    // Update user's total tokens in database (for tracking)
    const { data: currentUser } = await supabase
      .from('users')
      .select('total_tokens')
      .eq('wallet_address', wallet)
      .single()

    if (currentUser) {
      await supabase
        .from('users')
        .update({
          total_tokens: (currentUser.total_tokens || 0) + rewardAmount,
        })
        .eq('wallet_address', wallet)
    }

    // Update reward entry
    await supabase
      .from('user_rewards')
      .update({
        claimed: true,
        claimed_at: new Date().toISOString(),
      })
      .eq('user_wallet', wallet)
      .eq('source_id', questId)
      .eq('source_type', 'quest')

    return NextResponse.json({
      success: true,
      reward: rewardAmount,
      txHash: mintResult.txHash,
      message: `Claimed ${rewardAmount} FANFI tokens!`,
      onChain: !!mintResult.txHash && !mintResult.error?.includes('not configured'),
    })
  } catch (error) {
    console.error('Error in POST /api/quests/claim:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

