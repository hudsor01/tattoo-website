/**
 * This is a simplified type definition for the Supabase database.
 * In a production environment, you would generate this from your database schema.
 */
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
      EmailTemplate: {
        Row: {
          id: string
          name: string
          subject: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          content?: string
          updated_at?: string
        }
        Relationships: []
      }
      EmailLog: {
        Row: {
          id: string
          recipient: string
          template_id: string
          data: Json
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          recipient: string
          template_id: string
          data?: Json
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          recipient?: string
          template_id?: string
          data?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "EmailLog_template_id_fkey"
            columns: ["template_id"]
            referencedRelation: "EmailTemplate"
            referencedColumns: ["id"]
          }
        ]
      }
      EmailAutomation: {
        Row: {
          id: string
          name: string
          active: boolean
          trigger_type: string
          template_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          active?: boolean
          trigger_type: string
          template_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          active?: boolean
          trigger_type?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "EmailAutomation_template_id_fkey"
            columns: ["template_id"]
            referencedRelation: "EmailTemplate"
            referencedColumns: ["id"]
          }
        ]
      }
      Client: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          status?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}