'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, FileText, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { useLandlordApplications } from "@/hooks/use-landlord-applications"

export function ApplicantViewer() {
    const { applicants, loading, updateStatus } = useLandlordApplications()

    const handleApprove = async (id: string, name: string) => {
        await updateStatus(id, 'approved')
        toast.success(`Approved application for ${name}. Contract sent!`)
    }

    const handleReject = async (id: string, name: string) => {
        await updateStatus(id, 'rejected')
        toast.info(`Application for ${name} rejected.`)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Recent Applications</h2>
                <Badge variant="outline" className="px-3 py-1">{applicants.filter(a => a.status === 'pending').length} Pending</Badge>
            </div>

            <div className="space-y-3">
                {applicants.map((applicant) => (
                    <Card key={applicant.id} className="p-4 border-border/50 hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <Avatar className="h-12 w-12 border-2 border-primary/20">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${applicant.name}`} />
                                    <AvatarFallback>{applicant.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2">
                                        {applicant.name}
                                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-200">
                                            {applicant.match}% Match
                                        </Badge>
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {applicant.profession} • €{applicant.income}/mo • <span className="text-primary">{applicant.property}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 md:mt-0">
                                <Button variant="outline" size="sm" className="text-muted-foreground">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Details
                                </Button>
                                {applicant.status === 'pending' && (
                                    <>
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleApprove(applicant.id, applicant.name)}
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                            onClick={() => handleReject(applicant.id, applicant.name)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                                {applicant.status !== 'pending' && (
                                    <Badge variant={applicant.status === 'approved' ? 'default' : 'destructive'}>
                                        {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1 text-green-600">
                                <ShieldCheck className="w-3 h-3" />
                                Identity Verified
                            </div>
                            <div className="flex items-center gap-1 text-green-600">
                                <ShieldCheck className="w-3 h-3" />
                                Income Verified
                            </div>
                            <div className="flex items-center gap-1 text-green-600">
                                <ShieldCheck className="w-3 h-3" />
                                Guarantor Valid
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
