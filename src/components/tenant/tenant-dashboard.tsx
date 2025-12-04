'use client'

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TenantMatches } from "./dashboard/matches-list"
import { TenantApplicationCard } from "./dashboard/application-card"
import { Property } from "@/types"
import { useRouter } from "next/navigation"
import { useTenantApplications } from "@/hooks/use-tenant-applications"
import { usePayments } from "@/hooks/use-payments"
import { PaymentHistory } from "@/components/payments/payment-history"
import { useIncidents } from '@/hooks/use-incidents'
import { IncidentList } from '@/components/incidents/incident-list'
import { TenantContracts } from "./dashboard/tenant-contracts"
import { TenantDocuments } from "./dashboard/tenant-documents"
import { ProfileForm } from "@/components/profile/profile-form"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { useEffect } from "react"
import { toast } from "sonner"

export function TenantDashboard() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("matches")
    const { applications, loading: appsLoading } = useTenantApplications()
    const { payments, loading: paymentsLoading } = usePayments()
    const { incidents, loading: incidentsLoading } = useIncidents()
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [])

    const handlePropertySelect = (property: Property) => {
        router.push(`/properties/${property.id}`)
    }

    return (
        <div className="container py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-6 lg:w-[600px]">
                    <TabsTrigger value="matches">Matches</TabsTrigger>
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                    <TabsTrigger value="contracts">Contracts</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="incidents">Incidents</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="matches" className="space-y-6 animate-in fade-in-50 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Recommended for You</h2>
                    </div>
                    <TenantMatches onSelectProperty={handlePropertySelect} />
                </TabsContent>

                <TabsContent value="applications" className="animate-in fade-in-50 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">My Applications</h2>
                    </div>
                    {appsLoading ? (
                        <div>Loading...</div>
                    ) : (
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
                                    <h3 className="text-lg font-semibold">No active applications</h3>
                                    <p className="text-muted-foreground max-w-sm mt-2">
                                        Start searching properties to find your new home and submit applications.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="contracts" className="space-y-6 animate-in fade-in-50 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">My Contracts</h2>
                    </div>
                    <TenantContracts />
                </TabsContent>

                <TabsContent value="documents" className="space-y-6 animate-in fade-in-50 duration-500">
                    <TenantDocuments />
                </TabsContent>

                <TabsContent value="payments" className="space-y-6 animate-in fade-in-50 duration-500">
                    <PaymentHistory payments={payments} loading={paymentsLoading} />
                </TabsContent>

                <TabsContent value="incidents" className="space-y-6 animate-in fade-in-50 duration-500">
                    <IncidentList incidents={incidents} loading={incidentsLoading} />
                </TabsContent>

                <TabsContent value="profile" className="animate-in fade-in-50 duration-500">
                    <div className="p-8 border rounded-lg bg-card text-card-foreground shadow-sm">
                        <h3 className="text-lg font-semibold mb-6">Profile Settings</h3>
                        {user ? (
                            <ProfileForm user={user} />
                        ) : (
                            <div>Loading profile...</div>
                        )}
                    </div>

                    <div className="mt-8 p-8 border rounded-lg bg-red-50/50 border-red-100">
                        <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                        <p className="text-sm text-red-700 mb-6">
                            Planning to leave? You can request to end your lease here. Please note that notice periods may apply as per your contract.
                        </p>
                        <Button variant="destructive" onClick={() => {
                            if (confirm("Are you sure you want to request a move out? This will notify your landlord.")) {
                                toast.success("Move out request submitted. Your landlord will contact you shortly.")
                            }
                        }}>
                            Request Move Out
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
