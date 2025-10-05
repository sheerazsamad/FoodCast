"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Package, User, Navigation } from 'lucide-react'
import { useMapOffers, MapOfferWithDistance } from '@/hooks/useMapOffers'
import { loadGoogleMaps } from '@/lib/googleMapsLoader'
import { getCurrentLocation, createBoundsFromCenter } from '@/lib/googleMaps'
import { FoodCategory } from '@/lib/supabase'

interface MapViewProps {
  onClaimOffer?: (offer: MapOfferWithDistance) => void
  onCancelOffer?: (offer: MapOfferWithDistance) => void
  userRole?: 'donor' | 'recipient' | 'admin'
  showUserOffers?: boolean
}

export default function MapView({ 
  onClaimOffer, 
  onCancelOffer, 
  userRole = 'recipient',
  showUserOffers = false 
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  
  const [mapLoaded, setMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<MapOfferWithDistance | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | 'all'>('all')
  
  const { 
    offers, 
    loading, 
    error, 
    getUserLocation,
    claimOffer,
    cancelOffer 
  } = useMapOffers({
    center: userLocation || undefined,
    radius: 10, // 10 miles
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    showExpired: false
  })

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return

    try {
      const google = await loadGoogleMaps()
      
      // Default center (San Francisco)
      const defaultCenter = { lat: 37.7749, lng: -122.4194 }
      const center = userLocation || defaultCenter

      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      mapInstanceRef.current = map

      // Add user location marker if available
      if (userLocation) {
        new google.maps.Marker({
          position: userLocation,
          map,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        })
      }

      setMapLoaded(true)
    } catch (err) {
      console.error('Error initializing map:', err)
    }
  }, [userLocation])

  // Get user location
  const handleGetLocation = useCallback(async () => {
    try {
      const location = await getUserLocation()
      setUserLocation(location)
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(location)
        mapInstanceRef.current.setZoom(14)
      }
    } catch (err) {
      console.error('Error getting location:', err)
    }
  }, [getUserLocation])

  // Create marker for offer
  const createOfferMarker = useCallback((offer: MapOfferWithDistance) => {
    if (!mapInstanceRef.current || !window.google) return null

    const categoryColors: Record<FoodCategory, string> = {
      fruit: '#FF6B6B',
      vegetable: '#4ECDC4',
      grain: '#45B7D1',
      protein: '#96CEB4',
      nut_seed: '#FFEAA7',
      other: '#DDA0DD'
    }

    const marker = new window.google.maps.Marker({
      position: { lat: offer.latitude, lng: offer.longitude },
      map: mapInstanceRef.current,
      title: offer.title,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: categoryColors[offer.category],
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    })

    // Create info window content
    const infoContent = document.createElement('div')
    infoContent.className = 'p-4 max-w-sm'
    infoContent.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-start justify-between">
          <h3 class="font-semibold text-lg">${offer.title}</h3>
          <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${categoryColors[offer.category]}20; color: ${categoryColors[offer.category]}">
            ${offer.category}
          </span>
        </div>
        
        ${offer.description ? `<p class="text-sm text-gray-600">${offer.description}</p>` : ''}
        
        <div class="flex items-center gap-4 text-sm">
          <div class="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span>${offer.quantity} ${offer.unit}</span>
          </div>
          <div class="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>${offer.timeRemaining}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>${offer.formatted_address}</span>
        </div>
        
        ${offer.distance ? `<p class="text-sm text-gray-500">${offer.distance.toFixed(1)} miles away</p>` : ''}
        
        <div class="flex gap-2 pt-2">
          ${userRole === 'recipient' ? `
            <button 
              class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              onclick="window.claimOffer('${offer.id}')"
            >
              Claim Offer
            </button>
          ` : ''}
          ${userRole === 'donor' && showUserOffers ? `
            <button 
              class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
              onclick="window.cancelOffer('${offer.id}')"
            >
              Cancel
            </button>
          ` : ''}
        </div>
      </div>
    `

    // Add click listener
    marker.addListener('click', () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
      }
      
      infoWindowRef.current = new window.google.maps.InfoWindow({
        content: infoContent
      })
      
      infoWindowRef.current.open(mapInstanceRef.current, marker)
      setSelectedOffer(offer)
    })

    return marker
  }, [userRole, showUserOffers])

  // Update markers when offers change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Create new markers
    const newMarkers = offers
      .map(offer => createOfferMarker(offer))
      .filter((marker): marker is google.maps.Marker => marker !== null)

    markersRef.current = newMarkers

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      newMarkers.forEach(marker => {
        const position = marker.getPosition()
        if (position) bounds.extend(position)
      })
      
      if (userLocation) {
        bounds.extend(userLocation)
      }
      
      mapInstanceRef.current.fitBounds(bounds)
    }
  }, [offers, mapLoaded, createOfferMarker, userLocation])

  // Set up global functions for info window buttons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.claimOffer = (offerId: string) => {
        const offer = offers.find(o => o.id === offerId)
        if (offer && onClaimOffer) {
          onClaimOffer(offer)
        }
      }
      
      window.cancelOffer = (offerId: string) => {
        const offer = offers.find(o => o.id === offerId)
        if (offer && onCancelOffer) {
          onCancelOffer(offer)
        }
      }
    }
  }, [offers, onClaimOffer, onCancelOffer])

  // Initialize map on mount
  useEffect(() => {
    initializeMap()
  }, [initializeMap])

  const categories: { value: FoodCategory | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: '#6B7280' },
    { value: 'fruit', label: 'Fruit', color: '#FF6B6B' },
    { value: 'vegetable', label: 'Vegetable', color: '#4ECDC4' },
    { value: 'grain', label: 'Grain', color: '#45B7D1' },
    { value: 'protein', label: 'Protein', color: '#96CEB4' },
    { value: 'nut_seed', label: 'Nuts/Seeds', color: '#FFEAA7' },
    { value: 'other', label: 'Other', color: '#DDA0DD' }
  ]

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <Button
          onClick={handleGetLocation}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Use My Location
        </Button>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              onClick={() => setCategoryFilter(category.value)}
              variant={categoryFilter === category.value ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              {category.label}
            </Button>
          ))}
        </div>
        
        <div className="text-sm text-gray-500">
          {offers.length} offers found
        </div>
      </div>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg"
            style={{ minHeight: '400px' }}
          />
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">Error loading map: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading offers...</p>
        </div>
      )}

      {/* No Offers */}
      {!loading && !error && offers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No offers found in your area</p>
        </div>
      )}
    </div>
  )
}
