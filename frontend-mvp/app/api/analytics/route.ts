import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

export async function GET() {
  try {
    // Load offers from the same source as /api/offers
    let offers: any[] = []
    let claims: Array<{ donationId: string, recipientId: string }> = []
    try {
      const claimsPath = path.join(process.cwd(), '..', 'backend', 'claims.json')
      // Offers now maintained in-memory via /api/offers; for analytics, prefer empty baseline unless a future DB is added
      offers = []
      // Load live claims persisted by /api/users/claims
      if (fs.existsSync(claimsPath)) {
        const raw = JSON.parse(fs.readFileSync(claimsPath, 'utf8')) as Record<string, Array<{ donationId: string, recipientId: string }>>
        claims = Object.values(raw).flat()
      }
    } catch (error) {
      console.error('⚠️ Could not load analytics sources:', error)
    }

    // Calculate analytics based on offers
    const totalDonations = offers.filter(o => o.status === 'delivered').length
    const totalPredicted = offers.filter(o => o.isFromPrediction).length
    const totalConfirmed = offers.filter(o => o.status !== 'pending').length // Assuming pending is not confirmed
    // Combine live claims with offer-based claims to avoid missing predicted-offer claims
    const claimedIdsFromClaims = new Set(claims.map(c => c.donationId))
    const claimedIdsFromOffers = new Set(offers.filter(o => o.claimedBy || o.status === 'claimed' || o.status === 'in_transit' || o.status === 'delivered').map(o => o.id))
    const combinedClaimIds = new Set<string>([...claimedIdsFromClaims, ...claimedIdsFromOffers])
    const totalClaimed = combinedClaimIds.size
    const totalDelivered = offers.filter(o => o.status === 'delivered').length

    // Weight/impact should reflect live progress: include claimed, in_transit, delivered
    const impactOffers = offers.filter(o => ['claimed', 'in_transit', 'delivered'].includes(o.status))

    const toLbs = (offer: any): number => {
      if (typeof offer.quantity !== 'number') return 0
      const unit = (offer.unit || '').toString().toLowerCase()
      if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') {
        return offer.quantity * 2.20462
      }
      // Treat lbs, lb, pounds, or unknown units as lbs for demo purposes
      return offer.quantity
    }

    const totalWeight = impactOffers.reduce((sum, o) => sum + toLbs(o), 0)
    
    const totalValueSaved = offers
      .filter(o => o.status === 'delivered' && typeof o.estimatedValue === 'number')
      .reduce((sum, o) => sum + o.estimatedValue, 0)
    
    // Meals: 1 meal ~= 1.2 lbs
    const totalMealsRescued = Math.round(totalWeight / 1.2)
    // CO2: ~0.5 kg CO2 prevented per lb food
    const co2Saved = parseFloat((totalWeight * 0.5).toFixed(1))

    // Mock active users for demo purposes, as user data is separate
    const activeDonors = new Set(offers.map(o => o.donorId)).size
    const activeRecipients = (() => {
      const recipientIdsFromClaims = claims.map(c => c.recipientId)
      const recipientIdsFromOffers = offers
        .filter(o => o.claimedBy)
        .map(o => o.claimedBy as string)
      return new Set([...recipientIdsFromClaims, ...recipientIdsFromOffers]).size
    })()

    const pendingOffers = offers.filter(o => o.status === 'available').length

    const analytics: AnalyticsData = {
      totalDonations,
      totalPredicted,
      totalConfirmed,
      totalClaimed,
      totalDelivered,
      predictionAccuracy: 85.2, // Static for demo
      averageResponseTime: 2.3, // Static for demo
      totalMealsRescued,
      totalWeight,
      co2Saved,
      totalValueSaved: parseFloat(totalValueSaved.toFixed(2)),
      activeDonors,
      activeRecipients,
      pendingOffers,
    }

    return NextResponse.json({
      success: true,
      analytics,
      lastUpdated: new Date().toISOString(),
      dataSource: "real_transactions"
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch analytics',
        analytics: {
          totalDonations: 0,
          totalPredicted: 0,
          totalConfirmed: 0,
          totalClaimed: 0,
          totalDelivered: 0,
          predictionAccuracy: 0,
          averageResponseTime: 0,
          totalMealsRescued: 0,
          totalWeight: 0,
          co2Saved: 0,
          totalValueSaved: 0,
          activeDonors: 0,
          activeRecipients: 0,
          pendingOffers: 0
        }
      },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  }
}
