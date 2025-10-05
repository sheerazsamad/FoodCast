import { useState, useEffect } from 'react'

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

interface Claim {
  donationId: string
  recipientId: string
  recipientName: string
  recipientAddress: string
  notes?: string
}

export function useUserData() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userClaims, setUserClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  // Get user ID from localStorage
  const getUserId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || localStorage.getItem('userEmail')
    }
    return null
  }

  // Load user profile
  const loadUserProfile = async () => {
    const userId = getUserId()
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/users/profile?email=${encodeURIComponent(userId)}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.user) {
          setUserProfile(result.user)
          // Store user ID in localStorage for future use
          localStorage.setItem('userId', result.user.id)
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  // Load user claims
  const loadUserClaims = async () => {
    const userId = getUserId()
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      // Use the userProfile.id if available, otherwise use the userId from localStorage
      const claimsUserId = userProfile?.id || userId
      const response = await fetch(`/api/users/claims?userId=${encodeURIComponent(claimsUserId)}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setUserClaims(result.claims)
        }
      }
    } catch (error) {
      console.error('Error loading user claims:', error)
    }
  }

  // Claim a donation
  const claimDonation = async (donationId: string, notes?: string) => {
    const userId = getUserId()
    if (!userId) {
      console.error('No user ID found in localStorage')
      return false
    }

    // If userProfile is not loaded yet, try to load it first
    if (!userProfile) {
      console.log('User profile not loaded, attempting to load...')
      await loadUserProfile()
    }

    // If still no userProfile after loading, use fallback data
    if (!userProfile) {
      console.error('Could not load user profile, using fallback data')
      // Use fallback data from localStorage
      const fallbackName = localStorage.getItem('userName') || 'Unknown User'
      const fallbackAddress = 'Address not available'
      
      try {
        const response = await fetch('/api/users/claims', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            donationId,
            recipientName: fallbackName,
            recipientAddress: fallbackAddress,
            notes
          })
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            // Reload claims to get updated list
            await loadUserClaims()
            return true
          }
        } else {
          // Handle specific error cases
          const errorResult = await response.json()
          if (response.status === 400 && errorResult.error === 'Donation already claimed by this user') {
            console.log('Donation already claimed by this user')
            return 'already_claimed'
          }
        }
        return false
      } catch (error) {
        console.error('Error claiming donation with fallback data:', error)
        return false
      }
    }

    try {
      const response = await fetch('/api/users/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userProfile.id,
          donationId,
          recipientName: userProfile.name,
          recipientAddress: `${userProfile.address}, ${userProfile.city}, ${userProfile.zipCode}`,
          notes
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Reload claims to get updated list
          await loadUserClaims()
          // Trigger analytics refresh for homepage/admin dashboards
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('analytics:refresh'))
          }
          return true
        }
      } else {
        // Handle specific error cases
        const errorResult = await response.json()
        if (response.status === 400 && errorResult.error === 'Donation already claimed by this user') {
          console.log('Donation already claimed by this user')
          return 'already_claimed'
        }
      }
      return false
    } catch (error) {
      console.error('Error claiming donation:', error)
      return false
    }
  }

  // Unclaim a donation
  const unclaimDonation = async (donationId: string) => {
    const userId = getUserId()
    if (!userId || !userProfile) return false

    try {
      const response = await fetch(`/api/users/claims?userId=${encodeURIComponent(userProfile.id)}&donationId=${encodeURIComponent(donationId)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Reload claims to get updated list
          await loadUserClaims()
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error unclaiming donation:', error)
      return false
    }
  }

  // Check if user has claimed a donation
  const hasClaimed = (donationId: string) => {
    return userClaims.some(claim => claim.donationId === donationId)
  }

  // Get claimed donation IDs
  const getClaimedIds = () => {
    return userClaims.map(claim => claim.donationId)
  }

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      await Promise.all([loadUserProfile(), loadUserClaims()])
      setLoading(false)
    }

    initializeData()
  }, [])

  return {
    userProfile,
    userClaims,
    loading,
    claimDonation,
    unclaimDonation,
    hasClaimed,
    getClaimedIds,
    refreshData: () => {
      loadUserProfile()
      loadUserClaims()
    }
  }
}
