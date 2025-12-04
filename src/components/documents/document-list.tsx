'use client'

import { useEffect, useState } from "react"
import { Document } from "@/types"
import { createClient } from "@/utils/supabase/client"
import { DocumentUpload } from "./document-upload"
import { Loader2 } from "lucide-react"

interface RequiredDoc {
    type: string
    label: string
}

interface DocumentListProps {
    requiredDocs: RequiredDoc[]
    propertyId?: string
    title?: string
    description?: string
}

export function DocumentList({ requiredDocs, propertyId, title, description }: DocumentListProps) {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchDocuments = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            let query = supabase
                .from('documents')
                .select('*')
                .eq('user_id', user.id)

            if (propertyId) {
                query = query.eq('property_id', propertyId)
            } else {
                // If no propertyId, fetch docs that have NO property_id (personal docs)
                // Or should we fetch all? For now, let's be strict: personal docs have null property_id
                query = query.is('property_id', null)
            }

            const { data, error } = await query

            if (error) throw error
            setDocuments(data || [])
        } catch (error) {
            console.error('Error fetching documents:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [propertyId])

    if (loading) {
        return <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="space-y-6">
            {(title || description) && (
                <div>
                    {title && <h3 className="text-lg font-medium">{title}</h3>}
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            )}

            <div className="grid gap-4">
                {requiredDocs.map((doc) => {
                    const existingDoc = documents.find(d => d.type === doc.type)
                    return (
                        <DocumentUpload
                            key={doc.type}
                            type={doc.type}
                            label={doc.label}
                            propertyId={propertyId}
                            currentStatus={existingDoc?.status}
                            onUploadComplete={fetchDocuments}
                        />
                    )
                })}
            </div>
        </div>
    )
}
