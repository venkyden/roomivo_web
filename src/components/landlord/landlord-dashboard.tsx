'use client'

import { toast } from "sonner"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SmartInsights } from "./dashboard/smart-insights"
import { PropertyManager } from "./dashboard/property-manager"
import { LandlordDocuments } from "./dashboard/landlord-documents"
import { ApplicantViewer } from "./dashboard/applicant-viewer"
import { LayoutDashboard, Building2, Users, Settings, Bell, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProfileForm } from "@/components/profile/profile-form"
import { createClient } from "@/utils/supabase/client"
import { useEffect } from "react"

export function LandlordDashboard({ initialUser }: { initialUser?: any }) {
    const [activeTab, setActiveTab] = useState("overview")
    const [user, setUser] = useState<any>(initialUser || null)
    const supabase = createClient()

    useEffect(() => {
        if (initialUser) return // Skip if already loaded from server

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [initialUser])

    return (
        <div className="space-y-8 pt-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Landlord Command Center</h1>
                    <p className="text-muted-foreground">Manage your portfolio with AI-driven insights</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" className="relative" onClick={() => toast.info("No new notifications")}>
                        <Bell className="w-5 h-5" />
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-[10px]">3</Badge>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setActiveTab("profile")}>
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="properties" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Properties
                    </TabsTrigger>
                    <TabsTrigger value="applicants" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Applicants
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Documents
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Profile
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-500">
                    <SmartInsights />
                    <div className="grid lg:grid-cols-2 gap-8">
                        <ApplicantViewer />
                        <PropertyManager />
                    </div>
                </TabsContent>

                <TabsContent value="properties" className="animate-in fade-in-50 duration-500">
                    <PropertyManager />
                </TabsContent>

                <TabsContent value="applicants" className="animate-in fade-in-50 duration-500">
                    <ApplicantViewer />
                </TabsContent>

                <TabsContent value="documents" className="animate-in fade-in-50 duration-500">
                    <LandlordDocuments />
                </TabsContent>

                <TabsContent value="profile" className="animate-in fade-in-50 duration-500">
                    <div className="p-8 border rounded-lg bg-card text-card-foreground shadow-sm max-w-2xl">
                        <h3 className="text-lg font-semibold mb-6">Profile Settings</h3>
                        {user ? (
                            <ProfileForm user={user} />
                        ) : (
                            <div>Loading profile...</div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
