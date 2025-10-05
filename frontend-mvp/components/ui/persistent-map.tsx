"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Package, Clock } from 'lucide-react'
import { loadGoogleMaps } from '@/lib/googleMapsLoader'
import type { Offer } from '@/lib/types'

interface PersistentMapProps {
  userRole?: 'donor' | 'recipient' | 'admin'
  offers?: Offer[]
  loading?: boolean
  onOfferClick?: (offer: Offer) => void
}

export function PersistentMap({ userRole = 'recipient', offers = [], loading = false, onOfferClick }: PersistentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
          // Default to San Francisco if geolocation fails
          setUserLocation({ lat: 37.7749, lng: -122.4194 })
        }
      )
    } else {
      // Default to San Francisco if geolocation not supported
      setUserLocation({ lat: 37.7749, lng: -122.4194 })
    }
  }, [])

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMaps()
        getUserLocation()
      } catch (error) {
        console.error('Error loading Google Maps:', error)
      }
    }

    initializeMap()
  }, [getUserLocation])

  // Create map when user location is available
  useEffect(() => {
    if (!userLocation || !mapRef.current || mapLoaded) return

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center: userLocation,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    mapInstanceRef.current = map
    setMapLoaded(true)

    // Add user location marker
    new window.google.maps.Marker({
      position: userLocation,
      map: map,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="#ffffff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(24, 24),
        anchor: new window.google.maps.Point(12, 12)
      }
    })
  }, [userLocation, mapLoaded])

  // Update markers when offers change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return

    console.log('PersistentMap: Offers updated, total offers:', offers.length)
    console.log('PersistentMap: Available offers:', offers.filter(o => o.status === 'available').length)
    console.log('PersistentMap: All offers data:', offers)

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Filter offers that have location data
    const offersWithLocation = offers.filter(offer => 
      offer.latitude && offer.longitude && offer.status === 'available'
    )

    console.log('PersistentMap: Adding markers for offers with location:', offersWithLocation.length)
    console.log('PersistentMap: Offers with location data:', offersWithLocation)

    offersWithLocation.forEach((offer) => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: offer.latitude!,
          lng: offer.longitude!
        },
        map: mapInstanceRef.current,
        title: `${offer.category} - ${offer.description}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
              <circle cx="16" cy="16" r="6" fill="#ffffff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        }
      })

      // Create info window content
      const infoContent = `
        <div style="padding: 12px; max-width: 250px; font-family: system-ui, sans-serif;">
          <div style="font-weight: bold; margin-bottom: 8px; color: #1f2937; font-size: 16px;">
            ${offer.category.charAt(0).toUpperCase() + offer.category.slice(1)}
          </div>
          <div style="margin-bottom: 8px; color: #374151; font-size: 14px;">
            ${offer.description}
          </div>
          <div style="margin-bottom: 8px; color: #6b7280; font-size: 12px;">
            <strong>Quantity:</strong> ${offer.quantity} ${offer.unit}
          </div>
          <div style="margin-bottom: 8px; color: #6b7280; font-size: 12px;">
            <strong>Available:</strong> ${new Date(offer.availableDate).toLocaleDateString()}
          </div>
          <div style="margin-bottom: 8px; color: #6b7280; font-size: 12px;">
            <strong>Expires:</strong> ${new Date(offer.expiryDate).toLocaleDateString()}
          </div>
          <div style="margin-bottom: 8px; color: #6b7280; font-size: 12px;">
            <strong>Location:</strong> ${offer.location}
          </div>
          ${offer.urgencyLevel && offer.urgencyLevel !== 'medium' ? `
            <div style="margin-bottom: 8px;">
              <span style="
                padding: 2px 6px; 
                border-radius: 4px; 
                font-size: 10px; 
                font-weight: bold;
                background-color: ${offer.urgencyLevel === 'high' ? '#fef2f2' : '#f0f9ff'};
                color: ${offer.urgencyLevel === 'high' ? '#dc2626' : '#2563eb'};
              ">
                ${offer.urgencyLevel.toUpperCase()} PRIORITY
              </span>
            </div>
          ` : ''}
        </div>
      `

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent
      })

      // Add click listener
      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close()
        }
        infoWindow.open(mapInstanceRef.current, marker)
        infoWindowRef.current = infoWindow
        
        if (onOfferClick) {
          onOfferClick(offer)
        }
      })

      markersRef.current.push(marker)
    })

    // Fit map to show all markers
    if (offersWithLocation.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      offersWithLocation.forEach(offer => {
        bounds.extend({
          lat: offer.latitude!,
          lng: offer.longitude!
        })
      })
      
      // Also include user location in bounds
      if (userLocation) {
        bounds.extend(userLocation)
      }
      
      mapInstanceRef.current.fitBounds(bounds)
    }
  }, [offers, mapLoaded, userLocation, onOfferClick])

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      produce: "bg-green-100 text-green-800",
      dairy: "bg-blue-100 text-blue-800",
      bakery: "bg-amber-100 text-amber-800",
      prepared: "bg-purple-100 text-purple-800",
      canned: "bg-gray-100 text-gray-800",
      frozen: "bg-cyan-100 text-cyan-800",
      other: "bg-slate-100 text-slate-800",
    }
    return colors[category] || colors.other
  }

  const availableOffers = offers.filter(offer => offer.status === 'available')
  const offersWithLocation = availableOffers.filter(offer => offer.latitude && offer.longitude)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              Food Offers Map
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {offersWithLocation.length} available offers with locations
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Your Location
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Food Offers
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border border-gray-200"
            style={{ minHeight: '400px' }}
          />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>
        
        {offersWithLocation.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {offersWithLocation.slice(0, 6).map((offer) => (
              <div key={offer.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getCategoryColor(offer.category)} variant="secondary">
                        {offer.category}
                      </Badge>
                      {offer.urgencyLevel && offer.urgencyLevel !== 'medium' && (
                        <Badge 
                          variant="outline" 
                          className={offer.urgencyLevel === 'high' ? 'text-red-600 border-red-200' : 'text-blue-600 border-blue-200'}
                        >
                          {offer.urgencyLevel}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-sm mb-1">{offer.description}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {offer.quantity} {offer.unit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(offer.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {offersWithLocation.length > 6 && (
              <div className="p-3 border rounded-lg bg-gray-50 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  +{offersWithLocation.length - 6} more offers
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
