import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface ClaimData {
  donationId: string
  recipientId: string
  recipientName: string
  recipientAddress: string
  notes?: string
}

// In-memory storage for demo purposes
// In production, this would be a proper database
const userClaims: Record<string, ClaimData[]> = {}

// Persist claims to disk so analytics can read live data even across server restarts
const claimsDataPath = path.join(process.cwd(), '..', 'backend', 'claims.json')

// Load claims on startup
try {
  if (fs.existsSync(claimsDataPath)) {
    const raw = JSON.parse(fs.readFileSync(claimsDataPath, 'utf8')) as Record<string, ClaimData[]>
    Object.assign(userClaims, raw)
  }
} catch (e) {
  console.warn('⚠️ Could not load persisted claims:', e)
}

const saveClaims = () => {
  try {
    fs.writeFileSync(claimsDataPath, JSON.stringify(userClaims, null, 2))
  } catch (e) {
    console.error('Failed to persist claims:', e)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user's claims
    const claims = userClaims[userId] || []
    
    return NextResponse.json({
      success: true,
      claims: claims
    })

  } catch (error) {
    console.error('Get claims error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, donationId, recipientName, recipientAddress, notes } = body
    
    if (!userId || !donationId || !recipientName || !recipientAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create new claim
    const claimData: ClaimData = {
      donationId,
      recipientId: userId,
      recipientName,
      recipientAddress,
      notes: notes || ''
    }

    // Store claim for user
    if (!userClaims[userId]) {
      userClaims[userId] = []
    }
    
    // Check if already claimed
    const existingClaim = userClaims[userId].find(claim => claim.donationId === donationId)
    if (existingClaim) {
      return NextResponse.json(
        { success: false, error: 'Donation already claimed by this user' },
        { status: 400 }
      )
    }

    userClaims[userId].push(claimData)
    
    console.log(`User ${userId} claimed donation ${donationId}`)
    console.log('User claims:', userClaims[userId])

    // persist
    saveClaims()

    return NextResponse.json({
      success: true,
      message: 'Claim created successfully',
      claim: claimData
    })

  } catch (error) {
    console.error('Create claim error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const donationId = searchParams.get('donationId')
    
    if (!userId || !donationId) {
      return NextResponse.json(
        { success: false, error: 'User ID and donation ID are required' },
        { status: 400 }
      )
    }

    // Remove claim
    if (userClaims[userId]) {
      userClaims[userId] = userClaims[userId].filter(claim => claim.donationId !== donationId)
    }
    
    console.log(`User ${userId} unclaimed donation ${donationId}`)

    // persist
    saveClaims()

    return NextResponse.json({
      success: true,
      message: 'Claim removed successfully'
    })

  } catch (error) {
    console.error('Delete claim error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
