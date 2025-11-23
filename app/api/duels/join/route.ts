import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const { duelId, opponentWallet } = await request.json()

    if (!duelId || !opponentWallet) {
      return NextResponse.json(
        { error: 'Missing required fields: duelId, opponentWallet' },
        { status: 400 }
      )
    }

    // 1. Check if duel exists and is open
    const { data: duel, error: duelError } = await supabase
      .from('duels')
      .select('*')
      .eq('id', duelId)
      .eq('status', 'open')
      .single()

    if (duelError || !duel) {
      return NextResponse.json(
        { error: 'Duel not found or not open' },
        { status: 404 }
      )
    }

    // 2. Check if user is not the creator
    if (duel.creator_wallet.toLowerCase() === opponentWallet.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot join your own duel' },
        { status: 400 }
      )
    }

    // 3. Update duel with opponent and change status to active
    const { data: updatedDuel, error: updateError } = await supabase
      .from('duels')
      .update({
        opponent_wallet: opponentWallet,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', duelId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating duel:', updateError)
      return NextResponse.json(
        { error: 'Failed to join duel' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      duel: updatedDuel,
      message: 'Successfully joined duel!',
    })
  } catch (error) {
    console.error('Error in join duel API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

