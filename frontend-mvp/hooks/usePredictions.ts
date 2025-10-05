import { useState, useEffect } from 'react'
import type { Donation } from '@/lib/types'

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
}

interface UsePredictionsReturn {
  predictions: Donation[]
  loading: boolean
  error: string | null
  createPrediction: (predictionData: PredictionData) => Promise<boolean>
  updatePrediction: (id: string, updates: Partial<PredictionData>) => Promise<boolean>
  deletePrediction: (id: string) => Promise<boolean>
  refreshPredictions: () => Promise<void>
}

export function usePredictions(donorId: string): UsePredictionsReturn {
  const [predictions, setPredictions] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load predictions from the API
  const loadPredictions = async () => {
    if (!donorId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/predictions?donorId=${encodeURIComponent(donorId)}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load predictions: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Convert PredictionData to Donation format for compatibility
        const donations: Donation[] = result.predictions.map((pred: PredictionData) => ({
          id: pred.id,
          donorId: pred.donorId,
          donorName: pred.donorName,
          description: pred.description,
          category: pred.category,
          quantity: pred.quantity,
          unit: pred.unit,
          status: pred.status,
          predictedDate: pred.predictedDate,
          confirmedDate: pred.confirmedDate,
          createdAt: pred.createdAt,
          updatedAt: pred.updatedAt,
          location: pred.location,
          estimatedValue: pred.estimatedValue,
          notes: pred.notes,
          // AI prediction specific fields
          storeId: pred.storeId,
          productId: pred.productId,
          productName: pred.productName,
          dailySales: pred.dailySales,
          stockLevel: pred.stockLevel,
          price: pred.price,
          promotionFlag: pred.promotionFlag,
          brainDietFlag: pred.brainDietFlag,
          shelfLifeDays: pred.shelfLifeDays,
          predictedSurplus: pred.predictedSurplus,
          confidence: pred.confidence,
          // Enhanced MVP features
          urgency_score: pred.urgency_score,
          nutritional_value: pred.nutritional_value,
          estimated_meals: pred.estimated_meals,
          expiry_date: pred.expiry_date,
          priority_level: pred.priority_level,
          impact_score: pred.impact_score
        }))
        
        setPredictions(donations)
      } else {
        throw new Error(result.error || 'Failed to load predictions')
      }
    } catch (err) {
      console.error('Error loading predictions:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Create a new prediction
  const createPrediction = async (predictionData: PredictionData): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(predictionData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create prediction: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Reload predictions to get the updated list
        await loadPredictions()
        return true
      } else {
        throw new Error(result.error || 'Failed to create prediction')
      }
    } catch (err) {
      console.error('Error creating prediction:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }

  // Update an existing prediction
  const updatePrediction = async (id: string, updates: Partial<PredictionData>): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch('/api/predictions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorId,
          predictionId: id,
          updates
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update prediction: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Reload predictions to get the updated list
        await loadPredictions()
        return true
      } else {
        throw new Error(result.error || 'Failed to update prediction')
      }
    } catch (err) {
      console.error('Error updating prediction:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }

  // Delete a prediction
  const deletePrediction = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch(`/api/predictions?donorId=${encodeURIComponent(donorId)}&predictionId=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete prediction: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Reload predictions to get the updated list
        await loadPredictions()
        return true
      } else {
        throw new Error(result.error || 'Failed to delete prediction')
      }
    } catch (err) {
      console.error('Error deleting prediction:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }

  // Refresh predictions
  const refreshPredictions = async () => {
    await loadPredictions()
  }

  // Load predictions on mount and when donorId changes
  useEffect(() => {
    loadPredictions()
  }, [donorId])

  return {
    predictions,
    loading,
    error,
    createPrediction,
    updatePrediction,
    deletePrediction,
    refreshPredictions
  }
}
