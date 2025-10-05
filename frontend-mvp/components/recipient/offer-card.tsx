"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MapPin, Calendar, Package, CheckCircle2, Clock, Gift, AlertTriangle } from "lucide-react"
import type { Offer } from "@/lib/types"

interface OfferCardProps {
  offer: Offer
  onClaim: () => void
  isClaimed: boolean
}

export function OfferCard({ offer, onClaim, isClaimed }: OfferCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      produce: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      dairy: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      bakery: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      prepared: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      canned: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      frozen: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      other: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
    }
    return colors[category] || colors.other
  }

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    return colors[urgency] || colors.medium
  }

  const daysUntilExpiry = Math.ceil(
    (new Date(offer.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-2">
            <Badge className={getCategoryColor(offer.category)} variant="secondary">
              {offer.category}
            </Badge>
            <Badge className={getUrgencyColor(offer.urgencyLevel || "medium")} variant="secondary">
              {offer.urgencyLevel || "medium"} urgency
            </Badge>
          </div>
          {isClaimed && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Claimed
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Gift className="h-4 w-4 text-blue-500" />
          <h3 className="font-bold text-lg">
            {offer.isFromPrediction ? "AI Predicted Offer" : "Direct Offer"}
          </h3>
          {offer.isFromPrediction && (
            <Badge variant="outline" className="text-xs">
              🤖 AI Generated
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{offer.description}</p>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{offer.donorName}</span>
          {offer.location && <span className="text-xs">• {offer.location}</span>}
          {offer.latitude && offer.longitude && (
            <span className="text-xs text-blue-600">• 📍 Pinned Location</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="h-4 w-4 flex-shrink-0" />
          <span>
            {offer.quantity} {offer.unit}
          </span>
          {offer.estimatedValue && (
            <span className="text-xs">• ${offer.estimatedValue}</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>
            Available: {new Date(offer.availableDate).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>
            Expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? "day" : "days"}
          </span>
        </div>

        {offer.pickupWindow && (
          <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
            <strong>Pickup Window:</strong> {offer.pickupWindow}
          </div>
        )}

        {offer.specialInstructions && (
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            <strong>Special Instructions:</strong> {offer.specialInstructions}
          </div>
        )}

        {offer.notes && (
          <div className="text-xs text-muted-foreground">
            <strong>Notes:</strong> {offer.notes}
          </div>
        )}

        {/* AI Prediction Metrics */}
        {offer.isFromPrediction && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">🤖 AI Prediction Metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {offer.confidence && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-medium">{offer.confidence}</span>
                </div>
              )}
              {offer.predictedSurplus && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Predicted Surplus:</span>
                  <span className="font-medium">{offer.predictedSurplus.toFixed(1)} lbs</span>
                </div>
              )}
              {offer.dailySales && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Sales:</span>
                  <span className="font-medium">{offer.dailySales}</span>
                </div>
              )}
              {offer.stockLevel && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock Level:</span>
                  <span className="font-medium">{offer.stockLevel}</span>
                </div>
              )}
              {offer.estimated_meals && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Meals:</span>
                  <span className="font-medium">{offer.estimated_meals}</span>
                </div>
              )}
              {offer.nutritional_value && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nutrition Score:</span>
                  <span className="font-medium">{offer.nutritional_value}/10</span>
                </div>
              )}
              {offer.urgency_score && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Urgency Score:</span>
                  <span className="font-medium">{offer.urgency_score}</span>
                </div>
              )}
              {offer.impact_score && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impact Score:</span>
                  <span className="font-medium">{offer.impact_score}</span>
                </div>
              )}
            </div>
            {offer.priority_level && (
              <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Priority Level:</span>
                  <Badge 
                    variant={offer.priority_level === 'High' ? 'destructive' : offer.priority_level === 'Medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {offer.priority_level}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {offer.claimedAt && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Claimed {new Date(offer.claimedAt).toLocaleDateString()}</span>
          </div>
        )}

        {(daysUntilExpiry <= 2 || offer.urgencyLevel === "high") && (
          <Badge variant="destructive" className="w-full justify-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {offer.urgencyLevel === "high" ? "High Priority" : "Expires Soon"}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {!isClaimed ? (
          <>
            <Button onClick={onClaim} className="flex-1">
              <Gift className="h-4 w-4 mr-2" />
              Claim Offer
            </Button>
            {offer.latitude && offer.longitude && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const url = `https://www.google.com/maps?q=${offer.latitude},${offer.longitude}`
                  window.open(url, '_blank')
                }}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <Button variant="outline" className="w-full bg-transparent" disabled>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Already Claimed
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
