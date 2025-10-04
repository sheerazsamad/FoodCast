import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import { supabase } from './supabase';
import { RecipientCommunity, FoodSurplus, HistoricalSales, BrainDietFood } from './types';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'FoodCast Backend API'
  });
});

// Authentication Routes
app.post('/signup', async (req, res) => {
  try {
    const { email, password, userType, profileData } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, userType'
      });
    }

    // Validate user type
    const validUserTypes = ['store', 'student', 'shelter'];
    if (!validUserTypes.includes(userType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user type. Must be: store, student, or shelter'
      });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    // Store additional profile data in a profiles table
    if (profileData && authData.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          user_type: userType,
          ...profileData
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the signup if profile creation fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        userType
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during signup'
    });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        userType: profile?.user_type || 'unknown'
      },
      session: data.session
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during login'
    });
  }
});

// Surplus Management Routes
app.post('/upload-surplus', async (req, res) => {
  try {
    const { storeId, products } = req.body;

    if (!storeId || !products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        error: 'storeId and products array are required'
      });
    }

    // Validate products data
    const validatedProducts = products.map((product: any) => ({
      store_id: storeId,
      product_id: product.product_id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      product_name: product.product_name,
      category: product.category,
      brain_diet_flag: product.brain_diet_flag || false,
      shelf_life_days: product.shelf_life_days || 7,
      daily_sales: product.daily_sales || 0,
      starting_inventory: product.starting_inventory || 0,
      end_inventory: product.end_inventory || 0,
      wasted_units: product.wasted_units || 0,
      waste_percentage: product.waste_percentage || 0,
      date: new Date().toISOString().split('T')[0],
      store_location: product.store_location || 'Unknown'
    }));

    const { data, error } = await supabase
      .from('food_surplus')
      .insert(validatedProducts)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Surplus data uploaded successfully',
      data: data
    });

  } catch (error) {
    console.error('Upload surplus error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during surplus upload'
    });
  }
});

app.post('/predict-surplus', async (req, res) => {
  try {
    const { storeId, predictionDate } = req.body;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        error: 'storeId is required'
      });
    }

    // Get historical data for prediction
    const { data: historicalData, error: histError } = await supabase
      .from('historical_sales')
      .select('*')
      .eq('store_id', storeId);

    if (histError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch historical data'
      });
    }

    // Call AI prediction model (placeholder)
    const predictions = await predictSurplus(historicalData || [], storeId, predictionDate);

    // Store predictions in food_surplus table
    const { data, error } = await supabase
      .from('food_surplus')
      .insert(predictions)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to store predictions'
      });
    }

    res.json({
      success: true,
      message: 'Surplus predictions generated and stored',
      data: data
    });

  } catch (error) {
    console.error('Predict surplus error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during surplus prediction'
    });
  }
});

// Allocation Route
app.post('/allocate', async (req, res) => {
  try {
    const { surplusId, recipientPreferences } = req.body;

    if (!surplusId) {
      return res.status(400).json({
        success: false,
        error: 'surplusId is required'
      });
    }

    // Get surplus data
    const { data: surplus, error: surplusError } = await supabase
      .from('food_surplus')
      .select('*')
      .eq('product_id', surplusId)
      .single();

    if (surplusError || !surplus) {
      return res.status(404).json({
        success: false,
        error: 'Surplus not found'
      });
    }

    // Get nearby recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('recipient_community')
      .select('*');

    if (recipientsError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch recipients'
      });
    }

    // Match surplus to recipients based on proximity, type, and preferences
    const allocations = await allocateSurplusToRecipients(surplus, recipients || [], recipientPreferences);

    // Optimize delivery routes
    const optimizedRoutes = await optimizeDeliveryRoutes(allocations);

    res.json({
      success: true,
      message: 'Allocation completed successfully',
      data: {
        surplus: surplus,
        allocations: allocations,
        optimizedRoutes: optimizedRoutes
      }
    });

  } catch (error) {
    console.error('Allocation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during allocation'
    });
  }
});

