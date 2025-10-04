// Generated types for Supabase integration
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'store' | 'student' | 'shelter'
          name: string
          address: string
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'store' | 'student' | 'shelter'
          name: string
          address: string
          phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'store' | 'student' | 'shelter'
          name?: string
          address?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          store_id: string
          name: string
          category: 'produce' | 'dairy' | 'bakery' | 'prepared' | 'canned' | 'frozen' | 'other'
          quantity: number
          unit: string
          expiry_date: string
          status: 'available' | 'claimed' | 'delivered' | 'expired'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          category: 'produce' | 'dairy' | 'bakery' | 'prepared' | 'canned' | 'frozen' | 'other'
          quantity: number
          unit: string
          expiry_date: string
          status?: 'available' | 'claimed' | 'delivered' | 'expired'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          category?: 'produce' | 'dairy' | 'bakery' | 'prepared' | 'canned' | 'frozen' | 'other'
          quantity?: number
          unit?: string
          expiry_date?: string
          status?: 'available' | 'claimed' | 'delivered' | 'expired'
          created_at?: string
          updated_at?: string
        }
      }
      surplus_predictions: {
        Row: {
          id: string
          store_id: string
          product_id: string
          predicted_quantity: number
          confidence_score: number
          prediction_date: string
          actual_quantity?: number
          accuracy?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          product_id: string
          predicted_quantity: number
          confidence_score: number
          prediction_date: string
          actual_quantity?: number
          accuracy?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          product_id?: string
          predicted_quantity?: number
          confidence_score?: number
          prediction_date?: string
          actual_quantity?: number
          accuracy?: number
          created_at?: string
          updated_at?: string
        }
      }
      allocations: {
        Row: {
          id: string
          product_id: string
          recipient_id: string
          quantity: number
          status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
          delivery_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          recipient_id: string
          quantity: number
          status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
          delivery_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          recipient_id?: string
          quantity?: number
          status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
          delivery_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          date: string
          total_food_rescued: number
          total_co2_saved: number
          total_meals_provided: number
          prediction_accuracy: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          total_food_rescued: number
          total_co2_saved: number
          total_meals_provided: number
          prediction_accuracy: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          total_food_rescued?: number
          total_co2_saved?: number
          total_meals_provided?: number
          prediction_accuracy?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SignupRequest {
  email: string
  password: string
  role: 'store' | 'student' | 'shelter'
  name: string
  address: string
  phone: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SurplusUploadRequest {
  store_id: string
  name: string
  category: 'produce' | 'dairy' | 'bakery' | 'prepared' | 'canned' | 'frozen' | 'other'
  quantity: number
  unit: string
  expiry_date: string
}

export interface PredictionRequest {
  store_id: string
  product_id: string
  historical_data?: any[]
}

export interface AllocationRequest {
  product_id: string
  recipient_id: string
  quantity: number
}

export interface AnalyticsResponse {
  total_food_rescued: number
  total_co2_saved: number
  total_meals_provided: number
  prediction_accuracy: number
  active_stores: number
  active_recipients: number
  daily_rescues: Array<{
    date: string
    quantity: number
  }>
}
