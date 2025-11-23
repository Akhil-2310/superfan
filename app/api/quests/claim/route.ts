import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

// POST /api/quests/claim - Claim quest rewards
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

    const supabase = createClient()

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

    // Update user's total tokens
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        total_tokens: supabase.rpc('increment', { x: userQuest.quests.reward_amount }),
      })
      .eq('wallet_address', wallet)

    if (userUpdateError) {
      console.error('Error updating user tokens:', userUpdateError)
    }

    // Update reward entry
    const { error: rewardUpdateError } = await supabase
      .from('user_rewards')
      .update({
        claimed: true,
        claimed_at: new Date().toISOString(),
      })
      .eq('user_wallet', wallet)
      .eq('source_id', questId)
      .eq('source_type', 'quest')

    if (rewardUpdateError) {
      console.error('Error updating reward entry:', rewardUpdateError)
    }

    return NextResponse.json({
      success: true,
      reward: userQuest.quests.reward_amount,
      message: `Claimed ${userQuest.quests.reward_amount} FANFI tokens!`,
    })
  } catch (error) {
    console.error('Error in POST /api/quests/claim:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

