import { NextRequest, NextResponse } from 'next/server'
import type { Offer } from '@/lib/types'
import fs from 'fs'
import path from 'path'

// Start with an empty in-memory offers list (no demo data)
let offers: Offer[] = []

// Initialize from persisted file if present (no demo seeding)
try {
  const combinedDataPath = path.join(process.cwd(), '..', 'backend', 'combined_demo_offers.json')
  if (fs.existsSync(combinedDataPath)) {
    const persisted = JSON.parse(fs.readFileSync(combinedDataPath, 'utf8')) as Offer[]
    if (Array.isArray(persisted)) {
      offers = persisted
      console.log(`✅ Loaded ${offers.length} persisted offers`)
    }
  }
} catch (error) {
  console.log('⚠️ Could not load persisted offers:', error)
}

// Save offers to file
const saveOffers = () => {
  try {
    const combinedDataPath = path.join(process.cwd(), '..', 'backend', 'combined_demo_offers.json')
    fs.writeFileSync(combinedDataPath, JSON.stringify(offers, null, 2))
  } catch (error) {
    console.error('Error saving offers:', error)
  }
}

export async function GET() {
  try {
    return NextResponse.json({ offers })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'> = await request.json()
    
    const newOffer: Offer = {
      ...offerData,
      id: `offer-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    offers.push(newOffer)
    
    // Save to file
    saveOffers()
    
    return NextResponse.json({ 
      success: true, 
      offer: newOffer 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating offer:', error)
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()
    
    const offerIndex = offers.findIndex(offer => offer.id === id)
    if (offerIndex === -1) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }
    
    offers[offerIndex] = {
      ...offers[offerIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }
    
    // Save to file
    saveOffers()
    
    return NextResponse.json({ 
      success: true, 
      offer: offers[offerIndex] 
    })
  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Offer ID is required' },
        { status: 400 }
      )
    }
    
    const offerIndex = offers.findIndex(offer => offer.id === id)
    if (offerIndex === -1) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }
    
    offers.splice(offerIndex, 1)
    
    // Save to file
    saveOffers()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting offer:', error)
    return NextResponse.json(
      { error: 'Failed to delete offer' },
      { status: 500 }
    )
  }
}
