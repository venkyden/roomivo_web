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

    // Determine role with fallbacks
    // 1. Profile role (SSOT)
    // 2. Metadata role (Backup)
    // 3. Default to tenant
    let role = profile?.role

    if (!role) {
        // Fallback to metadata
        const metadataRole = user.user_metadata?.role
        if (metadataRole && ['landlord', 'tenant'].includes(metadataRole)) {
            role = metadataRole

            // Self-heal: Update profile with role from metadata if missing
            await supabase
                .from('profiles')
                .update({ role: role })
                .eq('id', user.id)
        } else {
            role = 'tenant'
        }
    }

    if (role === 'landlord') {
        return redirect('/landlord')
    } else {
        return redirect('/tenant')
    }
}
