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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/ui/file-upload'
import { useLandlordProperties } from '@/hooks/use-landlord-properties'
import { Loader2 } from 'lucide-react'

interface AddPropertyDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddPropertyDialog({ open, onOpenChange }: AddPropertyDialogProps) {
    const { addProperty } = useLandlordProperties()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        location: '',
        rooms: '',
        image: ''
    })

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await addProperty({
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                location: formData.location,
                rooms: parseInt(formData.rooms),
                images: formData.image ? [formData.image] : [],
                currency: '€',
                amenities: ['Wifi', 'Heating'] // Default for MVP
            })
            onOpenChange(false)
            setFormData({ name: '', description: '', price: '', location: '', rooms: '', image: '' })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                    <DialogDescription>
                        List your property for potential tenants.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Property Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Sunny Loft in Berlin"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price (€/mo)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="1200"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rooms">Rooms</Label>
                            <Input
                                id="rooms"
                                type="number"
                                value={formData.rooms}
                                onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                                placeholder="2"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Address or City"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the property..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Property Image</Label>
                        <FileUpload
                            bucket="properties"
                            onUpload={(url) => setFormData({ ...formData, image: url })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        List Property
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
