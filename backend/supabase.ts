import { createClient } from '@supabase/supabase-js';
import { RecipientCommunity, FoodSurplus, HistoricalSales, BrainDietFood } from './types';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions for common operations
export class SupabaseService {
  // Recipient Communities
  static async getRecipientCommunities() {
    const { data, error } = await supabase
      .from('recipient_community')
      .select('*');
    
    if (error) throw error;
    return data as RecipientCommunity[];
  }

  static async createRecipientCommunity(community: Omit<RecipientCommunity, 'recipient_id'>) {
    const { data, error } = await supabase
      .from('recipient_community')
      .insert(community)
      .select()
      .single();
    
    if (error) throw error;
    return data as RecipientCommunity;
  }

  // Food Surplus
  static async getFoodSurplus() {
    const { data, error } = await supabase
      .from('food_surplus')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data as FoodSurplus[];
  }

  static async createFoodSurplus(surplus: FoodSurplus) {
    const { data, error } = await supabase
      .from('food_surplus')
      .insert(surplus)
      .select()
      .single();
    
    if (error) throw error;
    return data as FoodSurplus;
  }

  // Historical Sales
  static async getHistoricalSales() {
    const { data, error } = await supabase
      .from('historical_sales')
      .select('*');
    
    if (error) throw error;
    return data as HistoricalSales[];
  }

  // Brain Diet Foods
  static async getBrainDietFoods() {
    const { data, error } = await supabase
      .from('brain_diet_foundation_foods')
      .select('*');
    
    if (error) throw error;
    return data as BrainDietFood[];
  }
}
