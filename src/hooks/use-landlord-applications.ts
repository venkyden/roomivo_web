import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export interface Applicant {
    id: string
    tenant_id: string
    property_id: string
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
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch applications for properties owned by this landlord
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    id,
                    status,
                    created_at,
                    tenant_id,
                    property_id,
                    tenant:profiles!tenant_id(first_name, last_name, email, profession, income),
                    property:properties!property_id(name, price)
                `)
                .eq('property.landlord_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Transform to Applicant interface
            const formattedApplicants: Applicant[] = (data || []).map((app: any) => {
                const income = app.tenant?.income || 0
                const rent = app.property?.price || 0

                // Simple Match Score Algorithm (Rent-to-Income Ratio)
                // Robust Landlord Scoring Algorithm
                let matchScore = 50 // Base score

                // 1. Financial Health (Max 50 points)
                if (income > 0 && rent > 0) {
                    const ratio = rent / income
                    if (ratio <= 0.30) matchScore += 45 // Excellent (<30%)
                    else if (ratio <= 0.35) matchScore += 35 // Very Good (<35%)
                    else if (ratio <= 0.40) matchScore += 20 // Good (<40%)
                    else if (ratio <= 0.50) matchScore += 5  // Risky (<50%)
                    else matchScore -= 20 // High Risk (>50%)
                }

                // 2. Professional Stability (Max 10 points)
                const job = (app.tenant?.profession || '').toLowerCase()
                if (job.includes('engineer') || job.includes('doctor') || job.includes('manager') || job.includes('developer')) {
                    matchScore += 10
                } else if (job.includes('student')) {
                    // Students are okay if they have income (or guarantor implied)
                    matchScore += 5
                }

                // Cap score
                matchScore = Math.min(99, Math.max(10, matchScore))

                return {
                    id: app.id,
                    tenant_id: app.tenant_id,
                    property_id: app.property_id,
                    name: `${app.tenant?.first_name || ''} ${app.tenant?.last_name || ''}`.trim() || app.tenant?.email || 'Unknown',
                    profession: app.tenant?.profession || 'Unspecified',
                    income: income,
                    property: app.property?.name || 'Unknown Property',
                    match: matchScore,
                    status: app.status
                }
            })

            setApplicants(formattedApplicants)
        } catch (error) {
            console.error('Error fetching applications:', error)
            // toast.error('Failed to load applications') // Suppress for now if empty
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('applications')
                .update({ status })
                .eq('id', id)

            if (error) throw error

            setApplicants(prev => prev.map(app =>
                app.id === id ? { ...app, status } : app
            ))
            toast.success(`Application ${status}`)
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        }
    }

    return { applicants, loading, updateStatus, refresh: fetchApplications }
}
