"use client"

import { useEffect, useRef, useState } from 'react'

export default function MinimalPlacesTest() {
  const [status, setStatus] = useState('Initializing...')
  const [address, setAddress] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        // Check if API key exists
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          setStatus('❌ API Key not found')
          return
        }

        setStatus('✅ API Key found, loading Google Maps...')

        // Load Google Maps API
        if (window.google && window.google.maps) {
          setStatus('✅ Google Maps already loaded')
          initAutocomplete()
          return
        }

        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=3.62`
        script.async = true
        script.defer = true

        script.onload = () => {
          if (window.google && window.google.maps) {
            setStatus('✅ Google Maps loaded, initializing autocomplete...')
            setTimeout(initAutocomplete, 100)
          } else {
            setStatus('❌ Failed to load Google Maps')
          }
        }

        script.onerror = () => {
          setStatus('❌ Failed to load Google Maps script')
        }

        document.head.appendChild(script)
      } catch (error) {
        setStatus(`❌ Error: ${error}`)
      }
    }

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google || !window.google.maps || !window.google.maps.places) {
        setStatus('❌ Cannot initialize autocomplete')
        return
      }

      try {
        // Clear any existing autocomplete
        const existingContainer = document.querySelector('.pac-container')
        if (existingContainer) {
          existingContainer.remove()
        }

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['establishment', 'geocode'],
          fields: ['place_id', 'formatted_address', 'geometry', 'name'],
          componentRestrictions: { country: 'us' }
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()
          if (place.formatted_address) {
            setAddress(place.formatted_address)
            setStatus(`✅ Place selected: ${place.formatted_address}`)
          }
        })

        // Fix positioning immediately
        setTimeout(() => {
          const pacContainer = document.querySelector('.pac-container') as HTMLElement
          if (pacContainer && inputRef.current) {
            const inputRect = inputRef.current.getBoundingClientRect()
            pacContainer.style.position = 'fixed'
            pacContainer.style.top = `${inputRect.bottom + window.scrollY + 4}px`
            pacContainer.style.left = `${inputRect.left + window.scrollX}px`
            pacContainer.style.width = `${inputRect.width}px`
            pacContainer.style.zIndex = '9999'
            pacContainer.style.backgroundColor = 'white'
            pacContainer.style.border = '1px solid #ccc'
            pacContainer.style.borderRadius = '4px'
            pacContainer.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)'
          }
        }, 100)

        setStatus('✅ Autocomplete ready! Try typing an address...')
      } catch (error) {
        setStatus(`❌ Autocomplete error: ${error}`)
      }
    }

    initGoogleMaps()
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Minimal Places Test</h2>
      
      <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <strong>Status:</strong> {status}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Address:</label>
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Type an address..."
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>
      
      <div style={{ fontSize: '14px', color: '#666' }}>
        <p>Try typing: "New York", "123 Main Street", or "Starbucks"</p>
      </div>
    </div>
  )
}
