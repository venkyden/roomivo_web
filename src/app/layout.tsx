import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roomivo | Premium Rental Experience",
  description: "Find your perfect home or tenant with Roomivo.",
};

import { createClient } from "@/utils/supabase/server";
import { Navbar } from "@/components/layout/navbar";

// ... existing code ...

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile if user exists to pass complete data to Navbar
  let userWithProfile = user;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profile) {
      userWithProfile = { ...user, profile };
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <div className="min-h-screen flex flex-col">
          {/* Pass server-fetched user to Navbar */}
          {/* Note: In sub-pages that use Navbar independently, they should also pass it, but Navbar is global usually */}
          {/* Wait, Navbar is used inside specific pages in current codebase structure, e.g. LandlordPage uses <Navbar /> manually. */}
          {/* Checking usage: LandlordPage uses <Navbar />. HomePage uses <Navbar />. */}
          {/* If I add it here in Layout, I might double-render it if pages also include it. */}
          {/* Let's checks the codebase. The user provided `app/landlord/page.tsx` has <Navbar />. */}
          {/* `app/page.tsx` has <Navbar />. */}
          {/* So `RootLayout` does NOT have <Navbar /> currently. */}
          {/* So I should NOT add it to RootLayout unless I refactor the whole app to use a Layout-based Navbar. */}
          {/* It's safer to update the specific pages to pass the user to Navbar. */}
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
