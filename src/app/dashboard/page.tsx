import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/auth')
    }

    // Fetch user profile to get role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // If profile doesn't exist yet (race condition), default to tenant
    // or show a loading state / error. For now, default to tenant.
    const role = profile?.role || 'tenant'

    if (role === 'landlord') {
        return redirect('/landlord')
    } else {
        return redirect('/tenant')
    }
}
