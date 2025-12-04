import { Payment } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import { format } from 'date-fns'

import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'sonner'

interface PaymentHistoryProps {
    payments: Payment[]
    loading: boolean
}

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

export function PaymentHistory({ payments, loading }: PaymentHistoryProps) {
    const handlePay = async (payment: Payment) => {
        try {
            if (!stripePromise) {
                toast.error("Stripe configuration missing. Please contact support.")
                console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
                return
            }

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    price: payment.amount,
                    propertyName: payment.property?.name || 'Rent Payment',
                    paymentId: payment.id,
                }),
            })

            if (!response.ok) throw new Error('Network response was not ok')

            const { sessionId } = await response.json()
            const stripe = await stripePromise

            if (!stripe) throw new Error('Stripe failed to load')

            const { error } = await (stripe as any).redirectToCheckout({ sessionId })

            if (error) throw error
        } catch (error) {
            console.error('Payment error:', error)
            toast.error('Failed to initiate payment')
        }
    }

    if (loading) {
        return <div className="p-4 text-center">Loading payments...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View your rent payments and download invoices.</CardDescription>
            </CardHeader>
            <CardContent>
                {payments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No payment history found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {payments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="space-y-1">
                                    <div className="font-medium">{payment.property?.name || 'Unknown Property'}</div>
                                    <div className="text-sm text-muted-foreground">
                                        Due: {format(new Date(payment.due_date), 'MMM d, yyyy')}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="font-bold">
                                            {payment.currency}{payment.amount}
                                        </div>
                                        <Badge variant={
                                            payment.status === 'paid' ? 'default' :
                                                payment.status === 'overdue' ? 'destructive' : 'secondary'
                                        }>
                                            {payment.status}
                                        </Badge>
                                    </div>
                                    {payment.status !== 'paid' && (
                                        <Button
                                            size="sm"
                                            onClick={() => handlePay(payment)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            Pay Now
                                        </Button>
                                    )}
                                    {payment.invoice_url && (
                                        <Button variant="ghost" size="icon" asChild>
                                            <a href={payment.invoice_url} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
