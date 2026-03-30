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
          role: string | null
          name: string | null
          skills: string[] | null
          portfolio_url: string | null
          created_at: string
          telefone: string | null
          estado: string | null
          cidade: string | null
          bairro: string | null
          idade: number | null
          avatar_url: string | null
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          id: string
          role?: string | null
          name?: string | null
          skills?: string[] | null
          portfolio_url?: string | null
          created_at?: string
          telefone?: string | null
          estado?: string | null
          cidade?: string | null
          bairro?: string | null
          idade?: number | null
          avatar_url?: string | null
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          id?: string
          role?: string | null
          name?: string | null
          skills?: string[] | null
          portfolio_url?: string | null
          created_at?: string
          telefone?: string | null
          estado?: string | null
          cidade?: string | null
          bairro?: string | null
          idade?: number | null
          avatar_url?: string | null
          latitude?: number | null
          longitude?: number | null
        }
      }
      jobs: {
        Row: {
          id: string
          company_id: string | null
          title: string | null
          description: string | null
          budget: string | null
          required_skills: string[] | null
          status: string | null
          created_at: string
          estado: string | null
          cidade: string | null
          bairro: string | null
          data_do_turno: string | null
          valor_da_diaria: number | null
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          title?: string | null
          description?: string | null
          budget?: string | null
          required_skills?: string[] | null
          status?: string | null
          created_at?: string
          estado?: string | null
          cidade?: string | null
          bairro?: string | null
          data_do_turno?: string | null
          valor_da_diaria?: number | null
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          id?: string
          company_id?: string | null
          title?: string | null
          description?: string | null
          budget?: string | null
          required_skills?: string[] | null
          status?: string | null
          created_at?: string
          estado?: string | null
          cidade?: string | null
          bairro?: string | null
          data_do_turno?: string | null
          valor_da_diaria?: number | null
          latitude?: number | null
          longitude?: number | null
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string | null
          freelancer_id: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id?: string | null
          freelancer_id?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string | null
          freelancer_id?: string | null
          status?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          application_id: string | null
          sender_id: string | null
          content: string | null
          read: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id?: string | null
          sender_id?: string | null
          content?: string | null
          read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string | null
          sender_id?: string | null
          content?: string | null
          read?: boolean | null
          created_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          freelancer_id: string | null
          credits: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          freelancer_id?: string | null
          credits?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          freelancer_id?: string | null
          credits?: number | null
          updated_at?: string
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
