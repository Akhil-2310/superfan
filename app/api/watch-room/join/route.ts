import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

/**
 * POST /api/watch-room/join
 * Record when a user joins a watch room (for watch-to-earn tracking)
 */
export async function POST(request: Request) {
  try {
    const { wallet, matchId, roomId } = await request.json()

    if (!wallet || !matchId) {
      return NextResponse.json(
        { error: 'Wallet and matchId required' },
        { status: 400 }
      )
    }

    // Record join time
    const joinTime = new Date().toISOString()

    // Create or update watch session
    const { data, error } = await supabase
      .from('watch_sessions')
      .upsert({
        user_wallet: wallet,
        match_id: matchId,
        room_id: roomId || matchId,
        join_time: joinTime,
        last_active: joinTime,
        messages_sent: 0,
        polls_participated: 0,
        is_active: true,
      }, {
        onConflict: 'user_wallet,match_id',
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating watch session:', error)
      return NextResponse.json(
        { error: 'Failed to join watch room' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      session: data,
      message: 'Joined watch room! Start earning watch time bonuses.',
    })
  } catch (error) {
    console.error('Error in POST /api/watch-room/join:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

