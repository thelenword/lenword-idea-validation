export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          username: string | null
          bio: string | null
          role: 'founder' | 'investor' | 'admin'
          created_at: string
          updated_at: string
          preferences: Json | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          username?: string | null
          bio?: string | null
          role?: 'founder' | 'investor' | 'admin'
          created_at?: string
          updated_at?: string
          preferences?: Json | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          username?: string | null
          bio?: string | null
          role?: 'founder' | 'investor' | 'admin'
          created_at?: string
          updated_at?: string
          preferences?: Json | null
        }
      }
      startups: {
        Row: {
          id: string
          founder_id: string
          name: string
          one_liner: string | null
          status: 'draft' | 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          founder_id: string
          name: string
          one_liner?: string | null
          status?: 'draft' | 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          founder_id?: string
          name?: string
          one_liner?: string | null
          status?: 'draft' | 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      questionnaire_responses: {
        Row: {
          id: string
          startup_id: string
          answers: Json
          submitted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          answers?: Json
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          answers?: Json
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      validation_reports: {
        Row: {
          id: string
          startup_id: string
          meta: Json
          scorecard: Json
          dimensions: Json
          assumptions_risk_matrix: Json
          failure_modes: Json
          risk_flags: Json
          next_moves: Json
          swot: Json
          market_validation: Json
          solution_feasibility: Json
          competitive_landscape: Json
          product_roadmap: Json
          deep_narrative_summary: string
          provider: string | null
          created_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          meta: Json
          scorecard: Json
          dimensions: Json
          assumptions_risk_matrix: Json
          failure_modes: Json
          risk_flags: Json
          next_moves: Json
          swot: Json
          market_validation: Json
          solution_feasibility: Json
          competitive_landscape: Json
          product_roadmap: Json
          deep_narrative_summary: string
          provider?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          meta?: Json
          scorecard?: Json
          dimensions?: Json
          assumptions_risk_matrix?: Json
          failure_modes?: Json
          risk_flags?: Json
          next_moves?: Json
          swot?: Json
          market_validation?: Json
          solution_feasibility?: Json
          competitive_landscape?: Json
          product_roadmap?: Json
          deep_narrative_summary?: string
          provider?: string | null
          created_at?: string
        }
      }
      pitch_deck_uploads: {
        Row: {
          id: string
          investor_id: string
          startup_name: string
          file_path: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          uploaded_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          investor_id: string
          startup_name: string
          file_path: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          uploaded_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          investor_id?: string
          startup_name?: string
          file_path?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          uploaded_at?: string
          updated_at?: string
        }
      }
      investor_reports: {
        Row: {
          id: string
          pitch_deck_id: string
          executive_summary: string | null
          market_analysis: Json | null
          financial_projections: Json | null
          team_evaluation: Json | null
          risk_assessment: Json | null
          investment_verdict: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pitch_deck_id: string
          executive_summary?: string | null
          market_analysis?: Json | null
          financial_projections?: Json | null
          team_evaluation?: Json | null
          risk_assessment?: Json | null
          investment_verdict?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pitch_deck_id?: string
          executive_summary?: string | null
          market_analysis?: Json | null
          financial_projections?: Json | null
          team_evaluation?: Json | null
          risk_assessment?: Json | null
          investment_verdict?: string | null
          created_at?: string
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
      user_role: 'founder' | 'investor' | 'admin'
      startup_status: 'draft' | 'active' | 'inactive'
      deck_status: 'pending' | 'processing' | 'completed' | 'failed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
