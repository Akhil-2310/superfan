import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

/**
 * POST /api/quests/complete
 * Automatically complete quests based on user actions
 */
export async function POST(request: Request) {
  try {
    const { wallet, action, data } = await request.json()

    if (!wallet || !action) {
      return NextResponse.json(
        { error: 'Wallet and action required' },
        { status: 400 }
      )
    }

    // Check which quests can be completed based on action
    let completedQuests: any[] = []

    switch (action) {
      case 'profile_complete':
        completedQuests = await completeQuestsByType(wallet, 'profile_complete')
        break
      
      case 'watch':
        completedQuests = await handleWatchQuests(wallet, data)
        break
      
      case 'prediction':
        completedQuests = await handlePredictionQuests(wallet, data)
        break
      
      case 'duel_win':
        completedQuests = await handleDuelQuests(wallet, data)
        break
      
      case 'stake':
        completedQuests = await handleStakeQuests(wallet, data)
        break
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      completedQuests,
      message: `Completed ${completedQuests.length} quest(s)!`,
    })
  } catch (error) {
    console.error('Error in POST /api/quests/complete:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function completeQuestsByType(wallet: string, type: string) {
  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('active', true)
    .contains('requirements', { type })

  const completed = []
  for (const quest of quests || []) {
    const result = await markQuestComplete(wallet, quest.id)
    if (result) completed.push(result)
  }
  return completed
}

async function handleWatchQuests(wallet: string, data: { minutes?: number, matches?: number }) {
  // Get user's total watch stats
  const { data: sessions } = await supabase
    .from('watch_sessions')
    .select('watch_time_seconds')
    .eq('user_wallet', wallet)
    .eq('is_active', false)

  const totalMinutes = (sessions || []).reduce((sum, s) => sum + (s.watch_time_seconds || 0), 0) / 60
  const totalMatches = (sessions || []).length

  // Check all watch quests
  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('active', true)
    .eq('category', 'watch')

  const completed = []
  for (const quest of quests || []) {
    const req = quest.requirements as any
    if (req.type === 'watch') {
      if (req.minutes && totalMinutes >= req.minutes) {
        const result = await markQuestComplete(wallet, quest.id)
        if (result) completed.push(result)
      }
      if (req.matches && totalMatches >= req.matches) {
        const result = await markQuestComplete(wallet, quest.id)
        if (result) completed.push(result)
      }
    }
  }
  return completed
}

async function handlePredictionQuests(wallet: string, data: { correct?: boolean }) {
  // Get user's prediction stats
  const { data: predictions } = await supabase
    .from('user_predictions')
    .select('correct')
    .eq('user_wallet', wallet)

  const totalPredictions = (predictions || []).length
  const correctPredictions = (predictions || []).filter(p => p.correct).length
  
  // Calculate streak
  let currentStreak = 0
  for (let i = predictions.length - 1; i >= 0; i--) {
    if (predictions[i].correct) currentStreak++
    else break
  }

  // Check all prediction quests
  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('active', true)
    .eq('category', 'prediction')

  const completed = []
  for (const quest of quests || []) {
    const req = quest.requirements as any
    if (req.type === 'prediction' && totalPredictions >= (req.count || 0)) {
      const result = await markQuestComplete(wallet, quest.id)
      if (result) completed.push(result)
    }
    if (req.type === 'prediction_streak' && currentStreak >= (req.count || 0)) {
      const result = await markQuestComplete(wallet, quest.id)
      if (result) completed.push(result)
    }
  }
  return completed
}

async function handleDuelQuests(wallet: string, data: any) {
  // Get user's duel win count
  const { data: duels } = await supabase
    .from('duels')
    .select('*')
    .eq('winner_wallet', wallet)
    .eq('status', 'completed')

  const totalWins = (duels || []).length

  // Check all duel quests
  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('active', true)
    .contains('requirements', { type: 'duel_wins' })

  const completed = []
  for (const quest of quests || []) {
    const req = quest.requirements as any
    if (totalWins >= (req.count || 0)) {
      const result = await markQuestComplete(wallet, quest.id)
      if (result) completed.push(result)
    }
  }
  return completed
}

async function handleStakeQuests(wallet: string, data: { amount?: number }) {
  // Check stake quests (assuming we track staking in users table)
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', wallet)
    .single()

  if (!user) return []

  // Get staking amount from contract or database
  const stakedAmount = data?.amount || 0

  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('active', true)
    .contains('requirements', { type: 'stake' })

  const completed = []
  for (const quest of quests || []) {
    const req = quest.requirements as any
    if (stakedAmount >= (req.amount || 0)) {
      const result = await markQuestComplete(wallet, quest.id)
      if (result) completed.push(result)
    }
  }
  return completed
}

async function markQuestComplete(wallet: string, questId: string) {
  // Check if already completed
  const { data: existing } = await supabase
    .from('user_quests')
    .select('*')
    .eq('user_wallet', wallet)
    .eq('quest_id', questId)
    .single()

  if (existing?.completed) return null

  // Mark as completed
  const { data, error } = await supabase
    .from('user_quests')
    .upsert({
      user_wallet: wallet,
      quest_id: questId,
      completed: true,
      completed_at: new Date().toISOString(),
      progress: { completed: true },
    }, {
      onConflict: 'user_wallet,quest_id'
    })
    .select('*, quests(*)')
    .single()

  if (error) {
    console.error('Error marking quest complete:', error)
    return null
  }

  // Create reward entry
  await supabase.from('user_rewards').insert({
    user_wallet: wallet,
    reward_type: 'quest',
    amount: data.quests.reward_amount,
    source_id: questId,
    source_type: 'quest',
    description: `Completed: ${data.quests.title}`,
    claimed: false,
  })

  return data
}

