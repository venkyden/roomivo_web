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
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
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
            // Check if role is passed in params (from Google OAuth)
            // Note: Google doesn't pass custom params back directly in the URL usually, 
            // but Supabase might preserve it if configured or we might need to check user metadata.
            // However, a more robust way for OAuth is to check if the user is new and update metadata.

            // Actually, for OAuth, the 'role' param sent to provider isn't always returned to callback.
            // But we can try to update the user if we have the session.

            // Better approach: Redirect to a role-check page or dashboard which handles routing.
            // But let's try to see if we can determine where to go.

            const { data: { user } } = await supabase.auth.getUser()
            const role = user?.user_metadata?.role || 'tenant'

            if (role === 'landlord') {
                return NextResponse.redirect(`${origin}/landlord`)
            } else {
                return NextResponse.redirect(`${origin}/tenant`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
