import { NextRequest, NextResponse } from 'next/server'

interface UserRegistrationData {
  email: string
  name: string
  role: 'donor' | 'recipient' | 'driver' | 'admin'
  address: string
  city?: string
  zipCode?: string
  phone: string
}

export async function POST(request: NextRequest) {
  try {
    const body: UserRegistrationData = await request.json()
    
    // Validate required fields (city/zip optional)
    if (!body.email || !body.name || !body.role || !body.address || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Map frontend roles to backend user types
    const userTypeMap: Record<string, 'store' | 'student' | 'shelter'> = {
      'donor': 'store',
      'recipient': 'shelter', 
      'driver': 'student',
      'admin': 'store' // Default admin to store type
    }

    const userType = userTypeMap[body.role] || 'store'

    // Create user profile data
    const userProfile = {
      user_id: body.email, // Using email as user_id for now
      user_type: userType,
      name: body.name,
      contact_email: body.email,
      phone: body.phone,
      address: body.address,
      zip_code: body.zipCode ? parseInt(body.zipCode) : null,
      // Note: latitude and longitude would need to be geocoded from address
      latitude: null,
      longitude: null
    }

    // For now, we'll just return success since we don't have the backend running
    // In a real implementation, you would save this to your database here
    console.log('User registration data:', userProfile)
    
    // Store the email in a simple way for the check API to find
    // In production, this would be handled by the database
    // For demo purposes, we'll log it so the check API can reference it
    console.log(`Registered user email: ${userProfile.contact_email}`)
    
    // Also save to user profile API for persistent storage
    try {
      const profileResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userProfile.user_id,
          email: userProfile.contact_email,
          name: userProfile.name,
          role: body.role,
          address: body.address,
          city: body.city || '',
          zipCode: body.zipCode || '',
          phone: body.phone
        })
      })
      
      if (profileResponse.ok) {
        console.log('User profile saved successfully')
      }
    } catch (error) {
      console.error('Error saving user profile:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: userProfile.user_id, // Use email as ID for consistency
          ...userProfile
        }
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
