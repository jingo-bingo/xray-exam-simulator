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
      answers: {
        Row: {
          case_id: string
          feedback: string | null
          id: string
          is_correct: boolean | null
          question_id: string
          response_text: string
          score: number | null
          submitted_at: string
          user_id: string
        }
        Insert: {
          case_id: string
          feedback?: string | null
          id?: string
          is_correct?: boolean | null
          question_id: string
          response_text: string
          score?: number | null
          submitted_at?: string
          user_id: string
        }
        Update: {
          case_id?: string
          feedback?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string
          response_text?: string
          score?: number | null
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      case_attempts: {
        Row: {
          case_id: string
          completed_at: string | null
          id: string
          score: number | null
          started_at: string
          status: Database["public"]["Enums"]["attempt_status"]
          user_id: string
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          id?: string
          score?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          user_id: string
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          id?: string
          score?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_attempts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_scans: {
        Row: {
          case_id: string
          created_at: string
          dicom_path: string
          display_order: number
          id: string
          label: string
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          dicom_path: string
          display_order?: number
          id?: string
          label: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          dicom_path?: string
          display_order?: number
          id?: string
          label?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_scans_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          age_group: Database["public"]["Enums"]["age_group"]
          case_number: string
          clinical_history: string | null
          created_at: string
          created_by: string | null
          description: string | null
          dicom_path: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id: string
          is_free_trial: boolean
          published: boolean
          region: Database["public"]["Enums"]["region_type"]
          title: string
          updated_at: string
        }
        Insert: {
          age_group: Database["public"]["Enums"]["age_group"]
          case_number: string
          clinical_history?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dicom_path?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          is_free_trial?: boolean
          published?: boolean
          region: Database["public"]["Enums"]["region_type"]
          title: string
          updated_at?: string
        }
        Update: {
          age_group?: Database["public"]["Enums"]["age_group"]
          case_number?: string
          clinical_history?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dicom_path?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          is_free_trial?: boolean
          published?: boolean
          region?: Database["public"]["Enums"]["region_type"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          case_id: string
          correct_answer: string | null
          created_at: string
          display_order: number
          explanation: string | null
          id: string
          question_text: string
          type: Database["public"]["Enums"]["question_type"]
          updated_at: string
        }
        Insert: {
          case_id: string
          correct_answer?: string | null
          created_at?: string
          display_order?: number
          explanation?: string | null
          id?: string
          question_text: string
          type: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Update: {
          case_id?: string
          correct_answer?: string | null
          created_at?: string
          display_order?: number
          explanation?: string | null
          id?: string
          question_text?: string
          type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
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
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      migrate_existing_case_scans: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      age_group: "pediatric" | "adult" | "geriatric"
      app_role: "admin" | "trainee"
      attempt_status: "in_progress" | "completed" | "failed"
      difficulty_level: "easy" | "medium" | "hard"
      question_type:
        | "report"
        | "management"
        | "multiple_choice"
        | "short_answer"
      region_type:
        | "chest"
        | "abdomen"
        | "head"
        | "musculoskeletal"
        | "cardiovascular"
        | "neuro"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      age_group: ["pediatric", "adult", "geriatric"],
      app_role: ["admin", "trainee"],
      attempt_status: ["in_progress", "completed", "failed"],
      difficulty_level: ["easy", "medium", "hard"],
      question_type: [
        "report",
        "management",
        "multiple_choice",
        "short_answer",
      ],
      region_type: [
        "chest",
        "abdomen",
        "head",
        "musculoskeletal",
        "cardiovascular",
        "neuro",
        "other",
      ],
    },
  },
} as const
