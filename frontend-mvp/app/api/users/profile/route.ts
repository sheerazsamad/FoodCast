import { NextRequest, NextResponse } from 'next/server'

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  address: string
  city: string
  zipCode: string
  phone: string
}

// In-memory storage for demo purposes
// In production, this would be a proper database
const userProfiles: Record<string, UserProfile> = {}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    
    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: 'User ID or email is required' },
        { status: 400 }
      )
    }

    // Find user by ID or email
    let user: UserProfile | undefined
    if (userId) {
      user = userProfiles[userId]
    } else if (email) {
      user = Object.values(userProfiles).find(u => u.email === email)
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: user
    })

  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, name, role, address, city, zipCode, phone } = body
    
    if (!id || !email || !name || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create or update user profile
    const userProfile: UserProfile = {
      id,
      email,
      name,
      role,
      address: address || '',
      city: city || '',
      zipCode: zipCode || '',
      phone: phone || ''
    }

    userProfiles[id] = userProfile
    
    console.log(`User profile created/updated for ${email}`)
    console.log('User profile:', userProfile)

    return NextResponse.json({
      success: true,
      message: 'User profile saved successfully',
      user: userProfile
    })

  } catch (error) {
    console.error('Save user profile error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
