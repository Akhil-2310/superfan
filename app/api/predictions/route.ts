import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// GET /api/predictions - Fetch available predictions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    

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
      matchId,
      predictedWinner,
      confidence,
      stakeAmount,
      homeTeam,
      awayTeam,
      matchDate,
      competition,
    } = body

    if (!wallet || !matchId || !predictedWinner || !stakeAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // First, ensure the match exists in match_predictions table (or create it)
    let matchPrediction = null
    const { data: existingMatch } = await supabase
      .from('match_predictions')
      .select('*')
      .eq('match_id', matchId)
      .single()

    if (existingMatch) {
      matchPrediction = existingMatch
    } else {
      // Create match prediction entry
      const bettingClosesAt = new Date(matchDate || Date.now())
      bettingClosesAt.setHours(bettingClosesAt.getHours() - 1) // Close betting 1 hour before match

      const { data: newMatch, error: matchError } = await supabase
        .from('match_predictions')
        .insert({
          match_id: matchId,
          home_team: homeTeam || 'Team A',
          away_team: awayTeam || 'Team B',
          match_date: matchDate || new Date().toISOString(),
          betting_closes_at: bettingClosesAt.toISOString(),
          finalized: false,
        })
        .select()
        .single()

      if (matchError) {
        console.error('Error creating match prediction:', matchError)
        return NextResponse.json(
          { error: 'Failed to create match' },
          { status: 500 }
        )
      }
      matchPrediction = newMatch
    }

    // Check if user already predicted for this match
    const { data: existingUserPrediction } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('user_wallet', wallet)
      .eq('prediction_id', matchPrediction.id)
      .single()

    if (existingUserPrediction) {
      return NextResponse.json(
        { error: 'Already predicted for this match' },
        { status: 400 }
      )
    }

    // Normalize predicted winner to 'home', 'away', or 'draw'
    let normalizedWinner = 'home'
    if (predictedWinner.toLowerCase() === homeTeam?.toLowerCase()) {
      normalizedWinner = 'home'
    } else if (predictedWinner.toLowerCase() === awayTeam?.toLowerCase()) {
      normalizedWinner = 'away'
    } else if (predictedWinner === 'home' || predictedWinner === 'away' || predictedWinner === 'draw') {
      normalizedWinner = predictedWinner
    }

    // Create user prediction
    const { data: userPrediction, error: createError } = await supabase
      .from('user_predictions')
      .insert({
        user_wallet: wallet,
        prediction_id: matchPrediction.id,
        predicted_winner: normalizedWinner,
        stake_amount: stakeAmount,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating user prediction:', createError)
      return NextResponse.json(
        { error: 'Failed to create prediction' },
        { status: 500 }
      )
    }

    // ===== AUTO-COMPLETE PREDICTION QUESTS =====
    // Check for prediction-related quests
    const { data: predictionQuests } = await supabase
      .from('quests')
      .select('id')
      .eq('category', 'prediction')
      .eq('active', true)

    if (predictionQuests && predictionQuests.length > 0) {
      for (const quest of predictionQuests) {
        // Check if user already has this quest
        const { data: userQuest } = await supabase
          .from('user_quests')
          .select('*')
          .eq('user_wallet', wallet)
          .eq('quest_id', quest.id)
          .single()

        if (!userQuest) {
          // Create quest progress entry
          await supabase
            .from('user_quests')
            .insert({
              user_wallet: wallet,
              quest_id: quest.id,
              progress: { predictions_made: 1 },
              completed: true,
              completed_at: new Date().toISOString(),
            })
        } else if (!userQuest.completed) {
          // Update progress
          const currentProgress = userQuest.progress || {}
          const predictionsMade = (currentProgress.predictions_made || 0) + 1
          
          await supabase
            .from('user_quests')
            .update({
              progress: { predictions_made: predictionsMade },
              completed: true,
              completed_at: new Date().toISOString(),
            })
            .eq('id', userQuest.id)
        }
      }
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

