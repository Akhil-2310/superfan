import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

// GET /api/duels - Fetch available duels
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    const status = searchParams.get('status') || 'open'
    
    const supabase = createClient()

    let query = supabase
      .from('duels')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (wallet) {
      query = query.or(`creator_wallet.eq.${wallet},opponent_wallet.eq.${wallet}`)
    }

    const { data: duels, error } = await query.limit(20)

    if (error) {
      console.error('Error fetching duels:', error)
      return NextResponse.json({ error: 'Failed to fetch duels' }, { status: 500 })
    }

    return NextResponse.json({ duels: duels || [] })
  } catch (error) {
    console.error('Error in GET /api/duels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/duels - Create a new duel
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wallet, duelType, stakeAmount, challengeData, opponentWallet } = body

    if (!wallet || !duelType || !stakeAmount || !challengeData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verify user has enough tokens
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('total_tokens')
      .eq('wallet_address', wallet)
      .single()

    if (userError || !user || user.total_tokens < stakeAmount) {
      return NextResponse.json(
        { error: 'Insufficient tokens' },
        { status: 400 }
      )
    }

    // Deduct stake from creator's balance
    await supabase
      .from('users')
      .update({
        total_tokens: user.total_tokens - stakeAmount,
      })
      .eq('wallet_address', wallet)

    // Create duel
    const { data: duel, error: createError } = await supabase
      .from('duels')
      .insert({
        duel_type: duelType,
        creator_wallet: wallet,
        opponent_wallet: opponentWallet || null,
        status: 'open',
        stake_amount: stakeAmount,
        total_pot: stakeAmount, // Will double when opponent joins
        challenge_data: challengeData,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating duel:', createError)
      return NextResponse.json(
        { error: 'Failed to create duel' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      duel,
      message: `Duel created! Staked ${stakeAmount} tokens.`,
    })
  } catch (error) {
    console.error('Error in POST /api/duels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/duels - Join/Update a duel
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { wallet, duelId, action, answer } = body

    if (!wallet || !duelId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Fetch duel
    const { data: duel, error: duelError } = await supabase
      .from('duels')
      .select('*')
      .eq('id', duelId)
      .single()

    if (duelError || !duel) {
      return NextResponse.json({ error: 'Duel not found' }, { status: 404 })
    }

    if (action === 'join') {
      // Join an open duel
      if (duel.status !== 'open') {
        return NextResponse.json({ error: 'Duel is not open' }, { status: 400 })
      }

      if (duel.creator_wallet === wallet) {
        return NextResponse.json({ error: 'Cannot join your own duel' }, { status: 400 })
      }

      // Verify user has enough tokens
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('total_tokens')
        .eq('wallet_address', wallet)
        .single()

      if (userError || !user || user.total_tokens < duel.stake_amount) {
        return NextResponse.json({ error: 'Insufficient tokens' }, { status: 400 })
      }

      // Deduct stake from opponent's balance
      await supabase
        .from('users')
        .update({
          total_tokens: user.total_tokens - duel.stake_amount,
        })
        .eq('wallet_address', wallet)

      // Update duel
      const { data: updatedDuel, error: updateError } = await supabase
        .from('duels')
        .update({
          opponent_wallet: wallet,
          status: 'active',
          total_pot: duel.stake_amount * 2,
        })
        .eq('id', duelId)
        .select()
        .single()

      if (updateError) {
        console.error('Error joining duel:', updateError)
        return NextResponse.json({ error: 'Failed to join duel' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        duel: updatedDuel,
        message: `Joined duel! Staked ${duel.stake_amount} tokens.`,
      })
    }

    if (action === 'submit_answer') {
      // Submit answer to duel
      if (duel.status !== 'active') {
        return NextResponse.json({ error: 'Duel is not active' }, { status: 400 })
      }

      const isCreator = duel.creator_wallet === wallet
      const isOpponent = duel.opponent_wallet === wallet

      if (!isCreator && !isOpponent) {
        return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
      }

      const updateField = isCreator ? 'creator_answer' : 'opponent_answer'
      
      const { error: updateError } = await supabase
        .from('duels')
        .update({
          [updateField]: answer,
        })
        .eq('id', duelId)

      if (updateError) {
        console.error('Error submitting answer:', updateError)
        return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 })
      }

      // Check if both answered, if so, determine winner
      const { data: updatedDuel } = await supabase
        .from('duels')
        .select('*')
        .eq('id', duelId)
        .single()

      if (updatedDuel && updatedDuel.creator_answer && updatedDuel.opponent_answer) {
        // Determine winner based on duel type
        const winner = determineWinner(updatedDuel)
        
        await supabase
          .from('duels')
          .update({
            status: 'completed',
            winner_wallet: winner,
            completed_at: new Date().toISOString(),
          })
          .eq('id', duelId)

        // Award winnings to winner
        if (winner) {
          const { data: winnerUser } = await supabase
            .from('users')
            .select('total_tokens')
            .eq('wallet_address', winner)
            .single()

          if (winnerUser) {
            await supabase
              .from('users')
              .update({
                total_tokens: winnerUser.total_tokens + updatedDuel.total_pot,
              })
              .eq('wallet_address', winner)

            // Create reward entry
            await supabase
              .from('user_rewards')
              .insert({
                user_wallet: winner,
                reward_type: 'duel',
                amount: updatedDuel.total_pot,
                source_id: duelId,
                source_type: 'duel',
                description: `Won duel: ${updatedDuel.duel_type}`,
                claimed: true,
                claimed_at: new Date().toISOString(),
              })
          }
        }

        return NextResponse.json({
          success: true,
          message: winner === wallet ? `You won ${updatedDuel.total_pot} tokens!` : 'Duel completed',
          winner,
          pot: updatedDuel.total_pot,
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Answer submitted! Waiting for opponent...',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in PUT /api/duels:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to determine duel winner
function determineWinner(duel: any): string | null {
  const { duel_type, challenge_data, creator_answer, opponent_answer, creator_wallet, opponent_wallet } = duel

  if (duel_type === 'prediction') {
    // For predictions, check against correct answer in challenge_data
    const correctAnswer = challenge_data.correct_answer
    
    const creatorCorrect = creator_answer?.answer === correctAnswer
    const opponentCorrect = opponent_answer?.answer === correctAnswer

    if (creatorCorrect && !opponentCorrect) return creator_wallet
    if (opponentCorrect && !creatorCorrect) return opponent_wallet
    if (creatorCorrect && opponentCorrect) {
      // Both correct, check who was faster or closer
      const creatorTime = new Date(creator_answer.timestamp).getTime()
      const opponentTime = new Date(opponent_answer.timestamp).getTime()
      return creatorTime < opponentTime ? creator_wallet : opponent_wallet
    }
    
    // Both wrong, return stake to both (draw)
    return null
  }

  if (duel_type === 'trivia') {
    // Count correct answers
    const creatorScore = creator_answer?.correct_count || 0
    const opponentScore = opponent_answer?.correct_count || 0

    if (creatorScore > opponentScore) return creator_wallet
    if (opponentScore > creatorScore) return opponent_wallet
    return null // Draw
  }

  if (duel_type === 'score_challenge') {
    // Higher score wins
    const creatorScore = creator_answer?.score || 0
    const opponentScore = opponent_answer?.score || 0

    if (creatorScore > opponentScore) return creator_wallet
    if (opponentScore > creatorScore) return opponent_wallet
    return null // Draw
  }

  return null
}

