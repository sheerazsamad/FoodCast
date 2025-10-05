"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Brain, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Clock
} from "lucide-react"
import { 
  checkPredictionHealth, 
  type HealthCheckResponse,
  type PredictionResponse 
} from "@/lib/prediction-api"
import { PredictionForm } from "./prediction-form"

interface PredictionDashboardProps {
  className?: string
}

export function PredictionDashboard({ className }: PredictionDashboardProps) {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null)
  const [isCheckingHealth, setIsCheckingHealth] = useState(false)
  const [recentPredictions, setRecentPredictions] = useState<PredictionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Check health status on component mount
  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    setIsCheckingHealth(true)
    try {
      const health = await checkPredictionHealth()
      setHealthStatus(health)
    } catch (error) {
      console.error('Health check failed:', error)
      setHealthStatus({
        success: false,
        model_server_status: 'down',
        error: 'Health check failed'
      })
    } finally {
      setIsCheckingHealth(false)
      setIsLoading(false)
    }
  }

  const handlePredictionComplete = (result: PredictionResponse) => {
    if (result.success) {
      // Add to recent predictions (keep only last 5)
      setRecentPredictions(prev => [result, ...prev.slice(0, 4)])
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'down':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading prediction dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            AI Prediction Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Predict food surplus using our trained machine learning model
          </p>
        </div>
        
        <Button 
          onClick={checkHealth} 
          disabled={isCheckingHealth}
          variant="outline"
          size="sm"
        >
          {isCheckingHealth ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Activity className="h-4 w-4 mr-2" />
          )}
          Check Status
        </Button>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getHealthStatusIcon(healthStatus.model_server_status)}
                  <span className="font-medium">Model Server</span>
                </div>
                <Badge 
                  variant={healthStatus.model_server_status === 'up' ? 'default' : 'destructive'}
                >
                  {healthStatus.model_server_status}
                </Badge>
              </div>
              
              {healthStatus.model_loaded !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Model Loaded</span>
                  <Badge variant={healthStatus.model_loaded ? 'default' : 'secondary'}>
                    {healthStatus.model_loaded ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
              
              {healthStatus.features_count !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Features Count</span>
                  <span className="text-sm font-medium">{healthStatus.features_count}</span>
                </div>
              )}
              
              {healthStatus.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{healthStatus.error}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">Unable to check system status</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prediction Form */}
      <PredictionForm onPredictionComplete={handlePredictionComplete} />

      {/* Recent Predictions */}
      {recentPredictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Predictions
            </CardTitle>
            <CardDescription>
              Your latest AI predictions for food surplus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPredictions.map((prediction, index) => (
                prediction.success && prediction.prediction && (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">
                          {prediction.prediction.product_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Store #{prediction.prediction.store_id} • {prediction.prediction.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {prediction.prediction.predicted_surplus.toFixed(1)} units
                      </div>
                      <Badge 
                        variant={prediction.prediction.confidence === 'high' ? 'default' : 
                                prediction.prediction.confidence === 'moderate' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {prediction.prediction.confidence}
                      </Badge>
                    </div>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Model Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-gray-600">Model Type</Label>
              <div className="font-medium">Gradient Boosting Regressor</div>
            </div>
            <div>
              <Label className="text-gray-600">Accuracy</Label>
              <div className="font-medium">59.4% (R² = 0.5937)</div>
            </div>
            <div>
              <Label className="text-gray-600">Features</Label>
              <div className="font-medium">12 selected features</div>
            </div>
            <div>
              <Label className="text-gray-600">Training Data</Label>
              <div className="font-medium">89,900 samples</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This model predicts next-day food surplus based on historical sales data, 
              inventory levels, and temporal patterns. Predictions are most accurate for products with 
              consistent sales patterns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
