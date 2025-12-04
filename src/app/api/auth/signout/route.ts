import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options)
                        })
                    } catch {
                        // Ignore errors
                    }
                },
            },
        }
    )

    // Sign out from Supabase
    await supabase.auth.signOut()

    // Create response
    const response = NextResponse.json({ success: true })

    // Explicitly clear all auth-related cookies
    const authCookies = [
        'sb-access-token',
        'sb-refresh-token',
        'sb-auth-token',
    ]

    authCookies.forEach(cookieName => {
        response.cookies.delete(cookieName)
        response.cookies.set(cookieName, '', {
            maxAge: 0,
            path: '/',
        })
    })

    return response
}
