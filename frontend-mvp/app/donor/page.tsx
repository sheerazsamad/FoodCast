"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, Package, CheckCircle2, Clock, Loader2, Gift } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { PredictionForm } from "@/components/prediction/prediction-form"
import { DonationList } from "@/components/donor/donation-list"
import { OfferForm } from "@/components/donor/offer-form"
import { PersistentMap } from "@/components/ui/persistent-map"
import { mockDonations } from "@/lib/mock-data"
import { usePredictions } from "@/hooks/usePredictions"
import { useOffers } from "@/hooks/useOffers"
import type { Donation, Offer } from "@/lib/types"

export default function DonorDashboard() {
  const [showPredictionForm, setShowPredictionForm] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)
  
  // Use the persistent predictions hook
  const { 
    predictions: savedPredictions, 
    loading: predictionsLoading, 
    error: predictionsError,
    createPrediction,
    updatePrediction 
  } = usePredictions("donor-1")

  // Use the offers hook
  const {
    offers,
    loading: offersLoading,
    error: offersError,
    createOffer,
    updateOffer
  } = useOffers("donor-1")
  
  // Combine saved predictions with mock donations (for demo purposes)
  const mockDonationsForDonor = mockDonations.filter((d) => d.donorId === "donor-1")
  const donations = [...savedPredictions, ...mockDonationsForDonor]

  const stats = {
    predicted: donations.filter((d) => d.status === "predicted").length,
    confirmed: donations.filter((d) => d.status === "confirmed").length,
    claimed: donations.filter((d) => d.status === "claimed" || d.status === "in_transit").length,
    delivered: donations.filter((d) => d.status === "delivered").length,
    offers: offers.filter((o) => o.status === "available").length,
    claimedOffers: offers.filter((o) => o.status === "claimed" || o.status === "in_transit").length,
  }

  const handleCreatePrediction = async (newDonation: Donation) => {
    // The prediction will be automatically saved via the usePredictions hook
    // and the donations list will be updated automatically
    setShowPredictionForm(false)
  }

  const handleCreateOffer = async (newOffer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('DonorDashboard: Creating offer with data:', newOffer)
    const success = await createOffer(newOffer)
    if (success) {
      console.log('DonorDashboard: Offer created successfully, current offers count:', offers.length)
      setShowOfferForm(false)
      console.log('✅ Direct offer created successfully!')
    } else {
      console.error('❌ Failed to create direct offer')
    }
  }

  const handleConfirmDonation = async (id: string) => {
    // Check if this is a saved prediction (starts with 'pred-')
    if (id.startsWith('pred-')) {
      await updatePrediction(id, {
        status: "confirmed",
        confirmedDate: new Date().toISOString().split("T")[0],
      })
    } else {
      // For mock donations, just update local state (they're not persisted)
      // In a real app, you'd also update these in the backend
      console.log('Mock donation confirmed:', id)
    }
  }

  const handleCancelDonation = async (id: string) => {
    // Check if this is a saved prediction (starts with 'pred-')
    if (id.startsWith('pred-')) {
      await updatePrediction(id, {
        status: "cancelled",
      })
    } else {
      // For mock donations, just update local state (they're not persisted)
      // In a real app, you'd also update these in the backend
      console.log('Mock donation cancelled:', id)
    }
  }

  const handleCancelOffer = async (id: string) => {
    await updateOffer(id, {
      status: "cancelled",
    })
  }


  // Show loading state while predictions are being loaded
  if (predictionsLoading) {
    return (
      <DashboardLayout role="donor" userName="Whole Foods Market">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Loading predictions...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show error state if there's an error loading predictions
  if (predictionsError) {
    return (
      <DashboardLayout role="donor" userName="Whole Foods Market">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Error loading predictions:</p>
            <p className="text-sm text-gray-600">{predictionsError}</p>
          </div>
        </div>
      </DashboardLayout>
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
            {savedPredictions.length > 0 && (
              <p className="text-sm text-green-600 mt-1">
                ✅ {savedPredictions.length} saved prediction{savedPredictions.length !== 1 ? 's' : ''} loaded
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowPredictionForm(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Prediction
            </Button>
            <Button onClick={() => setShowOfferForm(true)} size="lg" variant="outline">
              <Gift className="mr-2 h-4 w-4" />
              Create Offer
            </Button>
          </div>
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

        {/* Persistent Map */}
        <PersistentMap 
          userRole="donor"
          offers={offers}
          loading={offersLoading}
          onOfferClick={(offer) => {
            console.log('Offer clicked:', offer)
            // You can add offer details modal here if needed
          }}
        />

        {/* AI Prediction Form */}
        {showPredictionForm && (
          <Card>
            <CardHeader>
              <CardTitle>AI Surplus Prediction</CardTitle>
              <CardDescription>
                Use our trained AI model to predict next-day food surplus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionForm 
                onClose={() => setShowPredictionForm(false)}
                onPredictionComplete={async (result, formData) => {
                  if (result.success && result.prediction) {
                    // Create a new prediction with all AI data including enhanced MVP features
                    const predictionData = {
                      id: `pred-${Date.now()}`,
                      donorId: "donor-1",
                      donorName: "Whole Foods Market",
                      description: result.prediction.product_name,
                      category: "produce", // Default category, can be made dynamic
                      quantity: Math.round(result.prediction.predicted_surplus),
                      unit: "units",
                      status: "predicted" as const,
                      predictedDate: result.prediction.date,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      location: "Store #" + result.prediction.store_id,
                      estimatedValue: result.prediction.predicted_surplus * 5, // Estimate $5 per unit
                      notes: `AI Predicted - Confidence: ${result.prediction.confidence}`,
                      // AI prediction specific fields
                      storeId: result.prediction.store_id,
                      productId: result.prediction.product_id,
                      productName: result.prediction.product_name,
                      dailySales: formData?.daily_sales || 0,
                      stockLevel: formData?.stock_level || 0,
                      price: formData?.price || 0,
                      promotionFlag: formData?.promotion_flag || false,
                      brainDietFlag: formData?.brain_diet_flag || false,
                      shelfLifeDays: formData?.shelf_life_days || 7, // Use form data or default to 7 days
                      predictedSurplus: result.prediction.predicted_surplus,
                      confidence: result.prediction.confidence,
                      // Enhanced MVP features
                      urgency_score: result.prediction.urgency_score,
                      nutritional_value: result.prediction.nutritional_value,
                      estimated_meals: result.prediction.estimated_meals,
                      expiry_date: result.prediction.expiry_date,
                      priority_level: result.prediction.priority_level,
                      impact_score: result.prediction.impact_score
                    }
                    
                    // Save the prediction to the backend
                    const success = await createPrediction(predictionData)
                    if (success) {
                      console.log('✅ Prediction saved successfully!')
                    } else {
                      console.error('❌ Failed to save prediction')
                    }
                  }
                }}
                initialData={{
                  store_id: "1", // Default store for this donor
                  product_name: "Fresh Produce"
                }}
              />
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPredictionForm(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offer Form */}
        {showOfferForm && (
          <OfferForm 
            onClose={() => setShowOfferForm(false)}
            onSubmit={handleCreateOffer}
          />
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


        {/* Offers Management */}
        {offers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Offers</CardTitle>
              <CardDescription>Manage your offers to recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Offers</TabsTrigger>
                  <TabsTrigger value="available">
                    Available <Badge className="ml-1">{stats.offers}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="claimed">
                    Claimed <Badge className="ml-1">{stats.claimedOffers}</Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <div className="space-y-4">
                    {offers.map((offer) => (
                      <Card key={offer.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Gift className="h-4 w-4 text-blue-500" />
                                <h3 className="font-semibold">{offer.description}</h3>
                                <Badge variant="secondary">{offer.category}</Badge>
                                <Badge variant={offer.urgencyLevel === "high" ? "destructive" : offer.urgencyLevel === "medium" ? "default" : "secondary"}>
                                  {offer.urgencyLevel} urgency
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {offer.quantity} {offer.unit} • Available: {new Date(offer.availableDate).toLocaleDateString()} • Expires: {new Date(offer.expiryDate).toLocaleDateString()}
                              </p>
                              {offer.pickupWindow && (
                                <p className="text-xs text-muted-foreground">
                                  Pickup Window: {offer.pickupWindow}
                                </p>
                              )}
                              {offer.specialInstructions && (
                                <p className="text-xs text-muted-foreground">
                                  Special Instructions: {offer.specialInstructions}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={offer.status === "available" ? "default" : offer.status === "claimed" ? "secondary" : "destructive"}>
                                {offer.status}
                              </Badge>
                              {offer.status === "available" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelOffer(offer.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="available" className="mt-6">
                  <div className="space-y-4">
                    {offers.filter((o) => o.status === "available").map((offer) => (
                      <Card key={offer.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Gift className="h-4 w-4 text-blue-500" />
                                <h3 className="font-semibold">{offer.description}</h3>
                                <Badge variant="secondary">{offer.category}</Badge>
                                <Badge variant={offer.urgencyLevel === "high" ? "destructive" : offer.urgencyLevel === "medium" ? "default" : "secondary"}>
                                  {offer.urgencyLevel} urgency
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {offer.quantity} {offer.unit} • Available: {new Date(offer.availableDate).toLocaleDateString()} • Expires: {new Date(offer.expiryDate).toLocaleDateString()}
                              </p>
                              {offer.pickupWindow && (
                                <p className="text-xs text-muted-foreground">
                                  Pickup Window: {offer.pickupWindow}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelOffer(offer.id)}
                            >
                              Cancel Offer
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="claimed" className="mt-6">
                  <div className="space-y-4">
                    {offers.filter((o) => o.status === "claimed" || o.status === "in_transit").map((offer) => (
                      <Card key={offer.id} className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Gift className="h-4 w-4 text-green-500" />
                                <h3 className="font-semibold">{offer.description}</h3>
                                <Badge variant="secondary">{offer.category}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {offer.quantity} {offer.unit} • Claimed by: {offer.claimedByName} • Claimed: {offer.claimedAt ? new Date(offer.claimedAt).toLocaleDateString() : 'Unknown'}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {offer.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  )
}
