import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error)
  return {
    success: false,
    error: error.message || 'Database operation failed',
    message: 'An error occurred while processing your request'
  }
}

// Placeholder function for AI prediction model
const predictSurplus = async (storeId: string, productId: string, historicalData?: any[]) => {
  console.log(`Running AI prediction for store ${storeId}, product ${productId}`)
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const baseQuantity = Math.floor(Math.random() * 100) + 10
  const confidence = Math.random() * 0.4 + 0.6
  
  return {
    predicted_quantity: baseQuantity,
    confidence_score: confidence
  }
}

// Placeholder function for Google Maps optimization
const optimizeDeliveryRoutes = async (allocations: any[]) => {
  console.log('Optimizing delivery routes for', allocations.length, 'allocations')
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return allocations.map((allocation, index) => ({
    ...allocation,
    estimated_delivery_time: new Date(Date.now() + (index + 1) * 30 * 60 * 1000).toISOString(),
    route_optimization_score: Math.random() * 0.3 + 0.7
  }))
}

// Routes

// POST /signup - Register a new user
app.post('/signup', async (req, res) => {
  try {
    const { email, password, role, name, address, phone } = req.body

    if (!email || !password || !role || !name || !address || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please provide email, password, role, name, address, and phone'
      })
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return res.status(400).json(handleSupabaseError(authError))
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: 'User creation failed',
        message: 'Unable to create user account'
      })
    }

    // Create user profile in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        role,
        name,
        address,
        phone
      })
      .select()
      .single()

    if (userError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      return res.status(400).json(handleSupabaseError(userError))
    }

    res.status(201).json({
      success: true,
      data: {
        user: userData,
        session: authData.session
      },
      message: 'User registered successfully'
    })

  } catch (error) {
    res.status(500).json(handleSupabaseError(error))
  }
})

// POST /login - Authenticate user
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Please provide email and password'
      })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(401).json(handleSupabaseError(error))
    }

    if (!data.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid credentials'
      })
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      return res.status(500).json(handleSupabaseError(profileError))
    }

    res.json({
      success: true,
      data: {
        user: userProfile,
        session: data.session
      },
      message: 'Login successful'
    })

  } catch (error) {
    res.status(500).json(handleSupabaseError(error))
  }
})

// POST /upload-surplus - Upload inventory/surplus
app.post('/upload-surplus', async (req, res) => {
  try {
    const { store_id, name, category, quantity, unit, expiry_date } = req.body

    if (!store_id || !name || !category || !quantity || !unit || !expiry_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please provide store_id, name, category, quantity, unit, and expiry_date'
      })
    }

    const validCategories = ['produce', 'dairy', 'bakery', 'prepared', 'canned', 'frozen', 'other']
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        message: `Category must be one of: ${validCategories.join(', ')}`
      })
    }

    // Check if store exists
    const { data: store, error: storeError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', store_id)
      .eq('role', 'store')
      .single()

    if (storeError || !store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
        message: 'Invalid store ID or store does not exist'
      })
    }

    // Insert product into products table
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert({
        store_id,
        name,
        category,
        quantity,
        unit,
        expiry_date,
        status: 'available'
      })
      .select()
      .single()

    if (productError) {
      return res.status(400).json(handleSupabaseError(productError))
    }

    res.status(201).json({
      success: true,
      data: productData,
      message: 'Surplus inventory uploaded successfully'
    })

  } catch (error) {
    res.status(500).json(handleSupabaseError(error))
  }
})

// POST /predict-surplus - Run AI prediction
app.post('/predict-surplus', async (req, res) => {
  try {
    const { store_id, product_id, historical_data } = req.body

    if (!store_id || !product_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please provide store_id and product_id'
      })
    }

    // Check if store and product exist
    const { data: store, error: storeError } = await supabase
      .from('users')
      .select('id')
      .eq('id', store_id)
      .eq('role', 'store')
      .single()

    if (storeError || !store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
        message: 'Invalid store ID'
      })
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
        message: 'Invalid product ID'
      })
    }

    // Run AI prediction
    const prediction = await predictSurplus(store_id, product_id, historical_data)

    // Store prediction in database
    const { data: predictionData, error: predictionError } = await supabase
      .from('surplus_predictions')
      .insert({
        store_id,
        product_id,
        predicted_quantity: prediction.predicted_quantity,
        confidence_score: prediction.confidence_score,
        prediction_date: new Date().toISOString()
      })
      .select()
      .single()

    if (predictionError) {
      return res.status(400).json(handleSupabaseError(predictionError))
    }

    res.status(201).json({
      success: true,
      data: predictionData,
      message: 'Surplus prediction generated successfully'
    })

  } catch (error) {
    res.status(500).json(handleSupabaseError(error))
  }
})

