'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Property } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, BedDouble, Star, ArrowLeft, Share2, Heart, Check, Euro } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ApplyDialog } from "@/components/properties/apply-dialog"

export default function PropertyDetailsPage() {
    const params = useParams()
    const [property, setProperty] = useState<Property | null>(null)
    const [loading, setLoading] = useState(true)
    const [imgSrc, setImgSrc] = useState<string>("")
    const [isApplyOpen, setIsApplyOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchProperty = async () => {
            if (!params.id) return

            try {
                const { data, error } = await supabase
                    .from("properties")
                    .select("*")
                    .eq("id", params.id)
                    .single()

                if (error) throw error

                if (data) {
                    // Parse images if string
                    let images = []
                    if (Array.isArray(data.images)) {
                        images = data.images
                    } else if (typeof data.images === 'string') {
                        images = (data.images as string).replace('{', '').replace('}', '').split(',').map(s => s.trim().replace(/"/g, ''))
                    }

                    const formattedProperty = {
                        ...data,
                        images: images.length > 0 ? images : [],
                        amenities: data.amenities || []
                    }

                    setProperty(formattedProperty)
                    setImgSrc(formattedProperty.images[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80")
                }
            } catch (error) {
                console.error("Error fetching property:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProperty()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!property) {
        return (
            <div className="container mx-auto py-12 px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
                <Link href="/properties">
                    <Button>Back to Listings</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Link href="/properties" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Listings
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Images & Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Image */}
                    <div className="relative h-[400px] w-full rounded-xl overflow-hidden border border-border/50 shadow-sm">
                        <Image
                            src={imgSrc}
                            alt={property.name}
                            fill
                            className="object-cover"
                            onError={() => setImgSrc("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80")}
                            priority
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <Button variant="secondary" size="icon" className="rounded-full backdrop-blur-md bg-background/80">
                                <Share2 className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" size="icon" className="rounded-full backdrop-blur-md bg-background/80">
                                <Heart className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Title & Location */}
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-2">{property.name}</h1>
                                <div className="flex items-center text-muted-foreground">
                                    <MapPin className="w-4 h-4 mr-1.5" />
                                    {property.location}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary flex items-center justify-end">
                                    {property.price} {property.currency || '€'}
                                    <span className="text-base font-normal text-muted-foreground ml-1">/mo</span>
                                </div>
                                {property.match_score && (
                                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">
                                        {property.match_score}% Match
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Key Features */}
                    <div className="grid grid-cols-3 gap-4 py-6 border-y border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                                <BedDouble className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Rooms</p>
                                <p className="font-medium">{property.rooms} Bedroom{property.rooms > 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                                <Star className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Rating</p>
                                <p className="font-medium">{property.neighborhood_rating || 4.5}/5 Neighborhood</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                                <Check className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="font-medium capitalize">{property.legal_status || 'Verified'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">About this property</h2>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {property.description}
                        </p>
                    </div>

                    {/* Amenities */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                        <div className="flex flex-wrap gap-2">
                            {property.amenities.map((amenity, i) => (
                                <Badge key={i} variant="outline" className="px-3 py-1 text-sm font-normal">
                                    {amenity}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Action Card */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24 border-border/50 shadow-lg">
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Monthly Rent</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">{property.price} {property.currency || '€'}</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    className="w-full h-12 text-lg font-medium"
                                    onClick={() => setIsApplyOpen(true)}
                                >
                                    Apply Now
                                </Button>
                                <Button variant="outline" className="w-full h-12 text-lg font-medium">
                                    Contact Landlord
                                </Button>
                            </div>

                            <div className="pt-4 border-t border-border/50">
                                <p className="text-xs text-center text-muted-foreground">
                                    You won't be charged yet. Application is free.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ApplyDialog
                property={property}
                open={isApplyOpen}
                onOpenChange={setIsApplyOpen}
            />
        </div>
    )
}
