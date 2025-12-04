'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, CheckCircle, XCircle } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

interface DocumentUploadProps {
    type: string
    label: string
    propertyId?: string
    onUploadComplete: () => void
    currentStatus?: 'pending' | 'verified' | 'rejected'
}

export function DocumentUpload({ type, label, propertyId, onUploadComplete, currentStatus }: DocumentUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const supabase = createClient()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Not authenticated")

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // 2. Insert into Database
            const { error: dbError } = await supabase
                .from('documents')
                .insert({
                    user_id: user.id,
                    property_id: propertyId,
                    type,
                    name: label,
                    file_url: fileName,
                    status: 'pending'
                })

            if (dbError) throw dbError

            toast.success(`${label} uploaded successfully`)
            onUploadComplete()
        } catch (error) {
            console.error('Error uploading document:', error)
            toast.error("Failed to upload document")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="border rounded-lg p-4 flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${currentStatus === 'verified' ? 'bg-green-100 text-green-600' :
                        currentStatus === 'rejected' ? 'bg-red-100 text-red-600' :
                            currentStatus === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-muted text-muted-foreground'
                    }`}>
                    {currentStatus === 'verified' ? <CheckCircle className="w-5 h-5" /> :
                        currentStatus === 'rejected' ? <XCircle className="w-5 h-5" /> :
                            <Upload className="w-5 h-5" />}
                </div>
                <div>
                    <h4 className="font-medium text-sm">{label}</h4>
                    <p className="text-xs text-muted-foreground">
                        {currentStatus === 'verified' ? 'Verified' :
                            currentStatus === 'pending' ? 'Under Review' :
                                currentStatus === 'rejected' ? 'Rejected - Please re-upload' :
                                    'Not uploaded'}
                    </p>
                </div>
            </div>
            <div>
                <Input
                    type="file"
                    id={`upload-${type}`}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading || currentStatus === 'verified'}
                    accept=".pdf,.jpg,.jpeg,.png"
                />
                <Label
                    htmlFor={`upload-${type}`}
                    className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${(isUploading || currentStatus === 'verified') ? 'pointer-events-none opacity-50' : ''
                        }`}
                >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                </Label>
            </div>
        </div>
    )
}
