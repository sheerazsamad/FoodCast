"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, MapPin, Package, Calendar, AlertCircle } from "lucide-react"
import type { Donation } from "@/lib/types"

interface ClaimModalProps {
  donation: Donation
  onClose: () => void
  onClaim: (donationId: string, notes: string) => void
}

export function ClaimModal({ donation, onClose, onClaim }: ClaimModalProps) {
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    onClaim(donation.id, notes)
    setIsSubmitting(false)
  }

  const daysUntilExpiry = Math.ceil(
    (new Date(donation.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Claim Donation</CardTitle>
              <CardDescription>Review details and confirm your claim</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Donation Details */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-lg">{donation.description}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">{donation.donorName}</p>
                    <p className="text-muted-foreground text-xs">{donation.donorAddress}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      {donation.quantity} {donation.unit}
                    </p>
                    <p className="text-muted-foreground text-xs capitalize">{donation.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="font-medium">Expires {new Date(donation.expiryDate).toLocaleDateString()}</p>
                    <p className="text-muted-foreground text-xs">
                      {daysUntilExpiry} {daysUntilExpiry === 1 ? "day" : "days"} remaining
                    </p>
                  </div>
                </div>
              </div>

              {daysUntilExpiry <= 2 && (
                <div className="flex items-start gap-2 bg-destructive/10 text-destructive p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Urgent Pickup Required</p>
                    <p className="text-xs">This donation expires very soon. Please arrange immediate pickup.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions or requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Include pickup time preferences, special handling requirements, or contact information.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Claiming..." : "Confirm Claim"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
