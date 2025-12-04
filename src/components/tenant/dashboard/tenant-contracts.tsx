'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, PenTool, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function TenantContracts() {
    const [contracts, setContracts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [signingId, setSigningId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchContracts()
    }, [])

    const fetchContracts = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('contracts')
                .select(`
                    *,
                    property:properties(name, location)
                `)
                .eq('tenant_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setContracts(data || [])
        } catch (error) {
            console.error('Error fetching contracts:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSign = async (id: string) => {
        setSigningId(id)
        try {
            // Simulate digital signing delay
            await new Promise(resolve => setTimeout(resolve, 1500))

            const { error } = await supabase
                .from('contracts')
                .update({
                    status: 'signed',
                    signed_at: new Date().toISOString()
                })
                .eq('id', id)

            if (error) throw error

            toast.success("Contract signed successfully! Welcome home! 🏠")
            fetchContracts()
        } catch (error) {
            console.error('Error signing contract:', error)
            toast.error("Failed to sign contract")
        } finally {
            setSigningId(null)
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    if (contracts.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed rounded-lg">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Contracts Yet</h3>
                <p className="text-muted-foreground">
                    Once your application is approved, your lease agreement will appear here.
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-6">
            {contracts.map(contract => (
                <Card key={contract.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{contract.property?.name}</CardTitle>
                                <CardDescription>{contract.property?.location}</CardDescription>
                            </div>
                            <Badge variant={contract.status === 'signed' ? 'default' : 'secondary'}>
                                {contract.status.toUpperCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Lease Agreement.pdf
                            </div>
                            <div>
                                Created: {new Date(contract.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        {contract.status === 'sent' && (
                            <Button
                                onClick={() => handleSign(contract.id)}
                                disabled={!!signingId}
                                className="w-full sm:w-auto"
                            >
                                {signingId === contract.id ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <PenTool className="w-4 h-4 mr-2" />
                                )}
                                Sign Digitally
                            </Button>
                        )}
                        {contract.status === 'signed' && (
                            <Button variant="outline" className="w-full sm:w-auto text-green-600 border-green-200 bg-green-50 hover:bg-green-100">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Signed on {new Date(contract.signed_at).toLocaleDateString()}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
