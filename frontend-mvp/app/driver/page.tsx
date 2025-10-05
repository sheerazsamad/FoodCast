"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Truck, CheckCircle2, Clock, Package } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DeliveryCard } from "@/components/driver/delivery-card"
import { mockDeliveries, mockDonations } from "@/lib/mock-data"
import type { Delivery } from "@/lib/types"

export default function DriverDashboard() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries.filter((d) => d.driverId === "driver-1"))

  const stats = {
    assigned: deliveries.filter((d) => d.status === "assigned").length,
    inProgress: deliveries.filter(
      (d) => d.status === "en_route_pickup" || d.status === "picked_up" || d.status === "en_route_delivery",
    ).length,
    completed: deliveries.filter((d) => d.status === "delivered").length,
    total: deliveries.length,
  }

  const handleUpdateStatus = (deliveryId: string, newStatus: Delivery["status"]) => {
    setDeliveries(
      deliveries.map((d) => {
        if (d.id !== deliveryId) return d

        const updates: Partial<Delivery> = { status: newStatus }

        if (newStatus === "picked_up" && !d.pickedUpAt) {
          updates.pickedUpAt = new Date().toISOString()
        }

        if (newStatus === "delivered" && !d.deliveredAt) {
          updates.deliveredAt = new Date().toISOString()
        }

        return { ...d, ...updates }
      }),
    )
  }

  const activeDeliveries = deliveries.filter(
    (d) =>
      d.status === "assigned" ||
      d.status === "en_route_pickup" ||
      d.status === "picked_up" ||
      d.status === "en_route_delivery",
  )

  const completedDeliveries = deliveries.filter((d) => d.status === "delivered")

  return (
    <DashboardLayout role="driver" userName="John Smith">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-white/10">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-600/20 blur-2xl"/>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">Driver Dashboard</h1>
          <p className="text-muted-foreground">Manage your delivery routes and update status</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Assigned</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assigned}</div>
              <p className="text-xs text-muted-foreground">Ready to start</p>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Active deliveries</p>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All time deliveries</p>
            </CardContent>
          </Card>
        </div>

        {/* Deliveries List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Deliveries</CardTitle>
            <CardDescription>View and update delivery status in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">
                  Active <Badge className="ml-2">{activeDeliveries.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed <Badge className="ml-2">{completedDeliveries.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-6">
                {activeDeliveries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active deliveries</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeDeliveries.map((delivery) => {
                      const donation = mockDonations.find((d) => d.id === delivery.donationId)
                      return (
                        <DeliveryCard
                          key={delivery.id}
                          delivery={delivery}
                          donation={donation}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-6">
                {completedDeliveries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No completed deliveries yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedDeliveries.map((delivery) => {
                      const donation = mockDonations.find((d) => d.id === delivery.donationId)
                      return (
                        <DeliveryCard
                          key={delivery.id}
                          delivery={delivery}
                          donation={donation}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
