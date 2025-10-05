/**
 * FoodCast Prediction API Client
 * 
 * This module provides functions to interact with the AI prediction API.
 * It handles making requests to the backend prediction endpoint and
 * provides type-safe interfaces for prediction data.
 */

// Types for prediction input and output
export interface PredictionInput {
  // Optional donor context to keep predictions scoped per account
  donorId?: string
  donorName?: string
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
  // Optional pickup/location info for mapping
  location?: string
  place_id?: string
  formatted_address?: string
  latitude?: number
  longitude?: number
}

export interface PredictionResult {
  predicted_surplus: number
  store_id: string
  product_id: string
  product_name: string
  date: string
  confidence: string
}

export interface ModelInfo {
  features_used: number
  model_type: string
  accuracy: string
}

export interface PredictionResponse {
  success: boolean
  prediction?: PredictionResult
  model_info?: ModelInfo
  error?: string
  timestamp?: string
}

export interface HealthCheckResponse {
  success: boolean
  message?: string
  model_server_status: 'up' | 'down'
  model_loaded?: boolean
  features_count?: number
  error?: string
  timestamp?: string
}

/**
 * Makes a prediction request to the AI model
 * 
 * @param inputData - The input data for prediction
 * @returns Promise<PredictionResponse> - The prediction result
 */
export async function makePrediction(inputData: PredictionInput): Promise<PredictionResponse> {
  try {
    // Attach donor context from localStorage if available
    try {
      if (typeof window !== 'undefined') {
        const donorId = localStorage.getItem('userId') || undefined
        const donorName = localStorage.getItem('userName') || undefined
        if (donorId) inputData.donorId = donorId
        if (donorName) inputData.donorName = donorName
      }
    } catch {}
    console.log('🤖 Making prediction request:', inputData)
    
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    })
    
    const result: PredictionResponse = await response.json()
    
    if (!response.ok) {
      console.error('❌ Prediction request failed:', result.error)
      return {
        success: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`
      }
    }
    
    if (!result.success) {
      console.error('❌ Prediction failed:', result.error)
      return result
    }
    
    console.log('✅ Prediction successful:', result.prediction)
    return result
    
  } catch (error) {
    console.error('❌ Prediction API error:', error)
    
    let errorMessage = 'Unknown error occurred'
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Unable to connect to the prediction service. Please check your internet connection.'
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Checks the health status of the prediction API and model server
 * 
 * @returns Promise<HealthCheckResponse> - The health status
 */
export async function checkPredictionHealth(): Promise<HealthCheckResponse> {
  try {
    console.log('🏥 Checking prediction API health...')
    
    const response = await fetch('/api/predict', {
      method: 'GET',
    })
    
    const result: HealthCheckResponse = await response.json()
    
    if (!response.ok) {
      console.error('❌ Health check failed:', result.error)
      return {
        success: false,
        model_server_status: 'down',
        error: result.error || `HTTP ${response.status}: ${response.statusText}`
      }
    }
    
    console.log('✅ Health check successful:', result)
    return result
    
  } catch (error) {
    console.error('❌ Health check error:', error)
    
    return {
      success: false,
      model_server_status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Validates prediction input data
 * 
 * @param inputData - The input data to validate
 * @returns { isValid: boolean, errors: string[] } - Validation result
 */
export function validatePredictionInput(inputData: Partial<PredictionInput>): { 
  isValid: boolean
  errors: string[] 
} {
  const errors: string[] = []
  
  // Check required fields
  if (!inputData.store_id) {
    errors.push('Store ID is required')
  }
  
  if (!inputData.product_id) {
    errors.push('Product ID is required')
  }
  
  if (typeof inputData.daily_sales !== 'number' || inputData.daily_sales < 0) {
    errors.push('Daily sales must be a non-negative number')
  }
  
  if (typeof inputData.stock_level !== 'number' || inputData.stock_level < 0) {
    errors.push('Stock level must be a non-negative number')
  }
  
  // Check optional fields
  if (inputData.price !== undefined && (typeof inputData.price !== 'number' || inputData.price < 0)) {
    errors.push('Price must be a non-negative number')
  }
  
  if (inputData.shelf_life_days !== undefined && (typeof inputData.shelf_life_days !== 'number' || inputData.shelf_life_days < 0)) {
    errors.push('Shelf life days must be a non-negative number')
  }
  
  // Check date format if provided
  if (inputData.date !== undefined && inputData.date !== '') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(inputData.date)) {
      errors.push('Date must be in YYYY-MM-DD format')
    } else {
      const inputDate = new Date(inputData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day
      
      if (isNaN(inputDate.getTime())) {
        errors.push('Invalid date provided')
      } else if (inputDate < today) {
        errors.push('Prediction date cannot be in the past')
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Creates a default prediction input with sensible defaults
 * 
 * @param overrides - Optional overrides for default values
 * @returns PredictionInput - Default input data
 */
export function createDefaultPredictionInput(overrides: Partial<PredictionInput> = {}): PredictionInput {
  // Default to tomorrow's date since we're predicting next-day surplus
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return {
    store_id: '1',
    product_id: '1',
    product_name: 'Fresh Produce',
    daily_sales: 50,
    stock_level: 100,
    price: 10.0,
    promotion_flag: false,
    brain_diet_flag: false,
    shelf_life_days: 7,
    date: tomorrow.toISOString().split('T')[0],
    ...overrides
  }
}

/**
 * Formats a prediction result for display
 * 
 * @param prediction - The prediction result
 * @returns Formatted string for display
 */
export function formatPredictionResult(prediction: PredictionResult): string {
  return `Predicted surplus: ${prediction.predicted_surplus.toFixed(2)} units for ${prediction.product_name} (Store ${prediction.store_id}, Product ${prediction.product_id})`
}

/**
 * Gets prediction confidence color for UI
 * 
 * @param confidence - The confidence level
 * @returns CSS color class
 */
export function getConfidenceColor(confidence: string): string {
  switch (confidence.toLowerCase()) {
    case 'high':
      return 'text-green-600'
    case 'moderate':
      return 'text-yellow-600'
    case 'low':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * Gets prediction confidence badge variant for UI
 * 
 * @param confidence - The confidence level
 * @returns Badge variant
 */
export function getConfidenceBadgeVariant(confidence: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (confidence.toLowerCase()) {
    case 'high':
      return 'default'
    case 'moderate':
      return 'secondary'
    case 'low':
      return 'destructive'
    default:
      return 'outline'
  }
}
