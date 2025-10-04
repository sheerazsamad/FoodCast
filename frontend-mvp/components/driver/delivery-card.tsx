"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Package, Navigation, CheckCircle2, ArrowRight } from "lucide-react"
import type { Delivery, Donation } from "@/lib/types"

interface DeliveryCardProps {
  delivery: Delivery
  donation?: Donation
  onUpdateStatus: (deliveryId: string, newStatus: Delivery["status"]) => void
}

export function DeliveryCard({ delivery, donation, onUpdateStatus }: DeliveryCardProps) {
  const getStatusConfig = (status: Delivery["status"]) => {
    const configs = {
      assigned: {
        label: "Assigned",
        variant: "secondary" as const,
        nextStatus: "en_route_pickup" as const,
        nextLabel: "Start Pickup",
      },
      en_route_pickup: {
        label: "En Route to Pickup",
        variant: "default" as const,
        nextStatus: "picked_up" as const,
        nextLabel: "Confirm Pickup",
      },
      picked_up: {
        label: "Picked Up",
        variant: "default" as const,
        nextStatus: "en_route_delivery" as const,
        nextLabel: "Start Delivery",
      },
      en_route_delivery: {
        label: "En Route to Delivery",
        variant: "default" as const,
        nextStatus: "delivered" as const,
        nextLabel: "Confirm Delivery",
      },
      delivered: {
        label: "Delivered",
        variant: "default" as const,
        nextStatus: null,
        nextLabel: null,
      },
      cancelled: {
        label: "Cancelled",
        variant: "destructive" as const,
        nextStatus: null,
        nextLabel: null,
      },
    }
    return configs[status]
  }

  const statusConfig = getStatusConfig(delivery.status)
  const isCompleted = delivery.status === "delivered"

  return (
    <Card className={isCompleted ? "opacity-75" : ""}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Delivery Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">Delivery #{delivery.id.split("-")[1]}</h3>
                <p className="text-sm text-muted-foreground">
                  Assigned {new Date(delivery.assignedAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>

            {donation && (
              <div className="bg-muted rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">{donation.description}</p>
                    <p className="text-muted-foreground">
                      {donation.quantity} {donation.unit} • {donation.category}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Route */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 mt-1">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div className="w-0.5 h-8 bg-border" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium mb-1">PICKUP</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{delivery.pickupAddress}</p>
                  </div>
                  {delivery.pickedUpAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Picked up at {new Date(delivery.pickedUpAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 mt-1">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium mb-1">DELIVERY</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{delivery.deliveryAddress}</p>
                  </div>
                  {delivery.deliveredAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Delivered at {new Date(delivery.deliveredAt).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex lg:flex-col gap-2 lg:w-48">
            {statusConfig.nextStatus && statusConfig.nextLabel && (
              <Button
                onClick={() => onUpdateStatus(delivery.id, statusConfig.nextStatus!)}
                className="flex-1 lg:flex-none"
              >
                {statusConfig.nextStatus === "en_route_pickup" || statusConfig.nextStatus === "en_route_delivery" ? (
                  <Navigation className="h-4 w-4 mr-2" />
                ) : statusConfig.nextStatus === "picked_up" || statusConfig.nextStatus === "delivered" ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {statusConfig.nextLabel}
              </Button>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center lg:justify-start">
                <CheckCircle2 className="h-4 w-4" />
                <span>Completed</span>
              </div>
            )}

            <Button variant="outline" className="flex-1 lg:flex-none bg-transparent" asChild>
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(delivery.pickupAddress)}&destination=${encodeURIComponent(delivery.deliveryAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Open Maps
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
