import Link from 'next/link'
import { Building2, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-muted/30 border-t border-border/50 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">Roomivo</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            The premium rental platform connecting tenants and landlords with trust, transparency, and ease.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Platform</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/properties" className="hover:text-primary transition-colors">Browse Properties</Link></li>
                            <li><Link href="/landlord" className="hover:text-primary transition-colors">For Landlords</Link></li>
                            <li><Link href="/tenant" className="hover:text-primary transition-colors">For Tenants</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Roomivo. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <Link href="#" className="hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></Link>
                        <Link href="#" className="hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></Link>
                        <Link href="#" className="hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></Link>
                        <Link href="#" className="hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
