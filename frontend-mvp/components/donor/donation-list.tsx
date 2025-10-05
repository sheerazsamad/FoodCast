"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Package, Truck, Clock } from "lucide-react"
import type { Donation } from "@/lib/types"

interface DonationListProps {
  donations: Donation[]
  onConfirm: (id: string) => void
  onCancel: (id: string) => void
}

export function DonationList({ donations, onConfirm, onCancel }: DonationListProps) {
  const getStatusBadge = (status: Donation["status"]) => {
    const variants = {
      predicted: { label: "Predicted", variant: "secondary" as const, icon: Clock },
      confirmed: { label: "Confirmed", variant: "default" as const, icon: CheckCircle2 },
      claimed: { label: "Claimed", variant: "default" as const, icon: Package },
      in_transit: { label: "In Transit", variant: "default" as const, icon: Truck },
      delivered: { label: "Delivered", variant: "default" as const, icon: CheckCircle2 },
      cancelled: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No donations found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <div key={donation.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-lg capitalize">{donation.category}</h3>
                  <p className="text-sm text-muted-foreground">{donation.description}</p>
                </div>
                {getStatusBadge(donation.status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <p className="font-medium">
                    {donation.quantity} {donation.unit}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Predicted:</span>
                  <p className="font-medium">{new Date(donation.predictedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expires:</span>
                  <p className="font-medium">
                    {(() => {
                      // Calculate expiration date from prediction date + shelf life
                      if (donation.predictedDate) {
                        const predictionDate = new Date(donation.predictedDate)
                        const shelfLifeDays = (donation as any).shelfLifeDays || 7 // Default to 7 days
                        const expiryDate = new Date(predictionDate)
                        expiryDate.setDate(expiryDate.getDate() + shelfLifeDays)
                        return expiryDate.toLocaleDateString()
                      }
                      return "Invalid Date"
                    })()}
                  </p>
                </div>
                {donation.claimedByName && (
                  <div>
                    <span className="text-muted-foreground">Claimed by:</span>
                    <p className="font-medium">{donation.claimedByName}</p>
                  </div>
                )}
              </div>

              {/* Enhanced MVP Features for AI Predictions */}
              {(donation.urgency_score || donation.nutritional_value || donation.estimated_meals || donation.priority_level || donation.impact_score) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <span className="text-muted-foreground">Urgency:</span>
                    <p className="font-medium text-orange-600">
                      {donation.urgency_score}/20
                      {donation.priority_level && (
                        <Badge 
                          variant={donation.priority_level === 'Critical' ? 'destructive' :
                                  donation.priority_level === 'High' ? 'default' :
                                  donation.priority_level === 'Medium' ? 'secondary' : 'outline'}
                          className="ml-1 text-xs"
                        >
                          {donation.priority_level}
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nutrition:</span>
                    <p className="font-medium text-purple-600">
                      {donation.nutritional_value || 'N/A'}/10
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Meals:</span>
                    <p className="font-medium text-blue-600">
                      {donation.estimated_meals || Math.round(donation.quantity * 2)} meals
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Impact:</span>
                    <p className="font-medium text-indigo-600">
                      {donation.impact_score || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex md:flex-col gap-2">
              {donation.status === "predicted" && (
                <>
                  <Button size="sm" onClick={() => onConfirm(donation.id)} className="flex-1 md:flex-none">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCancel(donation.id)}
                    className="flex-1 md:flex-none"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              )}
              {donation.status === "confirmed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancel(donation.id)}
                  className="flex-1 md:flex-none"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
