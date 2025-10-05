import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // For now, we'll simulate checking if user exists
    // In a real implementation, you would query your database here
    // For demo purposes, we'll check localStorage or a simple in-memory store
    
    // Check if user exists in our "database" (simulated)
    // In a real app, this would be: const user = await db.users.findByEmail(email)
    const userExists = await checkUserExists(email)

    return NextResponse.json({
      success: true,
      exists: userExists,
      message: userExists ? 'User found' : 'User not found'
    })

  } catch (error) {
    console.error('Check user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Function to check if user exists by querying the user profile API
async function checkUserExists(email: string): Promise<boolean> {
  try {
    // Check if user exists in the user profile API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users/profile?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      return result.success && result.user
    }
    
    // If we get a 404, the user doesn't exist
    if (response.status === 404) {
      return false
    }
    
    // For other errors, we'll use the fallback
    console.log(`Profile API returned status ${response.status} for email ${email}`)
    return false
  } catch (error) {
    console.error('Error checking user existence:', error)
    
    // Fallback: Check if user exists in localStorage simulation
    // In a real app, this would be a proper database query
    return await checkUserInLocalStorage(email)
  }
}

// Fallback function to check user existence in localStorage simulation
async function checkUserInLocalStorage(email: string): Promise<boolean> {
  try {
    // In a real implementation, this would query a persistent database
    // For demo purposes, we'll check if the user has any stored data
    
    // Check if user has any claims (indicates they've used the system before)
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users/claims?userId=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    // If we can fetch claims, the user exists
    if (response.ok) {
      return true
    }
    
    // If no claims found, user might still exist but never claimed anything
    // For demo purposes, we'll assume they exist if they've logged in before
    // In a real app, you'd have a proper user table
    
    return false
  } catch (error) {
    console.error('Error in localStorage fallback:', error)
    return false
  }
}
