import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Interface for prediction data
interface PredictionData {
  id: string
  donorId: string
  donorName: string
  description: string
  category: string
  quantity: number
  unit: string
  status: 'predicted' | 'confirmed' | 'claimed' | 'in_transit' | 'delivered' | 'cancelled'
  predictedDate?: string
  confirmedDate?: string
  createdAt: string
  updatedAt: string
  location: string
  estimatedValue: number
  notes: string
  // AI prediction specific fields
  storeId: string
  productId: string
  productName: string
  dailySales: number
  stockLevel: number
  price?: number
  promotionFlag?: boolean
  brainDietFlag?: boolean
  shelfLifeDays?: number
  predictedSurplus: number
  confidence: string
  // Enhanced MVP features
  urgency_score?: number
  nutritional_value?: number
  estimated_meals?: number
  expiry_date?: string
  priority_level?: string
  impact_score?: number
}

// Persistent storage for predictions
let predictionsStorage: { [donorId: string]: PredictionData[] } = {}

// Load predictions from file on startup
const predictionsFilePath = path.join(process.cwd(), '..', 'backend', 'predictions.json')
try {
  if (fs.existsSync(predictionsFilePath)) {
    const data = fs.readFileSync(predictionsFilePath, 'utf8')
    predictionsStorage = JSON.parse(data)
    console.log(`✅ Loaded predictions for ${Object.keys(predictionsStorage).length} donors`)
  }
} catch (error) {
  console.log('⚠️ Could not load predictions data:', error)
  predictionsStorage = {}
}

// Save predictions to file
const savePredictions = () => {
  try {
    fs.writeFileSync(predictionsFilePath, JSON.stringify(predictionsStorage, null, 2))
  } catch (error) {
    console.error('Error saving predictions:', error)
  }
}

// Filter out expired predictions
const filterExpiredPredictions = (predictions: PredictionData[]): PredictionData[] => {
  const now = new Date()
  return predictions.filter(prediction => {
    if (prediction.expiry_date) {
      const expiryDate = new Date(prediction.expiry_date)
      return expiryDate > now
    }
    return true // Keep predictions without expiry date
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const donorId = searchParams.get('donorId')

    if (!donorId) {
      return NextResponse.json(
        { success: false, error: 'Donor ID is required' },
        { status: 400 }
      )
    }

    // Get predictions for the specific donor and filter out expired ones
    const allPredictions = predictionsStorage[donorId] || []
    const activePredictions = filterExpiredPredictions(allPredictions)
    
    // If any predictions were filtered out, save the updated data
    if (activePredictions.length !== allPredictions.length) {
      predictionsStorage[donorId] = activePredictions
      savePredictions()
    }

    return NextResponse.json({
      success: true,
      predictions: activePredictions,
      count: activePredictions.length
    })

  } catch (error) {
    console.error('Get predictions error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionData = await request.json()

    // Validate required fields
    const requiredFields = ['id', 'donorId', 'donorName', 'description', 'quantity', 'status']
    const missingFields = requiredFields.filter(field => !body[field as keyof PredictionData])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Initialize donor's predictions array if it doesn't exist
    if (!predictionsStorage[body.donorId]) {
      predictionsStorage[body.donorId] = []
    }

    // Check if prediction with this ID already exists
    const existingIndex = predictionsStorage[body.donorId].findIndex(p => p.id === body.id)
    
    if (existingIndex >= 0) {
      // Update existing prediction
      predictionsStorage[body.donorId][existingIndex] = {
        ...body,
        updatedAt: new Date().toISOString()
      }
    } else {
      // Add new prediction
      predictionsStorage[body.donorId].push(body)
    }

    // Save to file
    savePredictions()

    console.log(`Prediction saved for donor ${body.donorId}:`, body.id)

    return NextResponse.json({
      success: true,
      message: 'Prediction saved successfully',
      prediction: body
    })

  } catch (error) {
    console.error('Save prediction error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: { donorId: string; predictionId: string; updates: Partial<PredictionData> } = await request.json()

    if (!body.donorId || !body.predictionId) {
      return NextResponse.json(
        { success: false, error: 'Donor ID and Prediction ID are required' },
        { status: 400 }
      )
    }

    if (!predictionsStorage[body.donorId]) {
      return NextResponse.json(
        { success: false, error: 'Donor not found' },
        { status: 404 }
      )
    }

    const predictionIndex = predictionsStorage[body.donorId].findIndex(p => p.id === body.predictionId)
    
    if (predictionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Prediction not found' },
        { status: 404 }
      )
    }

    // Update the prediction
    predictionsStorage[body.donorId][predictionIndex] = {
      ...predictionsStorage[body.donorId][predictionIndex],
      ...body.updates,
      updatedAt: new Date().toISOString()
    }

    // Save to file
    savePredictions()

    console.log(`Prediction updated for donor ${body.donorId}:`, body.predictionId)

    return NextResponse.json({
      success: true,
      message: 'Prediction updated successfully',
      prediction: predictionsStorage[body.donorId][predictionIndex]
    })

  } catch (error) {
    console.error('Update prediction error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const donorId = searchParams.get('donorId')
    const predictionId = searchParams.get('predictionId')

    if (!donorId || !predictionId) {
      return NextResponse.json(
        { success: false, error: 'Donor ID and Prediction ID are required' },
        { status: 400 }
      )
    }

    if (!predictionsStorage[donorId]) {
      return NextResponse.json(
        { success: false, error: 'Donor not found' },
        { status: 404 }
      )
    }

    const initialLength = predictionsStorage[donorId].length
    predictionsStorage[donorId] = predictionsStorage[donorId].filter(p => p.id !== predictionId)

    if (predictionsStorage[donorId].length < initialLength) {
      // Save to file
      savePredictions()
      
      console.log(`Prediction deleted for donor ${donorId}:`, predictionId)
      return NextResponse.json({
        success: true,
        message: 'Prediction deleted successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Prediction not found' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Delete prediction error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
