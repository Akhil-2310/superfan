export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          nationality: string | null
          self_verified: boolean
          preferred_team: string | null
          fan_score: number
          total_tokens: number
          streak_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          nationality?: string | null
          self_verified?: boolean
          preferred_team?: string | null
          fan_score?: number
          total_tokens?: number
          streak_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          nationality?: string | null
          self_verified?: boolean
          preferred_team?: string | null
          fan_score?: number
          total_tokens?: number
          streak_days?: number
          created_at?: string
          updated_at?: string
        }
      }
      watch_rooms: {
        Row: {
          id: string
          match_id: string
          match_title: string
          team_home: string
          team_away: string
          league: string
          match_date: string
          status: 'upcoming' | 'live' | 'completed'
          participant_count: number
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          match_title: string
          team_home: string
          team_away: string
          league: string
          match_date: string
          status?: 'upcoming' | 'live' | 'completed'
          participant_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          match_title?: string
          team_home?: string
          team_away?: string
          league?: string
          match_date?: string
          status?: 'upcoming' | 'live' | 'completed'
          participant_count?: number
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          wallet_address: string
          username: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          wallet_address: string
          username: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          wallet_address?: string
          username?: string
          content?: string
          created_at?: string
        }
      }
      polls: {
        Row: {
          id: string
          room_id: string
          question: string
          options: Json
          vote_counts: Json
          status: 'active' | 'closed'
          created_at: string
          ends_at: string | null
        }
        Insert: {
          id?: string
          room_id: string
          question: string
          options: Json
          vote_counts?: Json
          status?: 'active' | 'closed'
          created_at?: string
          ends_at?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          question?: string
          options?: Json
          vote_counts?: Json
          status?: 'active' | 'closed'
          created_at?: string
          ends_at?: string | null
        }
      }
      poll_votes: {
        Row: {
          id: string
          poll_id: string
          user_id: string
          option_index: number
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          user_id: string
          option_index: number
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          user_id?: string
          option_index?: number
          created_at?: string
        }
      }
      room_participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          wallet_address: string
          joined_at: string
          watch_time_seconds: number
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          wallet_address: string
          joined_at?: string
          watch_time_seconds?: number
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          wallet_address?: string
          joined_at?: string
          watch_time_seconds?: number
        }
      }
      rewards: {
        Row: {
          id: string
          user_id: string
          action_type: string
          tokens_earned: number
          points_earned: number
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: string
          tokens_earned: number
          points_earned: number
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: string
          tokens_earned?: number
          points_earned?: number
          metadata?: Json
          created_at?: string
        }
      }
      staking_positions: {
        Row: {
          id: string
          user_id: string
          token_address: string
          token_symbol: string
          amount_staked: string
          apy: number
          loyalty_multiplier: number
          start_date: string
          last_claim_date: string | null
          total_rewards_claimed: string
        }
        Insert: {
          id?: string
          user_id: string
          token_address: string
          token_symbol: string
          amount_staked: string
          apy?: number
          loyalty_multiplier?: number
          start_date?: string
          last_claim_date?: string | null
          total_rewards_claimed?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_address?: string
          token_symbol?: string
          amount_staked?: string
          apy?: number
          loyalty_multiplier?: number
          start_date?: string
          last_claim_date?: string | null
          total_rewards_claimed?: string
        }
      }
      loyalty_scores: {
        Row: {
          id: string
          user_id: string
          token_address: string
          holdings_score: number
          time_weighted_score: number
          interaction_score: number
          total_score: number
          last_updated: string
        }
        Insert: {
          id?: string
          user_id: string
          token_address: string
          holdings_score?: number
          time_weighted_score?: number
          interaction_score?: number
          total_score?: number
          last_updated?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_address?: string
          holdings_score?: number
          time_weighted_score?: number
          interaction_score?: number
          total_score?: number
          last_updated?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

