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
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          party_size: number
          status: string | null
          updated_at: string
          visit_date: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          party_size?: number
          status?: string | null
          updated_at?: string
          visit_date: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          party_size?: number
          status?: string | null
          updated_at?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          advice: string | null
          agent_performance: number | null
          audio_file_url: string | null
          communication_skills: number | null
          created_at: string
          customer_id: string | null
          date: string
          error_message: string | null
          feedback: string | null
          file_format: string | null
          file_size: number | null
          general_score: number | null
          id: string
          manager_id: string | null
          processing_status: string | null
          processing_step: string | null
          sales_technique: number | null
          summary: string | null
          task_id: string | null
          transcription: string | null
          transcription_score: number | null
          updated_at: string
          upload_progress: number | null
          user_satisfaction_index: number | null
        }
        Insert: {
          advice?: string | null
          agent_performance?: number | null
          audio_file_url?: string | null
          communication_skills?: number | null
          created_at?: string
          customer_id?: string | null
          date?: string
          error_message?: string | null
          feedback?: string | null
          file_format?: string | null
          file_size?: number | null
          general_score?: number | null
          id?: string
          manager_id?: string | null
          processing_status?: string | null
          processing_step?: string | null
          sales_technique?: number | null
          summary?: string | null
          task_id?: string | null
          transcription?: string | null
          transcription_score?: number | null
          updated_at?: string
          upload_progress?: number | null
          user_satisfaction_index?: number | null
        }
        Update: {
          advice?: string | null
          agent_performance?: number | null
          audio_file_url?: string | null
          communication_skills?: number | null
          created_at?: string
          customer_id?: string | null
          date?: string
          error_message?: string | null
          feedback?: string | null
          file_format?: string | null
          file_size?: number | null
          general_score?: number | null
          id?: string
          manager_id?: string | null
          processing_status?: string | null
          processing_step?: string | null
          sales_technique?: number | null
          summary?: string | null
          task_id?: string | null
          transcription?: string | null
          transcription_score?: number | null
          updated_at?: string
          upload_progress?: number | null
          user_satisfaction_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      clustering_logs: {
        Row: {
          cluster_method: string | null
          clusters_created: number | null
          details: Json | null
          end_time: string | null
          error_message: string | null
          id: number
          parameters: Json | null
          start_time: string | null
          status: string | null
          total_keywords: number | null
        }
        Insert: {
          cluster_method?: string | null
          clusters_created?: number | null
          details?: Json | null
          end_time?: string | null
          error_message?: string | null
          id?: number
          parameters?: Json | null
          start_time?: string | null
          status?: string | null
          total_keywords?: number | null
        }
        Update: {
          cluster_method?: string | null
          clusters_created?: number | null
          details?: Json | null
          end_time?: string | null
          error_message?: string | null
          id?: number
          parameters?: Json | null
          start_time?: string | null
          status?: string | null
          total_keywords?: number | null
        }
        Relationships: []
      }
      customer_issues: {
        Row: {
          call_id: string
          created_at: string
          id: string
          issue_description: string | null
          issue_type: string
          resolved: boolean | null
          severity: string | null
        }
        Insert: {
          call_id: string
          created_at?: string
          id?: string
          issue_description?: string | null
          issue_type: string
          resolved?: boolean | null
          severity?: string | null
        }
        Update: {
          call_id?: string
          created_at?: string
          id?: string
          issue_description?: string | null
          issue_type?: string
          resolved?: boolean | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_issues_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: string
          name: string
          phone_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_import_logs: {
        Row: {
          details: Json | null
          end_time: string | null
          error_message: string | null
          id: number
          new_keywords: number | null
          source_id: number | null
          start_time: string | null
          status: string | null
          total_keywords: number | null
          updated_keywords: number | null
        }
        Insert: {
          details?: Json | null
          end_time?: string | null
          error_message?: string | null
          id?: number
          new_keywords?: number | null
          source_id?: number | null
          start_time?: string | null
          status?: string | null
          total_keywords?: number | null
          updated_keywords?: number | null
        }
        Update: {
          details?: Json | null
          end_time?: string | null
          error_message?: string | null
          id?: number
          new_keywords?: number | null
          source_id?: number | null
          start_time?: string | null
          status?: string | null
          total_keywords?: number | null
          updated_keywords?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "data_import_logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "keyword_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      exports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          file_url: string | null
          filters: Json | null
          id: string
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          file_url?: string | null
          filters?: Json | null
          id?: string
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          file_url?: string | null
          filters?: Json | null
          id?: string
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      internal_docs: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: number
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      keyword_cluster_membership: {
        Row: {
          cluster_id: number | null
          created_at: string | null
          id: number
          is_core_term: boolean | null
          keyword_id: number | null
          similarity_score: number | null
        }
        Insert: {
          cluster_id?: number | null
          created_at?: string | null
          id?: number
          is_core_term?: boolean | null
          keyword_id?: number | null
          similarity_score?: number | null
        }
        Update: {
          cluster_id?: number | null
          created_at?: string | null
          id?: number
          is_core_term?: boolean | null
          keyword_id?: number | null
          similarity_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_cluster_membership_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "keyword_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_cluster_membership_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_clusters: {
        Row: {
          centroid_vector: string | null
          cluster_method: string | null
          created_at: string | null
          description: string | null
          id: number
          name: string | null
          parameters: Json | null
          updated_at: string | null
        }
        Insert: {
          centroid_vector?: string | null
          cluster_method?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string | null
          parameters?: Json | null
          updated_at?: string | null
        }
        Update: {
          centroid_vector?: string | null
          cluster_method?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string | null
          parameters?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      keyword_embeddings: {
        Row: {
          created_at: string | null
          embedding: string | null
          id: number
          keyword_id: number | null
          model_name: string | null
          model_version: string | null
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          id?: number
          keyword_id?: number | null
          model_name?: string | null
          model_version?: string | null
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          id?: number
          keyword_id?: number | null
          model_name?: string | null
          model_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_embeddings_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_source_data: {
        Row: {
          id: number
          imported_at: string | null
          keyword_id: number | null
          source_frequency: number | null
          source_id: number | null
          source_raw_data: Json | null
        }
        Insert: {
          id?: number
          imported_at?: string | null
          keyword_id?: number | null
          source_frequency?: number | null
          source_id?: number | null
          source_raw_data?: Json | null
        }
        Update: {
          id?: number
          imported_at?: string | null
          keyword_id?: number | null
          source_frequency?: number | null
          source_id?: number | null
          source_raw_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_source_data_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "keywords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_source_data_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "keyword_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      keyword_sources: {
        Row: {
          api_credentials: Json | null
          config: Json | null
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          api_credentials?: Json | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          api_credentials?: Json | null
          config?: Json | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      keywords: {
        Row: {
          created_at: string | null
          ctr: number | null
          difficulty: number | null
          frequency: number | null
          id: number
          phrase: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ctr?: number | null
          difficulty?: number | null
          frequency?: number | null
          id?: number
          phrase: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ctr?: number | null
          difficulty?: number | null
          frequency?: number | null
          id?: number
          phrase?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      managers: {
        Row: {
          created_at: string
          department: string | null
          id: string
          name: string
          telegram_chat_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          name: string
          telegram_chat_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          name?: string
          telegram_chat_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          data: Json | null
          file_url: string | null
          generated_at: string
          generated_by: string | null
          id: string
          parameters: Json | null
          report_type: string
          title: string
        }
        Insert: {
          data?: Json | null
          file_url?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          parameters?: Json | null
          report_type: string
          title: string
        }
        Update: {
          data?: Json | null
          file_url?: string | null
          generated_at?: string
          generated_by?: string | null
          id?: string
          parameters?: Json | null
          report_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_positions: {
        Row: {
          date: string
          position: number | null
          semantics_id: number
        }
        Insert: {
          date: string
          position?: number | null
          semantics_id: number
        }
        Update: {
          date?: string
          position?: number | null
          semantics_id?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_customer_booking_count: {
        Args: { customer_uuid: string }
        Returns: number
      }
      import_chistopar_multigroup: {
        Args: { csv_content: string }
        Returns: number
      }
      import_chistopar_semantic_core: {
        Args: { csv_content: string }
        Returns: number
      }
      import_chistopar_structured_data: {
        Args: { csv_content: string }
        Returns: number
      }
      import_keyword_groups: {
        Args: { csv_content: string }
        Returns: number
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
