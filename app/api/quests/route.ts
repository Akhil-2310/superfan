import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// GET /api/quests - Fetch active quests for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
    }

    // Fetch active quests
    const { data: quests, error: questsError } = await supabase
      .from('quests')
      .select('*')
      .eq('active', true)
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })

    if (questsError) {
      console.error('Error fetching quests:', questsError)
      return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 })
    }

    // Fetch user's quest progress
    const { data: initialUserQuests, error: userQuestsError } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_wallet', wallet)

    if (userQuestsError) {
      console.error('Error fetching user quests:', userQuestsError)
    }
    
    let userQuests = initialUserQuests

    // Check if user is verified (for auto-completing "First Steps" quest)
    const { data: userData } = await supabase
      .from('users')
      .select('self_verified, verified_name, nationality, wallet_address')
      .eq('wallet_address', wallet)
      .single()

    const isVerified = userData && userData.self_verified === true

    // Auto-complete "First Steps" quest if user is verified but not completed
    if (isVerified) {
      const firstStepsQuest = quests?.find(q => q.title === 'First Steps')
      const userFirstStepsQuest = userQuests?.find(uq => uq.quest_id === firstStepsQuest?.id)
      
      if (firstStepsQuest && !userFirstStepsQuest?.completed) {
        console.log(`Auto-completing "First Steps" quest for ${wallet}`)
        
        // Upsert synchronously
        await supabase
          .from('user_quests')
          .upsert({
            user_wallet: wallet,
            quest_id: firstStepsQuest.id,
            progress: { verified: true },
            completed: true,
            completed_at: new Date().toISOString(),
            reward_claimed: false,
          }, {
            onConflict: 'user_wallet,quest_id'
          })
        
        // Also create reward entry if not exists
        const { data: existingReward } = await supabase
          .from('user_rewards')
          .select('id')
          .eq('user_wallet', wallet)
          .eq('source_id', firstStepsQuest.id)
          .eq('source_type', 'quest')
          .single()
        
        if (!existingReward) {
          await supabase
            .from('user_rewards')
            .insert({
              user_wallet: wallet,
              reward_type: 'quest',
              amount: firstStepsQuest.reward_amount,
              source_id: firstStepsQuest.id,
              source_type: 'quest',
              description: `Completed quest: ${firstStepsQuest.title}`,
              claimed: false,
            })
        }
        
        // Reload user quests after auto-complete
        const { data: updatedUserQuests } = await supabase
          .from('user_quests')
          .select('*')
          .eq('user_wallet', wallet)
        
        if (updatedUserQuests) {
          userQuests = updatedUserQuests
        }
      }
    }

    // Merge quest data with user progress
    const questsWithProgress = quests?.map(quest => {
      const userQuest = userQuests?.find(uq => uq.quest_id === quest.id)
      
      return {
        ...quest,
        userProgress: userQuest?.progress || {},
        completed: userQuest?.completed || false,
        completedAt: userQuest?.completed_at,
        rewardClaimed: userQuest?.reward_claimed || false,
      }
    }) || []

    return NextResponse.json({ quests: questsWithProgress })
  } catch (error) {
    console.error('Error in GET /api/quests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/quests/complete - Mark a quest as completed
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wallet, questId, progress } = body

    if (!wallet || !questId) {
      return NextResponse.json(
        { error: 'Wallet and questId required' },
        { status: 400 }
      )
    }

    // Check if quest exists and is active
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('*')
      .eq('id', questId)
      .eq('active', true)
      .single()

    if (questError || !quest) {
      return NextResponse.json({ error: 'Quest not found or inactive' }, { status: 404 })
    }

    // Check if already completed
    const { data: existingQuest } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_wallet', wallet)
      .eq('quest_id', questId)
      .single()

    if (existingQuest?.completed) {
      return NextResponse.json({ error: 'Quest already completed' }, { status: 400 })
    }

    // Verify quest requirements met (implement validation logic)
    const requirementsMet = validateQuestRequirements(quest, progress)
    
    if (!requirementsMet) {
      return NextResponse.json({ error: 'Quest requirements not met' }, { status: 400 })
    }

    // Mark quest as completed
    const { data: completedQuest, error: updateError } = await supabase
      .from('user_quests')
      .upsert({
        user_wallet: wallet,
        quest_id: questId,
        progress,
        completed: true,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_wallet,quest_id'
      })
      .select()
      .single()

    if (updateError) {
      console.error('Error updating quest:', updateError)
      return NextResponse.json({ error: 'Failed to complete quest' }, { status: 500 })
    }

    // Create reward entry
    const { error: rewardError } = await supabase
      .from('user_rewards')
      .insert({
        user_wallet: wallet,
        reward_type: 'quest',
        amount: quest.reward_amount,
        source_id: questId,
        source_type: 'quest',
        description: `Completed quest: ${quest.title}`,
      })

    if (rewardError) {
      console.error('Error creating reward:', rewardError)
    }

    return NextResponse.json({
      success: true,
      quest: completedQuest,
      reward: quest.reward_amount,
    })
  } catch (error) {
    console.error('Error in POST /api/quests/complete:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to validate quest requirements
function validateQuestRequirements(quest: any, progress: any): boolean {
  const requirements = quest.requirements || {}
  
  // Example validation logic - customize based on your quest types
  if (quest.category === 'prediction' && requirements.predictions) {
    return (progress.predictionsCount || 0) >= requirements.predictions
  }
  
  if (quest.category === 'social' && requirements.shares) {
    return (progress.sharesCount || 0) >= requirements.shares
  }
  
  if (quest.category === 'engage' && requirements.actions) {
    return (progress.actionsCount || 0) >= requirements.actions
  }
  
  // Default: consider it valid if progress is provided
  return true
}

