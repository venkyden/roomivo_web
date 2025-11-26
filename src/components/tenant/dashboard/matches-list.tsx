'use client'

import { useEffect, useState } from "react"
import { Property } from "@/types"
import { PropertyCard } from "@/components/properties/property-card"
import { createClient } from "@/utils/supabase/client"
import { Loader2 } from "lucide-react"

interface TenantMatchesProps {
    onSelectProperty: (property: Property) => void
}

export function TenantMatches({ onSelectProperty }: TenantMatchesProps) {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchProperties()
    }, [])

    const fetchProperties = async () => {
        try {
            // In a real app, this would call an AI matching endpoint
            // For now, we fetch properties and add mock scores
            const { data, error } = await supabase
                .from("properties")
                .select("*")
                .limit(6)

            if (error) throw error

            const formattedProperties: Property[] = (data || []).map((prop: any) => ({
                id: prop.id,
                name: prop.name,
                price: prop.price,
                currency: prop.currency || '€',
                rooms: prop.rooms,
                location: prop.location,
                amenities: prop.amenities || [],
                description: prop.description || '',
                neighborhood_rating: prop.neighborhood_rating || 4.5,
                transport_score: prop.transport_score || 4.2,
                legal_status: prop.legal_status || 'verified',
                match_score: Math.floor(Math.random() * (98 - 85) + 85), // Mock score
                images: prop.images || [],
            }))

            setProperties(formattedProperties)
        } catch (error) {
            console.error("Error fetching properties:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Your Perfect Matches</h2>
                <p className="text-muted-foreground">AI-powered recommendations based on your profile</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <PropertyCard
                        key={property.id}
                        property={property}
                        onSelect={onSelectProperty}
                    />
                ))}
            </div>
        </div>
    )
}
