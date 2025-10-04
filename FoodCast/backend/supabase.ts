import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Helper functions for common operations
export class SupabaseService {
  // User Management
  static async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createUser(userData: Database['public']['Tables']['users']['Insert']) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Product Management
  static async getProductsByStore(storeId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getAvailableProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'available')
      .order('expiry_date', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async createProduct(productData: Database['public']['Tables']['products']['Insert']) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProduct(productId: string, updates: Database['public']['Tables']['products']['Update']) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Surplus Predictions
  static async createPrediction(predictionData: Database['public']['Tables']['surplus_predictions']['Insert']) {
    const { data, error } = await supabase
      .from('surplus_predictions')
      .insert(predictionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getPredictionsByStore(storeId: string) {
    const { data, error } = await supabase
      .from('surplus_predictions')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Allocations
  static async createAllocation(allocationData: Database['public']['Tables']['allocations']['Insert']) {
    const { data, error } = await supabase
      .from('allocations')
      .insert(allocationData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getAllocationsByRecipient(recipientId: string) {
    const { data, error } = await supabase
      .from('allocations')
      .select(`
        *,
        products (
          name,
          category,
          unit,
          expiry_date
        )
      `)
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async updateAllocation(allocationId: string, updates: Database['public']['Tables']['allocations']['Update']) {
    const { data, error } = await supabase
      .from('allocations')
      .update(updates)
      .eq('id', allocationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Analytics
  static async getAnalytics(period: number = 30) {
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .gte('date', startDate)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async createAnalyticsEntry(analyticsData: Database['public']['Tables']['analytics']['Insert']) {
    const { data, error } = await supabase
      .from('analytics')
      .insert(analyticsData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Legacy methods for backward compatibility
  static async getRecipientCommunities() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['student', 'shelter']);
    
    if (error) throw error;
    return data;
  }

  static async getFoodSurplus() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getHistoricalSales() {
    const { data, error } = await supabase
      .from('surplus_predictions')
      .select('*')
      .not('actual_quantity', 'is', null);
    
    if (error) throw error;
    return data;
  }

  static async getBrainDietFoods() {
    // This would be a separate table for brain diet foods
    // For now, returning empty array
    return [];
  }
}
