import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Boxes, Code, DollarSign, Users, ArrowRight, Check, Sparkles, LayoutDashboard, LogOut, Building2, Cloud, Server, Globe, Container, Lock, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AnimatedDiagramDemo } from '@/components/animated-diagram-demo'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Beta Testing Banner */}
      <div className="bg-amber-500 text-amber-950 py-2 px-4">
        <div className="container mx-auto flex items-center justify-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-4 w-4" />
          <span>
            🚧 This application is currently in <strong>beta testing</strong>. Please do not create real accounts or enter sensitive data.
          </span>
        </div>
      </div>

      <nav className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">JobStack</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/organizations">
                  <Button variant="ghost">
                    <Building2 className="mr-2 h-4 w-4" />
                    Organizations
                  </Button>
                </Link>
                <form action="/auth/signout" method="post">
                  <Button variant="outline" type="submit">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login"><Button variant="ghost">Sign In</Button></Link>
                <Link href="/register"><Button>Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/50 mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">Visual Infrastructure Planning</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Design Infrastructure<br />
                <span className="text-primary">Like Drawing a Diagram</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                Drag-and-drop visual editor for cloud architecture. Generate production-ready Terraform code and estimate costs in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register"><Button size="lg">Start Building Free<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                <Link href="/login"><Button size="lg" variant="outline">View Demo</Button></Link>
              </div>

              {/* Tech badges */}
              <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
                <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20">
                  <Cloud className="h-3 w-3" /> AWS
                </span>
                <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  <Cloud className="h-3 w-3" /> GCP
                </span>
                <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
                  <Cloud className="h-3 w-3" /> Azure
                </span>
                <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  <Container className="h-3 w-3" /> Kubernetes
                </span>
              </div>
            </div>

            {/* Animated Demo */}
            <div className="hidden lg:block">
              <AnimatedDiagramDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Providers */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground mb-6">Supporting all major cloud providers</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Cloud className="h-6 w-6 text-[#FF9900]" />
              <span className="font-medium">AWS</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Cloud className="h-6 w-6 text-[#4285F4]" />
              <span className="font-medium">Google Cloud</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Cloud className="h-6 w-6 text-[#0078D4]" />
              <span className="font-medium">Azure</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="h-6 w-6 text-[#F38020]" />
              <span className="font-medium">Cloudflare</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Server className="h-6 w-6" />
              <span className="font-medium">Vercel</span>
            </div>
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
            <Card className="group hover:border-primary/50 transition-colors">
              <CardHeader>
                <Boxes className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Visual Diagram Builder</CardTitle>
                <CardDescription>Drag and drop 70+ components to design your infrastructure. Connect services with simple clicks.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="group hover:border-primary/50 transition-colors">
              <CardHeader>
                <Code className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Terraform Code Generation</CardTitle>
                <CardDescription>Export production-ready Terraform code instantly. Supports AWS, GCP, Azure, and more.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="group hover:border-primary/50 transition-colors">
              <CardHeader>
                <DollarSign className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Real-Time Cost Estimation</CardTitle>
                <CardDescription>See monthly costs as you build. Make informed decisions before deployment.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="group hover:border-primary/50 transition-colors">
              <CardHeader>
                <Container className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>DevOps & CI/CD Tools</CardTitle>
                <CardDescription>Docker, Kubernetes, GitHub Actions, Jenkins, ArgoCD and more DevOps tools.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="group hover:border-primary/50 transition-colors">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>Organizations, roles, and real-time collaborative editing.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="group hover:border-primary/50 transition-colors">
              <CardHeader>
                <Lock className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Security Built-In</CardTitle>
                <CardDescription>Security groups, IAM roles, Vault, and networking configured automatically.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Start free, upgrade when you need more</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited personal projects</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Terraform code generation</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Cost estimation</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> All cloud providers</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Export to PNG, SVG, JSON</li>
                </ul>
                <Link href="/register">
                  <Button className="w-full" variant="outline">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                Popular
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription className="mt-4">
                  <span className="text-4xl font-bold text-foreground">$19</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Everything in Free</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Organizations (up to 5 members)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Real-time collaboration</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Version history</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Priority support</li>
                </ul>
                <Button className="w-full" disabled>Coming Soon</Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription className="mt-4">
                  <span className="text-4xl font-bold text-foreground">Custom</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Everything in Pro</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited members</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> SSO / SAML</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Audit logs</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Dedicated support</li>
                </ul>
                <Button className="w-full" variant="outline" disabled>Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your Infrastructure?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">Join developers and DevOps teams using JobStack</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"><Button size="lg" variant="secondary">Start Free Today<ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
