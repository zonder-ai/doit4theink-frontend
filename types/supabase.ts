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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          email: string | null
          phone: string | null
          created_at: string
          updated_at: string | null
          user_type: string | null
          is_admin: boolean | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string | null
          user_type?: string | null
          is_admin?: boolean | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string | null
          user_type?: string | null
          is_admin?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      client_profiles: {
        Row: {
          id: string
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          preferences: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      artist_profiles: {
        Row: {
          id: string
          bio: string | null
          years_experience: number | null
          portfolio_url: string | null
          instagram_handle: string | null
          artist_name: string | null
          commission_rate: number | null
          stripe_account_id: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          is_independent: boolean | null
          availability_notice: string | null
          primary_studio_id: string | null
          average_rating: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          bio?: string | null
          years_experience?: number | null
          portfolio_url?: string | null
          instagram_handle?: string | null
          artist_name?: string | null
          commission_rate?: number | null
          stripe_account_id?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          is_independent?: boolean | null
          availability_notice?: string | null
          primary_studio_id?: string | null
          average_rating?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          bio?: string | null
          years_experience?: number | null
          portfolio_url?: string | null
          instagram_handle?: string | null
          artist_name?: string | null
          commission_rate?: number | null
          stripe_account_id?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          is_independent?: boolean | null
          availability_notice?: string | null
          primary_studio_id?: string | null
          average_rating?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_profiles_primary_studio_id_fkey"
            columns: ["primary_studio_id"]
            referencedRelation: "studios"
            referencedColumns: ["id"]
          }
        ]
      }
      studios: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          contact_email: string | null
          contact_phone: string | null
          website: string | null
          instagram_handle: string | null
          logo_url: string | null
          banner_url: string | null
          is_verified: boolean | null
          stripe_account_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          website?: string | null
          instagram_handle?: string | null
          logo_url?: string | null
          banner_url?: string | null
          is_verified?: boolean | null
          stripe_account_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          website?: string | null
          instagram_handle?: string | null
          logo_url?: string | null
          banner_url?: string | null
          is_verified?: boolean | null
          stripe_account_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studios_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      studio_artists: {
        Row: {
          id: string
          studio_id: string
          artist_id: string
          role: string | null
          is_active: boolean | null
          start_date: string | null
          end_date: string | null
          commission_split: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          studio_id: string
          artist_id: string
          role?: string | null
          is_active?: boolean | null
          start_date?: string | null
          end_date?: string | null
          commission_split?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          studio_id?: string
          artist_id?: string
          role?: string | null
          is_active?: boolean | null
          start_date?: string | null
          end_date?: string | null
          commission_split?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_artists_artist_id_fkey"
            columns: ["artist_id"]
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_artists_studio_id_fkey"
            columns: ["studio_id"]
            referencedRelation: "studios"
            referencedColumns: ["id"]
          }
        ]
      }
      styles: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          created_at?: string
        }
        Relationships: []
      }
      designs: {
        Row: {
          id: string
          artist_id: string
          studio_id: string | null
          title: string
          description: string | null
          base_price: number | null
          deposit_amount: number | null
          is_available: boolean | null
          is_flash: boolean | null
          is_custom: boolean | null
          is_color: boolean | null
          size: string | null
          placement: string | null
          estimated_hours: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          artist_id: string
          studio_id?: string | null
          title: string
          description?: string | null
          base_price?: number | null
          deposit_amount?: number | null
          is_available?: boolean | null
          is_flash?: boolean | null
          is_custom?: boolean | null
          is_color?: boolean | null
          size?: string | null
          placement?: string | null
          estimated_hours?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          artist_id?: string
          studio_id?: string | null
          title?: string
          description?: string | null
          base_price?: number | null
          deposit_amount?: number | null
          is_available?: boolean | null
          is_flash?: boolean | null
          is_custom?: boolean | null
          is_color?: boolean | null
          size?: string | null
          placement?: string | null
          estimated_hours?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designs_artist_id_fkey"
            columns: ["artist_id"]
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designs_studio_id_fkey"
            columns: ["studio_id"]
            referencedRelation: "studios"
            referencedColumns: ["id"]
          }
        ]
      }
      design_images: {
        Row: {
          id: string
          design_id: string
          image_url: string
          storage_path: string | null
          is_primary: boolean | null
          order_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          design_id: string
          image_url: string
          storage_path?: string | null
          is_primary?: boolean | null
          order_index?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          design_id?: string
          image_url?: string
          storage_path?: string | null
          is_primary?: boolean | null
          order_index?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_images_design_id_fkey"
            columns: ["design_id"]
            referencedRelation: "designs"
            referencedColumns: ["id"]
          }
        ]
      }
      design_styles: {
        Row: {
          id: string
          design_id: string
          style_id: string
          created_at: string
        }
        Insert: {
          id?: string
          design_id: string
          style_id: string
          created_at?: string
        }
        Update: {
          id?: string
          design_id?: string
          style_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_styles_design_id_fkey"
            columns: ["design_id"]
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_styles_style_id_fkey"
            columns: ["style_id"]
            referencedRelation: "styles"
            referencedColumns: ["id"]
          }
        ]
      }
      design_tags: {
        Row: {
          id: string
          design_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          design_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          design_id?: string
          tag_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_tags_design_id_fkey"
            columns: ["design_id"]
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          client_id: string
          artist_id: string
          studio_id: string | null
          design_id: string | null
          booking_date: string
          start_time: string
          end_time: string
          status: string
          total_price: number | null
          deposit_amount: number | null
          notes: string | null
          cancellation_reason: string | null
          cancelled_by: string | null
          cancelled_at: string | null
          is_rescheduled: boolean | null
          previous_booking_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          artist_id: string
          studio_id?: string | null
          design_id?: string | null
          booking_date: string
          start_time: string
          end_time: string
          status: string
          total_price?: number | null
          deposit_amount?: number | null
          notes?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          cancelled_at?: string | null
          is_rescheduled?: boolean | null
          previous_booking_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          artist_id?: string
          studio_id?: string | null
          design_id?: string | null
          booking_date?: string
          start_time?: string
          end_time?: string
          status?: string
          total_price?: number | null
          deposit_amount?: number | null
          notes?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          cancelled_at?: string | null
          is_rescheduled?: boolean | null
          previous_booking_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_artist_id_fkey"
            columns: ["artist_id"]
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_design_id_fkey"
            columns: ["design_id"]
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_previous_booking_id_fkey"
            columns: ["previous_booking_id"]
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_studio_id_fkey"
            columns: ["studio_id"]
            referencedRelation: "studios"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_designs: {
        Args: {
          p_style_ids: string[] | null
          p_tag_ids: string[] | null
          p_min_price: number | null
          p_max_price: number | null
          p_is_color: boolean | null
          p_artist_id: string | null
          p_location: string | null
          p_limit: number | null
          p_offset: number | null
        }
        Returns: {
          id: string
          title: string
          base_price: number | null
          deposit_amount: number | null
          is_color: boolean | null
          artist_id: string
          artist_name: string | null
          studio_name: string | null
          primary_image_url: string | null
        }[]
      }
      search_designs_advanced: {
        Args: {
          p_style_ids: string[] | null
          p_tag_ids: string[] | null
          p_artist_id: string | null
          p_studio_id: string | null
          p_min_price: number | null
          p_max_price: number | null
          p_is_color: boolean | null
          p_search_term: string | null
          p_city: string | null
          p_state: string | null
          p_country: string | null
          p_distance_km: number | null
          p_lat: number | null
          p_lng: number | null
          p_is_flash: boolean | null
          p_limit: number | null
          p_offset: number | null
          p_sort_by: string | null
          p_include_booked: boolean | null
        }
        Returns: {
          id: string
          title: string
          description: string | null
          base_price: number | null
          deposit_amount: number | null
          is_color: boolean | null
          is_flash: boolean | null
          is_custom: boolean | null
          is_available: boolean | null
          artist_id: string
          artist_name: string | null
          studio_id: string | null
          studio_name: string | null
          city: string | null
          state: string | null
          primary_image_url: string | null
          styles: string[] | null
          tags: string[] | null
          created_at: string
        }[]
      }
      search_artists: {
        Args: {
          p_style_ids: string[] | null
          p_location: string | null
          p_min_rating: number | null
          p_limit: number | null
          p_offset: number | null
        }
        Returns: {
          id: string
          artist_name: string | null
          bio: string | null
          years_experience: number | null
          city: string | null
          state: string | null
          average_rating: number | null
          profile_image_url: string | null
          primary_studio_name: string | null
          is_independent: boolean | null
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