// Analytics Route
app.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate, storeId } = req.query;

    // Build date filter
    let dateFilter = '';
    if (startDate && endDate) {
      dateFilter = `date >= '${startDate}' AND date <= '${endDate}'`;
    }

    // Get food rescued metrics
    const { data: surplusData, error: surplusError } = await supabase
      .from('food_surplus')
      .select('wasted_units, waste_percentage, product_name, category')
      .eq(storeId ? 'store_id' : 'store_id', storeId || '');

    if (surplusError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch surplus data'
      });
    }

    // Calculate metrics
    const totalFoodRescued = surplusData?.reduce((sum, item) => sum + (item.wasted_units || 0), 0) || 0;
    const averageWastePercentage = surplusData?.reduce((sum, item) => sum + (item.waste_percentage || 0), 0) / (surplusData?.length || 1) || 0;
    
    // Estimate CO2 saved (rough calculation: 1kg food waste = ~2.5kg CO2)
    const co2Saved = totalFoodRescued * 2.5;

    // Get recipient impact
    const { data: recipients, error: recipientsError } = await supabase
      .from('recipient_community')
      .select('max_daily_quantity');

    const totalRecipientsServed = recipients?.length || 0;
    const totalCapacity = recipients?.reduce((sum, recipient) => sum + (recipient.max_daily_quantity || 0), 0) || 0;

    res.json({
      success: true,
      data: {
        foodRescued: {
          totalUnits: totalFoodRescued,
          averageWastePercentage: Math.round(averageWastePercentage * 100) / 100
        },
        environmentalImpact: {
          co2SavedKg: Math.round(co2Saved * 100) / 100,
          estimatedTreesSaved: Math.round(co2Saved / 22) // Rough estimate: 1 tree absorbs ~22kg CO2/year
        },
        recipientImpact: {
          totalRecipients: totalRecipientsServed,
          totalCapacity: totalCapacity,
          utilizationRate: totalCapacity > 0 ? Math.round((totalFoodRescued / totalCapacity) * 100) / 100 : 0
        },
        period: {
          startDate: startDate || 'All time',
          endDate: endDate || 'Present'
        }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during analytics calculation'
    });
  }
});

// Placeholder functions for AI prediction and route optimization
async function predictSurplus(historicalData: HistoricalSales[], storeId: string, predictionDate?: string): Promise<FoodSurplus[]> {
  // Placeholder for AI prediction model
  // In a real implementation, this would call a Python API or ML service
  console.log('Running AI prediction for store:', storeId);
  
  // Mock prediction logic
  const predictions: FoodSurplus[] = historicalData.map(item => ({
    store_id: storeId,
    product_id: item.product_id,
    product_name: `Predicted ${item.product_id}`,
    category: 'predicted',
    brain_diet_flag: false,
    shelf_life_days: 7,
    daily_sales: item.daily_sales * 1.1, // 10% increase prediction
    starting_inventory: item.stock_level,
    end_inventory: Math.max(0, item.stock_level - item.daily_sales * 1.1),
    wasted_units: Math.max(0, item.stock_level - item.daily_sales * 1.1) * 0.1,
    waste_percentage: 10,
    date: predictionDate || new Date().toISOString().split('T')[0],
    store_location: 'Predicted Location'
  }));

  return predictions;
}

async function allocateSurplusToRecipients(surplus: FoodSurplus, recipients: RecipientCommunity[], preferences?: any) {
  // Simple allocation logic based on proximity and preferences
  const allocations = recipients
    .filter(recipient => {
      // Match by food category preference
      return !preferences?.category || recipient.preferred_food_category === surplus.category;
    })
    .map(recipient => ({
      recipient_id: recipient.recipient_id,
      recipient_name: recipient.name,
      allocated_quantity: Math.min(surplus.wasted_units, recipient.max_daily_quantity),
      distance: calculateDistance(surplus.store_location, recipient.latitude, recipient.longitude),
      priority_score: calculatePriorityScore(recipient, surplus)
    }))
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 5); // Top 5 matches

  return allocations;
}

async function optimizeDeliveryRoutes(allocations: any[]) {
  // Placeholder for Google Maps optimization API
  console.log('Optimizing delivery routes for', allocations.length, 'allocations');
  
  // Mock route optimization
  return {
    totalDistance: allocations.length * 5.2, // Mock distance
    estimatedTime: allocations.length * 15, // Mock time in minutes
    optimizedRoute: allocations.map((allocation, index) => ({
      stop: index + 1,
      recipient_id: allocation.recipient_id,
      estimated_arrival: new Date(Date.now() + (index + 1) * 15 * 60000).toISOString()
    }))
  };
}

function calculateDistance(storeLocation: string, lat: number, lng: number): number {
  // Simplified distance calculation (in a real app, use proper geolocation)
  return Math.sqrt(lat * lat + lng * lng);
}

function calculatePriorityScore(recipient: RecipientCommunity, surplus: FoodSurplus): number {
  let score = 0;
  
  // Category match bonus
  if (recipient.preferred_food_category === surplus.category) {
    score += 50;
  }
  
  // Brain diet bonus
  if (surplus.brain_diet_flag) {
    score += 20;
  }
  
  // Capacity utilization
  const utilization = Math.min(surplus.wasted_units, recipient.max_daily_quantity) / recipient.max_daily_quantity;
  score += utilization * 30;
  
  return score;
}

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FoodCast Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
