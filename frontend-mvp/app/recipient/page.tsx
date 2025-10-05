"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Package, CheckCircle2, Clock, Filter } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DonationCard } from "@/components/recipient/donation-card"
import { OfferCard } from "@/components/recipient/offer-card"
import { ClaimModal } from "@/components/recipient/claim-modal"
import { OfferClaimModal } from "@/components/recipient/offer-claim-modal"
import { PersistentMap } from "@/components/ui/persistent-map"
import { mockDonations } from "@/lib/mock-data"
import { useUserData } from "@/hooks/useUserData"
import { useOffers } from "@/hooks/useOffers"
import type { Donation, Offer, FoodCategory } from "@/lib/types"

export default function RecipientDashboard() {
  const { userProfile, userClaims, loading, claimDonation, hasClaimed, getClaimedIds, refreshData } = useUserData()
  const { offers, loading: offersLoading, claimOffer } = useOffers()
  
  // Debug logging for offers
  console.log('RecipientDashboard: Received offers:', offers)
  console.log('RecipientDashboard: Offers with location:', offers.filter(o => o.latitude && o.longitude))
  
  const [donations, setDonations] = useState<Donation[]>(
    mockDonations.filter((d) => d.status === "confirmed" || d.status === "claimed"),
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | "all">("all")
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  
  // Get claimed donation IDs from persistent storage
  const myClaims = getClaimedIds()

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || donation.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || offer.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const availableDonations = filteredDonations.filter((d) => d.status === "confirmed" && !myClaims.includes(d.id))
  const claimedDonations = filteredDonations.filter((d) => myClaims.includes(d.id))
  const availableOffers = filteredOffers.filter((o) => o.status === "available")
  const claimedOffers = filteredOffers.filter((o) => o.status === "claimed" || o.status === "in_transit")

  const handleClaim = async (donationId: string, notes: string) => {
    // Use persistent storage for claiming
    const result = await claimDonation(donationId, notes)
    
    if (result === true) {
      // Update local donations state to reflect the claim
      setDonations(
        donations.map((d) =>
          d.id === donationId
            ? {
                ...d,
                status: "claimed",
                claimedBy: userProfile?.id || "recipient-1",
                claimedByName: userProfile?.name || "SF Food Bank",
                claimedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : d,
        ),
      )
      // Refresh user data to ensure claims are up to date
      refreshData()
      setSelectedDonation(null)
    } else if (result === 'already_claimed') {
      alert("You have already claimed this donation.")
      setSelectedDonation(null)
    } else {
      alert("Failed to claim donation. Please try again.")
    }
  }

  const handleClaimOffer = async (offerId: string, notes: string) => {
    const result = await claimOffer(offerId, userProfile?.id || "recipient-1", userProfile?.name || "SF Food Bank")
    
    if (result) {
      // The offers hook will handle the backend update and refresh the offers list
      setSelectedOffer(null)
      // Refresh user data to update claims
      refreshData()
    } else {
      alert("Failed to claim offer. Please try again.")
    }
  }


  const stats = {
    available: availableDonations.length + availableOffers.length,
    claimed: claimedDonations.length + claimedOffers.length,
    inTransit: claimedDonations.filter((d) => d.status === "in_transit").length + claimedOffers.filter((o) => o.status === "in_transit").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Loading your dashboard...</h2>
          <p className="text-slate-600 dark:text-slate-300">Please wait while we load your data.</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout role="recipient" userName={userProfile?.name || "SF Food Bank"}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Recipient Marketplace</h1>
          <p className="text-muted-foreground">Browse and claim available food donations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.available}</div>
              <p className="text-xs text-muted-foreground">Ready to claim</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Claims</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.claimed}</div>
              <p className="text-xs text-muted-foreground">Total claimed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inTransit}</div>
              <p className="text-xs text-muted-foreground">On the way</p>
            </CardContent>
          </Card>
        </div>

        {/* Persistent Map */}
        <PersistentMap 
          userRole="recipient"
          offers={offers}
          loading={offersLoading}
          onOfferClick={(offer) => {
            setSelectedOffer(offer)
          }}
        />

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search Donations</CardTitle>
            <CardDescription>Filter by category or search for specific items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by description, donor, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value as FoodCategory | "all")}
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="produce">Produce</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="bakery">Bakery</SelectItem>
                    <SelectItem value="prepared">Prepared Foods</SelectItem>
                    <SelectItem value="canned">Canned Goods</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Available Donations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Available Donations</h2>
            <Badge variant="secondary">{availableDonations.length} items</Badge>
          </div>

          {availableDonations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">No available donations match your search</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableDonations.map((donation) => (
                <DonationCard
                  key={donation.id}
                  donation={donation}
                  onClaim={() => setSelectedDonation(donation)}
                  isClaimed={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Available Direct Offers */}
        {availableOffers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Direct Offers</h2>
              <Badge variant="default">{availableOffers.length} offers</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onClaim={() => setSelectedOffer(offer)}
                  isClaimed={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* My Claims */}
        {(claimedDonations.length > 0 || claimedOffers.length > 0) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My Claims</h2>
              <Badge variant="default">{claimedDonations.length + claimedOffers.length} items</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {claimedDonations.map((donation) => (
                <DonationCard key={donation.id} donation={donation} onClaim={() => {}} isClaimed={true} />
              ))}
              {claimedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} onClaim={() => {}} isClaimed={true} />
              ))}
            </div>
          </div>
        )}

        {/* Claim Modals */}
        {selectedDonation && (
          <ClaimModal donation={selectedDonation} onClose={() => setSelectedDonation(null)} onClaim={handleClaim} />
        )}
        {selectedOffer && (
          <OfferClaimModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} onClaim={handleClaimOffer} />
        )}
      </div>
    </DashboardLayout>
  )
}
