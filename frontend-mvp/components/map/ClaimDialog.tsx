"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Package, Clock, User, AlertCircle } from 'lucide-react'
import { MapOfferWithDistance } from '@/hooks/useMapOffers'
import { useMapOffers } from '@/hooks/useMapOffers'

interface ClaimDialogProps {
  offer: MapOfferWithDistance | null
  open: boolean
  onClose: () => void
  onClaimSuccess?: () => void
}

export default function ClaimDialog({ 
  offer, 
  open, 
  onClose, 
  onClaimSuccess 
}: ClaimDialogProps) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { claimOffer } = useMapOffers()

  const handleClaim = async () => {
    if (!offer) return
    
    setLoading(true)
    setError(null)
    
    try {
      await claimOffer(offer.id, notes.trim() || undefined)
      
      if (onClaimSuccess) {
        onClaimSuccess()
      }
      
      onClose()
      setNotes('')
    } catch (err) {
      console.error('Error claiming offer:', err)
      setError(err instanceof Error ? err.message : 'Failed to claim offer')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setNotes('')
      setError(null)
    }
  }

  if (!offer) return null

  const categoryColors: Record<string, string> = {
    fruit: '#FF6B6B',
    vegetable: '#4ECDC4',
    grain: '#45B7D1',
    protein: '#96CEB4',
    nut_seed: '#FFEAA7',
    other: '#DDA0DD'
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Claim Offer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Offer Details */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">{offer.title}</h3>
              <span 
                className="px-2 py-1 text-xs rounded-full text-white"
                style={{ backgroundColor: categoryColors[offer.category] }}
              >
                {offer.category}
              </span>
            </div>
            
            {offer.description && (
              <p className="text-sm text-gray-600">{offer.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span>{offer.quantity} {offer.unit}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className={offer.isExpiringSoon ? 'text-orange-600 font-medium' : ''}>
                  {offer.timeRemaining}
                </span>
              </div>
            </div>
            
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{offer.formatted_address}</span>
            </div>
            
            {offer.distance && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span>{offer.distance.toFixed(1)} miles away</span>
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or notes for the donor..."
              rows={3}
            />
          </div>
          
          {/* Warning for expiring offers */}
          {offer.isExpiringSoon && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This offer is expiring soon! Please coordinate pickup quickly.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleClaim}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Claiming...' : 'Claim Offer'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
