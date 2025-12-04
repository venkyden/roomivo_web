import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Stripe initialized lazily

export async function POST(request: Request) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            return new NextResponse('Stripe API Key Missing', { status: 500 })
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-11-17.clover',
        })

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { price, propertyName, paymentId } = await request.json()

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Rent Payment: ${propertyName}`,
                        },
                        unit_amount: Math.round(price * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tenant?payment_success=true&payment_id=${paymentId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tenant?payment_canceled=true`,
            metadata: {
                userId: user.id,
                paymentId: paymentId,
            },
        })

        return NextResponse.json({ sessionId: session.id })
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
