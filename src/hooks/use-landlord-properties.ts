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

            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('landlord_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                setProperties(data.map((p: any) => ({
                    ...p,
                    amenities: p.amenities || [],
                    images: Array.isArray(p.images)
                        ? p.images
                        : typeof p.images === 'string'
                            ? (p.images as string).replace('{', '').replace('}', '').split(',').map(s => s.trim().replace(/"/g, ''))
                            : []
                })))
            }
        } catch (error) {
            console.error('Error fetching properties:', error)
            toast.error('Failed to load properties')
        } finally {
            setLoading(false)
        }
    }

    const addProperty = async (property: Partial<Property>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error('You must be logged in')
                return
            }

            const { error } = await supabase
                .from('properties')
                .insert({
                    ...property,
                    landlord_id: user.id,
                    amenities: property.amenities || [],
                    images: property.images || []
                })

            if (error) throw error

            toast.success('Property added successfully')
            fetchProperties()
        } catch (error) {
            console.error('Error adding property:', error)
            toast.error('Failed to add property')
        }
    }

    return { properties, loading, addProperty, refresh: fetchProperties }
}
