// Mock Supabase setup for testing without real database
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Mock database
let mockUsers: any[] = []
let mockProducts: any[] = []
let mockPredictions: any[] = []
let mockAllocations: any[] = []

// Helper function to handle errors
const handleError = (error: any) => {
  console.error('Error:', error)
  return {
    success: false,
    error: error.message || 'Operation failed',
    message: 'An error occurred while processing your request'
  }
}

// Routes

// POST /signup - Register a new user
app.post('/signup', async (req, res) => {
  try {
    const { email, password, role, name, address, phone, recipient_type } = req.body

    if (!email || !password || !role || !name || !address || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Please provide email, password, role, name, address, and phone'
      })
    }

    // Validate recipient_type if role is shelter
    if (role === 'shelter' && !recipient_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing recipient type',
        message: 'Please specify what type of recipient you are (student, shelter, food_pantry, etc.)'
      })
    }

    // Validate recipient_type values
    const validRecipientTypes = ['student', 'shelter', 'food_pantry', 'nonprofit', 'community_center', 'church', 'other']
    if (role === 'shelter' && !validRecipientTypes.includes(recipient_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient type',
        message: `Please select a valid recipient type. Valid options: ${validRecipientTypes.join(', ')}`
      })
    }

    // Validate student email if recipient type is student
    if (role === 'shelter' && recipient_type === 'student' && !email.endsWith('.edu')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student email',
        message: 'Student accounts must use a valid .edu email address. Please use your school email.'
      })
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists'
      })
    }

    // Create mock user
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password, // Store the password for validation
      role,
      recipient_type: role === 'shelter' ? recipient_type : null, // Only store for recipients
      name,
      address,
      phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockUsers.push(newUser)

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          recipient_type: newUser.recipient_type,
          name: newUser.name,
          address: newUser.address,
          phone: newUser.phone,
          created_at: newUser.created_at,
          updated_at: newUser.updated_at
        },
        session: {
          access_token: `mock-token-${Date.now()}`,
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            recipient_type: newUser.recipient_type,
            name: newUser.name,
            address: newUser.address,
            phone: newUser.phone,
            created_at: newUser.created_at,
            updated_at: newUser.updated_at
          }
        }
      },
      message: 'User registered successfully'
    })

  } catch (error) {
    res.status(500).json(handleError(error))
  }
})

// POST /login - Authenticate user
app.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Please provide email, password, and role'
      })
    }

    // Find user in mock database
    const user = mockUsers.find(u => u.email === email)
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'No account found with this email. Please sign up first.',
        code: 'USER_NOT_FOUND'
      })
    }

    // Validate password
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password',
        message: 'Incorrect password. Please try again.',
        code: 'INVALID_PASSWORD'
      })
    }

    // Validate role matches user's registered role
    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        error: 'Role mismatch',
        message: `You signed up as a ${user.role}. Please select the correct role to log in.`,
        code: 'ROLE_MISMATCH',
        expectedRole: user.role
      })
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          recipient_type: user.recipient_type,
          name: user.name,
          address: user.address,
          phone: user.phone,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        session: {
          access_token: `mock-token-${Date.now()}`,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            recipient_type: user.recipient_type,
            name: user.name,
            address: user.address,
            phone: user.phone,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
      },
      message: 'Login successful'
    })

  } catch (error) {
    res.status(500).json(handleError(error))
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
    const store = mockUsers.find(u => u.id === store_id && u.role === 'store')
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found',
        message: 'Invalid store ID or store does not exist'
      })
    }

    // Create mock product
    const newProduct = {
      id: `product-${Date.now()}`,
      store_id,
      name,
      category,
      quantity,
      unit,
      expiry_date,
      status: 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockProducts.push(newProduct)

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Surplus inventory uploaded successfully'
    })

  } catch (error) {
    res.status(500).json(handleError(error))
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
    const store = mockUsers.find(u => u.id === store_id && u.role === 'store')
    const product = mockProducts.find(p => p.id === product_id)

    if (!store || !product) {
      return res.status(404).json({
        success: false,
        error: 'Store or product not found',
        message: 'Invalid store ID or product ID'
      })
    }

    // Mock AI prediction
    const prediction = {
      predicted_quantity: Math.floor(Math.random() * 100) + 10,
      confidence_score: Math.random() * 0.4 + 0.6
    }

    // Store prediction
    const newPrediction = {
      id: `prediction-${Date.now()}`,
      store_id,
      product_id,
      predicted_quantity: prediction.predicted_quantity,
      confidence_score: prediction.confidence_score,
      prediction_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockPredictions.push(newPrediction)

    res.status(201).json({
      success: true,
      data: newPrediction,
      message: 'Surplus prediction generated successfully'
    })

  } catch (error) {
    res.status(500).json(handleError(error))
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
    const product = mockProducts.find(p => p.id === product_id && p.status === 'available')
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not available',
        message: 'Product not found or already allocated'
      })
    }

    // Check if recipient exists
    const recipient = mockUsers.find(u => u.id === recipient_id && ['student', 'shelter'].includes(u.role))
    if (!recipient) {
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
    const newAllocation = {
      id: `allocation-${Date.now()}`,
      product_id,
      recipient_id,
      quantity,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockAllocations.push(newAllocation)

    // Update product quantity
    const remainingQuantity = product.quantity - quantity
    const newStatus = remainingQuantity === 0 ? 'claimed' : 'available'
    
    product.quantity = remainingQuantity
    product.status = newStatus
    product.updated_at = new Date().toISOString()

    res.status(201).json({
      success: true,
      data: {
        allocation: newAllocation,
        remaining_quantity: remainingQuantity
      },
      message: 'Allocation created successfully'
    })

  } catch (error) {
    res.status(500).json(handleError(error))
  }
})

// GET /analytics - Get impact metrics
app.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query

    // Calculate metrics from mock data
    const totalFoodRescued = mockProducts
      .filter(p => p.status === 'delivered')
      .reduce((sum, p) => sum + p.quantity, 0)

    const totalMealsProvided = Math.floor(totalFoodRescued * 0.5)
    const totalCo2Saved = totalFoodRescued * 2.5
    const predictionAccuracy = 79.2

    const analytics = {
      total_food_rescued: totalFoodRescued,
      total_co2_saved: totalCo2Saved,
      total_meals_provided: totalMealsProvided,
      prediction_accuracy: predictionAccuracy,
      active_stores: mockUsers.filter(u => u.role === 'store').length,
      active_recipients: mockUsers.filter(u => ['student', 'shelter'].includes(u.role)).length,
      daily_rescues: [
        { date: new Date().toISOString().split('T')[0], quantity: totalFoodRescued }
      ]
    }

    res.json({
      success: true,
      data: analytics,
      message: 'Analytics retrieved successfully'
    })

  } catch (error) {
    res.status(500).json(handleError(error))
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FoodCast API is running (Mock Mode)',
    timestamp: new Date().toISOString(),
    mock_data: {
      users: mockUsers.length,
      products: mockProducts.length,
      predictions: mockPredictions.length,
      allocations: mockAllocations.length
    }
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
  console.log(`🚀 FoodCast API server running on port ${PORT} (Mock Mode)`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Using mock database for testing`)
})

export default app
