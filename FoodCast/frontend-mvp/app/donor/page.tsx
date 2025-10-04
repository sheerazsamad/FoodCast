"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, Package, CheckCircle2, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PredictionForm } from "@/components/donor/prediction-form"
import { DonationList } from "@/components/donor/donation-list"
import { mockDonations } from "@/lib/mock-data"
import type { Donation } from "@/lib/types"

export default function DonorDashboard() {
  const [donations, setDonations] = useState<Donation[]>(mockDonations.filter((d) => d.donorId === "donor-1"))
  const [showPredictionForm, setShowPredictionForm] = useState(false)

  const stats = {
    predicted: donations.filter((d) => d.status === "predicted").length,
    confirmed: donations.filter((d) => d.status === "confirmed").length,
    claimed: donations.filter((d) => d.status === "claimed" || d.status === "in_transit").length,
    delivered: donations.filter((d) => d.status === "delivered").length,
  }

  const handleCreatePrediction = (newDonation: Donation) => {
    setDonations([newDonation, ...donations])
    setShowPredictionForm(false)
  }

  const handleConfirmDonation = (id: string) => {
    setDonations(
      donations.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "confirmed",
              confirmedDate: new Date().toISOString().split("T")[0],
              updatedAt: new Date().toISOString(),
            }
          : d,
      ),
    )
  }

  const handleCancelDonation = (id: string) => {
    setDonations(
      donations.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "cancelled",
              updatedAt: new Date().toISOString(),
            }
          : d,
      ),
    )
  }

  return (
    <DashboardLayout role="donor" userName="Whole Foods Market">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Donor Dashboard</h1>
            <p className="text-muted-foreground">Predict and manage your surplus food donations</p>
          </div>
          <Button onClick={() => setShowPredictionForm(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            New Prediction
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Predicted</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.predicted}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed}</div>
              <p className="text-xs text-muted-foreground">Available for claiming</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Claimed</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.claimed}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
              <p className="text-xs text-muted-foreground">Successfully rescued</p>
            </CardContent>
          </Card>
        </div>

        {/* Prediction Form Modal */}
        {showPredictionForm && (
          <PredictionForm onClose={() => setShowPredictionForm(false)} onSubmit={handleCreatePrediction} />
        )}

        {/* Donations List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Donations</CardTitle>
            <CardDescription>Manage predictions, confirmations, and track delivery status</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="predicted">
                  Predicted <Badge className="ml-1">{stats.predicted}</Badge>
                </TabsTrigger>
                <TabsTrigger value="confirmed">
                  Confirmed <Badge className="ml-1">{stats.confirmed}</Badge>
                </TabsTrigger>
                <TabsTrigger value="claimed">
                  Claimed <Badge className="ml-1">{stats.claimed}</Badge>
                </TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <DonationList donations={donations} onConfirm={handleConfirmDonation} onCancel={handleCancelDonation} />
              </TabsContent>

              <TabsContent value="predicted" className="mt-6">
                <DonationList
                  donations={donations.filter((d) => d.status === "predicted")}
                  onConfirm={handleConfirmDonation}
                  onCancel={handleCancelDonation}
                />
              </TabsContent>

              <TabsContent value="confirmed" className="mt-6">
                <DonationList
                  donations={donations.filter((d) => d.status === "confirmed")}
                  onConfirm={handleConfirmDonation}
                  onCancel={handleCancelDonation}
                />
              </TabsContent>

              <TabsContent value="claimed" className="mt-6">
                <DonationList
                  donations={donations.filter((d) => d.status === "claimed" || d.status === "in_transit")}
                  onConfirm={handleConfirmDonation}
                  onCancel={handleCancelDonation}
                />
              </TabsContent>

              <TabsContent value="delivered" className="mt-6">
                <DonationList
                  donations={donations.filter((d) => d.status === "delivered")}
                  onConfirm={handleConfirmDonation}
                  onCancel={handleCancelDonation}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
