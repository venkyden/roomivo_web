'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Loader2, Upload } from 'lucide-react'

interface BulkUploadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function BulkUploadDialog({ open, onOpenChange }: BulkUploadDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsLoading(true)
        try {
            const text = await file.text()
            const rows = text.split('\n').slice(1) // Skip header
            const properties = []

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            for (const row of rows) {
                const [name, price, location, description] = row.split(',')
                if (name && price && location) {
                    properties.push({
                        name: name.trim(),
                        price: parseFloat(price.trim()),
                        location: location.trim(),
                        description: description?.trim() || '',
                        landlord_id: user.id,
                        images: [], // Default empty images
                        amenities: [], // Default empty amenities
                    })
                }
            }

            if (properties.length === 0) {
                throw new Error('No valid properties found in CSV')
            }

            const { error } = await supabase.from('properties').insert(properties)

            if (error) throw error

            toast.success(`Successfully uploaded ${properties.length} properties`)
            onOpenChange(false)
            // Ideally trigger a refresh here, but for now page reload or SWR revalidation will handle it
            window.location.reload()
        } catch (error: any) {
            console.error('Upload error:', error)
            toast.error(error.message || 'Failed to upload properties')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bulk Upload Properties</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with the following columns: Name, Price, Location, Description.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="csv">CSV File</Label>
                        <Input id="csv" type="file" accept=".csv" onChange={handleFileUpload} disabled={isLoading} />
                    </div>
                    {isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                        </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                        <p>Example CSV format:</p>
                        <code className="block bg-muted p-2 rounded mt-1">
                            Name,Price,Location,Description<br />
                            Sunny Room,500,Berlin,Great view<br />
                            Cozy Studio,750,Munich,Central location
                        </code>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
