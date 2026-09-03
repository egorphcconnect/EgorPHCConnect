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
      article_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_revisions: {
        Row: {
          created_at: string
          entity: string
          entity_id: string
          id: string
          snapshot: Json
          updated_by: string | null
          updated_by_email: string | null
        }
        Insert: {
          created_at?: string
          entity: string
          entity_id: string
          id?: string
          snapshot: Json
          updated_by?: string | null
          updated_by_email?: string | null
        }
        Update: {
          created_at?: string
          entity?: string
          entity_id?: string
          id?: string
          snapshot?: Json
          updated_by?: string | null
          updated_by_email?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          anonymous: boolean
          cleanliness: number | null
          comments: string | null
          created_at: string
          id: string
          phc_id: string
          rating: number
          service_used: string | null
          staff_professionalism: number | null
          waiting_time: number | null
        }
        Insert: {
          anonymous?: boolean
          cleanliness?: number | null
          comments?: string | null
          created_at?: string
          id?: string
          phc_id: string
          rating: number
          service_used?: string | null
          staff_professionalism?: number | null
          waiting_time?: number | null
        }
        Update: {
          anonymous?: boolean
          cleanliness?: number | null
          comments?: string | null
          created_at?: string
          id?: string
          phc_id?: string
          rating?: number
          service_used?: string | null
          staff_professionalism?: number | null
          waiting_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_phc_id_fkey"
            columns: ["phc_id"]
            isOneToOne: false
            referencedRelation: "phcs"
            referencedColumns: ["id"]
          },
        ]
      }
      health_articles: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          published: boolean
          summary: string
          tags: string[]
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          published?: boolean
          summary: string
          tags?: string[]
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          published?: boolean
          summary?: string
          tags?: string[]
          title?: string
        }
        Relationships: []
      }
      news_categories: {
        Row: {
          created_at: string
          description: string
          display_order: number
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_alt: string
          image_url: string
          post_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_alt?: string
          image_url: string
          post_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_alt?: string
          image_url?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_images_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "news_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          call_to_action_text: string | null
          call_to_action_url: string | null
          category_id: string | null
          contact_information: string | null
          content: string
          created_at: string
          created_by: string | null
          event_date: string | null
          event_time: string | null
          featured: boolean
          featured_image: string | null
          featured_image_alt: string | null
          id: string
          location: string | null
          published_at: string | null
          slug: string
          status: string
          summary: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          call_to_action_text?: string | null
          call_to_action_url?: string | null
          category_id?: string | null
          contact_information?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          event_date?: string | null
          event_time?: string | null
          featured?: boolean
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          location?: string | null
          published_at?: string | null
          slug: string
          status?: string
          summary?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          call_to_action_text?: string | null
          call_to_action_url?: string | null
          category_id?: string | null
          contact_information?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          event_date?: string | null
          event_time?: string | null
          featured?: boolean
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          location?: string | null
          published_at?: string | null
          slug?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          body: string
          created_at: string
          display_order: number
          heading: string
          id: string
          image_alt: string | null
          image_url: string | null
          page: string
          published: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body?: string
          created_at?: string
          display_order?: number
          heading: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          page?: string
          published?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          display_order?: number
          heading?: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          page?: string
          published?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      phcs: {
        Row: {
          address: string
          closing_time: string | null
          contact_phone: string | null
          created_at: string
          facility_type: string | null
          friday_services: string[]
          google_maps_url: string | null
          id: string
          image_url: string | null
          images: string[]
          last_updated: string
          latitude: number | null
          longitude: number | null
          monday_services: string[]
          name: string
          opening_time: string | null
          operating_hours: Json
          saturday_services: string[]
          services: string[]
          status: string
          sunday_services: string[]
          thursday_services: string[]
          tuesday_services: string[]
          updated_at: string
          ward: string
          wednesday_services: string[]
        }
        Insert: {
          address: string
          closing_time?: string | null
          contact_phone?: string | null
          created_at?: string
          facility_type?: string | null
          friday_services?: string[]
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          images?: string[]
          last_updated?: string
          latitude?: number | null
          longitude?: number | null
          monday_services?: string[]
          name: string
          opening_time?: string | null
          operating_hours?: Json
          saturday_services?: string[]
          services?: string[]
          status?: string
          sunday_services?: string[]
          thursday_services?: string[]
          tuesday_services?: string[]
          updated_at?: string
          ward: string
          wednesday_services?: string[]
        }
        Update: {
          address?: string
          closing_time?: string | null
          contact_phone?: string | null
          created_at?: string
          facility_type?: string | null
          friday_services?: string[]
          google_maps_url?: string | null
          id?: string
          image_url?: string | null
          images?: string[]
          last_updated?: string
          latitude?: number | null
          longitude?: number | null
          monday_services?: string[]
          name?: string
          opening_time?: string | null
          operating_hours?: Json
          saturday_services?: string[]
          services?: string[]
          status?: string
          sunday_services?: string[]
          thursday_services?: string[]
          tuesday_services?: string[]
          updated_at?: string
          ward?: string
          wednesday_services?: string[]
        }
        Relationships: []
      }
      services_catalog: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          block_key: string
          created_at: string
          draft_value: string | null
          id: string
          page: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          block_key: string
          created_at?: string
          draft_value?: string | null
          id?: string
          page: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Update: {
          block_key?: string
          created_at?: string
          draft_value?: string | null
          id?: string
          page?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      stakeholders: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_alt: string | null
          image_url: string | null
          name: string
          organization: string | null
          published: boolean
          role_title: string | null
          statement: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_alt?: string | null
          image_url?: string | null
          name: string
          organization?: string | null
          published?: boolean
          role_title?: string | null
          statement?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_alt?: string | null
          image_url?: string | null
          name?: string
          organization?: string | null
          published?: boolean
          role_title?: string | null
          statement?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
