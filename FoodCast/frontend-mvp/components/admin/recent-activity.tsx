"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, CheckCircle2, Truck, Users } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "donation",
    icon: Package,
    title: "New donation confirmed",
    description: "Whole Foods Market - 50 lbs of produce",
    time: "5 minutes ago",
    status: "confirmed",
  },
  {
    id: 2,
    type: "claim",
    icon: Users,
    title: "Donation claimed",
    description: "SF Food Bank claimed bakery items",
    time: "12 minutes ago",
    status: "claimed",
  },
  {
    id: 3,
    type: "delivery",
    icon: Truck,
    title: "Delivery in progress",
    description: "Driver John Smith en route to delivery",
    time: "25 minutes ago",
    status: "in_transit",
  },
  {
    id: 4,
    type: "completed",
    icon: CheckCircle2,
    title: "Delivery completed",
    description: "60 lbs delivered to Community Kitchen",
    time: "1 hour ago",
    status: "delivered",
  },
  {
    id: 5,
    type: "donation",
    icon: Package,
    title: "New prediction created",
    description: "Trader Joe's - Dairy products for tomorrow",
    time: "2 hours ago",
    status: "predicted",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0 capitalize">
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
