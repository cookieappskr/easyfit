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
      categories: {
        Row: {
          value: string | null
          description: string | null
          additional_attribute1: string | null
          additional_attribute2: string | null
          additional_attribute3: string | null
          code: string
          created_at: string
          display_order: number
          id: number
          is_active: boolean
          name: string
          parent_id: number | null
          updated_at: string
        }
        Insert: {
          value?: string | null
          description?: string | null
          additional_attribute1?: string | null
          additional_attribute2?: string | null
          additional_attribute3?: string | null
          code: string
          created_at?: string
          display_order?: number
          id?: never
          is_active?: boolean
          name: string
          parent_id?: number | null
          updated_at?: string
        }
        Update: {
          value?: string | null
          description?: string | null
          additional_attribute1?: string | null
          additional_attribute2?: string | null
          additional_attribute3?: string | null
          code?: string
          created_at?: string
          display_order?: number
          id?: never
          is_active?: boolean
          name?: string
          parent_id?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string
          description: string
          exercise_type: string
          id: number
          mechanic_type: string
          name: string
          quick_guide: string[] | null
          updated_at: string
          video_link: string | null
        }
        Insert: {
          created_at?: string
          description: string
          exercise_type: string
          id?: never
          mechanic_type: string
          name: string
          quick_guide?: string[] | null
          updated_at?: string
          video_link?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          exercise_type?: string
          id?: never
          mechanic_type?: string
          name?: string
          quick_guide?: string[] | null
          updated_at?: string
          video_link?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          birth_year: number | null
          created_at: string
          email: string
          gender: Database["public"]["Enums"]["gender_types"] | null
          height: number | null
          id: string
          nickname: string
          role: Database["public"]["Enums"]["role_types"] | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          avatar?: string | null
          birth_year?: number | null
          created_at?: string
          email: string
          gender?: Database["public"]["Enums"]["gender_types"] | null
          height?: number | null
          id: string
          nickname: string
          role?: Database["public"]["Enums"]["role_types"] | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          avatar?: string | null
          birth_year?: number | null
          created_at?: string
          email?: string
          gender?: Database["public"]["Enums"]["gender_types"] | null
          height?: number | null
          id?: string
          nickname?: string
          role?: Database["public"]["Enums"]["role_types"] | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      workout_plan_prompts: {
        Row: {
          base_prompt: string
          created_at: string
          id: number
          is_active: boolean
          llm_model_code: string
          output_format: string
          title: string
          updated_at: string
        }
        Insert: {
          base_prompt: string
          created_at?: string
          id?: never
          is_active?: boolean
          llm_model_code: string
          output_format: string
          title: string
          updated_at?: string
        }
        Update: {
          base_prompt?: string
          created_at?: string
          id?: never
          is_active?: boolean
          llm_model_code?: string
          output_format?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gender_types: "male" | "female"
      role_types: "admin" | "user" | "other"
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
      gender_types: ["male", "female"],
      role_types: ["admin", "user", "other"],
    },
  },
} as const
