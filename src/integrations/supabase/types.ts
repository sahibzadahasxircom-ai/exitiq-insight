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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          company_name: string
          created_at: string
          id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      interview_insights: {
        Row: {
          category: Database["public"]["Enums"]["churn_category"]
          churn_reason: string
          company_id: string
          confidence_score: number
          competitor_mentioned: string | null
          created_at: string
          executive_summary: string
          id: string
          journey_failure_point: Database["public"]["Enums"]["journey_failure_point"]
          missing_features: string[]
          onboarding_issue: boolean
          pricing_issue: boolean
          quote: string
          recommended_actions: string[]
          retention_opportunity: string
          secondary_reasons: string[]
          sentiment: Database["public"]["Enums"]["sentiment"]
          session_id: string
          support_issue: boolean
          summary: string
          suggestions: string[]
          tags: string[]
          root_cause: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["churn_category"]
          churn_reason?: string
          company_id: string
          confidence_score?: number
          competitor_mentioned?: string | null
          created_at?: string
          executive_summary?: string
          id?: string
          journey_failure_point?: Database["public"]["Enums"]["journey_failure_point"]
          missing_features?: string[]
          onboarding_issue?: boolean
          pricing_issue?: boolean
          quote?: string
          recommended_actions?: string[]
          retention_opportunity?: string
          secondary_reasons?: string[]
          sentiment?: Database["public"]["Enums"]["sentiment"]
          session_id: string
          support_issue?: boolean
          summary?: string
          suggestions?: string[]
          tags?: string[]
          root_cause?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["churn_category"]
          churn_reason?: string
          company_id?: string
          confidence_score?: number
          competitor_mentioned?: string | null
          created_at?: string
          executive_summary?: string
          id?: string
          journey_failure_point?: Database["public"]["Enums"]["journey_failure_point"]
          missing_features?: string[]
          onboarding_issue?: boolean
          pricing_issue?: boolean
          quote?: string
          recommended_actions?: string[]
          retention_opportunity?: string
          secondary_reasons?: string[]
          sentiment?: Database["public"]["Enums"]["sentiment"]
          session_id?: string
          support_issue?: boolean
          summary?: string
          suggestions?: string[]
          tags?: string[]
          root_cause?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_insights_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_features: {
        Row: {
          id: string
          company_id: string
          feature_name: string
          feature_description: string | null
          feature_category: string
          status: string
          launch_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          feature_name: string
          feature_description?: string | null
          feature_category?: string
          status?: string
          launch_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          feature_name?: string
          feature_description?: string | null
          feature_category?: string
          status?: string
          launch_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_features_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_updates: {
        Row: {
          id: string
          company_id: string
          update_type: string
          title: string
          description: string
          impact_level: string
          published_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          update_type: string
          title: string
          description: string
          impact_level?: string
          published_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          update_type?: string
          title?: string
          description?: string
          impact_level?: string
          published_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_updates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_messages: {
        Row: {
          created_at: string
          id: string
          message_content: string
          role: Database["public"]["Enums"]["interview_role"]
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_content: string
          role: Database["public"]["Enums"]["interview_role"]
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_content?: string
          role?: Database["public"]["Enums"]["interview_role"]
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          interview_progress: Database["public"]["Enums"]["interview_progress"]
          interview_status: Database["public"]["Enums"]["interview_status"]
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          interview_progress?: Database["public"]["Enums"]["interview_progress"]
          interview_status?: Database["public"]["Enums"]["interview_status"]
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          interview_progress?: Database["public"]["Enums"]["interview_progress"]
          interview_status?: Database["public"]["Enums"]["interview_status"]
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          full_name?: string
          id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _company_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      user_company_id: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "owner" | "member"
      interview_progress:
        | "started"
        | "discovery"
        | "deep_dive"
        | "root_cause"
        | "completed"
      interview_role: "assistant" | "user"
      interview_status: "active" | "completed" | "abandoned"
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
      app_role: ["owner", "member"],
      interview_progress: [
        "started",
        "discovery",
        "deep_dive",
        "root_cause",
        "completed",
      ],
      interview_role: ["assistant", "user"],
      interview_status: ["active", "completed", "abandoned"],
    },
  },
} as const
