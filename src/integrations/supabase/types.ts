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
      applications: {
        Row: {
          created_at: string
          freelancer_id: string
          id: string
          job_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          freelancer_id: string
          id?: string
          job_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          freelancer_id?: string
          id?: string
          job_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          bairro: string | null
          budget: string | null
          cidade: string | null
          company_id: string
          created_at: string
          data_do_turno: string | null
          description: string
          estado: string | null
          id: string
          latitude: number | null
          longitude: number | null
          required_skills: string[] | null
          status: string | null
          title: string
          valor_da_diaria: number | null
        }
        Insert: {
          bairro?: string | null
          budget?: string | null
          cidade?: string | null
          company_id: string
          created_at?: string
          data_do_turno?: string | null
          description: string
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          required_skills?: string[] | null
          status?: string | null
          title: string
          valor_da_diaria?: number | null
        }
        Update: {
          bairro?: string | null
          budget?: string | null
          cidade?: string | null
          company_id?: string
          created_at?: string
          data_do_turno?: string | null
          description?: string
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          required_skills?: string[] | null
          status?: string | null
          title?: string
          valor_da_diaria?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          application_id: string
          content: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          application_id: string
          content: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          application_id?: string
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          aceita_email: boolean
          aceita_whatsapp: boolean
          avatar_url: string | null
          bairro: string | null
          cidade: string | null
          created_at: string
          estado: string | null
          id: string
          idade: number | null
          latitude: number | null
          longitude: number | null
          name: string
          portfolio_url: string | null
          role: string
          skills: string[] | null
          telefone: string | null
        }
        Insert: {
          aceita_email?: boolean
          aceita_whatsapp?: boolean
          avatar_url?: string | null
          bairro?: string | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          id: string
          idade?: number | null
          latitude?: number | null
          longitude?: number | null
          name: string
          portfolio_url?: string | null
          role: string
          skills?: string[] | null
          telefone?: string | null
        }
        Update: {
          aceita_email?: boolean
          aceita_whatsapp?: boolean
          avatar_url?: string | null
          bairro?: string | null
          cidade?: string | null
          created_at?: string
          estado?: string | null
          id?: string
          idade?: number | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          portfolio_url?: string | null
          role?: string
          skills?: string[] | null
          telefone?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          credits: number
          freelancer_id: string
          id: string
          updated_at: string
        }
        Insert: {
          credits?: number
          freelancer_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          credits?: number
          freelancer_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallets_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string | null
          name: string | null
          portfolio_url: string | null
          role: string | null
          skills: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          portfolio_url?: string | null
          role?: string | null
          skills?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          portfolio_url?: string | null
          role?: string | null
          skills?: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_skill_rankings: {
        Args: never
        Returns: {
          cnt: number
          skill: string
        }[]
      }
      get_user_role: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
