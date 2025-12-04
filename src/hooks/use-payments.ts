import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Payment } from '@/types'
import { toast } from 'sonner'

export function usePayments() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchPayments = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('payments')
                .select(`
                    *,
                    property:properties(name)
                `)
                .order('due_date', { ascending: false })

            if (error) throw error

            setPayments(data || [])
        } catch (error) {
            console.error('Error fetching payments:', error)
            // toast.error('Failed to load payments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPayments()
    }, [])

    return { payments, loading, refresh: fetchPayments }
}
