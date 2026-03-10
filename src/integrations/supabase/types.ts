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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          details: string | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          details?: string | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          details?: string | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      ai_profiles: {
        Row: {
          additional_context: string | null
          biggest_challenges: string | null
          career_goals: string | null
          conversation_history: Json | null
          created_at: string
          current_institution: string | null
          education_level: string | null
          field_of_study: string | null
          graduation_year: string | null
          help_areas: string[] | null
          id: string
          opportunity_types: string[] | null
          preferred_study_duration: string | null
          study_abroad_goals: string | null
          target_countries: string[] | null
          tools_used: string | null
          trained_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_context?: string | null
          biggest_challenges?: string | null
          career_goals?: string | null
          conversation_history?: Json | null
          created_at?: string
          current_institution?: string | null
          education_level?: string | null
          field_of_study?: string | null
          graduation_year?: string | null
          help_areas?: string[] | null
          id?: string
          opportunity_types?: string[] | null
          preferred_study_duration?: string | null
          study_abroad_goals?: string | null
          target_countries?: string[] | null
          tools_used?: string | null
          trained_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_context?: string | null
          biggest_challenges?: string | null
          career_goals?: string | null
          conversation_history?: Json | null
          created_at?: string
          current_institution?: string | null
          education_level?: string | null
          field_of_study?: string | null
          graduation_year?: string | null
          help_areas?: string[] | null
          id?: string
          opportunity_types?: string[] | null
          preferred_study_duration?: string | null
          study_abroad_goals?: string | null
          target_countries?: string[] | null
          tools_used?: string | null
          trained_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
        }
        Relationships: []
      }
      opportunity_listings: {
        Row: {
          application_link: string | null
          contact_email: string | null
          country: string | null
          created_at: string
          deadline: string | null
          description: string
          id: string
          institution_name: string
          is_active: boolean
          listing_type: string
          posted_by: string
          title: string
          updated_at: string
        }
        Insert: {
          application_link?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          id?: string
          institution_name: string
          is_active?: boolean
          listing_type: string
          posted_by: string
          title: string
          updated_at?: string
        }
        Update: {
          application_link?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          institution_name?: string
          is_active?: boolean
          listing_type?: string
          posted_by?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pathway_maps: {
        Row: {
          created_at: string
          future_goal: string
          id: string
          pathway_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          future_goal: string
          id?: string
          pathway_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          future_goal?: string
          id?: string
          pathway_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banned_at: string | null
          bio: string | null
          country: string | null
          created_at: string
          email: string | null
          field_of_study: string | null
          id: string
          name: string | null
          phone: string | null
          preferred_language: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          banned_at?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          field_of_study?: string | null
          id: string
          name?: string | null
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          banned_at?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          field_of_study?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          credits: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      is_authenticated: { Args: never; Returns: boolean }
      is_owner: { Args: { profile_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "super_admin"
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
      app_role: ["admin", "moderator", "user", "super_admin"],
    },
  },
} as const
