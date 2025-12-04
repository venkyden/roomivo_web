'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const profileSchema = z.object({
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(2, "Last name is required"),
    phone: z.string().optional(),
    profession: z.string().optional(),
    income: z.string().optional(),
    age: z.string().optional(),
    bio: z.string().optional(),
    has_guarantor: z.boolean().default(false).optional(),
    preferred_location: z.string().optional(),
    budget_min: z.string().optional(),
    budget_max: z.string().optional(),
})

export function ProfileForm({ user }: { user: any }) {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            phone: "",
            profession: "",
            income: "",
            age: "",
            bio: "",
            has_guarantor: false,
            preferred_location: "",
            budget_min: "",
            budget_max: "",
        },
    })

    useEffect(() => {
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (data) {
                form.reset({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    phone: data.phone || "",
                    profession: data.profession || "",
                    income: data.income?.toString() || "",
                    age: data.age?.toString() || "",
                    bio: data.bio || "",
                    has_guarantor: data.has_guarantor || false,
                    preferred_location: data.preferred_location || "",
                    budget_min: data.budget_min?.toString() || "",
                    budget_max: data.budget_max?.toString() || "",
                })
            }
        }
        fetchProfile()
    }, [user.id, form, supabase])

    async function onSubmit(values: z.infer<typeof profileSchema>) {
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: values.first_name,
                    last_name: values.last_name,
                    phone: values.phone,
                    profession: values.profession,
                    income: values.income ? parseFloat(values.income) : null,
                    age: values.age ? parseInt(values.age) : null,
                    bio: values.bio,
                    has_guarantor: values.has_guarantor,
                    preferred_location: values.preferred_location,
                    budget_min: values.budget_min ? parseInt(values.budget_min) : null,
                    budget_max: values.budget_max ? parseInt(values.budget_max) : null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)

            if (error) throw error

            toast.success("Profile updated successfully")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="+33 6 12 34 56 78" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="profession"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Profession</FormLabel>
                                <FormControl>
                                    <Input placeholder="Software Engineer" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="income"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monthly Income (€)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="3000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="preferred_location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Preferred Location</FormLabel>
                            <FormControl>
                                <Input placeholder="Paris, Lyon..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="budget_min"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Min Budget (€)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="500" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="budget_max"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Max Budget (€)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="1200" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </Form>
    )
}
