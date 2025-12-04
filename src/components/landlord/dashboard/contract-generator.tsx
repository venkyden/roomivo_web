'use client'

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import jsPDF from "jspdf"
import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ContractGeneratorProps {
    tenantName: string
    propertyName: string
    price: number
    currency: string
    startDate: string
    applicationId?: string
    tenantId?: string
    propertyId?: string
}

type ContractType = 'furnished' | 'unfurnished' | 'colocation'

export function ContractGenerator({ tenantName, propertyName, price, currency, startDate, applicationId, tenantId, propertyId }: ContractGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false)
    const [contractType, setContractType] = useState<ContractType | 'guarantor_act' | 'custom_template'>('furnished')
    const [mode, setMode] = useState<'generate' | 'upload'>('generate')
    const [file, setFile] = useState<File | null>(null)

    // Templates
    const templates = {
        simple: `CONTRAT DE LOCATION

ENTRE :
{{LANDLORD_NAME}} (Le Bailleur)
Email: {{LANDLORD_EMAIL}}

ET :
{{TENANT_NAME}} (Le Locataire)
Email: {{TENANT_EMAIL}}

IL A ÉTÉ CONVENU CE QUI SUIT :
Le bailleur loue au locataire le logement situé à : {{PROPERTY_ADDRESS}}
Surface : {{SURFACE}} m² | Pièces : {{ROOMS}}

CONDITIONS FINANCIÈRES :
Loyer mensuel : {{RENT}} {{CURRENCY}}
Charges : {{CHARGES}} {{CURRENCY}}
Dépôt de garantie : {{DEPOSIT}} {{CURRENCY}}

DURÉE :
Début du bail : {{START_DATE}}
Durée : 1 an (reconductible)

Fait à {{CITY}}, le ${new Date().toLocaleDateString()}

SIGNATURES :
_____________________           _____________________
Le Bailleur                     Le Locataire`,

        detailed: `CONTRAT DE LOCATION D'UN LOGEMENT MEUBLÉ

ARTICLE 1 - DÉSIGNATION DES PARTIES
Le présent contrat est conclu entre :
{{LANDLORD_NAME}}, demeurant à [Adresse Bailleur], désigné "le bailleur".
ET
{{TENANT_NAME}}, désigné "le locataire".

ARTICLE 2 - OBJET DU CONTRAT
Le présent contrat a pour objet la location d'un logement situé :
{{PROPERTY_ADDRESS}}
Surface habitable : {{SURFACE}} m² | Nombre de pièces : {{ROOMS}}

Équipements et parties communes :
{{AMENITIES}}

ARTICLE 3 - DURÉE
Prise d'effet : {{START_DATE}}
Durée : 1 an (reconductible tacitement).

ARTICLE 4 - CONDITIONS FINANCIÈRES
Loyer mensuel : {{RENT}} {{CURRENCY}}
Charges forfaitaires : {{CHARGES}} {{CURRENCY}}
Total mensuel : {{RENT}} + {{CHARGES}} = [Total] {{CURRENCY}}
Dépôt de garantie : {{DEPOSIT}} {{CURRENCY}}

ARTICLE 5 - CLAUSE RÉSOLUTOIRE
Le contrat sera résilié de plein droit en cas de défaut de paiement ou de troubles de voisinage.

Fait à {{CITY}}, le ${new Date().toLocaleDateString()}

SIGNATURES :
_____________________           _____________________
Le Bailleur                     Le Locataire`,

        guarantor_custom: `ACTE DE CAUTIONNEMENT

Je soussigné(e), [Nom du Garant] demeurant à [Adresse du Garant]
déclare me porter caution de {{TENANT_NAME}} demeurant à {{PROPERTY_ADDRESS}} en vertu du contrat de location signé le {{START_DATE}} avec {{LANDLORD_NAME}}. Un exemplaire du bail m’a été remis et j’ai pris connaissance des différentes clauses et conditions de ce bail.

En me portant caution, je m’engage à garantir, pour la durée de 3 ans tacitement renouvelable, le paiement des loyers, réparations locatives, impôts et taxes, pénalités, intérêts de retard et tous frais éventuels de procédure dus en vertu de ce bail.

" Bon pour caution pour le paiement du loyer d’un montant de {{RENT}} {{CURRENCY}} révisable annuellement selon la variation annuelle de l’indice de référence des loyers publié par l’INSEE à majorer de tous intérêts, frais et accessoires.

Je confirme avoir une parfaite connaissance de l’étendue de mon engagement et des termes de l’article 22-1, avant-dernier alinéa, de la loi du 6 juillet 1989, reproduit ci-dessous :

Lorsque le cautionnement d’obligations résultant d’un contrat de colocation conclu en application du présent titre ne comporte aucune indication de durée ou lorsque la durée du cautionnement est stipulée indéterminée, la caution peut le résilier unilatéralement. La résiliation prend effet au terme du contrat de location, qu’il s’agisse du contrat initial ou d’un contrat reconduit ou renouvelé, au cours duquel le bailleur reçoit notification de la résiliation." *

Fait à {{CITY}}, signé le ${new Date().toLocaleDateString()}

Signature de la caution

* Écrire de façon manuscrite la totalité du texte entre guillemets.`
    }

    const [customTemplateText, setCustomTemplateText] = useState(templates.simple)

    // Extra data state
    const [landlord, setLandlord] = useState<any>(null)
    const [propertyDetails, setPropertyDetails] = useState<any>(null)

    const supabase = createClient()

    // Load template from localStorage
    // Force rebuild
    useEffect(() => {
        const saved = localStorage.getItem('landlord_contract_template')
        if (saved) setCustomTemplateText(saved)
    }, [])

    // Save template to localStorage on change
    useEffect(() => {
        localStorage.setItem('landlord_contract_template', customTemplateText)
    }, [customTemplateText])

    // Fetch extra details
    useEffect(() => {
        const fetchData = async () => {
            // Get Landlord Profile
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
                setLandlord(profile)
            }

            // Get Property Details (Surface, Rooms, City, Amenities)
            if (propertyId) {
                const { data: prop } = await supabase.from('properties').select('*').eq('id', propertyId).single()
                setPropertyDetails(prop)
            }
        }
        fetchData()
    }, [propertyId])

    // Infer contract type logic (kept from before)
    useEffect(() => {
        const inferType = async () => {
            if (!propertyId || !propertyDetails) return

            // Use propertyDetails if already fetched, otherwise fetch (but we fetch above now)
            // Re-using propertyDetails for inference
            const property = propertyDetails

            if (property) {
                if (property.rental_type && ['furnished', 'unfurnished', 'colocation'].includes(property.rental_type)) {
                    setContractType(property.rental_type as ContractType)
                    return
                }
                const desc = (property.description || '').toLowerCase()
                const amenities = (property.amenities || []).map((a: string) => a.toLowerCase())

                if (desc.includes('colocation') || desc.includes('shared') || amenities.includes('shared')) {
                    setContractType('colocation')
                } else if (desc.includes('unfurnished') || desc.includes('non meublé')) {
                    setContractType('unfurnished')
                } else {
                    setContractType('furnished')
                }
            }
        }
        inferType()
    }, [propertyId, propertyDetails])

    const insertVariable = (variable: string) => {
        setCustomTemplateText(prev => prev + ` ${variable} `)
    }

    const loadPreset = (preset: 'simple' | 'detailed' | 'guarantor_custom') => {
        if (confirm("This will overwrite your current template. Continue?")) {
            setCustomTemplateText(templates[preset])
        }
    }

    const handleUpload = async () => {
        if (!file || !applicationId || !tenantId || !propertyId) {
            toast.error("Please select a file and ensure all application details are present.")
            return
        }
        setIsGenerating(true)

        try {
            const fileName = `custom_contract_${applicationId}_${Date.now()}.pdf`
            const { error: uploadError } = await supabase.storage
                .from('contracts')
                .upload(fileName, file, {
                    contentType: 'application/pdf'
                })

            if (uploadError) throw uploadError

            const { error: dbError } = await supabase
                .from('contracts')
                .insert({
                    application_id: applicationId,
                    tenant_id: tenantId,
                    property_id: propertyId,
                    landlord_id: (await supabase.auth.getUser()).data.user?.id,
                    status: 'sent',
                    contract_url: fileName
                })

            if (dbError) throw dbError

            toast.success("Custom contract uploaded and sent!")
            setFile(null)
        } catch (error) {
            console.error('Error uploading contract:', error)
            toast.error("Failed to upload contract")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleGenerate = async () => {
        setIsGenerating(true)
        try {
            const doc = new jsPDF()

            if (contractType === 'custom_template') {
                // SMART TEMPLATE GENERATION
                doc.setFontSize(11)
                doc.setFont("helvetica", "normal")

                // Prepare variables
                const landlordName = landlord ? `${landlord.first_name || ''} ${landlord.last_name || ''}`.trim() || "Le Propriétaire" : "Le Propriétaire"
                const landlordEmail = landlord?.email || "[Email]"
                const surface = propertyDetails?.surface || "[Surface]"
                const rooms = propertyDetails?.rooms || "[Pièces]"
                const city = propertyDetails?.city || "Paris"
                const amenities = propertyDetails?.amenities?.join(', ') || "Non spécifié"
                const charges = 50 // Default or fetch
                const deposit = price * 2 // Default rule

                // Replace variables
                let finalText = customTemplateText
                    .replace(/{{TENANT_NAME}}/g, tenantName)
                    .replace(/{{TENANT_EMAIL}}/g, "[Email Locataire]") // Need to fetch tenant email if not passed
                    .replace(/{{LANDLORD_NAME}}/g, landlordName)
                    .replace(/{{LANDLORD_EMAIL}}/g, landlordEmail)
                    .replace(/{{PROPERTY_ADDRESS}}/g, propertyName)
                    .replace(/{{SURFACE}}/g, surface.toString())
                    .replace(/{{ROOMS}}/g, rooms.toString())
                    .replace(/{{AMENITIES}}/g, amenities)
                    .replace(/{{CITY}}/g, city)
                    .replace(/{{RENT}}/g, price.toString())
                    .replace(/{{CHARGES}}/g, charges.toString())
                    .replace(/{{DEPOSIT}}/g, deposit.toString())
                    .replace(/{{CURRENCY}}/g, currency)
                    .replace(/{{START_DATE}}/g, startDate)
                    .replace(/\[Nom du Propriétaire\]/g, landlordName) // Legacy support

                // Split text into lines that fit the page
                const splitText = doc.splitTextToSize(finalText, 170)

                let y = 20
                splitText.forEach((line: string) => {
                    if (y > 270) {
                        doc.addPage()
                        y = 20
                    }
                    doc.text(line, 20, y)
                    y += 6
                })

            } else if (contractType === 'guarantor_act') {
                // Guarantor Act Generation
                doc.setFontSize(14)
                doc.text("ACTE DE CAUTIONNEMENT", 105, 20, { align: "center" })

                doc.setFontSize(10)
                const content = [
                    `Fait à ${propertyDetails?.city || '[Ville]'}, le ${new Date().toLocaleDateString()}`,
                    "",
                    "Objet : Acte de cautionnement",
                    "",
                    "Madame, Monsieur,",
                    "",
                    `Je soussigné [Nom du Garant], né le [Date] résidant à [Adresse du Garant],`,
                    `déclare par le présent acte me porter caution simple pour ${tenantName},`,
                    `au profit de ${landlord ? (landlord.first_name + ' ' + landlord.last_name) : '[Nom du Propriétaire]'} (le Bailleur).`,
                    "",
                    `Cet acte est valable pour le contrat conclu le ${startDate} et les obligations du contrat de bail`,
                    `du bien situé au ${propertyName}.`,
                    "",
                    "Cet acte de cautionnement est valable pour les loyers, mais aussi les éventuels frais de",
                    "réparations locatives, les impôts, les taxes et potentiellement les frais de procédure s’il y a lieu.",
                    "",
                    "Je déclare avoir connaissance de l’étendue de cet engagement, mais aussi avoir reçu",
                    "l’exemplaire du contrat qui m’est destiné, ainsi que les différentes clauses qu’il comprend.",
                    "",
                    "Bon pour caution solidaire/simple en garantie du paiement du loyer d’un montant de",
                    `[Montant en lettres] euros (${price}€), révisé chaque année selon l’indice de référence`,
                    "des loyers publié par l’INSEE.",
                    "",
                    "Cet acte est valable pour une durée indéterminée.",
                    "",
                    "Je déclare avoir pris connaissance de l’article 22-1 alinéa 1 de la loi du 6 juillet 1989 reproduit ci-dessous :",
                    "",
                    "« Lorsque le cautionnement d’obligations résultant d’un contrat de location conclu en application",
                    "du présent titre ne comporte aucune indication de durée ou lorsque la durée du cautionnement est",
                    "stipulée indéterminée, la caution peut le résilier unilatéralement. La résiliation prend effet au terme",
                    "du contrat de location, qu’il s’agisse du contrat initial ou d’un contrat reconduit ou renouvelé, au",
                    "cours duquel le bailleur reçoit notification de la résiliation. »",
                    "",
                    "",
                    `Fait à ${propertyDetails?.city || '[Ville]'} le ${new Date().toLocaleDateString()}`,
                    "",
                    "",
                    "SIGNATURE DU GARANT",
                    "(Précédée de la mention manuscrite « Bon pour caution »)",
                    "",
                    "",
                    "__________________________"
                ]

                let y = 40
                content.forEach(line => {
                    if (y > 270) {
                        doc.addPage()
                        y = 20
                    }
                    doc.text(line, 20, y)
                    y += 6
                })

            } else if (contractType === 'furnished') {
                // NEW FURNISHED TEMPLATE (User Provided)
                doc.setFontSize(12)
                doc.setFont("helvetica", "bold")
                doc.text("CONTRAT DE LOCATION", 105, 20, { align: "center" })
                doc.setFontSize(10)
                doc.setFont("helvetica", "normal")
                doc.text("(Soumis au titre Ier bis de la loi du 6 juillet 1989 - Loi Alur)", 105, 26, { align: "center" })
                doc.setFont("helvetica", "bold")
                doc.text("LOCAUX MEUBLES A USAGE D'HABITATION", 105, 32, { align: "center" })

                doc.setFont("helvetica", "normal")
                doc.setFontSize(9)

                const content = [
                    "",
                    "I. DÉSIGNATION DES PARTIES",
                    "Le présent contrat est conclu entre les soussignés :",
                    "",
                    "Qualité du bailleur : Personne physique",
                    `Nom et prénom du bailleur : ${landlord ? (landlord.first_name + ' ' + landlord.last_name) : '[Nom du Propriétaire]'}`,
                    `Adresse email : ${landlord?.email || '[Email Propriétaire]'}`,
                    "Désigné(s) ci-après « le bailleur »",
                    "",
                    "ET",
                    "",
                    "Qualité du locataire : Personne physique",
                    `Nom et prénom du locataire : ${tenantName}`,
                    `Adresse email : [Email Locataire]`,
                    "Désigné(s) ci-après « le locataire »",
                    "",
                    "IL A ÉTÉ CONVENU CE QUI SUIT :",
                    "",
                    "II. OBJET DU CONTRAT",
                    "Le présent contrat a pour objet la location d’un logement ainsi déterminé :",
                    "",
                    "A. Consistance du logement",
                    `Adresse du logement : ${propertyName}`,
                    "Type d’habitat : Immeuble collectif / Copropriété",
                    `Surface habitable : ${propertyDetails?.surface || '[Surface]'} m2`,
                    `Nombre de pièces principales : ${propertyDetails?.rooms || '[Nb Pièces]'}`,
                    "Équipements : Cuisine équipée (four, plaques, frigo), lave-linge, mobilier complet.",
                    "Chauffage : Collectif / Eau chaude : Individuel",
                    "",
                    "B. Destination des locaux : Usage d’habitation",
                    "",
                    "C. Équipement TIC : Internet fibre optique",
                    "",
                    "III. DATE DE PRISE D’EFFET ET DURÉE DU CONTRAT",
                    `A. Date de prise d’effet : ${startDate}`,
                    "B. Durée du contrat : UN AN (ou 9 mois si étudiant)",
                    "Le locataire peut mettre fin au bail à tout moment (préavis 1 mois).",
                    "Le bailleur peut mettre fin au bail à son échéance (préavis 3 mois).",
                    "",
                    "IV. CONDITIONS FINANCIÈRES",
                    "A. Loyer",
                    `1. Loyer mensuel hors charges : ${price} ${currency}`,
                    `2. Charges provisionnelles : 50 ${currency}`,
                    `3. Total mensuel : ${price + 50} ${currency}`,
                    "",
                    "B. Dépôt de garantie",
                    `Montant : ${price * 2} ${currency} (2 mois de loyer HC)`,
                    "",
                    "C. Modalités de paiement",
                    "Périodicité : Mensuel (à échoir)",
                    "Date de paiement : Le 5 du mois",
                    "Lieu de paiement : Virement bancaire",
                    "",
                    "V. CONDITIONS PARTICULIÈRES",
                    "- Le délai de plus de 10 jours du paiement du loyer donne la possibilité d’annuler le contrat.",
                    "- Tout problème de moisissure dû à l'absence de ventilation sera déduit de la caution.",
                    "",
                    "VI. ANNEXES",
                    "- État des lieux",
                    "- Inventaire du mobilier",
                    "- Dossier de diagnostic technique",
                    "",
                    `Fait à ${propertyDetails?.city || '[Ville]'}, le ${new Date().toLocaleDateString()}`,
                    "",
                    "",
                    "LE BAILLEUR                                          LE LOCATAIRE",
                    "(Lu et approuvé)                                     (Lu et approuvé)",
                    "",
                    "",
                    "__________________________                           __________________________"
                ]

                let y = 40
                content.forEach(line => {
                    if (y > 270) {
                        doc.addPage()
                        y = 20
                    }

                    // Bold headers logic
                    if (line.startsWith("I. ") || line.startsWith("II. ") || line.startsWith("III. ") || line.startsWith("IV. ") || line.startsWith("V. ") || line.startsWith("VI. ") || line.startsWith("A. ") || line.startsWith("B. ") || line.startsWith("C. ")) {
                        doc.setFont("helvetica", "bold")
                    } else {
                        doc.setFont("helvetica", "normal")
                    }

                    doc.text(line, 20, y)
                    y += 5 // Slightly tighter spacing for this long contract
                })

            } else {
                // For brevity in this diff, I'm mapping 'unfurnished' and 'colocation' to the previous simple logic
                // or just reusing the generic structure.

                // Configuration based on type
                const config = {
                    unfurnished: {
                        title: "CONTRAT DE LOCATION NUE",
                        law: "(Soumis au titre Ier de la loi n° 89-462 du 6 juillet 1989)",
                        duration: "TROIS ANS",
                        depositMonths: 1,
                        depositText: "1 mois de loyer HC"
                    },
                    colocation: {
                        title: "CONTRAT DE COLOCATION (BAIL UNIQUE)",
                        law: "(Soumis à l'article 8-1 de la loi n° 89-462 du 6 juillet 1989)",
                        duration: "UN AN (Meublé) / TROIS ANS (Nu)",
                        depositMonths: 1,
                        depositText: "Montant divisé entre les colocataires"
                    }
                }[contractType as 'unfurnished' | 'colocation']

                // Header
                doc.setFontSize(14)
                doc.setTextColor(0, 0, 0)
                doc.text(config.title, 105, 20, { align: "center" })
                doc.setFontSize(9)
                doc.text(config.law, 105, 26, { align: "center" })

                // Content
                doc.setFontSize(10)
                doc.setTextColor(0, 0, 0)

                const content = [
                    "",
                    "I. DÉSIGNATION DES PARTIES",
                    "Le présent contrat est conclu entre les soussignés :",
                    "",
                    `LE BAILLEUR : ${landlord ? (landlord.first_name + ' ' + landlord.last_name) : '[Nom du Propriétaire]'}`,
                    "Désigné(s) ci-après « le bailleur »",
                    "",
                    "ET",
                    "",
                    `LE LOCATAIRE : ${tenantName}`,
                    "Désigné(s) ci-après « le locataire »",
                    "",
                    "IL A ÉTÉ CONVENU CE QUI SUIT :",
                    "",
                    "II. OBJET DU CONTRAT",
                    `Adresse : ${propertyName}`,
                    contractType === 'colocation' ? "Colocation avec clause de solidarité." : "Location nue à usage d'habitation principale.",
                    "",
                    "III. DURÉE",
                    `Durée : ${config.duration} à compter du ${startDate}`,
                    "",
                    "IV. CONDITIONS FINANCIÈRES",
                    `Loyer : ${price} ${currency}`,
                    `Charges : 50 ${currency}`,
                    `Dépôt de garantie : ${price * config.depositMonths} ${currency}`,
                    "",
                    "Fait à ___________________, le _______________",
                    "",
                    "LE BAILLEUR                                          LE LOCATAIRE",
                    "__________________________                           __________________________"
                ]

                let y = 40
                content.forEach(line => {
                    if (y > 270) {
                        doc.addPage()
                        y = 20
                    }
                    doc.text(line, 20, y)
                    y += 6
                })
            }

            // Save PDF as Blob
            const pdfBlob = doc.output('blob')

            if (applicationId && tenantId && propertyId) {
                const fileName = `${contractType === 'guarantor_act' ? 'guarantor_act' : 'contract_' + contractType}_${applicationId}_${Date.now()}.pdf`
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('contracts')
                    .upload(fileName, pdfBlob, {
                        contentType: 'application/pdf'
                    })

                if (uploadError) throw uploadError

                const { error: dbError } = await supabase
                    .from('contracts')
                    .insert({
                        application_id: applicationId,
                        tenant_id: tenantId,
                        property_id: propertyId,
                        landlord_id: (await supabase.auth.getUser()).data.user?.id,
                        status: 'sent',
                        contract_url: fileName
                    })

                if (dbError) throw dbError

                toast.success(`${contractType === 'guarantor_act' ? 'Acte de cautionnement' : 'Contrat'} généré et envoyé !`)
            } else {
                doc.save(`${contractType === 'guarantor_act' ? 'Acte_Cautionnement' : 'Contrat'}_${tenantName.replace(' ', '_')}.pdf`)
                toast.success("Document téléchargé !")
            }

        } catch (error) {
            console.error('Error generating document:', error)
            toast.error("Échec de la génération du document")
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                <Button
                    variant={mode === 'generate' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('generate')}
                >
                    Auto-Generate
                </Button>
                <Button
                    variant={mode === 'upload' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('upload')}
                >
                    Upload PDF
                </Button>
            </div>

            {mode === 'generate' ? (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <Select value={contractType} onValueChange={(v: ContractType | 'guarantor_act' | 'custom_template') => setContractType(v)}>
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Type de document" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="furnished">Contrat Meublé (1 an)</SelectItem>
                                <SelectItem value="unfurnished">Contrat Non Meublé (3 ans)</SelectItem>
                                <SelectItem value="colocation">Contrat Colocation</SelectItem>
                                <SelectItem value="guarantor_act">Acte de Cautionnement</SelectItem>
                                <SelectItem value="custom_template">✨ Custom Template</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                            <FileText className="w-4 h-4 mr-2" />
                            {isGenerating ? "..." : "Générer"}
                        </Button>
                    </div>

                    {contractType === 'custom_template' && (
                        <div className="mt-2 p-4 border rounded-lg bg-slate-50">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-muted-foreground">
                                    Customize your contract. Changes are auto-saved.
                                </p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => loadPreset('simple')} className="text-xs">Load Simple</Button>
                                    <Button size="sm" variant="ghost" onClick={() => loadPreset('detailed')} className="text-xs">Load Detailed</Button>
                                    <Button size="sm" variant="ghost" onClick={() => loadPreset('guarantor_custom')} className="text-xs text-violet-600">Load Guarantor Act</Button>
                                </div>
                            </div>
                            <div className="flex gap-2 mb-2 flex-wrap">
                                <Button size="sm" variant="outline" onClick={() => insertVariable('{{TENANT_NAME}}')}>Tenant</Button>
                                <Button size="sm" variant="outline" onClick={() => insertVariable('{{LANDLORD_NAME}}')}>Landlord</Button>
                                <Button size="sm" variant="outline" onClick={() => insertVariable('{{PROPERTY_ADDRESS}}')}>Address</Button>
                                <Button size="sm" variant="outline" onClick={() => insertVariable('{{RENT}}')}>Rent</Button>
                                <Button size="sm" variant="outline" onClick={() => insertVariable('{{CHARGES}}')}>Charges</Button>
                                <Button size="sm" variant="outline" onClick={() => insertVariable('{{DEPOSIT}}')}>Deposit</Button>
                                <Button size="sm" variant="outline" onClick={() => insertVariable('{{START_DATE}}')}>Date</Button>
                                <Button size="sm" variant="outline" onClick={() => insertVariable('{{SURFACE}}')}>Surface</Button>
                                <Button size="sm" variant="outline" onClick={() => insertVariable('{{AMENITIES}}')}>Amenities</Button>
                            </div>
                            <textarea
                                className="w-full h-96 p-2 text-sm border rounded font-mono"
                                value={customTemplateText}
                                onChange={(e) => setCustomTemplateText(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex gap-2 items-center">
                    <input
                        type="file"
                        accept=".pdf"
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <Button size="sm" onClick={handleUpload} disabled={!file || isGenerating}>
                        {isGenerating ? "Uploading..." : "Send PDF"}
                    </Button>
                </div>
            )}
        </div>
    )
}
