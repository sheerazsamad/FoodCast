"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Brain, TrendingUp, Package, Calendar } from "lucide-react"
import { 
  makePrediction, 
  validatePredictionInput, 
  createDefaultPredictionInput,
  type PredictionInput,
  type PredictionResponse 
} from "@/lib/prediction-api"

interface PredictionFormProps {
  onPredictionComplete?: (result: PredictionResponse, formData?: PredictionInput) => void
  onClose?: () => void
  initialData?: Partial<PredictionInput>
}

export function PredictionForm({ onPredictionComplete, onClose, initialData }: PredictionFormProps) {
  // Form state
  const [formData, setFormData] = useState<PredictionInput>(
    createDefaultPredictionInput(initialData)
  )
  
  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  // Handle form input changes
  const handleInputChange = (field: keyof PredictionInput, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear previous errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate input
    const validation = validatePredictionInput(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }
    
    setIsLoading(true)
    setResult(null)
    setErrors([])
    
    try {
      const predictionResult = await makePrediction(formData)
      setResult(predictionResult)
      
      // Call the callback if provided
      if (onPredictionComplete) {
        onPredictionComplete(predictionResult, formData)
      }
      
      // Close the form after successful prediction
      if (predictionResult.success && onClose) {
        setTimeout(() => {
          onClose()
        }, 1000) // Small delay to show success message
      }
    } catch (error) {
      console.error('Prediction error:', error)
      setErrors(['An unexpected error occurred. Please try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData(createDefaultPredictionInput(initialData))
    setResult(null)
    setErrors([])
  }

  return (
    <div className="space-y-6">
      {/* Prediction Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Surplus Prediction
          </CardTitle>
          <CardDescription>
            Enter product and sales data to predict next-day food surplus using our trained AI model.
            The model predicts how much surplus food you'll have tomorrow based on current inventory and sales patterns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Store and Product Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store_id">Store ID *</Label>
                <Input
                  id="store_id"
                  type="text"
                  value={formData.store_id}
                  onChange={(e) => handleInputChange('store_id', e.target.value)}
                  placeholder="e.g., 1, 2, 3..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="product_id">Product ID *</Label>
                <Input
                  id="product_id"
                  type="text"
                  value={formData.product_id}
                  onChange={(e) => handleInputChange('product_id', e.target.value)}
                  placeholder="e.g., 1, 2, 3..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name</Label>
              <Input
                id="product_name"
                type="text"
                value={formData.product_name || ''}
                onChange={(e) => handleInputChange('product_name', e.target.value)}
                placeholder="e.g., Fresh Apples, Organic Bread..."
              />
            </div>

            {/* Sales and Inventory Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="daily_sales">Daily Sales (units) *</Label>
                <Input
                  id="daily_sales"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.daily_sales}
                  onChange={(e) => handleInputChange('daily_sales', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 45"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock_level">Current Stock Level (units) *</Label>
                <Input
                  id="stock_level"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock_level}
                  onChange={(e) => handleInputChange('stock_level', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 120"
                  required
                />
              </div>
            </div>

            {/* Price and Product Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 3.99"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shelf_life_days">Shelf Life (days)</Label>
                <Input
                  id="shelf_life_days"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.shelf_life_days || ''}
                  onChange={(e) => handleInputChange('shelf_life_days', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 7"
                />
                <p className="text-xs text-gray-500">
                  How many days until the product expires
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Prediction Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500">
                  Date to predict surplus for (defaults to tomorrow)
                </p>
              </div>
            </div>

            {/* Product Flags */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="promotion_flag"
                  checked={formData.promotion_flag || false}
                  onCheckedChange={(checked) => handleInputChange('promotion_flag', checked)}
                />
                <Label htmlFor="promotion_flag">On Promotion</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="brain_diet_flag"
                  checked={formData.brain_diet_flag || false}
                  onCheckedChange={(checked) => handleInputChange('brain_diet_flag', checked)}
                />
                <Label htmlFor="brain_diet_flag">Brain Diet Item</Label>
              </div>
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Predict Surplus
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Prediction Result */}
      {result && result.success && result.prediction && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Package className="h-5 w-5" />
              Prediction Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Prediction Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Predicted Surplus</Label>
                <div className="text-3xl font-bold text-green-600">
                  {result.prediction.predicted_surplus.toFixed(2)} units
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Estimated Meals</Label>
                <div className="text-2xl font-bold text-blue-600">
                  {result.prediction.estimated_meals || Math.round(result.prediction.predicted_surplus * 2)} meals
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Confidence</Label>
                <Badge 
                  variant={result.prediction.confidence === 'high' ? 'default' : 
                          result.prediction.confidence === 'moderate' ? 'secondary' : 'destructive'}
                  className="text-sm"
                >
                  {result.prediction.confidence}
                </Badge>
              </div>
            </div>

            {/* Enhanced MVP Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Urgency Score</Label>
                <div className="flex items-center gap-2">
                  <div className="text-xl font-bold text-orange-600">
                    {result.prediction.urgency_score || 'N/A'}/20
                  </div>
                  {result.prediction.priority_level && (
                    <Badge 
                      variant={result.prediction.priority_level === 'Critical' ? 'destructive' :
                              result.prediction.priority_level === 'High' ? 'default' :
                              result.prediction.priority_level === 'Medium' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {result.prediction.priority_level}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Nutritional Value</Label>
                <div className="text-xl font-bold text-purple-600">
                  {result.prediction.nutritional_value || 'N/A'}/10
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Expiry Date</Label>
                <div className="text-sm font-medium text-red-600">
                  {result.prediction.expiry_date || 'N/A'}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Impact Score</Label>
                <div className="text-xl font-bold text-indigo-600">
                  {result.prediction.impact_score || 'N/A'}
                </div>
              </div>
            </div>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">Product</Label>
                <div className="font-medium">{result.prediction.product_name}</div>
              </div>
              <div>
                <Label className="text-gray-600">Store</Label>
                <div className="font-medium">#{result.prediction.store_id}</div>
              </div>
              <div>
                <Label className="text-gray-600">Date</Label>
                <div className="font-medium">{result.prediction.date}</div>
              </div>
            </div>

            {/* Product Attributes */}
            <div className="flex flex-wrap gap-2">
              {result.prediction.brain_diet_flag && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  🧠 Brain Diet Item
                </Badge>
              )}
              {result.prediction.promotion_flag && (
                <Badge variant="secondary">
                  🏷️ On Promotion
                </Badge>
              )}
              {result.prediction.shelf_life_days && (
                <Badge variant="outline">
                  📅 {result.prediction.shelf_life_days} days shelf life
                </Badge>
              )}
            </div>
            
            {result.model_info && (
              <div className="pt-4 border-t border-green-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Model: {result.model_info.model_type} | Accuracy: {result.model_info.accuracy}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Result */}
      {result && !result.success && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Prediction Failed:</strong> {result.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