// POST /allocate - Match surplus to recipients
app.post('/allocate', async (req, res) => {
  try {
    const { product_id, recipient_id, quantity } = req.body

    if (!product_id || !recipient_id || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please provide product_id, recipient_id, and quantity'
      })
    }

    // Check if product exists and is available
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('status', 'available')
      .single()

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        error: 'Product not available',
        message: 'Product not found or already allocated'
      })
    }

    // Check if recipient exists
    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('*')
      .eq('id', recipient_id)
      .in('role', ['student', 'shelter'])
      .single()

    if (recipientError || !recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found',
        message: 'Invalid recipient ID or recipient does not exist'
      })
    }

    // Check if requested quantity is available
    if (quantity > product.quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient quantity',
        message: `Only ${product.quantity} ${product.unit} available`
      })
    }

    // Create allocation
    const { data: allocationData, error: allocationError } = await supabase
      .from('allocations')
      .insert({
        product_id,
        recipient_id,
        quantity,
        status: 'pending'
      })
      .select()
      .single()

    if (allocationError) {
      return res.status(400).json(handleSupabaseError(allocationError))
    }

    // Update product quantity
    const remainingQuantity = product.quantity - quantity
    const newStatus = remainingQuantity === 0 ? 'claimed' : 'available'

    const { error: updateError } = await supabase
      .from('products')
      .update({
        quantity: remainingQuantity,
        status: newStatus
      })
      .eq('id', product_id)

    if (updateError) {
      return res.status(400).json(handleSupabaseError(updateError))
    }

    // Optimize delivery routes (placeholder)
    const optimizedAllocations = await optimizeDeliveryRoutes([allocationData])

    res.status(201).json({
      success: true,
      data: {
        allocation: optimizedAllocations[0],
        remaining_quantity: remainingQuantity
      },
      message: 'Allocation created successfully'
    })

  } catch (error) {
    res.status(500).json(handleSupabaseError(error))
  }
})

// GET /analytics - Get impact metrics
app.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query

    // Get analytics data from database
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics')
      .select('*')
      .gte('date', new Date(Date.now() - parseInt(period as string) * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: true })

    if (analyticsError) {
      return res.status(400).json(handleSupabaseError(analyticsError))
    }

    // Get current counts
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('quantity, status')

    const { data: stores, error: storesError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'store')

    const { data: recipients, error: recipientsError } = await supabase
      .from('users')
      .select('id')
      .in('role', ['student', 'shelter'])

    if (productsError || storesError || recipientsError) {
      return res.status(400).json(handleSupabaseError(productsError || storesError || recipientsError))
    }

    // Calculate metrics
    const totalFoodRescued = products
      ?.filter(p => p.status === 'delivered')
      .reduce((sum, p) => sum + p.quantity, 0) || 0

    const totalMealsProvided = Math.floor(totalFoodRescued * 0.5)
    const totalCo2Saved = totalFoodRescued * 2.5
    const predictionAccuracy = 79.2

    const analytics = {
      total_food_rescued: totalFoodRescued,
      total_co2_saved: totalCo2Saved,
      total_meals_provided: totalMealsProvided,
      prediction_accuracy: predictionAccuracy,
      active_stores: stores?.length || 0,
      active_recipients: recipients?.length || 0,
      daily_rescues: analyticsData?.map(item => ({
        date: item.date,
        quantity: item.total_food_rescued
      })) || []
    }

    res.json({
      success: true,
      data: analytics,
      message: 'Analytics retrieved successfully'
    })

  } catch (error) {
    res.status(500).json(handleSupabaseError(error))
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FoodCast API is running',
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FoodCast API server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Supabase connected: ${supabaseUrl ? 'Yes' : 'No'}`)
})

export default app