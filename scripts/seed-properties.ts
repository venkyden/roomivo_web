// Seed script to populate properties table
// Run this file once to insert 20 French properties

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: '.env' })

// Use service role key to bypass RLS for seeding
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const properties = [
    { name: 'Studio Latin Quarter', price: 950, location: 'Paris', description: 'Charming 18m² furnished studio in the 5th arrondissement, steps from the Sorbonne. Features a kitchenette with fridge and microwave, a sofa bed, and a private bathroom. Rent includes water and high-speed Wi-Fi. Perfect for a student who wants to be in the historic center.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'], amenities: ['Wi-Fi', 'Furnished', 'Kitchen'] },
    { name: 'Modern Studio La Défense', price: 1100, location: 'Paris', description: 'Spacious 25m² studio in a modern residence near La Défense business district. Fully equipped with a washing machine, large desk, and plenty of storage. Building amenities include a gym and 24/7 security. Excellent transport links (Metro Line 1, RER A) to central Paris.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'], amenities: ['Gym', 'Security', 'Metro'] },
    { name: 'Cozy Room Montmartre', price: 750, location: 'Paris', description: 'Bright 12m² room in a shared 3-bedroom apartment in the 18th arrondissement. You will share with two young professionals. The room overlooks a quiet courtyard. Shared living room and fully equipped kitchen. Experience the artistic vibe of Montmartre.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1502672260066-6bc344928e52?w=800&q=80'], amenities: ['Shared', 'Quiet', 'Kitchen'] },
    { name: 'Student Residence Ivry', price: 800, location: 'Paris', description: 'Functional 20m² studio in a dedicated student residence in Ivry-sur-Seine. All-inclusive rent (electricity, heating, internet). The residence offers a cafeteria, laundry room, and study area. 5 minutes walk to RER C station.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80'], amenities: ['Student', 'Wi-Fi', 'Laundry'] },
    { name: 'Loft Presqu\'île', price: 700, location: 'Lyon', description: 'Stylish room in a 90m² loft shared with 3 others in the heart of Lyon (2nd arr.). High ceilings, exposed beams, and a massive open-plan living area. The room comes with a double bed and desk. Close to Bellecour and universities.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'], amenities: ['Loft', 'Shared', 'University'] },
    { name: 'Quiet Studio Part-Dieu', price: 650, location: 'Lyon', description: 'Modern 22m² studio near Part-Dieu train station. Recently renovated with a smart layout. Includes a fold-out bed to maximize space during the day. Air conditioning and double glazing for peace and quiet. Ideal for students at Lyon 3 University.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'], amenities: ['AC', 'Modern', 'University'] },
    { name: 'Vieux Port Apartment', price: 550, location: 'Marseille', description: 'Sunny 35m² one-bedroom apartment near the Old Port. Features a balcony with a sea view. Traditional tile floors and high ceilings. The bedroom is separate from the living room. Close to metro and bus lines. Great value for money.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80'], amenities: ['Balcony', 'Sea View', 'Metro'] },
    { name: 'Student Room Luminy', price: 450, location: 'Marseille', description: 'Affordable 15m² room in a shared house near the Luminy university campus. Perfect for science students. The house has a large garden and terrace. Rent includes all utilities and weekly cleaning of common areas.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80'], amenities: ['Student', 'Campus', 'Garden'] },
    { name: 'Chartrons Duplex', price: 850, location: 'Bordeaux', description: 'Elegant duplex apartment in the trendy Chartrons district. The lower level has a living room and kitchen, while the upper level features a bedroom and bathroom. Walking distance to the tram and Garonne river banks.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&q=80'], amenities: ['Duplex', 'Modern', 'Tram'] },
    { name: 'Shared Flat Victoire', price: 500, location: 'Bordeaux', description: 'Room available in a lively 4-bedroom flat near Place de la Victoire. Popular student area with many bars and restaurants. The flat has a large kitchen and two bathrooms. You will be sharing with international students.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1502672260066-6bc344928e52?w=800&q=80'], amenities: ['Student', 'Shared', 'Kitchen'] },
    { name: 'Promenade Studio', price: 900, location: 'Nice', description: 'Luxury 28m² studio just one block from the Promenade des Anglais. Features a modern kitchen, marble bathroom, and a small balcony. Air conditioned. Perfect for enjoying the Mediterranean lifestyle while studying.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80'], amenities: ['Beach', 'AC', 'Balcony'] },
    { name: 'Old Town Gem', price: 700, location: 'Nice', description: 'Charming one-bedroom apartment in the winding streets of Vieux Nice. Authentic Niçois style with colorful shutters. Close to the flower market and the beach. Note: 3rd floor without elevator.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80'], amenities: ['Beach', 'Historical', 'Market'] },
    { name: 'Capitole Apartment', price: 750, location: 'Toulouse', description: 'Central 40m² one-bedroom apartment right on Place du Capitole. The heart of the city. Spacious living room with large windows. Fully furnished with modern decor. Close to all metro lines.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1502672260066-6bc344928e52?w=800&q=80'], amenities: ['Central', 'Metro', 'Furnished'] },
    { name: 'Canal du Midi Room', price: 480, location: 'Toulouse', description: 'Peaceful room in a house with a garden near the Canal du Midi. Ideal for cycling enthusiasts. Share the house with a friendly landlord and one other student. Access to the full kitchen and garden.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80'], amenities: ['Garden', 'Quiet', 'Shared'] },
    { name: 'Grand Place Flat', price: 600, location: 'Lille', description: 'Spacious 50m² one-bedroom apartment near the Grand Place. Classic Flemish architecture with high ceilings. Large living room and separate kitchen. Close to Lille Flandres train station.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'], amenities: ['Historical', 'Train', 'Large'] },
    { name: 'Student Hub Villeneuve', price: 450, location: 'Lille', description: 'Modern studio in a student complex in Villeneuve d\'Ascq. Right next to the university campus. All bills included. The building has a game room and bike storage.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80'], amenities: ['Student', 'Campus', 'Modern'] },
    { name: 'Historic Center Studio', price: 550, location: 'Montpellier', description: 'Cozy studio in the pedestrian center of Montpellier (L\'Écusson). Stone walls and vaulted ceilings. Small but functional. Steps away from cafes and tram stops.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80'], amenities: ['Historical', 'Tram', 'Central'] },
    { name: 'Antigone Shared Flat', price: 480, location: 'Montpellier', description: 'Bright room in a modern apartment in the Antigone district. Large terrace with city views. Share with 2 other students. Close to the Olympic swimming pool and library.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80'], amenities: ['Terrace', 'Student', 'Modern'] },
    { name: 'Petite France Apt', price: 800, location: 'Strasbourg', description: 'Beautiful 45m² apartment in the picturesque Petite France area. Timber-framed building with river views. Spacious and warm. Close to the medical and law faculties.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80'], amenities: ['Historical', 'River View', 'University'] },
    { name: 'European Quarter Studio', price: 700, location: 'Strasbourg', description: 'Contemporary studio near the European institutions. Modern building with elevator. Includes a parking space. Quiet area with plenty of parks.', landlord_id: '00000000-0000-0000-0000-000000000001', images: ['https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80'], amenities: ['Modern', 'Elevator', 'Parking'] },
]

async function seed() {
    console.log('Starting seed...')

    // First, get a real landlord user
    const { data: landlords } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'landlord')
        .limit(1)

    let landlordId: string

    if (!landlords || landlords.length === 0) {
        // No landlord found, create a dummy user account
        console.log('No landlord found. Creating a demo landlord account...')
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: 'landlord.demo@roomivo.eu',
            password: 'Demo123!',
            email_confirm: true,
            user_metadata: {
                role: 'landlord',
                first_name: 'Demo',
                last_name: 'Landlord'
            }
        })

        if (authError || !authData.user) {
            console.error('Failed to create demo landlord:', authError)
            return
        }

        landlordId = authData.user.id
        console.log('Created demo landlord with ID:', landlordId)
    } else {
        landlordId = landlords[0].id
        console.log('Using existing landlord ID:', landlordId)
    }

    // Update all properties with the real landlord ID
    const propertiesWithLandlord = properties.map(p => ({
        ...p,
        landlord_id: landlordId
    }))

    const { data, error } = await supabase
        .from('properties')
        .insert(propertiesWithLandlord)

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('✅ Successfully inserted 20 properties!')
    }
}

seed()
