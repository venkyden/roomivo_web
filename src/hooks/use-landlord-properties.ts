import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Property } from '@/types'
import { toast } from 'sonner'

export function useLandlordProperties() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchProperties()
    }, [])

    const fetchProperties = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // In a real app, filter by landlord_id
            // For now, we fetch all properties or mock them if none exist
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                // .eq('landlord_id', user.id) // Uncomment when RLS is set up
                .limit(10)

            if (error) throw error

            if (data && data.length > 0) {
                setProperties(data.map((p: any) => ({
                    ...p,
                    amenities: p.amenities || [],
                    images: p.images || []
                })))
            } else {
                // Mock data for demo
                setProperties([
                    {
                        id: '1',
                        name: 'Modern Loft in Le Marais',
                        price: 1800,
                        currency: '€',
                        rooms: 2,
                        location: 'Paris, 4th Arr.',
                        amenities: ['Wifi', 'Furnished'],
                        description: 'Beautiful loft...',
                        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'],
                        landlord_id: user.id
                    },
                    {
                        id: '2',
                        name: 'Cozy Studio near Sorbonne',
                        price: 950,
                        currency: '€',
                        rooms: 1,
                        location: 'Paris, 5th Arr.',
                        amenities: ['Wifi', 'Elevator'],
                        description: 'Perfect for students...',
                        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
                        landlord_id: user.id
                    }
                ])
            }
        } catch (error) {
            console.error('Error fetching properties:', error)
            toast.error('Failed to load properties')
        } finally {
            setLoading(false)
        }
    }

    const addProperty = async (property: Partial<Property>) => {
        // Implement add logic
        console.log('Adding property:', property)
    }

    return { properties, loading, addProperty, refresh: fetchProperties }
}
