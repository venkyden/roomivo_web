'use client'

import { TenantMatches } from "@/components/tenant/dashboard/matches-list"
import { useRouter } from "next/navigation"

export default function PropertiesPage() {
    const router = useRouter()

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Find Your Home</h1>
                <p className="text-muted-foreground">Explore verified listings tailored to your preferences.</p>
            </div>

            {/* Reuse the matches list component which fetches properties */}
            <TenantMatches onSelectProperty={(property) => {
                router.push(`/properties/${property.id}`)
            }} />
        </div>
    )
}
