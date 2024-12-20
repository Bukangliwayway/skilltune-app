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
      choices: {
        Row: {
          choice: string | null
          created_at: string
          id: number
          is_correct: boolean | null
          quiz_card_id: number | null
        }
        Insert: {
          choice?: string | null
          created_at?: string
          id?: number
          is_correct?: boolean | null
          quiz_card_id?: number | null
        }
        Update: {
          choice?: string | null
          created_at?: string
          id?: number
          is_correct?: boolean | null
          quiz_card_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "choices_quiz_card_id_fkey"
            columns: ["quiz_card_id"]
            isOneToOne: false
            referencedRelation: "quiz_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          created_at: string
          id: number
          lesson_completed: boolean | null
          lesson_completed_at: string | null
          lesson_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          lesson_completed?: boolean | null
          lesson_completed_at?: string | null
          lesson_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          lesson_completed?: boolean | null
          lesson_completed_at?: string | null
          lesson_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          description: string | null
          id: number
          pdf_url: string | null
          sequence: number | null
          title: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          pdf_url?: string | null
          sequence?: number | null
          title?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          pdf_url?: string | null
          sequence?: number | null
          title?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          attempt_date: string | null
          created_at: string
          id: number
          is_passed: boolean | null
          quiz_deck_id: number | null
          score: number | null
          user_id: string | null
        }
        Insert: {
          attempt_date?: string | null
          created_at?: string
          id?: number
          is_passed?: boolean | null
          quiz_deck_id?: number | null
          score?: number | null
          user_id?: string | null
        }
        Update: {
          attempt_date?: string | null
          created_at?: string
          id?: number
          is_passed?: boolean | null
          quiz_deck_id?: number | null
          score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_deck_id_fkey"
            columns: ["quiz_deck_id"]
            isOneToOne: false
            referencedRelation: "quiz_decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_cards: {
        Row: {
          correct_choice_id: number | null
          created_at: string
          explanation: string | null
          id: number
          item_score: number | null
          question: string | null
          quiz_deck_id: number | null
          sequence: number | null
        }
        Insert: {
          correct_choice_id?: number | null
          created_at?: string
          explanation?: string | null
          id?: number
          item_score?: number | null
          question?: string | null
          quiz_deck_id?: number | null
          sequence?: number | null
        }
        Update: {
          correct_choice_id?: number | null
          created_at?: string
          explanation?: string | null
          id?: number
          item_score?: number | null
          question?: string | null
          quiz_deck_id?: number | null
          sequence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_cards_quiz_deck_id_fkey"
            columns: ["quiz_deck_id"]
            isOneToOne: false
            referencedRelation: "quiz_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_decks: {
        Row: {
          created_at: string
          csv_version: string | null
          description: string | null
          id: number
          lesson_id: number | null
          title: string | null
        }
        Insert: {
          created_at?: string
          csv_version?: string | null
          description?: string | null
          id?: number
          lesson_id?: number | null
          title?: string | null
        }
        Update: {
          created_at?: string
          csv_version?: string | null
          description?: string | null
          id?: number
          lesson_id?: number | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_decks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string
          created_at: string | null
          email: string
          id: string
          type: string | null
        }
        Insert: {
          avatar_url: string
          created_at?: string | null
          email: string
          id: string
          type?: string | null
        }
        Update: {
          avatar_url?: string
          created_at?: string | null
          email?: string
          id?: string
          type?: string | null
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
      types: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
