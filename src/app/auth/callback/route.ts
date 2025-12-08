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

            // Handle Registration Flow - Update Role
            const flow = searchParams.get('flow')
            const requestedRole = searchParams.get('role')

            if (flow === 'register' && requestedRole && ['tenant', 'landlord'].includes(requestedRole)) {
                // Update user metadata
                await supabase.auth.updateUser({
                    data: { role: requestedRole }
                })

                // Update profile
                await supabase
                    .from('profiles')
                    .update({ role: requestedRole })
                    .eq('id', user.id)
            }

            // Fetch role from profiles table to ensure accuracy
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            const role = profile?.role || user.user_metadata?.role || 'tenant'

            console.log('OAuth user:', user.id, 'Flow:', flow, 'Role:', role)

            // Redirect to the central dashboard router which handles role-based sub-routing
            return NextResponse.redirect(`${origin}/dashboard`)
        } else {
            console.error('OAuth error:', error)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
