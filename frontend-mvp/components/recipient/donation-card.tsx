"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MapPin, Calendar, Package, CheckCircle2, Clock } from "lucide-react"
import type { Donation } from "@/lib/types"

interface DonationCardProps {
  donation: Donation
  onClaim: () => void
  isClaimed: boolean
}

export function DonationCard({ donation, onClaim, isClaimed }: DonationCardProps) {
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

  const daysUntilExpiry = Math.ceil(
    (new Date(donation.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={getCategoryColor(donation.category)} variant="secondary">
            {donation.category}
          </Badge>
          {isClaimed && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Claimed
            </Badge>
          )}
        </div>
        <h3 className="font-bold text-lg mt-2">{donation.description}</h3>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{donation.donorName}</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="h-4 w-4 flex-shrink-0" />
          <span>
            {donation.quantity} {donation.unit}
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>
            Expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? "day" : "days"}
          </span>
        </div>

        {donation.claimedAt && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>Claimed {new Date(donation.claimedAt).toLocaleDateString()}</span>
          </div>
        )}

        {daysUntilExpiry <= 2 && (
          <Badge variant="destructive" className="w-full justify-center">
            Urgent - Expires Soon
          </Badge>
        )}
      </CardContent>

      <CardFooter>
        {!isClaimed ? (
          <Button onClick={onClaim} className="w-full">
            Claim Donation
          </Button>
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
