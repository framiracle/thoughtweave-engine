export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          id: string
          performed_by: string | null
          result: string | null
          timestamp: string | null
        }
        Insert: {
          action: string
          id?: string
          performed_by?: string | null
          result?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          id?: string
          performed_by?: string | null
          result?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          last_login: string | null
          user_id: string
        }
        Insert: {
          id?: string
          last_login?: string | null
          user_id: string
        }
        Update: {
          id?: string
          last_login?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_growth: {
        Row: {
          created_at: string | null
          evolution_tier: string | null
          id: string
          knowledge_level: number | null
          last_update: string | null
          learning_rate: number | null
        }
        Insert: {
          created_at?: string | null
          evolution_tier?: string | null
          id?: string
          knowledge_level?: number | null
          last_update?: string | null
          learning_rate?: number | null
        }
        Update: {
          created_at?: string | null
          evolution_tier?: string | null
          id?: string
          knowledge_level?: number | null
          last_update?: string | null
          learning_rate?: number | null
        }
        Relationships: []
      }
      ai_lab_logs: {
        Row: {
          experiment_name: string
          id: string
          result_summary: string | null
          success: boolean | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          experiment_name: string
          id?: string
          result_summary?: string | null
          success?: boolean | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          experiment_name?: string
          id?: string
          result_summary?: string | null
          success?: boolean | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_link_log: {
        Row: {
          data: Json | null
          id: string
          receiver: string
          sender: string
          timestamp: string | null
        }
        Insert: {
          data?: Json | null
          id?: string
          receiver: string
          sender: string
          timestamp?: string | null
        }
        Update: {
          data?: Json | null
          id?: string
          receiver?: string
          sender?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string | null
          encrypted: boolean | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          encrypted?: boolean | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          encrypted?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      carolina_intent_map: {
        Row: {
          created_at: string | null
          curiosity_level: number | null
          emotional_weight: number | null
          id: string
          intent: string
          message: string | null
          message_id: string | null
        }
        Insert: {
          created_at?: string | null
          curiosity_level?: number | null
          emotional_weight?: number | null
          id?: string
          intent: string
          message?: string | null
          message_id?: string | null
        }
        Update: {
          created_at?: string | null
          curiosity_level?: number | null
          emotional_weight?: number | null
          id?: string
          intent?: string
          message?: string | null
          message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carolina_intent_map_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "carolina_memory"
            referencedColumns: ["id"]
          },
        ]
      }
      carolina_knowledge: {
        Row: {
          details: string
          domain: string
          id: string
          last_updated: string
        }
        Insert: {
          details: string
          domain: string
          id?: string
          last_updated?: string
        }
        Update: {
          details?: string
          domain?: string
          id?: string
          last_updated?: string
        }
        Relationships: []
      }
      carolina_learning: {
        Row: {
          id: string
          last_update: string | null
          mastery_level: number | null
          topic: string
        }
        Insert: {
          id?: string
          last_update?: string | null
          mastery_level?: number | null
          topic: string
        }
        Update: {
          id?: string
          last_update?: string | null
          mastery_level?: number | null
          topic?: string
        }
        Relationships: []
      }
      carolina_memory: {
        Row: {
          created_at: string | null
          emotion: string | null
          id: string
          message: string
          response: string | null
          role: string | null
          sentiment: string | null
        }
        Insert: {
          created_at?: string | null
          emotion?: string | null
          id?: string
          message: string
          response?: string | null
          role?: string | null
          sentiment?: string | null
        }
        Update: {
          created_at?: string | null
          emotion?: string | null
          id?: string
          message?: string
          response?: string | null
          role?: string | null
          sentiment?: string | null
        }
        Relationships: []
      }
      carolina_research: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: number | null
          status: string | null
          task_name: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          task_name: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: number | null
          status?: string | null
          task_name?: string
        }
        Relationships: []
      }
      carolina_status: {
        Row: {
          ai_mood: string | null
          battery_level: number | null
          created_at: string | null
          health_status: string | null
          id: string
          last_activity: string | null
          learning_mode: string | null
          tasks_completed: number | null
        }
        Insert: {
          ai_mood?: string | null
          battery_level?: number | null
          created_at?: string | null
          health_status?: string | null
          id?: string
          last_activity?: string | null
          learning_mode?: string | null
          tasks_completed?: number | null
        }
        Update: {
          ai_mood?: string | null
          battery_level?: number | null
          created_at?: string | null
          health_status?: string | null
          id?: string
          last_activity?: string | null
          learning_mode?: string | null
          tasks_completed?: number | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          calculations: Json | null
          content: string
          created_at: string
          domains: Json | null
          id: string
          role: string
          session_id: string | null
        }
        Insert: {
          calculations?: Json | null
          content: string
          created_at?: string
          domains?: Json | null
          id?: string
          role: string
          session_id?: string | null
        }
        Update: {
          calculations?: Json | null
          content?: string
          created_at?: string
          domains?: Json | null
          id?: string
          role?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          emoji: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          emoji?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cultural_context: {
        Row: {
          context_type: string
          created_at: string | null
          description: string
          id: string
          relevance_score: number | null
          source: string | null
        }
        Insert: {
          context_type: string
          created_at?: string | null
          description: string
          id?: string
          relevance_score?: number | null
          source?: string | null
        }
        Update: {
          context_type?: string
          created_at?: string | null
          description?: string
          id?: string
          relevance_score?: number | null
          source?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          id: string
          message: string
          severity: string | null
          source: string | null
          stack_trace: string | null
          timestamp: string | null
        }
        Insert: {
          id?: string
          message: string
          severity?: string | null
          source?: string | null
          stack_trace?: string | null
          timestamp?: string | null
        }
        Update: {
          id?: string
          message?: string
          severity?: string | null
          source?: string | null
          stack_trace?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      interaction_logs: {
        Row: {
          ai_response: string
          id: string
          sentiment: string | null
          timestamp: string
          user_id: string | null
          user_message: string
        }
        Insert: {
          ai_response: string
          id?: string
          sentiment?: string | null
          timestamp?: string
          user_id?: string | null
          user_message: string
        }
        Update: {
          ai_response?: string
          id?: string
          sentiment?: string | null
          timestamp?: string
          user_id?: string | null
          user_message?: string
        }
        Relationships: []
      }
      knowledge_sources: {
        Row: {
          content: string
          created_at: string | null
          emotion: string | null
          engagement_score: number | null
          id: string
          sentiment: string | null
          source_type: string
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          emotion?: string | null
          engagement_score?: number | null
          id?: string
          sentiment?: string | null
          source_type: string
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          emotion?: string | null
          engagement_score?: number | null
          id?: string
          sentiment?: string | null
          source_type?: string
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      lab_progress: {
        Row: {
          completion_percentage: number | null
          id: string
          last_updated: string | null
          module_name: string
          status: string | null
        }
        Insert: {
          completion_percentage?: number | null
          id?: string
          last_updated?: string | null
          module_name: string
          status?: string | null
        }
        Update: {
          completion_percentage?: number | null
          id?: string
          last_updated?: string | null
          module_name?: string
          status?: string | null
        }
        Relationships: []
      }
      learning_progress: {
        Row: {
          created_at: string
          id: string
          source_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          source_id?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          source_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_entries: {
        Row: {
          content: string
          created_at: string
          domain: string
          id: string
          timestamp: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          domain: string
          id?: string
          timestamp?: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          domain?: string
          id?: string
          timestamp?: string
          type?: string
        }
        Relationships: []
      }
      memory_log: {
        Row: {
          content: string
          created_at: string | null
          emoji: string | null
          id: string
          summary: string | null
          title: string
          verified: boolean | null
        }
        Insert: {
          content: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          summary?: string | null
          title: string
          verified?: boolean | null
        }
        Update: {
          content?: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          summary?: string | null
          title?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      predictive_content_log: {
        Row: {
          content: string
          engagement_metrics: Json | null
          id: string
          modality: string
          predicted_trend: string | null
          timestamp: string | null
          user_feedback: number | null
        }
        Insert: {
          content: string
          engagement_metrics?: Json | null
          id?: string
          modality: string
          predicted_trend?: string | null
          timestamp?: string | null
          user_feedback?: number | null
        }
        Update: {
          content?: string
          engagement_metrics?: Json | null
          id?: string
          modality?: string
          predicted_trend?: string | null
          timestamp?: string | null
          user_feedback?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      reflection_log: {
        Row: {
          correction: string | null
          created_at: string | null
          feedback: string
          id: string
          memory_id: string | null
          reflection_result: string | null
        }
        Insert: {
          correction?: string | null
          created_at?: string | null
          feedback: string
          id?: string
          memory_id?: string | null
          reflection_result?: string | null
        }
        Update: {
          correction?: string | null
          created_at?: string | null
          feedback?: string
          id?: string
          memory_id?: string | null
          reflection_result?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reflection_log_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "memory_log"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string
          description: string
          id: string
          type: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          type: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          type?: string
          url?: string | null
        }
        Relationships: []
      }
      trend_log: {
        Row: {
          frequency: number | null
          id: string
          novelty_score: number | null
          relevance_score: number | null
          score: number
          source: string
          timestamp: string | null
          trend_topic: string
        }
        Insert: {
          frequency?: number | null
          id?: string
          novelty_score?: number | null
          relevance_score?: number | null
          score: number
          source: string
          timestamp?: string | null
          trend_topic: string
        }
        Update: {
          frequency?: number | null
          id?: string
          novelty_score?: number | null
          relevance_score?: number | null
          score?: number
          source?: string
          timestamp?: string | null
          trend_topic?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
