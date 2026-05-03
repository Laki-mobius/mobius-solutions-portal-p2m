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
      _app_secrets: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string
          email: string
          id: string
          session_id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          created_at?: string
          email: string
          id?: string
          session_id: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          email?: string
          id?: string
          session_id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      collaterals: {
        Row: {
          created_at: string
          file_url: string
          id: string
          linked_solution_id: string | null
          title: string
          type: Database["public"]["Enums"]["collateral_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          linked_solution_id?: string | null
          title: string
          type: Database["public"]["Enums"]["collateral_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          linked_solution_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["collateral_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaterals_linked_solution_id_fkey"
            columns: ["linked_solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaterals_linked_solution_id_fkey"
            columns: ["linked_solution_id"]
            isOneToOne: false
            referencedRelation: "solutions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      credential_reveals: {
        Row: {
          created_at: string
          email: string
          id: string
          session_id: string
          solution_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          session_id: string
          solution_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          session_id?: string
          solution_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credential_reveals_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credential_reveals_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          created_at: string
          credentials_note: string | null
          default_password_encrypted: string | null
          default_username: string | null
          description: string
          icon_url: string | null
          id: string
          solution_type: Database["public"]["Enums"]["solution_type"]
          status: Database["public"]["Enums"]["solution_status"]
          target_url: string
          thumbnail_url: string | null
          title: string
          upcoming_eta: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credentials_note?: string | null
          default_password_encrypted?: string | null
          default_username?: string | null
          description?: string
          icon_url?: string | null
          id?: string
          solution_type: Database["public"]["Enums"]["solution_type"]
          status?: Database["public"]["Enums"]["solution_status"]
          target_url: string
          thumbnail_url?: string | null
          title: string
          upcoming_eta?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credentials_note?: string | null
          default_password_encrypted?: string | null
          default_username?: string | null
          description?: string
          icon_url?: string | null
          id?: string
          solution_type?: Database["public"]["Enums"]["solution_type"]
          status?: Database["public"]["Enums"]["solution_status"]
          target_url?: string
          thumbnail_url?: string | null
          title?: string
          upcoming_eta?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          email: string
          id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          session_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      solutions_public: {
        Row: {
          created_at: string | null
          credentials_note: string | null
          default_username: string | null
          description: string | null
          has_credentials: boolean | null
          icon_url: string | null
          id: string | null
          solution_type: Database["public"]["Enums"]["solution_type"] | null
          status: Database["public"]["Enums"]["solution_status"] | null
          target_url: string | null
          thumbnail_url: string | null
          title: string | null
          upcoming_eta: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credentials_note?: string | null
          default_username?: string | null
          description?: string | null
          has_credentials?: never
          icon_url?: string | null
          id?: string | null
          solution_type?: Database["public"]["Enums"]["solution_type"] | null
          status?: Database["public"]["Enums"]["solution_status"] | null
          target_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          upcoming_eta?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credentials_note?: string | null
          default_username?: string | null
          description?: string | null
          has_credentials?: never
          icon_url?: string | null
          id?: string | null
          solution_type?: Database["public"]["Enums"]["solution_type"] | null
          status?: Database["public"]["Enums"]["solution_status"] | null
          target_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          upcoming_eta?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      decrypt_credential: { Args: { _ciphertext: string }; Returns: string }
      encrypt_credential: { Args: { _plaintext: string }; Returns: string }
      set_credentials_key: { Args: { _key: string }; Returns: undefined }
    }
    Enums: {
      collateral_type: "video" | "deck" | "document"
      solution_status: "live" | "upcoming" | "archived"
      solution_type: "internal" | "external"
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
      collateral_type: ["video", "deck", "document"],
      solution_status: ["live", "upcoming", "archived"],
      solution_type: ["internal", "external"],
    },
  },
} as const
