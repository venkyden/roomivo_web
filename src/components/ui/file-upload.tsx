'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface FileUploadProps {
    bucket: 'properties' | 'documents'
    onUpload: (url: string) => void
    label?: string
    accept?: string
}

export function FileUpload({ bucket, onUpload, label = "Upload File", accept = "image/*" }: FileUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const supabase = createClient()

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = event.target.files?.[0]
            if (!file) return

            // Create preview
            if (file.type.startsWith('image/')) {
                const objectUrl = URL.createObjectURL(file)
                setPreview(objectUrl)
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath)

            onUpload(publicUrl)
            toast.success('Upload successful!')
        } catch (error) {
            console.error('Error uploading file:', error)
            toast.error('Error uploading file')
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-4">
                {preview ? (
                    <div className="relative w-20 h-20 rounded-md overflow-hidden border">
                        <Image src={preview} alt="Preview" fill className="object-cover" />
                        <button
                            onClick={() => setPreview(null)}
                            className="absolute top-0 right-0 p-1 bg-black/50 text-white hover:bg-black/70"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div className="w-full">
                        <Input
                            type="file"
                            accept={accept}
                            onChange={handleUpload}
                            disabled={uploading}
                            className="cursor-pointer"
                        />
                    </div>
                )}
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
        </div>
    )
}
