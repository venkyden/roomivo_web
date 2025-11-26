import { Navbar } from "@/components/layout/navbar"
import { LandlordDashboard } from "@/components/landlord/landlord-dashboard"

export default function LandlordPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <LandlordDashboard />
            </main>
        </div>
    )
}
