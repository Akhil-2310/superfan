import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

/**
 * POST /api/watch-room/leave
 * Record when a user leaves a watch room and calculate rewards
 */
export async function POST(request: Request) {
  try {
    const { wallet, matchId } = await request.json()

    if (!wallet || !matchId) {
      return NextResponse.json(
        { error: 'Wallet and matchId required' },
        { status: 400 }
      )
    }

    // Get watch session
    const { data: session, error: sessionError } = await supabase
      .from('watch_sessions')
      .select('*')
      .eq('user_wallet', wallet)
      .eq('match_id', matchId)
      .eq('is_active', true)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No active watch session found' },
        { status: 404 }
      )
    }

    // Calculate watch time (in seconds)
    const joinTime = new Date(session.join_time).getTime()
    const leaveTime = Date.now()
    const watchTimeSeconds = Math.floor((leaveTime - joinTime) / 1000)
    const watchTimeMinutes = Math.floor(watchTimeSeconds / 60)

    // Calculate rewards
    // Base: 1 FANFI per 5 minutes watched
    // Bonus: 1 FANFI per message sent
    // Bonus: 2 FANFI per poll participated
    const baseReward = Math.floor(watchTimeMinutes / 5)
    const messageBonus = session.messages_sent || 0
    const pollBonus = (session.polls_participated || 0) * 2
    const totalReward = baseReward + messageBonus + pollBonus

    // Update session
    const { error: updateError } = await supabase
      .from('watch_sessions')
      .update({
        leave_time: new Date(leaveTime).toISOString(),
        watch_time_seconds: watchTimeSeconds,
        is_active: false,
        rewards_earned: totalReward,
      })
      .eq('user_wallet', wallet)
      .eq('match_id', matchId)

    if (updateError) {
      console.error('Error updating watch session:', updateError)
    }

    // Award rewards if any earned
    if (totalReward > 0) {
      const { error: rewardError } = await supabase
        .from('user_rewards')
        .insert({
          user_wallet: wallet,
          reward_type: 'watch',
          amount: totalReward,
          source_id: matchId,
          source_type: 'watch_room',
          description: `Watched match for ${watchTimeMinutes} minutes`,
          claimed: true,
          claimed_at: new Date().toISOString(),
        })

      if (rewardError) {
        console.error('Error creating reward:', rewardError)
      }

      // Update user total tokens
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          total_tokens: supabase.raw(`COALESCE(total_tokens, 0) + ${totalReward}`),
        })
        .eq('wallet_address', wallet)

      if (userUpdateError) {
        console.error('Error updating user tokens:', userUpdateError)
      }
    }

    return NextResponse.json({
      success: true,
      watchTime: {
        seconds: watchTimeSeconds,
        minutes: watchTimeMinutes,
      },
      engagement: {
        messages: session.messages_sent || 0,
        polls: session.polls_participated || 0,
      },
      rewards: {
        base: baseReward,
        messageBonus: messageBonus,
        pollBonus: pollBonus,
        total: totalReward,
      },
      message: `Earned ${totalReward} FANFI for watching!`,
    })
  } catch (error) {
    console.error('Error in POST /api/watch-room/leave:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

