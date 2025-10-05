import { NextResponse } from 'next/server'

/**
 * Health Check API Route
 * 
 * This endpoint provides a comprehensive health check for the entire application,
 * including the AI model server status.
 */

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Check if the prediction API is available
    let predictionApiStatus = 'unknown'
    let modelServerStatus = 'unknown'
    let modelLoaded = false
    let featuresCount = 0
    
    try {
      const predictionResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/predict`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      
      if (predictionResponse.ok) {
        const predictionData = await predictionResponse.json()
        predictionApiStatus = 'healthy'
        modelServerStatus = predictionData.model_server_status || 'unknown'
        modelLoaded = predictionData.model_loaded || false
        featuresCount = predictionData.features_count || 0
      } else {
        predictionApiStatus = 'unhealthy'
        modelServerStatus = 'down'
      }
    } catch (error) {
      predictionApiStatus = 'unhealthy'
      modelServerStatus = 'down'
    }
    
    const responseTime = Date.now() - startTime
    
    // Determine overall health status
    const overallStatus = predictionApiStatus === 'healthy' && modelServerStatus === 'up' ? 'healthy' : 'degraded'
    
    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        api: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version
        },
        prediction_api: {
          status: predictionApiStatus,
          model_server_status: modelServerStatus,
          model_loaded: modelLoaded,
          features_count: featuresCount
        }
      },
      environment: {
        node_env: process.env.NODE_ENV,
        nextauth_url: process.env.NEXTAUTH_URL,
        model_server_url: process.env.MODEL_SERVER_URL || 'http://localhost:5001'
      }
    })
    
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        services: {
          api: {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      },
      { status: 503 }
    )
  }
}
