"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Package, Clock, AlertCircle } from 'lucide-react'
import { loadGoogleMaps, initializePlacesAutocomplete, PlaceDetails } from '@/lib/googleMapsLoader'
import { FoodCategory } from '@/lib/supabase'
import { useMapOffers } from '@/hooks/useMapOffers'

interface OfferFormProps {
  onClose?: () => void
  onCancel?: () => void
  onSubmit?: (offer: any) => void
}

export default function OfferForm({ onClose, onCancel, onSubmit }: OfferFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as FoodCategory | '',
    quantity: '',
    unit: '',
    address: '',
    expires_at: ''
  })
  
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)
  
  const addressInputRef = useRef<HTMLInputElement>(null)
  const { createOffer } = useMapOffers()

  const categories: { value: FoodCategory; label: string }[] = [
    { value: 'fruit', label: 'Fruit' },
    { value: 'vegetable', label: 'Vegetable' },
    { value: 'grain', label: 'Grain' },
    { value: 'protein', label: 'Protein' },
    { value: 'nut_seed', label: 'Nuts/Seeds' },
    { value: 'other', label: 'Other' }
  ]

  const units = [
    'lbs', 'kg', 'pieces', 'bags', 'boxes', 'containers', 'gallons', 'liters'
  ]

  // Initialize Google Maps and Places Autocomplete
  useEffect(() => {
    const initPlaces = async () => {
      try {
        await loadGoogleMaps()
        
        if (addressInputRef.current) {
          const autocomplete = initializePlacesAutocomplete(
            addressInputRef.current,
            (place: PlaceDetails) => {
              setPlaceDetails(place)
              setFormData(prev => ({
                ...prev,
                address: place.formatted_address
              }))
              setAddressError(null)
            }
          )
          
          if (!autocomplete) {
            setError('Failed to initialize address autocomplete')
          }
        }
      } catch (err) {
        console.error('Error initializing Places API:', err)
        setError('Failed to load address autocomplete')
      }
    }

    initPlaces()
  }, [])

  // Set default expiry time (2 hours from now)
  useEffect(() => {
    const now = new Date()
    now.setHours(now.getHours() + 2)
    const defaultExpiry = now.toISOString().slice(0, 16) // Format for datetime-local input
    
    setFormData(prev => ({
      ...prev,
      expires_at: defaultExpiry
    }))
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear address error when user starts typing
    if (field === 'address') {
      setAddressError(null)
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return false
    }
    
    if (!formData.category) {
      setError('Category is required')
      return false
    }
    
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setError('Quantity must be greater than 0')
      return false
    }
    
    if (!formData.unit) {
      setError('Unit is required')
      return false
    }
    
    if (!placeDetails) {
      setAddressError('Please select a valid address from the dropdown')
      return false
    }
    
    if (!formData.expires_at) {
      setError('Expiry time is required')
      return false
    }
    
    const expiryTime = new Date(formData.expires_at)
    const now = new Date()
    const minExpiry = new Date(now.getTime() + 30 * 60 * 1000) // 30 minutes from now
    
    if (expiryTime <= minExpiry) {
      setError('Expiry time must be at least 30 minutes from now')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const offerData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category as FoodCategory,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        place_id: placeDetails!.place_id,
        formatted_address: placeDetails!.formatted_address,
        latitude: placeDetails!.latitude,
        longitude: placeDetails!.longitude,
        expires_at: new Date(formData.expires_at).toISOString()
      }
      
      const newOffer = await createOffer(offerData)
      
      if (onSubmit) {
        onSubmit(newOffer)
      }
      
      onCancel ? onCancel() : onClose?.()
    } catch (err) {
      console.error('Error creating offer:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create offer'
      setError(errorMessage)
      console.log('Error details:', {
        message: errorMessage,
        originalError: err
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Create Map Offer
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Fresh Apples from Local Orchard"
              required
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional details about the food..."
              rows={3}
            />
          </div>
          
          {/* Category and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="10"
                required
              />
            </div>
          </div>
          
          {/* Unit */}
          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => handleInputChange('unit', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Pickup Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                ref={addressInputRef}
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Start typing an address..."
                className="pl-10"
                required
              />
            </div>
            {addressError && (
              <p className="text-sm text-red-500">{addressError}</p>
            )}
            {placeDetails && (
              <p className="text-sm text-green-600">
                ✓ Location verified: {placeDetails.formatted_address}
              </p>
            )}
          </div>
          
          {/* Expiry Time */}
          <div className="space-y-2">
            <Label htmlFor="expires_at">Available Until *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => handleInputChange('expires_at', e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <p className="text-sm text-gray-500">
              Minimum 30 minutes from now
            </p>
          </div>
          
          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Offer'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
