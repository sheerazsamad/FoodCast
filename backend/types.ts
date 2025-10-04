
// TypeScript interfaces for tables in Supabase

// Recipient Community Table
export interface RecipientCommunity {
    recipient_id: number;
    name: string;
    type: string;
    preferred_food_category: string;
    max_daily_quantity: number;
    zip_code: number;
    latitude: number;
    longitude: number;
}

// Food Surplus Table
export interface FoodSurplus {
    store_id: string;
    product_id: string;
    product_name: string;
    category: string;
    brain_diet_flag: boolean;
    shelf_life_days: number;
    daily_sales: number;
    starting_inventory: number;
    end_inventory: number;
    wasted_units: number;
    waste_percentage: number;
    date: string;
    store_location: string;
}

// Historical Sales Table
export interface HistoricalSales {
    store_id: string;
    product_id: string;
    day: number;
    daily_sales: number;
    stock_level: number;
    price: number;
    promotion_flag: boolean;
}

// Brain Diet Foundation Foods Table
export interface BrainDietFood {
    clean_name: string;
    fdc_id: number;
    food_description: string;
    category_description: string;
    category_simple: string;
    brain_diet_flag: boolean;
    default_weight_unit: string;
    shelf_life_days: number;
    publication_date: string;
}
