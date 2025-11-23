import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

// GET /api/predictions - Fetch available predictions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    
    const supabase = createClient()

    // Fetch open predictions (betting not closed yet)
    const { data: predictions, error: predictionsError } = await supabase
      .from('match_predictions')
      .select('*')
      .gte('betting_closes_at', new Date().toISOString())
      .eq('finalized', false)
      .order('match_date', { ascending: true })
      .limit(10)

    if (predictionsError) {
      console.error('Error fetching predictions:', predictionsError)
      return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 })
    }

    // If wallet provided, fetch user's predictions
    let userPredictions = []
    if (wallet) {
      const { data, error } = await supabase
        .from('user_predictions')
        .select('*')
        .eq('user_wallet', wallet)

      if (!error) {
        userPredictions = data || []
      }
    }

    // Calculate pool sizes for each prediction
    const predictionsWithDetails = await Promise.all(
      (predictions || []).map(async (pred) => {
        const { data: poolData } = await supabase
          .from('user_predictions')
          .select('stake_amount, predicted_winner')
          .eq('prediction_id', pred.id)

        const totalPool = poolData?.reduce((sum, p) => sum + p.stake_amount, 0) || 0
        const homeCount = poolData?.filter(p => p.predicted_winner === 'home').length || 0
        const awayCount = poolData?.filter(p => p.predicted_winner === 'away').length || 0
        const drawCount = poolData?.filter(p => p.predicted_winner === 'draw').length || 0
        
        const userPrediction = userPredictions.find(up => up.prediction_id === pred.id)

        return {
          ...pred,
          totalPool,
          predictions: {
            home: homeCount,
            away: awayCount,
            draw: drawCount,
            total: homeCount + awayCount + drawCount,
          },
          userPrediction: userPrediction || null,
        }
      })
    )

    return NextResponse.json({ predictions: predictionsWithDetails })
  } catch (error) {
    console.error('Error in GET /api/predictions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/predictions - Submit a prediction
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      wallet,
      predictionId,
      predictedWinner,
      predictedHomeScore,
      predictedAwayScore,
      confidenceLevel,
      stakeAmount,
    } = body

    if (!wallet || !predictionId || !predictedWinner) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Verify prediction exists and is open
    const { data: prediction, error: predError } = await supabase
      .from('match_predictions')
      .select('*')
      .eq('id', predictionId)
      .gte('betting_closes_at', new Date().toISOString())
      .eq('finalized', false)
      .single()

    if (predError || !prediction) {
      return NextResponse.json(
        { error: 'Prediction not found or closed' },
        { status: 404 }
      )
    }

    // Check if user already predicted
    const { data: existing } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('user_wallet', wallet)
      .eq('prediction_id', predictionId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already predicted for this match' },
        { status: 400 }
      )
    }

    // Verify user has enough tokens if staking
    if (stakeAmount > 0) {
      const { data: user } = await supabase
        .from('users')
        .select('total_tokens')
        .eq('wallet_address', wallet)
        .single()

      if (!user || user.total_tokens < stakeAmount) {
        return NextResponse.json(
          { error: 'Insufficient tokens' },
          { status: 400 }
        )
      }

      // Deduct stake from user's balance
      await supabase
        .from('users')
        .update({
          total_tokens: user.total_tokens - stakeAmount,
        })
        .eq('wallet_address', wallet)
    }

    // Calculate potential reward (simple 2x for now, can be more sophisticated)
    const potentialReward = stakeAmount * 2

    // Create prediction
    const { data: userPrediction, error: createError } = await supabase
      .from('user_predictions')
      .insert({
        user_wallet: wallet,
        prediction_id: predictionId,
        predicted_winner: predictedWinner,
        predicted_home_score: predictedHomeScore,
        predicted_away_score: predictedAwayScore,
        confidence_level: confidenceLevel || 'medium',
        stake_amount: stakeAmount || 0,
        potential_reward: potentialReward,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating prediction:', createError)
      return NextResponse.json(
        { error: 'Failed to create prediction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      prediction: userPrediction,
      message: stakeAmount > 0 
        ? `Staked ${stakeAmount} tokens. Potential reward: ${potentialReward} tokens!`
        : 'Prediction submitted!',
    })
  } catch (error) {
    console.error('Error in POST /api/predictions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

