import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function backfill() {
    console.log('🔄 Backfilling rental_type...')

    const { data: properties, error } = await supabase
        .from('properties')
        .select('id, description, amenities')

    if (error) {
        console.error('Error fetching properties:', error)
        return
    }

    for (const p of properties) {
        let type = 'furnished' // Default
        const desc = p.description.toLowerCase()
        const amenities = (p.amenities || []).map((a: string) => a.toLowerCase())

        if (desc.includes('shared') || desc.includes('colocation') || amenities.includes('shared')) {
            type = 'colocation'
        } else if (desc.includes('unfurnished') || desc.includes('non meublé')) {
            type = 'unfurnished'
        } else if (desc.includes('furnished') || desc.includes('meublé')) {
            type = 'furnished'
        }

        const { error: updateError } = await supabase
            .from('properties')
            .update({ rental_type: type })
            .eq('id', p.id)

        if (updateError) {
            console.error(`Failed to update ${p.id}:`, updateError)
        } else {
            console.log(`Updated ${p.id} -> ${type}`)
        }
    }
    console.log('✅ Backfill complete!')
}

backfill()
