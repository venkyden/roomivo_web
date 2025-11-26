import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export interface Applicant {
    id: string
    name: string
    profession: string
    income: number
    property: string
    match: number
    status: 'pending' | 'approved' | 'rejected'
}

export function useLandlordApplications() {
    const [applicants, setApplicants] = useState<Applicant[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchApplications()
    }, [])

    const fetchApplications = async () => {
        try {
            // Mock data for demo
            setApplicants([
                {
                    id: '1',
                    name: 'Sophie Martin',
                    profession: 'Software Engineer',
                    income: 4200,
                    property: 'Modern Loft in Le Marais',
                    match: 95,
                    status: 'pending'
                },
                {
                    id: '2',
                    name: 'Lucas Dubois',
                    profession: 'Architect',
                    income: 3800,
                    property: 'Cozy Studio near Sorbonne',
                    match: 88,
                    status: 'pending'
                }
            ])
            setLoading(false)
        } catch (error) {
            console.error('Error fetching applications:', error)
            setLoading(false)
        }
    }

    const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
        setApplicants(prev => prev.map(app =>
            app.id === id ? { ...app, status } : app
        ))
        // In real app, update Supabase here
    }

    return { applicants, loading, updateStatus, refresh: fetchApplications }
}
