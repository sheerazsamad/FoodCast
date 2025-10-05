// Core data models for FoodCast

export type UserRole = "donor" | "recipient" | "driver" | "admin"

export type DonationStatus = "predicted" | "confirmed" | "claimed" | "in_transit" | "delivered" | "cancelled"
export type OfferStatus = "available" | "claimed" | "in_transit" | "delivered" | "cancelled"

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
  // AI prediction specific fields
  storeId?: string
  productId?: string
  productName?: string
  dailySales?: number
  stockLevel?: number
  price?: number
  promotionFlag?: boolean
  brainDietFlag?: boolean
  shelfLifeDays?: number
  predictedSurplus?: number
  confidence?: string
  // Enhanced MVP features
  urgency_score?: number
  nutritional_value?: number
  estimated_meals?: number
  expiry_date?: string
  priority_level?: string
  impact_score?: number
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

export interface Offer {
  id: string
  donorId: string
  donorName: string
  donorAddress: string
  category: FoodCategory
  description: string
  quantity: number
  unit: string
  status: OfferStatus
  availableDate: string
  expiryDate: string
  claimedBy?: string
  claimedByName?: string
  claimedAt?: string
  deliveryId?: string
  createdAt: string
  updatedAt: string
  location?: string
  estimatedValue?: number
  notes?: string
  // Map location data (optional - for offers with pinned locations)
  place_id?: string
  formatted_address?: string
  latitude?: number
  longitude?: number
  // Enhanced offer fields
  urgencyLevel?: 'low' | 'medium' | 'high'
  pickupWindow?: string
  specialInstructions?: string
  // Direct offer specific fields
  isDirectOffer?: boolean
  // AI prediction specific fields (for offers created from predictions)
  isFromPrediction?: boolean
  storeId?: string
  productId?: string
  productName?: string
  dailySales?: number
  stockLevel?: number
  price?: number
  promotionFlag?: boolean
  brainDietFlag?: boolean
  shelfLifeDays?: number
  predictedSurplus?: number
  confidence?: string
  // Enhanced AI prediction metrics
  urgency_score?: number
  nutritional_value?: number
  estimated_meals?: number
  priority_level?: string
  impact_score?: number
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
