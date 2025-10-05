// Global Google Maps API loader to prevent multiple loading
let isGoogleMapsLoading = false
let isGoogleMapsLoaded = false
let loadPromise: Promise<typeof google> | null = null

export interface PlaceDetails {
  place_id: string
  formatted_address: string
  latitude: number
  longitude: number
  name?: string
  city?: string
  postal_code?: string
}

export const loadGoogleMaps = (): Promise<typeof google> => {
  // Return existing promise if already loading
  if (loadPromise) {
    return loadPromise
  }

  // Return immediately if already loaded
  if (isGoogleMapsLoaded && window.google && window.google.maps) {
    return Promise.resolve(window.google)
  }

  // Prevent multiple loading
  if (isGoogleMapsLoading) {
    return new Promise((resolve, reject) => {
      const checkLoaded = () => {
        if (isGoogleMapsLoaded && window.google && window.google.maps) {
          resolve(window.google)
        } else if (!isGoogleMapsLoading) {
          reject(new Error('Failed to load Google Maps'))
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
    })
  }

  isGoogleMapsLoading = true

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google Maps can only be loaded in the browser'))
      return
    }

    const script = document.createElement('script')
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      reject(new Error('Google Maps API key not found'))
      return
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=3.62`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      if (window.google && window.google.maps) {
        isGoogleMapsLoaded = true
        isGoogleMapsLoading = false
        resolve(window.google)
      } else {
        isGoogleMapsLoading = false
        reject(new Error('Failed to load Google Maps'))
      }
    }
    
    script.onerror = () => {
      isGoogleMapsLoading = false
      reject(new Error('Failed to load Google Maps script'))
    }
    
    document.head.appendChild(script)
  })

  return loadPromise
}

// Check if Google Maps is already loaded
export const isGoogleMapsReady = (): boolean => {
  return isGoogleMapsLoaded && !!(window.google && window.google.maps)
}

// Initialize Places Autocomplete with proper error handling
export const initializePlacesAutocomplete = (
  input: HTMLInputElement,
  onPlaceSelected: (place: any) => void
): google.maps.places.Autocomplete | null => {
  if (!isGoogleMapsReady()) {
    console.error('Google Maps not ready for Places Autocomplete')
    return null
  }

  try {
    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      types: ['establishment', 'geocode'],
      fields: ['place_id', 'formatted_address', 'geometry', 'name', 'address_components'],
      componentRestrictions: { country: 'us' }
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      
      if (!place.place_id || !place.geometry || !place.geometry.location) {
        console.error('Invalid place selected')
        return
      }

      const components = place.address_components || []
      const getComponent = (type: string) => components.find((c: any) => c.types?.includes(type))?.long_name
      const city = getComponent('locality') || getComponent('sublocality_level_1') || getComponent('administrative_area_level_2') || ''
      const postalCode = getComponent('postal_code') || ''

      const placeDetails = {
        place_id: place.place_id,
        formatted_address: place.formatted_address || '',
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        name: place.name,
        city,
        postal_code: postalCode
      }

      onPlaceSelected(placeDetails)
    })

    return autocomplete
  } catch (error) {
    console.error('Error initializing Places Autocomplete:', error)
    return null
  }
}
