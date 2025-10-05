// Google Maps integration utilities
export interface PlaceResult {
  place_id: string
  formatted_address: string
  geometry: {
    location: {
      lat: () => number
      lng: () => number
    }
  }
  name?: string
}

export interface PlaceDetails {
  place_id: string
  formatted_address: string
  latitude: number
  longitude: number
  name?: string
}

// Load Google Maps API
export const loadGoogleMaps = (): Promise<typeof google> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Maps can only be loaded in the browser'))
      return
    }

    if (window.google && window.google.maps) {
      resolve(window.google)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google)
      } else {
        reject(new Error('Failed to load Google Maps'))
      }
    }
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'))
    }
    
    document.head.appendChild(script)
  })
}

// Initialize Places Autocomplete
export const initializePlacesAutocomplete = (
  input: HTMLInputElement,
  onPlaceSelected: (place: PlaceDetails) => void
): google.maps.places.Autocomplete | null => {
  if (!window.google || !window.google.maps || !window.google.maps.places) {
    console.error('Google Maps Places API not loaded')
    return null
  }

  const autocomplete = new window.google.maps.places.Autocomplete(input, {
    types: ['establishment', 'geocode'],
    fields: ['place_id', 'formatted_address', 'geometry', 'name']
  })

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    
    if (!place.place_id || !place.geometry || !place.geometry.location) {
      console.error('Invalid place selected')
      return
    }

    const placeDetails: PlaceDetails = {
      place_id: place.place_id,
      formatted_address: place.formatted_address || '',
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      name: place.name
    }

    onPlaceSelected(placeDetails)
  })

  return autocomplete
}

// Get place details by place_id
export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  if (!window.google || !window.google.maps || !window.google.maps.places) {
    console.error('Google Maps Places API not loaded')
    return null
  }

  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    )

    service.getDetails(
      {
        placeId,
        fields: ['place_id', 'formatted_address', 'geometry', 'name']
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const placeDetails: PlaceDetails = {
            place_id: place.place_id || '',
            formatted_address: place.formatted_address || '',
            latitude: place.geometry?.location?.lat() || 0,
            longitude: place.geometry?.location?.lng() || 0,
            name: place.name
          }
          resolve(placeDetails)
        } else {
          reject(new Error(`Places service error: ${status}`))
        }
      }
    )
  })
}

// Calculate distance between two points (in miles)
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Get user's current location
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Create map bounds from center and radius
export const createBoundsFromCenter = (
  center: { lat: number; lng: number },
  radiusMiles: number
): google.maps.LatLngBounds => {
  const bounds = new window.google.maps.LatLngBounds()
  
  // Convert miles to degrees (approximate)
  const latRange = radiusMiles / 69 // 1 degree latitude ≈ 69 miles
  const lngRange = radiusMiles / (69 * Math.cos(center.lat * Math.PI / 180))
  
  bounds.extend(new window.google.maps.LatLng(
    center.lat - latRange,
    center.lng - lngRange
  ))
  bounds.extend(new window.google.maps.LatLng(
    center.lat + latRange,
    center.lng + lngRange
  ))
  
  return bounds
}

// Format time remaining until expiry
export const formatTimeRemaining = (expiresAt: string): string => {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diffMs = expiry.getTime() - now.getTime()
  
  if (diffMs <= 0) {
    return 'Expired'
  }
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays}d ${diffHours % 24}h`
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes % 60}m`
  } else {
    return `${diffMinutes}m`
  }
}

// Check if offer is expiring soon (within 10 minutes)
export const isExpiringSoon = (expiresAt: string, minutesThreshold: number = 10): boolean => {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diffMs = expiry.getTime() - now.getTime()
  const diffMinutes = diffMs / (1000 * 60)
  
  return diffMinutes <= minutesThreshold && diffMinutes > 0
}
