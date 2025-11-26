import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Application } from '@/types'

export function useTenantApplications() {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchApplications()
    }, [])

    const fetchApplications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    property:properties(*)
                `)
                .eq('tenant_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Transform data to match Application interface if needed
            // For now assuming direct mapping works or using 'any' cast if strict
            setApplications(data as any[])
        } catch (error) {
            console.error('Error fetching applications:', error)
        } finally {
            setLoading(false)
        }
    }

    return { applications, loading, refresh: fetchApplications }
}
