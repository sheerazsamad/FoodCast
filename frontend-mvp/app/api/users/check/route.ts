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
    
    return false
  } catch (error) {
    console.error('Error checking user existence:', error)
    
    // Fallback to hardcoded list for demo purposes
    const registeredEmails = [
      'sheeraz.s.samad@gmail.com', // From the logs, we know this user was registered
      // Add other registered emails here or implement proper DB query
    ]
    
    // Normalize email for comparison (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim()
    
    return registeredEmails.includes(normalizedEmail)
  }
}
