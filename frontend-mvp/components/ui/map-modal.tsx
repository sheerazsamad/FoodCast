"use client"

import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MapPin, X } from 'lucide-react'
import { loadGoogleMaps } from '@/lib/googleMapsLoader'

interface MapModalProps {
  isOpen: boolean
  onClose: () => void
  location: {
    latitude: number
    longitude: number
    formatted_address: string
    title?: string
  }
}

export function MapModal({ isOpen, onClose, location }: MapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  console.log('MapModal rendered with isOpen:', isOpen, 'location:', location)

  useEffect(() => {
    if (!isOpen || !mapRef.current) return

    const initializeMap = async () => {
      try {
        await loadGoogleMaps()
        
        if (!mapRef.current) return

        // Create map centered on the offer location
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 15,
          center: {
            lat: location.latitude,
            lng: location.longitude
          },
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

        // Create marker for the offer location
        const marker = new window.google.maps.Marker({
          position: {
            lat: location.latitude,
            lng: location.longitude
          },
          map: map,
          title: location.title || 'Offer Location',
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

        markerRef.current = marker

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <div style="font-weight: bold; margin-bottom: 4px; color: #1f2937;">
                ${location.title || 'Offer Location'}
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                ${location.formatted_address}
              </div>
            </div>
          `
        })

        // Show info window on marker click
        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

        // Show info window immediately
        infoWindow.open(map, marker)

        setMapLoaded(true)
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initializeMap()
  }, [isOpen, location])

  // Cleanup map when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null
      }
      setMapLoaded(false)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 z-[60]">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              Offer Location
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6 pt-0">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900">{location.title || 'Offer Location'}</h3>
            <p className="text-sm text-gray-600">{location.formatted_address}</p>
          </div>
          
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
          
          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => {
                const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
                window.open(url, '_blank')
              }}
              className="flex-1"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Open in Google Maps
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
