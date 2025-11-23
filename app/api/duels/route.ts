import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// Note: Duels now work with on-chain token balances
// Database token tracking has been removed in favor of blockchain verification

// GET /api/duels - Fetch available duels
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    const status = searchParams.get('status') || 'open'
    

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

    // Note: Token staking is tracked on-chain, not in database
    // Users should have FANFI tokens in their wallet to participate
    // The actual token locking happens through smart contracts
    // For now, duels are created without upfront token deduction
    // Tokens will be handled by duel smart contract when deployed

    // Create duel (only insert columns that exist in schema)
    const { data: duel, error: createError } = await supabase
      .from('duels')
      .insert({
        duel_type: duelType,
        creator_wallet: wallet,
        opponent_wallet: opponentWallet || null,
        status: 'open',
        stake_amount: stakeAmount,
        challenge_data: challengeData,
        // Note: total_pot and expires_at columns don't exist in current schema
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

    // ===== AUTO-COMPLETE DUEL CREATION QUESTS =====
    const { data: duelQuests } = await supabase
      .from('quests')
      .select('id, title, requirements')
      .eq('category', 'engage')
      .eq('active', true)
      .ilike('title', '%duel%')

    if (duelQuests && duelQuests.length > 0) {
      for (const quest of duelQuests) {
        const { data: userQuest } = await supabase
          .from('user_quests')
          .select('*')
          .eq('user_wallet', wallet)
          .eq('quest_id', quest.id)
          .single()

        if (!userQuest) {
          await supabase
            .from('user_quests')
            .insert({
              user_wallet: wallet,
              quest_id: quest.id,
              progress: { duels_created: 1 },
              completed: true,
              completed_at: new Date().toISOString(),
            })
        }
      }
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

      // Note: Token staking is tracked on-chain, not in database
      // Users should have FANFI tokens in their wallet to join
      // The actual token locking happens through smart contracts
      // For now, duels can be joined without upfront token deduction

      // Update duel
      const { data: updatedDuel, error: updateError } = await supabase
        .from('duels')
        .update({
          opponent_wallet: wallet,
          status: 'active',
          started_at: new Date().toISOString(),
          // Note: total_pot calculated as stake_amount * 2 (not stored in DB)
        })
        .eq('id', duelId)
        .select()
        .single()

      if (updateError) {
        console.error('Error joining duel:', updateError)
        return NextResponse.json({ error: 'Failed to join duel' }, { status: 500 })
      }

      // ===== AUTO-COMPLETE DUEL JOIN QUESTS =====
      const { data: joinQuests } = await supabase
        .from('quests')
        .select('id, title')
        .eq('category', 'engage')
        .eq('active', true)
        .or('title.ilike.%join%duel%,title.ilike.%participate%')

      if (joinQuests && joinQuests.length > 0) {
        for (const quest of joinQuests) {
          const { data: userQuest } = await supabase
            .from('user_quests')
            .select('*')
            .eq('user_wallet', wallet)
            .eq('quest_id', quest.id)
            .single()

          if (!userQuest) {
            await supabase
              .from('user_quests')
              .insert({
                user_wallet: wallet,
                quest_id: quest.id,
                progress: { duels_joined: 1 },
                completed: true,
                completed_at: new Date().toISOString(),
              })
          }
        }
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

        // Award winnings to winner (on-chain)
        const totalPot = updatedDuel.stake_amount * 2
        
        if (winner) {
          // TODO: Mint tokens on-chain when duel contract is deployed
          // For now, create reward entry for tracking
          await supabase
            .from('user_rewards')
            .insert({
              user_wallet: winner,
              reward_type: 'duel',
              amount: totalPot,
              source_id: duelId,
              source_type: 'duel',
              description: `Won duel: ${updatedDuel.duel_type}`,
              claimed: false, // Will be claimed via on-chain minting later
              claimed_at: null,
            })
        }

        return NextResponse.json({
          success: true,
          message: winner === wallet ? `You won ${totalPot} tokens!` : 'Duel completed',
          winner,
          pot: totalPot,
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

