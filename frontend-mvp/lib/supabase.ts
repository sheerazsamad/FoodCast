import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'donor' | 'recipient' | 'admin'
          address: string | null
          city: string | null
          zip_code: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'donor' | 'recipient' | 'admin'
          address?: string | null
          city?: string | null
          zip_code?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'donor' | 'recipient' | 'admin'
          address?: string | null
          city?: string | null
          zip_code?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      map_offers: {
        Row: {
          id: string
          donor_id: string
          title: string
          description: string | null
          category: 'fruit' | 'vegetable' | 'grain' | 'protein' | 'nut_seed' | 'other'
          quantity: number
          unit: string
          place_id: string
          formatted_address: string
          latitude: number
          longitude: number
          expires_at: string
          status: 'active' | 'claimed' | 'expired' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          title: string
          description?: string | null
          category: 'fruit' | 'vegetable' | 'grain' | 'protein' | 'nut_seed' | 'other'
          quantity: number
          unit: string
          place_id: string
          formatted_address: string
          latitude: number
          longitude: number
          expires_at: string
          status?: 'active' | 'claimed' | 'expired' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          title?: string
          description?: string | null
          category?: 'fruit' | 'vegetable' | 'grain' | 'protein' | 'nut_seed' | 'other'
          quantity?: number
          unit?: string
          place_id?: string
          formatted_address?: string
          latitude?: number
          longitude?: number
          expires_at?: string
          status?: 'active' | 'claimed' | 'expired' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      map_claims: {
        Row: {
          id: string
          offer_id: string
          recipient_id: string
          claimed_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          offer_id: string
          recipient_id: string
          claimed_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          offer_id?: string
          recipient_id?: string
          claimed_at?: string
          notes?: string | null
        }
      }
    }
    Functions: {
      claim_map_offer: {
        Args: {
          offer_uuid: string
          claim_notes?: string
        }
        Returns: {
          success: boolean
          error?: string
          offer?: any
          claim?: any
        }
      }
      cancel_map_offer: {
        Args: {
          offer_uuid: string
        }
        Returns: {
          success: boolean
          error?: string
          offer?: any
        }
      }
      expire_map_offers: {
        Args: {}
        Returns: number
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type MapOffer = Database['public']['Tables']['map_offers']['Row']
export type MapClaim = Database['public']['Tables']['map_claims']['Row']
export type FoodCategory = MapOffer['category']
export type OfferStatus = MapOffer['status']
