"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, AlertCircle } from 'lucide-react'

interface OfferFormDebugProps {
  onClose: () => void
}

export default function OfferFormDebug({ onClose }: OfferFormDebugProps) {
  const [address, setAddress] = useState('')
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [autocompleteInitialized, setAutocompleteInitialized] = useState(false)
  
  const addressInputRef = useRef<HTMLInputElement>(null)

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        addDebugInfo('Starting Google Maps API load...')
        
        if (typeof window === 'undefined') {
          addDebugInfo('❌ Window is undefined (server-side)')
          return
        }

        if (window.google && window.google.maps) {
          addDebugInfo('✅ Google Maps already loaded')
          setGoogleMapsLoaded(true)
          return
        }

        const script = document.createElement('script')
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        addDebugInfo(`API Key: ${apiKey ? 'Present' : 'Missing'}`)
        
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true
        
        script.onload = () => {
          if (window.google && window.google.maps) {
            addDebugInfo('✅ Google Maps API loaded successfully')
            setGoogleMapsLoaded(true)
          } else {
            addDebugInfo('❌ Google Maps API failed to load')
          }
        }
        
        script.onerror = (error) => {
          addDebugInfo(`❌ Script load error: ${error}`)
        }
        
        document.head.appendChild(script)
        addDebugInfo('Script added to document head')
        
      } catch (error) {
        addDebugInfo(`❌ Error loading Google Maps: ${error}`)
      }
    }

    loadGoogleMaps()
  }, [])

  // Initialize Places Autocomplete
  useEffect(() => {
    if (!googleMapsLoaded || !addressInputRef.current) {
      return
    }

    const initAutocomplete = () => {
      try {
        addDebugInfo('Initializing Places Autocomplete...')
        
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          addDebugInfo('❌ Google Maps Places API not available')
          return
        }

        // Clear any existing autocomplete
        if (addressInputRef.current) {
          addressInputRef.current.value = ''
        }

        const autocomplete = new window.google.maps.places.Autocomplete(
          addressInputRef.current!,
          {
            types: ['establishment', 'geocode'],
            fields: ['place_id', 'formatted_address', 'geometry', 'name'],
            componentRestrictions: { country: 'us' } // Restrict to US for better results
          }
        )

        // Add more detailed event listeners
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          addDebugInfo(`Place selected: ${place.formatted_address || 'Unknown'}`)
          
          if (place.place_id && place.geometry && place.geometry.location) {
            setAddress(place.formatted_address || '')
            addDebugInfo(`✅ Valid place selected with coordinates`)
            addDebugInfo(`📍 Lat: ${place.geometry.location.lat()}, Lng: ${place.geometry.location.lng()}`)
          } else {
            addDebugInfo('❌ Invalid place selected')
          }
        })

        // Listen for autocomplete predictions
        const service = new window.google.maps.places.PlacesService(document.createElement('div'))
        
        // Test if autocomplete is working by triggering a search
        const testSearch = () => {
          addDebugInfo('Testing autocomplete with "New York"...')
          const request = {
            query: 'New York',
            fields: ['place_id', 'formatted_address', 'geometry', 'name']
          }
          
          service.textSearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              addDebugInfo(`✅ Text search working: Found ${results.length} results`)
            } else {
              addDebugInfo(`❌ Text search failed: ${status}`)
            }
          })
        }

        // Test after a short delay
        setTimeout(testSearch, 1000)

        setAutocompleteInitialized(true)
        addDebugInfo('✅ Places Autocomplete initialized successfully')
        addDebugInfo('💡 Try typing "New York" or "123 Main Street" to test')
        
      } catch (error) {
        addDebugInfo(`❌ Error initializing autocomplete: ${error}`)
      }
    }

    // Small delay to ensure DOM is ready
    setTimeout(initAutocomplete, 100)
  }, [googleMapsLoaded])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Places Autocomplete Debug
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a debug version to test Google Places Autocomplete functionality.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <Label htmlFor="address">Test Address Input:</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              ref={addressInputRef}
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Start typing an address..."
              className="pl-10"
              style={{
                zIndex: 1
              }}
            />
          </div>
          <p className="text-sm text-gray-500">
            Try typing: "New York", "123 Main Street", "Starbucks", or "Central Park"
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>Debug Information:</Label>
          <div className="bg-gray-100 p-4 rounded-md max-h-60 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <p className="text-gray-500">No debug information yet...</p>
            ) : (
              debugInfo.map((info, index) => (
                <p key={index} className="text-sm font-mono">
                  {info}
                </p>
              ))
            )}
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
