import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { supabase, MapOffer, MapClaim, FoodCategory } from '@/lib/supabase'
import { calculateDistance, formatTimeRemaining, isExpiringSoon } from '@/lib/googleMaps'

// Simple UUID generator for consistent IDs from email
function generateUUIDFromEmail(email: string): string {
  // Create a simple hash-based UUID from email
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert to UUID format (simplified)
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `${hex.substring(0, 8)}-${hex.substring(0, 4)}-${hex.substring(0, 4)}-${hex.substring(0, 4)}-${hex.substring(0, 12)}`
}

export interface MapOfferWithDistance extends MapOffer {
  distance?: number
  timeRemaining: string
  isExpiringSoon: boolean
}

export interface UseMapOffersOptions {
  center?: { lat: number; lng: number }
  radius?: number // in miles
  category?: FoodCategory
  showExpired?: boolean
}

export const useMapOffers = (options: UseMapOffersOptions = {}) => {
  const { data: session } = useSession()
  const [offers, setOffers] = useState<MapOfferWithDistance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const { center, radius = 10, category, showExpired = false } = options

  // Fetch offers from Supabase
  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching map offers from Supabase...')

      let query = supabase
        .from('map_offers')
        .select('*')
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('Error fetching offers:', fetchError)
        console.log('Supabase error details:', {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code
        })
        
        // If table doesn't exist, fall back to empty array for now
        if (fetchError.message?.includes('relation') || fetchError.message?.includes('does not exist')) {
          console.log('Map offers table not set up yet, using empty array')
          setOffers([])
          setError(null)
          return
        }
        
        setError(`Database error: ${fetchError.message}`)
        setOffers([])
        return
      }

      console.log('Successfully fetched offers:', data?.length || 0, 'offers')

      if (!data) {
        setOffers([])
        return
      }

      // Process offers with distance and time calculations
      const processedOffers: MapOfferWithDistance[] = data.map((offer) => {
        const timeRemaining = formatTimeRemaining(offer.expires_at)
        const isExpiringSoon = isExpiringSoon(offer.expires_at, 10) // 10 minutes

        let distance: number | undefined
        if (center) {
          distance = calculateDistance(
            center.lat,
            center.lng,
            offer.latitude,
            offer.longitude
          )
        }

        return {
          ...offer,
          distance,
          timeRemaining,
          isExpiringSoon
        }
      })

      // Filter by radius if center is provided
      let filteredOffers = processedOffers
      if (center && radius) {
        filteredOffers = processedOffers.filter((offer) => 
          !offer.distance || offer.distance <= radius
        )
      }

      // Filter out expiring offers if not showing expired
      if (!showExpired) {
        filteredOffers = filteredOffers.filter((offer) => !offer.isExpiringSoon)
      }

      // Sort by distance if available, otherwise by creation time
      filteredOffers.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setOffers(filteredOffers)
    } catch (err) {
      console.error('Error fetching offers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch offers')
    } finally {
      setLoading(false)
    }
  }, [center, radius, category, showExpired])

  // Create a new offer
  const createOffer = useCallback(async (offerData: {
    title: string
    description?: string
    category: FoodCategory
    quantity: number
    unit: string
    place_id: string
    formatted_address: string
    latitude: number
    longitude: number
    expires_at: string
  }) => {
    try {
      if (!session?.user?.email) {
        throw new Error('User not authenticated')
      }

      const donorId = generateUUIDFromEmail(session.user.email)
      
      console.log('Creating offer with data:', {
        ...offerData,
        donor_id: donorId,
        donor_email: session.user.email
      })

      const { data, error } = await supabase
        .from('map_offers')
        .insert({
          ...offerData,
          donor_id: donorId
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', error)
        
        // If table doesn't exist, provide a helpful message
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          throw new Error('Map offers feature is not set up yet. Please contact the administrator to set up the database tables.')
        }
        
        throw new Error(`Database error: ${error.message || 'Unknown error'}`)
      }

      console.log('Offer created successfully:', data)
      
      // Refresh offers list
      await fetchOffers()
      return data
    } catch (err) {
      console.error('Error creating offer:', err)
      // Provide more detailed error information
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      throw new Error(`Failed to create offer: ${errorMessage}`)
    }
  }, [session, fetchOffers])

  // Claim an offer
  const claimOffer = useCallback(async (offerId: string, notes?: string) => {
    try {
      const { data, error } = await supabase.rpc('claim_map_offer', {
        offer_uuid: offerId,
        claim_notes: notes
      })

      if (error) {
        throw error
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to claim offer')
      }

      // Refresh offers list
      await fetchOffers()
      return data
    } catch (err) {
      console.error('Error claiming offer:', err)
      throw err
    }
  }, [fetchOffers])

  // Cancel an offer
  const cancelOffer = useCallback(async (offerId: string) => {
    try {
      const { data, error } = await supabase.rpc('cancel_map_offer', {
        offer_uuid: offerId
      })

      if (error) {
        throw error
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to cancel offer')
      }

      // Refresh offers list
      await fetchOffers()
      return data
    } catch (err) {
      console.error('Error cancelling offer:', err)
      throw err
    }
  }, [fetchOffers])

  // Get user's location
  const getUserLocation = useCallback(async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported')
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      setUserLocation(location)
      return location
    } catch (err) {
      console.error('Error getting user location:', err)
      throw err
    }
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('map_offers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'map_offers'
        },
        () => {
          // Refresh offers when any change occurs
          fetchOffers()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'map_claims'
        },
        () => {
          // Refresh offers when claims change
          fetchOffers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchOffers])

  // Initial fetch
  useEffect(() => {
    fetchOffers()
  }, [fetchOffers])

  return {
    offers,
    loading,
    error,
    userLocation,
    fetchOffers,
    createOffer,
    claimOffer,
    cancelOffer,
    getUserLocation
  }
}

// Hook for user's own offers (for donor dashboard)
export const useMyOffers = () => {
  const [offers, setOffers] = useState<MapOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyOffers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error: fetchError } = await supabase
        .from('map_offers')
        .select(`
          *,
          map_claims(id, recipient_id, claimed_at, notes, profiles!map_claims_recipient_id_fkey(name))
        `)
        .eq('donor_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setOffers(data || [])
    } catch (err) {
      console.error('Error fetching my offers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch offers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMyOffers()
  }, [fetchMyOffers])

  return {
    offers,
    loading,
    error,
    fetchMyOffers
  }
}

// Hook for user's claims (for recipient dashboard)
export const useMyClaims = () => {
  const [claims, setClaims] = useState<(MapClaim & { map_offers: MapOffer })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyClaims = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error: fetchError } = await supabase
        .from('map_claims')
        .select(`
          *,
          map_offers(*)
        `)
        .eq('recipient_id', user.id)
        .order('claimed_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setClaims(data || [])
    } catch (err) {
      console.error('Error fetching my claims:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch claims')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMyClaims()
  }, [fetchMyClaims])

  return {
    claims,
    loading,
    error,
    fetchMyClaims
  }
}
