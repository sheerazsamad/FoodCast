"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Package, CheckCircle2, Clock, Filter } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DonationCard } from "@/components/recipient/donation-card"
import { ClaimModal } from "@/components/recipient/claim-modal"
import { mockDonations } from "@/lib/mock-data"
import type { Donation, FoodCategory } from "@/lib/types"

export default function RecipientDashboard() {
  const [donations, setDonations] = useState<Donation[]>(
    mockDonations.filter((d) => d.status === "confirmed" || d.status === "claimed"),
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | "all">("all")
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [myClaims, setMyClaims] = useState<string[]>(
    mockDonations.filter((d) => d.claimedBy === "recipient-1").map((d) => d.id),
  )

  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || donation.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const availableDonations = filteredDonations.filter((d) => d.status === "confirmed")
  const claimedDonations = filteredDonations.filter((d) => myClaims.includes(d.id))

  const handleClaim = (donationId: string, notes: string) => {
    setDonations(
      donations.map((d) =>
        d.id === donationId
          ? {
              ...d,
              status: "claimed",
              claimedBy: "recipient-1",
              claimedByName: "SF Food Bank",
              claimedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : d,
      ),
    )
    setMyClaims([...myClaims, donationId])
    setSelectedDonation(null)
  }

  const stats = {
    available: availableDonations.length,
    claimed: claimedDonations.length,
    inTransit: claimedDonations.filter((d) => d.status === "in_transit").length,
  }

  return (
    <DashboardLayout role="recipient" userName="SF Food Bank">
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

        {/* My Claims */}
        {claimedDonations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">My Claims</h2>
              <Badge variant="default">{claimedDonations.length} items</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {claimedDonations.map((donation) => (
                <DonationCard key={donation.id} donation={donation} onClaim={() => {}} isClaimed={true} />
              ))}
            </div>
          </div>
        )}

        {/* Claim Modal */}
        {selectedDonation && (
          <ClaimModal donation={selectedDonation} onClose={() => setSelectedDonation(null)} onClaim={handleClaim} />
        )}
      </div>
    </DashboardLayout>
  )
}
