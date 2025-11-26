'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Home, MapPin, Euro } from "lucide-react"
import { toast } from "sonner"
import { useLandlordProperties } from "@/hooks/use-landlord-properties"
import Image from "next/image"

export function PropertyManager() {
    const { properties, loading, addProperty } = useLandlordProperties()

    const handleAddProperty = () => {
        toast.info("Opening 'Add Property' modal... (Demo)")
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">My Properties</h2>
                <Button onClick={handleAddProperty} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {properties.map((property) => (
                    <Card key={property.id} className="p-4 border-border/50 flex gap-4 hover:shadow-md transition-all">
                        <div className="relative w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                            {property.images[0] ? (
                                <Image
                                    src={property.images[0]}
                                    alt={property.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Home className="w-8 h-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold line-clamp-1">{property.name}</h3>
                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {property.location}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-primary flex items-center justify-end">
                                        <Euro className="w-3 h-3 mr-1" />
                                        {property.price}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">/month</span>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
                                    Edit
                                </Button>
                                <Button variant="secondary" size="sm" className="h-7 text-xs flex-1">
                                    View
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
