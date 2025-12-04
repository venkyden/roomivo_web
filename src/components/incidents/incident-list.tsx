import { Incident } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, Clock, Wrench } from 'lucide-react'
import { format } from 'date-fns'
import { ReportIncidentDialog } from './report-incident-dialog'

interface IncidentListProps {
    incidents: Incident[]
    loading: boolean
}

export function IncidentList({ incidents, loading }: IncidentListProps) {
    if (loading) {
        return <div className="p-4 text-center">Loading incidents...</div>
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'destructive'
            case 'high': return 'destructive' // or orange if available
            case 'medium': return 'default'
            case 'low': return 'secondary'
            default: return 'secondary'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'reported': return <AlertTriangle className="h-4 w-4" />
            case 'in_progress': return <Wrench className="h-4 w-4" />
            case 'resolved': return <CheckCircle2 className="h-4 w-4" />
            case 'closed': return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            default: return <Clock className="h-4 w-4" />
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Maintenance Requests</CardTitle>
                    <CardDescription>Track the status of your reported issues.</CardDescription>
                </div>
                <ReportIncidentDialog />
            </CardHeader>
            <CardContent>
                {incidents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Wrench className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No incidents reported.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {incidents.map((incident) => (
                            <div key={incident.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{incident.title}</span>
                                        <Badge variant={getPriorityColor(incident.priority) as any} className="text-xs">
                                            {incident.priority}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                        {incident.description}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Reported: {format(new Date(incident.created_at), 'MMM d, yyyy')} • {incident.property?.name || 'Unknown Property'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="flex items-center gap-1 capitalize">
                                        {getStatusIcon(incident.status)}
                                        {incident.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
