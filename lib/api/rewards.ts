// Reward System - Manages token distribution and scoring

import { supabase } from '../supabase/client'
import type { Address } from 'viem'

export type RewardAction =
  | 'join_room'
  | 'chat_message'
  | 'poll_vote'
  | 'watch_time'
  | 'check_in'
  | 'daily_login'
  | 'streak_bonus'
  | 'first_watch'
  | 'social_share'

export interface RewardConfig {
  action: RewardAction
  tokens: number
  points: number
  description: string
}

// Reward configuration
export const REWARD_CONFIG: Record<RewardAction, RewardConfig> = {
  join_room: {
    action: 'join_room',
    tokens: 50,
    points: 25,
    description: 'Join a watch room',
  },
  chat_message: {
    action: 'chat_message',
    tokens: 5,
    points: 2,
    description: 'Send a chat message',
  },
  poll_vote: {
    action: 'poll_vote',
    tokens: 20,
    points: 10,
    description: 'Vote in a poll',
  },
  watch_time: {
    action: 'watch_time',
    tokens: 10,
    points: 5,
    description: 'Watch for 10 minutes',
  },
  check_in: {
    action: 'check_in',
    tokens: 1000,
    points: 500,
    description: 'Check in at stadium',
  },
  daily_login: {
    action: 'daily_login',
    tokens: 25,
    points: 10,
    description: 'Daily login bonus',
  },
  streak_bonus: {
    action: 'streak_bonus',
    tokens: 100,
    points: 50,
    description: '7-day streak bonus',
  },
  first_watch: {
    action: 'first_watch',
    tokens: 100,
    points: 50,
    description: 'First watch room joined',
  },
  social_share: {
    action: 'social_share',
    tokens: 50,
    points: 25,
    description: 'Share on social media',
  },
}

/**
 * Award tokens and points to a user
 */
export async function awardReward(
  userId: string,
  walletAddress: Address,
  action: RewardAction,
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; tokens: number; points: number; error?: string }> {
  const config = REWARD_CONFIG[action]

  if (!config) {
    return { success: false, tokens: 0, points: 0, error: 'Invalid action' }
  }

  try {
    // Insert reward record
    const { error: rewardError } = await supabase.from('rewards').insert({
      user_id: userId,
      action_type: action,
      tokens_earned: config.tokens,
      points_earned: config.points,
      metadata,
    })

    if (rewardError) throw rewardError

    // Update user totals
    const { error: updateError } = await supabase.rpc('update_user_totals', {
      p_user_id: userId,
      p_tokens: config.tokens,
      p_points: config.points,
    })

    if (updateError) {
      console.warn('User totals update failed (may need manual sync):', updateError)
    }

    return {
      success: true,
      tokens: config.tokens,
      points: config.points,
    }
  } catch (error) {
    console.error('Error awarding reward:', error)
    return {
      success: false,
      tokens: 0,
      points: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check if user can receive a specific reward (for rate-limited actions)
 */
export async function canReceiveReward(
  userId: string,
  action: RewardAction,
  cooldownMinutes: number = 0
): Promise<boolean> {
  if (cooldownMinutes === 0) return true

  try {
    const cooldownDate = new Date(Date.now() - cooldownMinutes * 60 * 1000)

    const { data, error } = await supabase
      .from('rewards')
      .select('created_at')
      .eq('user_id', userId)
      .eq('action_type', action)
      .gte('created_at', cooldownDate.toISOString())
      .limit(1)

    if (error) throw error

    return data.length === 0
  } catch (error) {
    console.error('Error checking reward eligibility:', error)
    return false
  }
}

/**
 * Get user's reward history
 */
export async function getUserRewards(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching user rewards:', error)
    return []
  }
}

/**
 * Update user's streak (call this on daily login)
 */
export async function updateUserStreak(userId: string): Promise<number> {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('streak_days, updated_at')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    const lastUpdate = new Date(user.updated_at)
    const now = new Date()
    const daysSinceUpdate = Math.floor(
      (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    )

    let newStreak = user.streak_days || 0

    if (daysSinceUpdate === 1) {
      // Consecutive day
      newStreak += 1

      // Award streak bonus every 7 days
      if (newStreak % 7 === 0) {
        await awardReward(userId, '0x0' as Address, 'streak_bonus', {
          streak: newStreak,
        })
      }
    } else if (daysSinceUpdate > 1) {
      // Streak broken
      newStreak = 1
    }
    // If same day (daysSinceUpdate === 0), keep current streak

    // Update streak
    const { error: updateError } = await supabase
      .from('users')
      .update({ streak_days: newStreak })
      .eq('id', userId)

    if (updateError) throw updateError

    return newStreak
  } catch (error) {
    console.error('Error updating streak:', error)
    return 0
  }
}

/**
 * Get leaderboard (top users by fan score)
 */
export async function getLeaderboard(limit: number = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, wallet_address, nationality, preferred_team, fan_score, total_tokens, streak_days')
      .order('fan_score', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
}

/**
 * Batch award rewards to multiple users (for room participation)
 */
export async function batchAwardRewards(
  awards: Array<{ userId: string; walletAddress: Address; action: RewardAction; metadata?: Record<string, any> }>
): Promise<{ successful: number; failed: number }> {
  let successful = 0
  let failed = 0

  for (const award of awards) {
    const result = await awardReward(
      award.userId,
      award.walletAddress,
      award.action,
      award.metadata || {}
    )

    if (result.success) {
      successful++
    } else {
      failed++
    }
  }

  return { successful, failed }
}

