import { useState, useEffect } from 'react'
import type { Offer } from '@/lib/types'

export function useOffers(donorId?: string) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOffers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/offers')
      if (!response.ok) {
        throw new Error('Failed to fetch offers')
      }
      
      const data = await response.json()
      let fetchedOffers = data.offers || []
      
      // Filter by donor if donorId is provided
      if (donorId) {
        fetchedOffers = fetchedOffers.filter((offer: Offer) => offer.donorId === donorId)
      }
      
      setOffers(fetchedOffers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching offers:', err)
    } finally {
      setLoading(false)
    }
  }

  const createOffer = async (offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData),
      })

      if (!response.ok) {
        throw new Error('Failed to create offer')
      }

      const data = await response.json()
      if (data.success) {
        // Add the new offer to the local state
        setOffers(prev => [...prev, data.offer])
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offer')
      console.error('Error creating offer:', err)
      return false
    }
  }

  const updateOffer = async (id: string, updateData: Partial<Offer>): Promise<boolean> => {
    try {
      const response = await fetch('/api/offers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updateData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update offer')
      }

      const data = await response.json()
      if (data.success) {
        // Update the offer in local state
        setOffers(prev => prev.map(offer => 
          offer.id === id ? data.offer : offer
        ))
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update offer')
      console.error('Error updating offer:', err)
      return false
    }
  }

  const deleteOffer = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/offers?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete offer')
      }

      const data = await response.json()
      if (data.success) {
        // Remove the offer from local state
        setOffers(prev => prev.filter(offer => offer.id !== id))
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete offer')
      console.error('Error deleting offer:', err)
      return false
    }
  }

  const claimOffer = async (id: string, recipientId: string, recipientName: string): Promise<boolean> => {
    const result = await updateOffer(id, {
      status: 'claimed',
      claimedBy: recipientId,
      claimedByName: recipientName,
      claimedAt: new Date().toISOString(),
    })
    
    // Refresh offers to ensure we have the latest data
    if (result) {
      await fetchOffers()
    }
    
    return result
  }

  useEffect(() => {
    fetchOffers()
  }, [donorId])

  return {
    offers,
    loading,
    error,
    createOffer,
    updateOffer,
    deleteOffer,
    claimOffer,
    refreshOffers: fetchOffers,
  }
}
