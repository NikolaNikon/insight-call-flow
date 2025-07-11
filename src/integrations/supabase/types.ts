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
      call_keywords: {
        Row: {
          call_id: string | null
          detected_at: string | null
          id: string
          match_count: number | null
          matched_keywords: Json | null
          tracker_id: string | null
        }
        Insert: {
          call_id?: string | null
          detected_at?: string | null
          id?: string
          match_count?: number | null
          matched_keywords?: Json | null
          tracker_id?: string | null
        }
        Update: {
          call_id?: string | null
          detected_at?: string | null
          id?: string
          match_count?: number | null
          matched_keywords?: Json | null
          tracker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_keywords_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_keywords_tracker_id_fkey"
            columns: ["tracker_id"]
            isOneToOne: false
            referencedRelation: "keyword_trackers"
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
          org_id: string
          processing_status: string | null
          processing_step: string | null
          sales_technique: number | null
          source: string | null
          source_call_id: string | null
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
          org_id: string
          processing_status?: string | null
          processing_step?: string | null
          sales_technique?: number | null
          source?: string | null
          source_call_id?: string | null
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
          org_id?: string
          processing_status?: string | null
          processing_step?: string | null
          sales_technique?: number | null
          source?: string | null
          source_call_id?: string | null
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
          {
            foreignKeyName: "calls_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
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
          org_id: string
          phone_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          org_id: string
          phone_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          org_id?: string
          phone_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
          },
        ]
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
      keyword_trackers: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          keywords: Json
          mentions_count: number | null
          name: string
          org_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: Json
          mentions_count?: number | null
          name: string
          org_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: Json
          mentions_count?: number | null
          name?: string
          org_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "keyword_trackers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "keyword_trackers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
          },
        ]
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
      knowledge_article_versions: {
        Row: {
          article_id: string
          author_id: string
          change_summary: string | null
          content: string
          created_at: string
          description: string | null
          id: string
          title: string
          version_number: number
        }
        Insert: {
          article_id: string
          author_id: string
          change_summary?: string | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          version_number: number
        }
        Update: {
          article_id?: string
          author_id?: string
          change_summary?: string | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_article_versions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_articles: {
        Row: {
          author_id: string
          category_id: string | null
          content: string
          created_at: string
          description: string | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          template: Database["public"]["Enums"]["article_template"]
          title: string
          updated_at: string
          version_number: number
          view_count: number
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          template?: Database["public"]["Enums"]["article_template"]
          title: string
          updated_at?: string
          version_number?: number
          view_count?: number
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          template?: Database["public"]["Enums"]["article_template"]
          title?: string
          updated_at?: string
          version_number?: number
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "knowledge_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "knowledge_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_feedback: {
        Row: {
          article_id: string
          created_at: string
          feedback_text: string | null
          id: string
          is_helpful: boolean
          user_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          feedback_text?: string | null
          id?: string
          is_helpful: boolean
          user_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          feedback_text?: string | null
          id?: string
          is_helpful?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_feedback_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      managers: {
        Row: {
          created_at: string
          department: string | null
          id: string
          name: string
          org_id: string
          telegram_chat_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          name: string
          org_id: string
          telegram_chat_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          name?: string
          org_id?: string
          telegram_chat_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "managers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
          },
        ]
      }
      metric_history: {
        Row: {
          created_at: string | null
          event_type: string | null
          id: string
          metric_id: string | null
          new_value: number | null
          notes: string | null
          old_value: number | null
          triggered_by: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          metric_id?: string | null
          new_value?: number | null
          notes?: string | null
          old_value?: number | null
          triggered_by?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string | null
          id?: string
          metric_id?: string | null
          new_value?: number | null
          notes?: string | null
          old_value?: number | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_history_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "org_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_history_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "v_active_nsm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metric_history_triggered_by_fkey"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      org_metrics: {
        Row: {
          created_at: string | null
          current_value: number | null
          id: string
          is_active: boolean | null
          metric_name: string
          org_id: string | null
          target_value: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          metric_name: string
          org_id?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          metric_name?: string
          org_id?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          subdomain: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          subdomain?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          subdomain?: string | null
          updated_at?: string | null
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
          org_id: string
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
          org_id: string
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
          org_id?: string
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
          {
            foreignKeyName: "reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
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
      telegram_auth_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          used: boolean
          user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          used?: boolean
          user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          used?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_auth_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_links: {
        Row: {
          active: boolean
          chat_id: number
          created_at: string
          first_name: string | null
          id: string
          org_id: string
          telegram_username: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          chat_id: number
          created_at?: string
          first_name?: string | null
          id?: string
          org_id: string
          telegram_username?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          chat_id?: number
          created_at?: string
          first_name?: string | null
          id?: string
          org_id?: string
          telegram_username?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_links_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_links_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "telegram_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          org_id: string
          session_code: string
          used: boolean
          user_id: string
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          org_id: string
          session_code: string
          used?: boolean
          user_id: string
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          org_id?: string
          session_code?: string
          used?: boolean
          user_id?: string
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "telegram_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_settings: {
        Row: {
          bot_token: string
          bot_username: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          org_id: string | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          bot_token: string
          bot_username?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          bot_token?: string
          bot_username?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          org_id?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_settings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
          },
        ]
      }
      telfin_calls: {
        Row: {
          call_id: string
          called_number: string | null
          caller_number: string | null
          created_at: string
          duration: number | null
          end_time: string | null
          extension_id: string | null
          has_record: boolean | null
          id: string
          org_id: string
          processing_feedback: string | null
          processing_status: string | null
          raw_payload: Json | null
          record_url: string | null
          start_time: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          call_id: string
          called_number?: string | null
          caller_number?: string | null
          created_at?: string
          duration?: number | null
          end_time?: string | null
          extension_id?: string | null
          has_record?: boolean | null
          id?: string
          org_id: string
          processing_feedback?: string | null
          processing_status?: string | null
          raw_payload?: Json | null
          record_url?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          call_id?: string
          called_number?: string | null
          caller_number?: string | null
          created_at?: string
          duration?: number | null
          end_time?: string | null
          extension_id?: string | null
          has_record?: boolean | null
          id?: string
          org_id?: string
          processing_feedback?: string | null
          processing_status?: string | null
          raw_payload?: Json | null
          record_url?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telfin_calls_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telfin_calls_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
          },
        ]
      }
      telfin_connections: {
        Row: {
          access_token: string | null
          client_id: string
          client_secret: string
          created_at: string
          org_id: string
          refresh_token: string | null
          token_expiry: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          client_id: string
          client_secret: string
          created_at?: string
          org_id: string
          refresh_token?: string | null
          token_expiry?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          client_id?: string
          client_secret?: string
          created_at?: string
          org_id?: string
          refresh_token?: string | null
          token_expiry?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telfin_connections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telfin_connections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          channel: string | null
          notify_calls: boolean | null
          notify_metrics: boolean | null
          notify_risks: boolean | null
          user_id: string
        }
        Insert: {
          channel?: string | null
          notify_calls?: boolean | null
          notify_metrics?: boolean | null
          notify_risks?: boolean | null
          user_id: string
        }
        Update: {
          channel?: string | null
          notify_calls?: boolean | null
          notify_metrics?: boolean | null
          notify_risks?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          locale: string | null
          preferred_nsm: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          locale?: string | null
          preferred_nsm?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          locale?: string | null
          preferred_nsm?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_preferred_nsm_fkey"
            columns: ["preferred_nsm"]
            isOneToOne: false
            referencedRelation: "org_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_preferred_nsm_fkey"
            columns: ["preferred_nsm"]
            isOneToOne: false
            referencedRelation: "v_active_nsm"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          name: string
          org_id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          org_id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          org_id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
          },
        ]
      }
    }
    Views: {
      v_active_nsm: {
        Row: {
          created_at: string | null
          current_value: number | null
          id: string | null
          is_active: boolean | null
          metric_name: string | null
          org_id: string | null
          org_name: string | null
          org_subdomain: string | null
          target_value: number | null
          unit: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_metrics_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_org_dashboard_metrics"
            referencedColumns: ["org_id"]
          },
        ]
      }
      v_org_dashboard_metrics: {
        Row: {
          active_managers: number | null
          active_trackers: number | null
          avg_satisfaction: number | null
          avg_score: number | null
          org_id: string | null
          org_name: string | null
          total_calls: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_telegram_codes: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_telegram_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_customer_booking_count: {
        Args: { customer_uuid: string }
        Returns: number
      }
      get_metric_trend: {
        Args: { metric_id_param: string; days_back?: number }
        Returns: {
          date: string
          value: number
          change_percent: number
        }[]
      }
      has_user_role: {
        Args: { _role: string }
        Returns: boolean
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
      increment_article_views: {
        Args: { article_id: string }
        Returns: undefined
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
      article_status: "draft" | "internal" | "published"
      article_template: "instruction" | "integration" | "faq" | "general"
      user_role: "superadmin" | "admin" | "manager" | "operator" | "viewer"
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
      article_status: ["draft", "internal", "published"],
      article_template: ["instruction", "integration", "faq", "general"],
      user_role: ["superadmin", "admin", "manager", "operator", "viewer"],
    },
  },
} as const
