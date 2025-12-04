import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Profile Settings</h1>
            <p className="text-muted-foreground mb-8">Manage your personal information and preferences.</p>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <ProfileForm user={user} />
            </div>
        </div>
    )
}
