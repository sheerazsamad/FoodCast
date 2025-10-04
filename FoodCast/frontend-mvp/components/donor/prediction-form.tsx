"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import type { Donation, FoodCategory } from "@/lib/types"

interface PredictionFormProps {
  onClose: () => void
  onSubmit: (donation: Donation) => void
}

export function PredictionForm({ onClose, onSubmit }: PredictionFormProps) {
  const [formData, setFormData] = useState({
    category: "" as FoodCategory,
    description: "",
    quantity: "",
    unit: "lbs",
    predictedDate: "",
    expiryDate: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      donorId: "donor-1",
      donorName: "Whole Foods Market",
      donorAddress: "123 Main St, San Francisco, CA 94102",
      category: formData.category,
      description: formData.description,
      quantity: Number.parseFloat(formData.quantity),
      unit: formData.unit,
      status: "predicted",
      predictedDate: formData.predictedDate,
      expiryDate: formData.expiryDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSubmit(newDonation)
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create Surplus Prediction</CardTitle>
              <CardDescription>Forecast upcoming surplus food for potential donation</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Food Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as FoodCategory })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
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

              <div className="space-y-2">
                <Label htmlFor="predictedDate">Predicted Date *</Label>
                <Input
                  id="predictedDate"
                  type="date"
                  value={formData.predictedDate}
                  onChange={(e) => setFormData({ ...formData, predictedDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the food items..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="items">Items</SelectItem>
                    <SelectItem value="meals">Meals</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Create Prediction
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
