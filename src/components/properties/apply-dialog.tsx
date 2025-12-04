'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@/components/ui/file-upload'
import { Property } from '@/types'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ApplyDialogProps {
    property: Property | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ApplyDialog({ property, open, onOpenChange }: ApplyDialogProps) {
    const [message, setMessage] = useState('')
    const [documents, setDocuments] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleSubmit = async () => {
        if (!property) return
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("You must be logged in to apply")
                return
            }

            const { error } = await supabase
                .from('applications')
                .insert({
                    property_id: property.id,
                    tenant_id: user.id,
                    status: 'pending',
                    message: message,
                    documents: documents,
                    created_at: new Date().toISOString()
                })

            if (error) throw error

            toast.success("Application submitted successfully!")
            onOpenChange(false)
            setMessage('')
        } catch (error) {
            console.error(error)
            toast.error("Failed to submit application")
        } finally {
            setLoading(false)
        }
    }

    if (!property) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Apply for {property.name}</DialogTitle>
                    <DialogDescription>
                        Send a message to the landlord to express your interest.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Textarea
                            placeholder="Hi, I'm interested in this property because..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Attach Document (Optional)</Label>
                        <FileUpload
                            bucket="documents"
                            label="Upload ID or Payslip"
                            accept=".pdf,.jpg,.png"
                            onUpload={(url) => setDocuments([...documents, url])}
                        />
                        {documents.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                                {documents.length} file(s) attached
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Application
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
