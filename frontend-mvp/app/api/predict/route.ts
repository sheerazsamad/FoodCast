import { NextRequest, NextResponse } from 'next/server'

// Interface for prediction input data
interface PredictionInput {
  store_id: string
  product_id: string
  product_name?: string
  daily_sales: number
  stock_level: number
  price?: number
  promotion_flag?: boolean
  brain_diet_flag?: boolean
  shelf_life_days?: number
  date?: string
}

// Interface for prediction response
interface PredictionResponse {
  success: boolean
  prediction?: {
    predicted_surplus: number
    store_id: string
    product_id: string
    product_name: string
    date: string
    confidence: string
  }
  model_info?: {
    features_used: number
    model_type: string
    accuracy: string
  }
  error?: string
}

// Configuration for the Python model server
const MODEL_SERVER_URL = process.env.MODEL_SERVER_URL || 'http://localhost:5001'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const inputData: PredictionInput = await request.json()
    
    // Validate required fields
    const requiredFields = ['store_id', 'product_id', 'daily_sales', 'stock_level']
    const missingFields = requiredFields.filter(field => !inputData[field as keyof PredictionInput])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      )
    }
    
    // Validate data types and ranges
    if (typeof inputData.daily_sales !== 'number' || inputData.daily_sales < 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'daily_sales must be a non-negative number' 
        },
        { status: 400 }
      )
    }
    
    if (typeof inputData.stock_level !== 'number' || inputData.stock_level < 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'stock_level must be a non-negative number' 
        },
        { status: 400 }
      )
    }
    
    // Set default values for optional fields
    const predictionData = {
      store_id: inputData.store_id,
      product_id: inputData.product_id,
      product_name: inputData.product_name || 'Unknown Product',
      daily_sales: inputData.daily_sales,
      stock_level: inputData.stock_level,
      price: inputData.price || 10.0,
      promotion_flag: inputData.promotion_flag || false,
      brain_diet_flag: inputData.brain_diet_flag || false,
      shelf_life_days: inputData.shelf_life_days || 7,
      date: inputData.date || new Date().toISOString().split('T')[0]
    }
    
    console.log('🤖 Making prediction request to model server:', predictionData)
    
    // Call the Python model server
    const modelResponse = await fetch(`${MODEL_SERVER_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(predictionData),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    if (!modelResponse.ok) {
      const errorText = await modelResponse.text()
      console.error('❌ Model server error:', errorText)
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Model server error: ${modelResponse.status} ${modelResponse.statusText}` 
        },
        { status: 500 }
      )
    }
    
    const modelResult: PredictionResponse = await modelResponse.json()
    
    if (!modelResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: modelResult.error || 'Prediction failed' 
        },
        { status: 500 }
      )
    }
    
    console.log('✅ Prediction successful:', modelResult.prediction)
    
    // Automatically create an offer from the prediction
    try {
      // Calculate expiry date from AI prediction (if available) or default to 7 days
      const expiryDate = modelResult.prediction.expiry_date 
        ? new Date(modelResult.prediction.expiry_date).toISOString().split('T')[0]
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      // Set availability date to the night before expiry (1 day before)
      const expiryDateObj = new Date(expiryDate)
      const availableDateObj = new Date(expiryDateObj.getTime() - 24 * 60 * 60 * 1000) // 1 day before
      const availableDate = availableDateObj.toISOString().split('T')[0]

      const offerData = {
        donorId: 'donor-1', // Default donor for now
        donorName: 'AI Prediction System',
        donorAddress: '123 Main St, San Francisco, CA 94102',
        category: 'produce' as const,
        description: `${modelResult.prediction.product_name} (AI Predicted)`,
        quantity: Math.round(modelResult.prediction.predicted_surplus),
        unit: 'lbs',
        status: 'available' as const,
        availableDate: availableDate,
        expiryDate: expiryDate,
        location: '123 Main St, San Francisco, CA 94102',
        estimatedValue: Math.round(modelResult.prediction.predicted_surplus * (inputData.price || 10)),
        notes: `AI predicted surplus based on daily sales: ${inputData.daily_sales}, stock level: ${inputData.stock_level}`,
        isFromPrediction: true,
        // AI prediction specific fields
        storeId: inputData.store_id,
        productId: inputData.product_id,
        productName: modelResult.prediction.product_name,
        dailySales: inputData.daily_sales,
        stockLevel: inputData.stock_level,
        price: inputData.price || 10,
        promotionFlag: inputData.promotion_flag || false,
        brainDietFlag: inputData.brain_diet_flag || false,
        shelfLifeDays: inputData.shelf_life_days || 7,
        predictedSurplus: modelResult.prediction.predicted_surplus,
        confidence: modelResult.prediction.confidence,
        // Enhanced AI prediction metrics (if available in model result)
        urgency_score: (modelResult as any).urgency_score,
        nutritional_value: (modelResult as any).nutritional_value,
        estimated_meals: (modelResult as any).estimated_meals,
        priority_level: (modelResult as any).priority_level,
        impact_score: (modelResult as any).impact_score,
      }

      // Create the offer by calling the offers API
      const offerResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData),
      })

      if (offerResponse.ok) {
        const offerResult = await offerResponse.json()
        console.log('✅ Offer created from prediction:', offerResult.offer?.id)
      } else {
        console.error('❌ Failed to create offer from prediction:', await offerResponse.text())
      }
    } catch (offerError) {
      console.error('❌ Error creating offer from prediction:', offerError)
      // Don't fail the prediction if offer creation fails
    }

    // Save the prediction to the predictions API
    try {
      const predictionData = {
        id: `pred-${Date.now()}`,
        donorId: 'donor-1', // Default donor for now
        donorName: 'AI Prediction System',
        description: `${modelResult.prediction.product_name} (AI Predicted)`,
        category: 'produce',
        quantity: Math.round(modelResult.prediction.predicted_surplus),
        unit: 'lbs',
        status: 'predicted' as const,
        predictedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        location: '123 Main St, San Francisco, CA 94102',
        estimatedValue: Math.round(modelResult.prediction.predicted_surplus * (inputData.price || 10)),
        notes: `AI predicted surplus based on daily sales: ${inputData.daily_sales}, stock level: ${inputData.stock_level}`,
        // AI prediction specific fields
        storeId: inputData.store_id,
        productId: inputData.product_id,
        productName: modelResult.prediction.product_name,
        dailySales: inputData.daily_sales,
        stockLevel: inputData.stock_level,
        price: inputData.price || 10,
        promotionFlag: inputData.promotion_flag || false,
        brainDietFlag: inputData.brain_diet_flag || false,
        shelfLifeDays: inputData.shelf_life_days || 7,
        predictedSurplus: modelResult.prediction.predicted_surplus,
        confidence: modelResult.prediction.confidence,
        // Enhanced AI prediction metrics
        urgency_score: modelResult.prediction.urgency_score,
        nutritional_value: modelResult.prediction.nutritional_value,
        estimated_meals: modelResult.prediction.estimated_meals,
        expiry_date: modelResult.prediction.expiry_date,
        priority_level: modelResult.prediction.priority_level,
        impact_score: modelResult.prediction.impact_score,
      }

      const predictionResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(predictionData),
      })

      if (predictionResponse.ok) {
        const predictionResult = await predictionResponse.json()
        console.log('✅ Prediction saved:', predictionResult.prediction?.id)
      } else {
        console.error('❌ Failed to save prediction:', await predictionResponse.text())
      }
    } catch (predictionError) {
      console.error('❌ Error saving prediction:', predictionError)
      // Don't fail the prediction if saving fails
    }
    
    // Return the prediction result
    return NextResponse.json({
      success: true,
      prediction: modelResult.prediction,
      model_info: modelResult.model_info,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Prediction API error:', error)
    
    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body' 
        },
        { status: 400 }
      )
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unable to connect to model server. Please ensure the Python model server is running on port 5001.' 
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint for health check
export async function GET() {
  try {
    // Check if the model server is available
    const healthResponse = await fetch(`${MODEL_SERVER_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    
    if (!healthResponse.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Model server is not available',
          model_server_status: 'down'
        },
        { status: 503 }
      )
    }
    
    const healthData = await healthResponse.json()
    
    return NextResponse.json({
      success: true,
      message: 'Prediction API is healthy',
      model_server_status: 'up',
      model_loaded: healthData.model_loaded,
      features_count: healthData.features_count,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Health check error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Health check failed',
        model_server_status: 'down'
      },
      { status: 503 }
    )
  }
}
