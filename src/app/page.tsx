import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Clock, FileCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now Live in Paris & Lyon
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              Rent with <span className="text-primary">Confidence</span>.<br />
              Live with <span className="text-primary">Peace of Mind</span>.
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              The first rental platform that protects both tenants and landlords.
              Verified profiles, secure payments, and legal compliance built-in.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/25" asChild>
                <Link href="/auth">
                  Start Renting <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full bg-background/50 backdrop-blur-sm" asChild>
                <Link href="/about">How it Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure Escrow</h3>
                <p className="text-muted-foreground">
                  Your money is held safely until you move in. No more scams or lost deposits.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Matching</h3>
                <p className="text-muted-foreground">
                  Find your perfect match in minutes with our AI-powered recommendation engine.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileCheck className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Legal Compliance</h3>
                <p className="text-muted-foreground">
                  Auto-generated contracts and documents compliant with the latest French laws.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
