import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
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
                                // Enhanced cookie security
                                const enhancedOptions = {
                                    ...options,
                                    sameSite: 'lax' as const,
                                    secure: process.env.NODE_ENV === 'production',
                                    path: '/',
                                    httpOnly: true,
                                }
                                cookieStore.set(name, value, enhancedOptions)
                            })
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Get the authenticated user
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                console.error('Failed to get user after OAuth:', userError)
                return NextResponse.redirect(`${origin}/auth/auth-code-error`)
            }

            // Log the authenticated user for debugging
            console.log('OAuth authenticated user:', user.id, user.email)

            const role = user?.user_metadata?.role || 'tenant'

            if (role === 'landlord') {
                return NextResponse.redirect(`${origin}/landlord`)
            } else {
                return NextResponse.redirect(`${origin}/tenant`)
            }
        } else {
            console.error('OAuth error:', error)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
