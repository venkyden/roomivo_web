import { Navbar } from "@/components/layout/navbar"
import { ChatLayout } from "@/components/messages/chat-layout"

export default function MessagesPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Messages</h1>
                <ChatLayout />
            </main>
        </div>
    )
}
