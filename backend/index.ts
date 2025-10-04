import { SupabaseService } from './supabase';

// Example usage of the Supabase client
async function main() {
  try {
    console.log('🚀 FoodCast Backend - Supabase Client Initialized');
    
    // Example: Get all recipient communities
    console.log('📋 Fetching recipient communities...');
    const communities = await SupabaseService.getRecipientCommunities();
    console.log(`Found ${communities?.length || 0} recipient communities`);
    
    // Example: Get food surplus data
    console.log('🍎 Fetching food surplus data...');
    const surplus = await SupabaseService.getFoodSurplus();
    console.log(`Found ${surplus?.length || 0} food surplus records`);
    
    // Example: Get brain diet foods
    console.log('🧠 Fetching brain diet foods...');
    const brainFoods = await SupabaseService.getBrainDietFoods();
    console.log(`Found ${brainFoods?.length || 0} brain diet foods`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main();
}

export { SupabaseService };
