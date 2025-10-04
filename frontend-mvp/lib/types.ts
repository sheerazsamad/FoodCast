// Core data models for FoodCast

export type UserRole = "donor" | "recipient" | "driver" | "admin"

export type DonationStatus = "predicted" | "confirmed" | "claimed" | "in_transit" | "delivered" | "cancelled"

export type FoodCategory = "produce" | "dairy" | "bakery" | "prepared" | "canned" | "frozen" | "other"

export interface Donation {
  id: string
  donorId: string
  donorName: string
  donorAddress: string
  category: FoodCategory
  description: string
  quantity: number
  unit: string
  status: DonationStatus
  predictedDate: string
  confirmedDate?: string
  expiryDate: string
  claimedBy?: string
  claimedByName?: string
  claimedAt?: string
  deliveryId?: string
  createdAt: string
  updatedAt: string
}

export interface Claim {
  id: string
  donationId: string
  recipientId: string
  recipientName: string
  recipientAddress: string
  claimedAt: string
  status: "pending" | "approved" | "in_transit" | "completed" | "cancelled"
  notes?: string
}

export interface Delivery {
  id: string
  claimId: string
  donationId: string
  driverId: string
  driverName: string
  pickupAddress: string
  deliveryAddress: string
  status: "assigned" | "en_route_pickup" | "picked_up" | "en_route_delivery" | "delivered" | "cancelled"
  assignedAt: string
  pickedUpAt?: string
  deliveredAt?: string
  notes?: string
}

export interface KPI {
  totalDonations: number
  totalPredicted: number
  totalConfirmed: number
  totalClaimed: number
  totalDelivered: number
  predictionAccuracy: number
  averageResponseTime: number
  totalMealsRescued: number
  totalWeight: number
  co2Saved: number
}
