import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Boxes, Code, DollarSign, Zap, Users, Shield, ArrowRight, Check, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">JobStack</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost">Sign In</Button></Link>
            <Link href="/register"><Button>Get Started</Button></Link>
          </div>
        </div>
      </nav>

      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/50 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm">Visual Infrastructure Planning</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Design Infrastructure<br />
            <span className="text-primary">Like Drawing a Diagram</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Drag-and-drop visual editor for cloud architecture. Generate production-ready Terraform code and estimate costs in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"><Button size="lg">Start Building Free<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            <Link href="/login"><Button size="lg" variant="outline">View Demo</Button></Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Plan Infrastructure</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">From visual design to production deployment</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card><CardHeader><Boxes className="h-10 w-10 text-primary mb-2" /><CardTitle>Visual Diagram Builder</CardTitle><CardDescription>Drag and drop components to design your infrastructure. Connect services with simple clicks.</CardDescription></CardHeader></Card>
            <Card><CardHeader><Code className="h-10 w-10 text-primary mb-2" /><CardTitle>Terraform Code Generation</CardTitle><CardDescription>Export production-ready Terraform code instantly. Supports AWS, GCP, Azure, and more.</CardDescription></CardHeader></Card>
            <Card><CardHeader><DollarSign className="h-10 w-10 text-primary mb-2" /><CardTitle>Real-Time Cost Estimation</CardTitle><CardDescription>See monthly costs as you build. Make informed decisions before deployment.</CardDescription></CardHeader></Card>
            <Card><CardHeader><Zap className="h-10 w-10 text-primary mb-2" /><CardTitle>30+ Cloud Components</CardTitle><CardDescription>Pre-configured templates for AWS Lambda, ECS, RDS, Cloud Run, and all major services.</CardDescription></CardHeader></Card>
            <Card><CardHeader><Users className="h-10 w-10 text-primary mb-2" /><CardTitle>Team Collaboration</CardTitle><CardDescription>Share projects with your team. Real-time editing and version control.</CardDescription></CardHeader></Card>
            <Card><CardHeader><Shield className="h-10 w-10 text-primary mb-2" /><CardTitle>Best Practices Built-In</CardTitle><CardDescription>Security groups, IAM roles, and networking configured automatically.</CardDescription></CardHeader></Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Start free, upgrade as you grow</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card><CardHeader><CardTitle>Free</CardTitle><CardDescription className="mt-4"><span className="text-4xl font-bold text-foreground">$0</span><span className="text-muted-foreground">/month</span></CardDescription></CardHeader><CardContent><ul className="space-y-3"><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>3 projects</span></li><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>10 diagrams</span></li><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>Terraform export</span></li><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>Cost estimation</span></li></ul><Link href="/register"><Button className="w-full mt-6" variant="outline">Get Started</Button></Link></CardContent></Card>
            <Card className="border-primary shadow-lg scale-105"><CardHeader><div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit mb-2">POPULAR</div><CardTitle>Pro</CardTitle><CardDescription className="mt-4"><span className="text-4xl font-bold text-foreground">$29</span><span className="text-muted-foreground">/month</span></CardDescription></CardHeader><CardContent><ul className="space-y-3"><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>Unlimited projects</span></li><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>Unlimited diagrams</span></li><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>All export formats</span></li><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>Priority support</span></li><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>Custom templates</span></li></ul><Link href="/register"><Button className="w-full mt-6">Start Pro Trial</Button></Link></CardContent></Card>
            <Card><CardHeader><CardTitle>Team</CardTitle><CardDescription className="mt-4"><span className="text-4xl font-bold text-foreground">$99</span><span className="text-muted-foreground">/month</span></CardDescription></CardHeader><CardContent><ul className="space-y-3"><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>Everything in Pro</span></li><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>Up to 10 team members</span></li><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>Real-time collaboration</span></li><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>Version history</span></li><li className="flex items-start gap-2"><Check className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>SSO integration</span></li></ul><Link href="/register"><Button className="w-full mt-6" variant="outline">Contact Sales</Button></Link></CardContent></Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your Infrastructure?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">Join thousands of developers and DevOps teams using JobStack</p>
          <Link href="/register"><Button size="lg" variant="secondary">Start Free Today<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2"><Boxes className="h-5 w-5 text-primary" /><span className="font-semibold">JobStack</span></div>
            <p className="text-sm text-muted-foreground">© 2026 KobeCloud Jakub Pospieszny. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="https://github.com/KobeeCloud/JobStack" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
