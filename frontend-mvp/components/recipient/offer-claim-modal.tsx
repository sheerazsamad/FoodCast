"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Gift, AlertCircle } from "lucide-react"
import type { Offer } from "@/lib/types"

interface OfferClaimModalProps {
  offer: Offer
  onClose: () => void
  onClaim: (offerId: string, notes: string) => void
}

export function OfferClaimModal({ offer, onClose, onClaim }: OfferClaimModalProps) {
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onClaim(offer.id, notes)
    } finally {
      setIsSubmitting(false)
    }
  }

  const daysUntilExpiry = Math.ceil(
    (new Date(offer.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-blue-500" />
            Claim Direct Offer
          </DialogTitle>
          <DialogDescription>
            You are about to claim this direct offer from {offer.donorName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{offer.description}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-medium">{offer.quantity} {offer.unit}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium capitalize">{offer.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Available:</span>
                <span className="font-medium">{new Date(offer.availableDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Expires:</span>
                <span className="font-medium">{daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}</span>
              </div>
              {offer.urgencyLevel && (
                <div className="flex justify-between">
                  <span>Urgency:</span>
                  <span className="font-medium capitalize">{offer.urgencyLevel}</span>
                </div>
              )}
              {offer.pickupWindow && (
                <div className="flex justify-between">
                  <span>Pickup Window:</span>
                  <span className="font-medium text-xs">{offer.pickupWindow}</span>
                </div>
              )}
              {offer.location && (
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium text-xs">{offer.location}</span>
                </div>
              )}
            </div>
          </div>

          {offer.specialInstructions && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Special Instructions:</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{offer.specialInstructions}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about pickup arrangements, special requirements, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Claiming..." : "Claim Offer"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
