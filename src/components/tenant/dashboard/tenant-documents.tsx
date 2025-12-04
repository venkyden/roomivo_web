'use client'

import { DocumentList } from "@/components/documents/document-list"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function TenantDocuments() {
    const requiredDocs = [
        { type: 'contract_signed', label: 'Contrat signé' },
        { type: 'home_insurance', label: 'Assurance Habitation' },
        { type: 'guarantor_letter', label: 'Lettre de responsabilité des garants' },
        { type: 'id_proof', label: 'Titre de séjour / Passeport' },
        { type: 'guarantor_payslip', label: 'Bulletin de salaire garant' },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">My Documents</h2>
                <p className="text-muted-foreground">Manage your rental documents and verifications.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Required Documents</CardTitle>
                    <CardDescription>
                        Please upload the following documents to complete your rental file.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DocumentList requiredDocs={requiredDocs} />
                </CardContent>
            </Card>
        </div>
    )
}
