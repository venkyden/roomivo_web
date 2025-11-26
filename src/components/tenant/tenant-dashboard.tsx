'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TenantMatches } from "./dashboard/matches-list"
import { TenantApplicationCard } from "./dashboard/application-card"
import { Property } from "@/types"
import { User, Home, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTenantApplications } from "@/hooks/use-tenant-applications"

export function TenantDashboard() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("matches")
    const { applications, loading: appsLoading } = useTenantApplications()

    const handlePropertySelect = (property: Property) => {
        router.push(`/properties/${property.id}`)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tenant Dashboard</h1>
                    <p className="text-muted-foreground">Manage your search, applications, and profile</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="matches" className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Matches
                    </TabsTrigger>
                    <TabsTrigger value="applications" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Applications
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profile
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="matches" className="space-y-6 animate-in fade-in-50 duration-500">
                    <TenantMatches onSelectProperty={handlePropertySelect} />
                </TabsContent>

                <TabsContent value="applications" className="animate-in fade-in-50 duration-500">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map(app => (
                            <TenantApplicationCard
                                key={app.id}
                                application={app}
                                onViewDetails={(id) => console.log("View details", id)}
                            />
                        ))}
                        {!appsLoading && applications.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border border-dashed rounded-lg">
                                <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold">No active applications</h3>
                                <p className="text-muted-foreground max-w-sm mt-2">
                                    Start searching properties to find your new home and submit applications.
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="profile" className="animate-in fade-in-50 duration-500">
                    <div className="p-8 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                        <p className="text-muted-foreground">Profile management form coming soon...</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
