
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const updateSession = async (request: NextRequest) => {
    const supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        // Enhanced cookie security settings
                        const enhancedOptions = {
                            ...options,
                            sameSite: 'lax' as const,
                            secure: process.env.NODE_ENV === 'production',
                            path: '/',
                            httpOnly: false,
                        }
                        request.cookies.set(name, value)
                        supabaseResponse.cookies.set(name, value, enhancedOptions)
                    })
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Protected routes
    const isProtectedRoute =
        path.startsWith('/dashboard') ||
        path.startsWith('/tenant') ||
        path.startsWith('/landlord') ||
        path.startsWith('/profile') ||
        path.startsWith('/messages')

    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth'
        // Clear any stale auth cookies
        supabaseResponse.cookies.delete('sb-access-token')
        supabaseResponse.cookies.delete('sb-refresh-token')
        return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from auth page
    if (user && path.startsWith('/auth') && !path.startsWith('/auth/update-password')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
