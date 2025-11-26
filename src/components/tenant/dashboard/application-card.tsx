'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Application } from "@/types"
import { FileText, Clock, ArrowRight } from "lucide-react"

interface TenantApplicationCardProps {
    application: Application
    onViewDetails: (id: string) => void
}

export function TenantApplicationCard({ application, onViewDetails }: TenantApplicationCardProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">Approved</Badge>
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200">Pending Review</Badge>
            default:
                return <Badge variant="outline">Draft</Badge>
        }
    }

    return (
        <Card className="p-6 border-border/50 hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-lg">{application.property.name}</h3>
                    <p className="text-sm text-muted-foreground">{application.property.location}</p>
                </div>
                {getStatusBadge(application.status)}
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    Submitted: {new Date(application.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="w-4 h-4 mr-2" />
                    Documents: {application.status === 'draft' ? 'Incomplete' : 'Uploaded'}
                </div>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => onViewDetails(application.id)}>
                    View Details
                </Button>
                {application.status === 'approved' && (
                    <Button className="flex-1">
                        Sign Lease
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </Card>
    )
}
