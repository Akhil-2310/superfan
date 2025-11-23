import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// POST /api/staking/track - Track staking action and complete quests
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wallet, action, amount } = body

    if (!wallet || !action || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Only track stake actions (not unstake)
    if (action !== 'stake') {
      return NextResponse.json({ success: true, message: 'No tracking needed' })
    }

    // ===== AUTO-COMPLETE STAKING QUESTS =====
    
    // Get all staking-related quests
    const { data: stakingQuests } = await supabase
      .from('quests')
      .select('id, title, requirements, reward_amount')
      .eq('category', 'engage')
      .eq('active', true)
      .or('title.ilike.%stake%,requirements->>type.eq.stake,requirements->>type.eq.stake_big')

    if (stakingQuests && stakingQuests.length > 0) {
      for (const quest of stakingQuests) {
        const requirements = quest.requirements as any
        const requiredAmount = requirements.amount || 0

        // Check if stake amount meets quest requirements
        if (amount >= requiredAmount) {
          // Check if quest already completed
          const { data: existingQuest } = await supabase
            .from('user_quests')
            .select('*')
            .eq('user_wallet', wallet)
            .eq('quest_id', quest.id)
            .single()

          if (!existingQuest || !existingQuest.completed) {
            // Auto-complete the quest
            await supabase
              .from('user_quests')
              .upsert({
                user_wallet: wallet,
                quest_id: quest.id,
                progress: { staked_amount: amount },
                completed: true,
                completed_at: new Date().toISOString(),
              }, {
                onConflict: 'user_wallet,quest_id'
              })

            console.log(`✅ Auto-completed quest "${quest.title}" for ${wallet}`)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Staking tracked and quests updated',
    })
  } catch (error) {
    console.error('Error in POST /api/staking/track:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

