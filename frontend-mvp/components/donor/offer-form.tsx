"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, MapPin } from "lucide-react"
import type { Offer, FoodCategory } from "@/lib/types"
import { loadGoogleMaps, initializePlacesAutocomplete, type PlaceDetails } from "@/lib/googleMapsLoader"

interface OfferFormProps {
  onClose: () => void
  onSubmit: (offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function OfferForm({ onClose, onSubmit }: OfferFormProps) {
  const [formData, setFormData] = useState({
    category: "" as FoodCategory,
    description: "",
    quantity: "",
    unit: "lbs",
    availableDate: "",
    expiryDate: "",
    location: "",
    estimatedValue: "",
    notes: "",
    urgencyLevel: "medium" as "low" | "medium" | "high",
    pickupWindow: "",
    specialInstructions: "",
  })

  // Map location state
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)
  

  // Initialize Google Maps and Places Autocomplete
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadGoogleMaps()
        
        if (addressInputRef.current) {
          const autocomplete = initializePlacesAutocomplete(
            addressInputRef.current,
            (place: PlaceDetails) => {
              setPlaceDetails(place)
              setFormData(prev => ({
                ...prev,
                location: place.formatted_address
              }))
              setAddressError(null)
            }
          )
          
          if (!autocomplete) {
            setAddressError('Failed to initialize address autocomplete')
          }
        }
      } catch (error) {
        console.error('Error initializing Google Maps:', error)
        setAddressError('Failed to load map services')
      }
    }

    initializeMap()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear place details if address is manually changed
    if (field === 'location' && value !== placeDetails?.formatted_address) {
      setPlaceDetails(null)
      setAddressError(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.category || !formData.description || !formData.quantity || !formData.availableDate || !formData.expiryDate) {
      alert("Please fill in all required fields")
      return
    }

    // Validate location (either manual or map-pinned)
    if (!formData.location) {
      setAddressError("Please provide a pickup location")
      return
    }

    const newOffer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'> = {
      donorId: "donor-1",
      donorName: "Whole Foods Market",
      donorAddress: "123 Main St, San Francisco, CA 94102",
      category: formData.category,
      description: formData.description,
      quantity: Number.parseFloat(formData.quantity),
      unit: formData.unit,
      status: "available",
      availableDate: formData.availableDate,
      expiryDate: formData.expiryDate,
      location: formData.location,
      estimatedValue: formData.estimatedValue ? Number.parseFloat(formData.estimatedValue) : undefined,
      notes: formData.notes,
      isDirectOffer: true,
      urgencyLevel: formData.urgencyLevel,
      pickupWindow: formData.pickupWindow,
      specialInstructions: formData.specialInstructions,
      // Include map location data if available
      ...(placeDetails && {
        place_id: placeDetails.place_id,
        formatted_address: placeDetails.formatted_address,
        latitude: placeDetails.latitude,
        longitude: placeDetails.longitude,
      }),
    }

    onSubmit(newOffer)
    
    // Close form after submission - the persistent map will show the new offer
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create Direct Offer</CardTitle>
              <CardDescription>Make a direct offer of surplus food to recipients</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Food Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as FoodCategory })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produce">Produce</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="bakery">Bakery</SelectItem>
                    <SelectItem value="prepared">Prepared Foods</SelectItem>
                    <SelectItem value="canned">Canned Goods</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgencyLevel">Urgency Level *</Label>
                <Select
                  value={formData.urgencyLevel}
                  onValueChange={(value) => setFormData({ ...formData, urgencyLevel: value as "low" | "medium" | "high" })}
                >
                  <SelectTrigger id="urgencyLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Can wait a few days</SelectItem>
                    <SelectItem value="medium">Medium - Should be picked up soon</SelectItem>
                    <SelectItem value="high">High - Needs immediate pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the food items..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="items">Items</SelectItem>
                    <SelectItem value="meals">Meals</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availableDate">Available Date *</Label>
                <Input
                  id="availableDate"
                  type="date"
                  value={formData.availableDate}
                  onChange={(e) => setFormData({ ...formData, availableDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Pickup Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    ref={addressInputRef}
                    id="location"
                    placeholder="Start typing an address..."
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupWindow">Preferred Pickup Window</Label>
              <Input
                id="pickupWindow"
                placeholder="e.g., 9 AM - 5 PM, Monday-Friday"
                value={formData.pickupWindow}
                onChange={(e) => setFormData({ ...formData, pickupWindow: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                placeholder="Any special handling requirements, storage needs, etc."
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about this offer..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Create Direct Offer
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
    </div>
  )
}
