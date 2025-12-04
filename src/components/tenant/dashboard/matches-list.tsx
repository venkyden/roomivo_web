'use client'

import { useEffect, useState } from "react"
import { Property } from "@/types"
import { PropertyCard } from "@/components/properties/property-card"
import { createClient } from "@/utils/supabase/client"
import { Loader2 } from "lucide-react"
import { ApplyDialog } from "@/components/properties/apply-dialog"

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
            const { data: { user } } = await supabase.auth.getUser()
            let userProfile: any = null

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('income, budget_max, preferred_location, age, bio, profession')
                    .eq('id', user.id)
                    .single()
                userProfile = profile
            }

            const { data, error } = await supabase
                .from("properties")
                .select("*")
                .limit(6)

            if (error) throw error

            const formattedProperties: Property[] = (data || []).map((prop: any) => {
                // Robust Matching Algorithm
                let score = 0

                if (userProfile) {
                    // 1. Financial Score (Max 40)
                    const income = userProfile.income || 0
                    const budget = userProfile.budget_max || 0
                    const rent = prop.price

                    if (budget > 0 && rent <= budget) {
                        score += 40 // Perfect budget fit
                    } else if (income > 0 && rent <= (income * 0.33)) {
                        score += 40 // Meets 33% rule
                    } else if (budget > 0 && rent <= (budget * 1.15)) {
                        score += 20 // Slightly over budget (15%)
                    } else if (income > 0 && rent <= (income * 0.40)) {
                        score += 15 // Meets 40% rule (stretch)
                    }

                    // 2. Location Score (Max 35)
                    if (userProfile.preferred_location && prop.location) {
                        const pref = userProfile.preferred_location.toLowerCase()
                        const loc = prop.location.toLowerCase()

                        if (loc === pref || loc.includes(pref) || pref.includes(loc)) {
                            score += 35
                        } else {
                            // TODO: Add proximity check (requires geocoding)
                            // For now, give small points if country matches or generic
                            score += 5
                        }
                    }

                    // 3. Lifestyle & Keywords (Max 25)
                    const desc = (prop.description || '').toLowerCase()
                    const amenities = (prop.amenities || []).join(' ').toLowerCase()
                    const fullText = `${desc} ${amenities}`
                    const bio = (userProfile.bio || '').toLowerCase()
                    const age = userProfile.age || 0

                    // Adaptive Scoring based on Profile

                    // Student / Young (< 25)
                    if (age > 0 && age < 25) {
                        if (fullText.includes('student') || fullText.includes('university') || fullText.includes('campus')) score += 10
                        if (fullText.includes('shared') || fullText.includes('colocation')) score += 5
                        if (fullText.includes('furnished')) score += 5
                    }

                    // Professional (25 - 60)
                    else if (age >= 25 && age < 60) {
                        if (fullText.includes('modern') || fullText.includes('renovated')) score += 5
                        if (fullText.includes('transport') || fullText.includes('metro') || fullText.includes('parking')) score += 5
                        if (fullText.includes('fiber') || fullText.includes('internet')) score += 5
                    }

                    // Senior (> 60)
                    else if (age >= 60) {
                        if (fullText.includes('elevator') || fullText.includes('ascenseur')) score += 10
                        if (fullText.includes('ground floor') || fullText.includes('rez-de-chaussée')) score += 10
                        if (fullText.includes('quiet') || fullText.includes('calm')) score += 5
                    }

                    // Bio Matching
                    if (bio.includes('family') && (fullText.includes('school') || fullText.includes('garden'))) score += 10
                    if (bio.includes('pet') && (fullText.includes('pet') || fullText.includes('garden'))) score += 10
                    if (bio.includes('quiet') && fullText.includes('quiet')) score += 5
                }

                // Base score for just existing (to avoid 0)
                score = Math.max(40, score)

                // Cap at 99
                score = Math.min(99, score)

                return {
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
                    match_score: score,
                    images: Array.isArray(prop.images)
                        ? prop.images
                        : typeof prop.images === 'string'
                            ? (prop.images as string).replace('{', '').replace('}', '').split(',').map(s => s.trim().replace(/"/g, ''))
                            : [],
                }
            })

            setProperties(formattedProperties)
        } catch (error) {
            console.error("Error fetching properties:", error)
        } finally {
            setLoading(false)
        }
    }

    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
    const [isApplyOpen, setIsApplyOpen] = useState(false)

    const handleSelect = (property: Property) => {
        setSelectedProperty(property)
        setIsApplyOpen(true)
        onSelectProperty(property)
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
                        onSelect={handleSelect}
                    />
                ))}
            </div>

            <ApplyDialog
                property={selectedProperty}
                open={isApplyOpen}
                onOpenChange={setIsApplyOpen}
            />
        </div>
    )
}
