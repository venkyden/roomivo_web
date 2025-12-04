import { ChatLayout } from "@/components/messages/chat-layout"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function MessagesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Messages</h1>
            <ChatLayout />
        </div>
    )
}
