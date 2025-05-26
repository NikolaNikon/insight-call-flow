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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
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
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
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
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
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
