"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, TrendingUp } from "lucide-react"

const donors = [
  {
    id: 1,
    name: "Whole Foods Market",
    location: "San Francisco, CA",
    totalDonations: 89,
    totalWeight: 4250,
    trend: "+15%",
  },
  {
    id: 2,
    name: "Trader Joe's",
    location: "San Francisco, CA",
    totalDonations: 67,
    totalWeight: 3180,
    trend: "+22%",
  },
  {
    id: 3,
    name: "Safeway",
    location: "San Francisco, CA",
    totalDonations: 54,
    totalWeight: 2890,
    trend: "+8%",
  },
  {
    id: 4,
    name: "Target",
    location: "San Francisco, CA",
    totalDonations: 42,
    totalWeight: 2100,
    trend: "+12%",
  },
  {
    id: 5,
    name: "Costco",
    location: "San Francisco, CA",
    totalDonations: 38,
    totalWeight: 1950,
    trend: "+18%",
  },
]

export function TopDonors() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {donors.map((donor, index) => (
            <div key={donor.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">#{index + 1}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Store className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{donor.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{donor.location}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold">{donor.totalDonations}</p>
                <p className="text-xs text-muted-foreground">{donor.totalWeight} lbs</p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                <TrendingUp className="h-3 w-3" />
                {donor.trend}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
