import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

// File-based storage for demo purposes
// In production, this would be a proper database
const STORAGE_FILE = path.join(process.cwd(), 'user-profiles.json')

// Load user profiles from file
const loadUserProfiles = (): Record<string, UserProfile> => {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading user profiles:', error)
  }
  return {}
}

// Save user profiles to file
const saveUserProfiles = (profiles: Record<string, UserProfile>) => {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(profiles, null, 2))
  } catch (error) {
    console.error('Error saving user profiles:', error)
  }
}

// Load user profiles on module initialization
let userProfiles: Record<string, UserProfile> = loadUserProfiles()

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

    // Reload profiles from file to ensure we have the latest data
    userProfiles = loadUserProfiles()

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
    
    // Save to persistent storage
    saveUserProfiles(userProfiles)
    
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
