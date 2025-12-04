'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { Building2 } from 'lucide-react'

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Roomivo</h1>
                    <p className="text-muted-foreground">The premium rental experience.</p>
                </div>

                <Card className="border-border/50 shadow-xl shadow-primary/5 backdrop-blur-sm bg-background/95">
                    <CardHeader>
                        <CardTitle>Welcome back</CardTitle>
                        <CardDescription>Sign in to your account or create a new one.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid w-full grid-cols-2 mb-6 bg-muted p-1 rounded-lg">
                            <button
                                onClick={() => setMode('login')}
                                className={`text-sm font-medium py-2 rounded-md transition-all ${mode === 'login'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setMode('register')}
                                className={`text-sm font-medium py-2 rounded-md transition-all ${mode === 'register'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Register
                            </button>
                        </div>

                        <div className="mt-4">
                            {mode === 'login' ? <LoginForm /> : <RegisterForm />}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
