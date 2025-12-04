'use client'

import { useEffect, useState } from "react"
import { DocumentList } from "@/components/documents/document-list"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useLandlordProperties } from "@/hooks/use-landlord-properties"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LandlordDocuments() {
    const { properties } = useLandlordProperties()

    const personalDocs = [
        { type: 'id_proof', label: 'Passeport / ID' },
        { type: 'rib', label: 'RIB de consignation' },
    ]

    const propertyDocs = [
        { type: 'property_insurance', label: 'Assurance appartement' },
        { type: 'property_deed', label: 'Document de propriété' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
                <p className="text-muted-foreground">Manage your verification documents and property files.</p>
            </div>

            <Tabs defaultValue="personal" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="personal">Personal Documents</TabsTrigger>
                    <TabsTrigger value="properties">Property Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identity & Banking</CardTitle>
                            <CardDescription>
                                Required for identity verification and rent payments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DocumentList requiredDocs={personalDocs} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="properties" className="space-y-4">
                    {properties.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                No properties found. Add a property to upload documents.
                            </CardContent>
                        </Card>
                    ) : (
                        properties.map(property => (
                            <Card key={property.id}>
                                <CardHeader>
                                    <CardTitle>{property.name}</CardTitle>
                                    <CardDescription>{property.location}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DocumentList
                                        requiredDocs={propertyDocs}
                                        propertyId={property.id}
                                    />
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
