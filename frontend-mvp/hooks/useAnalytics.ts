import { useState, useEffect } from 'react'

interface AnalyticsData {
  totalDonations: number
  totalPredicted: number
  totalConfirmed: number
  totalClaimed: number
  totalDelivered: number
  predictionAccuracy: number
  averageResponseTime: number
  totalMealsRescued: number
  totalWeight: number
  co2Saved: number
  totalValueSaved: number
  activeDonors: number
  activeRecipients: number
  pendingOffers: number
}

interface AnalyticsResponse {
  success: boolean
  analytics: AnalyticsData
  lastUpdated: string
  dataSource: string
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics?t=${Date.now()}`, { cache: 'no-store' })
      const data: AnalyticsResponse = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
        setLastUpdated(data.lastUpdated)
        setError(null)
      } else {
        setError('Failed to fetch analytics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()

    // Refresh analytics every 30 seconds to show live updates
    const interval = setInterval(fetchAnalytics, 30000)

    // Listen for global refresh events to update immediately after claims/updates
    const onRefresh = () => fetchAnalytics()
    if (typeof window !== 'undefined') {
      window.addEventListener('analytics:refresh', onRefresh)
    }

    return () => {
      clearInterval(interval)
      if (typeof window !== 'undefined') {
        window.removeEventListener('analytics:refresh', onRefresh)
      }
    }
  }, [])

  return {
    analytics,
    loading,
    error,
    lastUpdated,
    refresh: fetchAnalytics
  }
}
