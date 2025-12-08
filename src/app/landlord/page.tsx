import { Navbar } from "@/components/layout/navbar"
import { LandlordDashboard } from "@/components/landlord/landlord-dashboard"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function LandlordPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar initialUser={user} />
            <main className="flex-1 container mx-auto px-4 py-8">
                <LandlordDashboard initialUser={user} />
            </main>
        </div>
    )
}
