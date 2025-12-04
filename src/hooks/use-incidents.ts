import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Incident } from '@/types'
import { toast } from 'sonner'

export function useIncidents() {
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchIncidents = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('incidents')
                .select(`
                    *,
                    property:properties(name)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            setIncidents(data || [])
        } catch (error) {
            console.error('Error fetching incidents:', error)
            // toast.error('Failed to load incidents')
        } finally {
            setLoading(false)
        }
    }

    const createIncident = async (incident: Partial<Incident>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // For MVP, we need a property_id. 
            // Ideally, we'd let the user pick from their active leases.
            // For now, we'll try to find the most recent application that was approved.
            const { data: application } = await supabase
                .from('applications')
                .select('property_id')
                .eq('tenant_id', user.id)
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (!application?.property_id) {
                toast.error('You must have an active lease (approved application) to report an incident.')
                return false
            }

            const { error } = await supabase
                .from('incidents')
                .insert({
                    ...incident,
                    tenant_id: user.id,
                    property_id: application.property_id,
                    status: 'reported'
                })

            if (error) throw error

            toast.success('Incident reported successfully')
            fetchIncidents()
            return true
        } catch (error) {
            console.error('Error creating incident:', error)
            toast.error('Failed to report incident')
            return false
        }
    }

    useEffect(() => {
        fetchIncidents()
    }, [])

    return { incidents, loading, createIncident, refresh: fetchIncidents }
}
