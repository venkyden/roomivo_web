'use client'

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Property } from "@/types"
import { MapPin, BedDouble, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface PropertyCardProps {
    property: Property
    onSelect?: (property: Property) => void
}

export function PropertyCard({ property, onSelect }: PropertyCardProps) {
    const [imgSrc, setImgSrc] = useState(property.images[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80")

    return (
        <Card className="group overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300">
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={imgSrc}
                    alt={property.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={() => setImgSrc("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80")}
                />
                <div className="absolute top-3 right-3">
                    <Badge className="bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90">
                        {property.price} {property.currency}/mo
                    </Badge>
                </div>
                {property.match_score && (
                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                            {property.match_score}% Match
                        </Badge>
                    </div>
                )}
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{property.name}</h3>
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            <span className="line-clamp-1">{property.location}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center">
                        <BedDouble className="w-4 h-4 mr-1.5" />
                        {property.rooms} Rooms
                    </div>
                    {property.neighborhood_rating && (
                        <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1.5 text-yellow-500 fill-yellow-500" />
                            {property.neighborhood_rating}/5
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {property.amenities.slice(0, 3).map((amenity, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-normal">
                            {amenity}
                        </Badge>
                    ))}
                    {property.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs font-normal">
                            +{property.amenities.length - 3}
                        </Badge>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Link href={`/properties/${property.id}`} className="w-full">
                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        View Details <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
