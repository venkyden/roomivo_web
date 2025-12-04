import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function simulateLandlordAction() {
    console.log('🤖 Simulating Landlord Actions...')

    // 1. Find the latest pending application
    const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

    if (!applications || applications.length === 0) {
        console.log('❌ No pending applications found.')
        return
    }

    const app = applications[0]
    console.log(`📝 Found application: ${app.id} for Property ${app.property_id}`)

    // 2. Approve Application
    const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'approved' })
        .eq('id', app.id)

    if (updateError) {
        console.error('Error approving application:', updateError)
        return
    }
    console.log('✅ Application Approved')

    // 3. Get Property Details (for landlord_id)
    const { data: property } = await supabase
        .from('properties')
        .select('landlord_id, price')
        .eq('id', app.property_id)
        .single()

    if (!property) return

    // 4. Create Contract
    const { error: contractError } = await supabase
        .from('contracts')
        .insert({
            application_id: app.id,
            landlord_id: property.landlord_id,
            tenant_id: app.tenant_id,
            property_id: app.property_id,
            status: 'sent',
            contract_url: 'https://example.com/lease.pdf' // Mock URL
        })

    if (contractError) {
        console.error('Error creating contract:', contractError)
    } else {
        console.log('✅ Contract Generated & Sent')
    }

    // 5. Create Invoice (First Month Rent)
    const { error: paymentError } = await supabase
        .from('payments')
        .insert({
            tenant_id: app.tenant_id,
            landlord_id: property.landlord_id,
            property_id: app.property_id,
            amount: property.price,
            description: 'First Month Rent + Security Deposit',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due in 7 days
            status: 'pending'
        })

    if (paymentError) {
        console.error('Error creating invoice:', paymentError)
    } else {
        console.log('✅ Invoice Sent')
    }
}

simulateLandlordAction()
