import { Navbar } from "@/components/layout/navbar"
import { TenantDashboard } from "@/components/tenant/tenant-dashboard"

export default function TenantPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <TenantDashboard />
            </main>
        </div>
    )
}
