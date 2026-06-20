import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Boxes, Code, DollarSign, Users, ArrowRight, Check, Sparkles,
  LayoutDashboard, LogOut, Building2, Cloud, Server, Globe, Container, Lock, AlertTriangle,
  Shield, TestTube2, FileCode2, Github, GitBranch
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/logo'
import { FeatureTabs } from '@/components/landing/feature-tabs'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { getTranslations } from 'next-intl/server'
// SR-8: Lazy-load the animated demo via a client wrapper (ssr:false requires 'use client')
import { LazyAnimatedDiagramDemo as AnimatedDiagramDemo } from '@/components/landing/lazy-animated-diagram'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations('footer')

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
            <Logo size={28} />
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
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

      {/* SR-2: Semantic <main> landmark for screen readers */}
      <main>
        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="absolute top-0 right-[-10%] w-[50%] aspect-square bg-primary/10 rounded-full blur-[100px] opacity-70" />

          <div className="container relative z-10 mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-background/50 backdrop-blur-md mb-8 shadow-sm">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium">AI-Powered Infrastructure Design</span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                  Design Infrastructure<br />
                  <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Like Drawing a Diagram</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  AI-assisted visual editor for cloud architecture. Generate production-ready Terraform code, validate connections, and estimate costs in real-time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/register">
                    <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                      Start Building Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button size="lg" variant="outline" className="h-12 px-8 text-base backdrop-blur bg-background/50 hover:bg-muted/50 transition-all">
                      View Demo
                    </Button>
                  </Link>
                </div>

                {/* Tech badges */}
                <div className="flex flex-wrap gap-4 mt-12 justify-center lg:justify-start">
                  <span className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-background/80 backdrop-blur border shadow-sm hover:scale-105 transition-transform cursor-default">
                    <Cloud className="h-4 w-4 text-[#FF9900]" /> AWS
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-background/80 backdrop-blur border shadow-sm hover:scale-105 transition-transform cursor-default">
                    <Cloud className="h-4 w-4 text-[#4285F4]" /> GCP
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-background/80 backdrop-blur border shadow-sm hover:scale-105 transition-transform cursor-default">
                    <Cloud className="h-4 w-4 text-[#0078D4]" /> Azure
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-background/80 backdrop-blur border shadow-sm hover:scale-105 transition-transform cursor-default">
                    <Container className="h-4 w-4 text-purple-600" /> Kubernetes
                  </span>
                </div>
              </div>

              {/* Animated Demo */}
              <div className="hidden lg:block relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-3xl blur-2xl opacity-50" />
                <div className="relative rounded-2xl overflow-hidden border bg-background shadow-2xl">
                  <AnimatedDiagramDemo />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="py-10 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">158+</p>
                <p className="text-sm text-muted-foreground mt-1">Cloud Components</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">3</p>
                <p className="text-sm text-muted-foreground mt-1">Cloud Providers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">&lt; 60s</p>
                <p className="text-sm text-muted-foreground mt-1">To Export Terraform</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground mt-1">Free to Start</p>
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

        {/* Feature tabs — what JobStack generates */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/50 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">Built for real cloud engineers</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">From diagram to production</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">JobStack turns visual cloud architecture into the code and pipelines your team actually ships.</p>
            </div>
            <FeatureTabs />
          </div>
        </section>

        <section className="py-24 relative overflow-hidden">
          <div className="absolute -left-40 top-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl opacity-50" />
          <div className="container relative z-10 mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Everything You Need to Plan Infrastructure</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">From visual design to production deployment</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Boxes className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">Visual Diagram Builder</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">Drag and drop 158+ components to design your infrastructure. Connect services with intelligent validation.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Code className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">Terraform Generation</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">Export production-ready Terraform code with detailed error messages and validation warnings.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <DollarSign className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">Real-Time Cost Estimates</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">See monthly costs as you build. Make informed decisions before deployment.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Shield className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">Compliance Scanner</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">Built-in compliance checks for SOC2, HIPAA, GDPR, PCI-DSS, and AWS Well-Architected best practices.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <TestTube2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">Infrastructure Testing</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">Validate connectivity, security groups, and high availability before deploying to production.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">Team Collaboration</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">Organizations, roles, and real-time collaborative editing with cloud sync.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Lock className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">Security Built-In</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">Security groups, firewalls, WAF, and DDoS protection displayed as visual indicators on components.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <FileCode2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">Multi-Format Export</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">Export diagrams as PNG, SVG, JSON. Generate Terraform, CloudFormation, ARM templates, and Pulumi TypeScript — all from your visual diagram.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Container className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">DevOps & CI/CD Tools</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">Docker, Kubernetes, GitHub Actions, Jenkins, ArgoCD and more DevOps tools ready to use.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* GitHub CTA */}
        <section className="py-24 relative overflow-hidden bg-zinc-950 text-zinc-100 dark:bg-zinc-900/80 border-y border-zinc-800 dark:border-zinc-700">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />

          <div className="container relative mx-auto px-4 z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800/60 dark:bg-zinc-800 mb-8 backdrop-blur shadow-sm">
                <Github className="h-4 w-4" />
                <span className="text-sm font-medium text-zinc-300">Git-native workflows</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                Infrastructure reviews<br />in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-400">pull request</span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                JobStack diagrams generate CI/CD pipelines that post Terraform Plan output directly as PR comments.
                Review infra changes exactly the same way you review code.
              </p>
              <div className="grid sm:grid-cols-3 gap-6 text-left mb-12">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur dark:bg-zinc-800/60 p-6 shadow-2xl transition-transform hover:-translate-y-1">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
                    <GitBranch className="h-5 w-5 text-violet-400" />
                  </div>
                  <p className="font-semibold text-lg mb-2 text-zinc-100">Push to branch</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">Commit your diagram — the pipeline triggers automatically</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur dark:bg-zinc-800/60 p-6 shadow-2xl transition-transform hover:-translate-y-1">
                  <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center mb-4">
                    <Github className="h-5 w-5 text-sky-400" />
                  </div>
                  <p className="font-semibold text-lg mb-2 text-zinc-100">Plan on PR</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">Terraform Plan posted as a comment with inline diff highlighting</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur dark:bg-zinc-800/60 p-6 shadow-2xl transition-transform hover:-translate-y-1">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Check className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="font-semibold text-lg mb-2 text-zinc-100">Apply on merge</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">Protected environments firmly gate production applies</p>
                </div>
              </div>
              <Link href="/register">
                <Button size="lg" className="bg-white text-black hover:bg-zinc-200 h-12 px-8 text-base shadow-xl">
                  <Github className="mr-2 h-5 w-5" /> Generate my pipeline
                </Button>
              </Link>
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
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> AI Assistant</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Compliance scanner</li>
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
                  <Button className="w-full" variant="outline" asChild>
                    <a href="mailto:kuba.pospieszny@gmail.com?subject=JobStack%20Enterprise%20Inquiry">Contact Sales</a>
                  </Button>
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
      </main>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2"><Logo size={20} /></div>
            <p className="text-sm text-muted-foreground">{t('copyright', { year: new Date().getFullYear() })}</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">{t('privacy')}</Link>
              <Link href="/terms" className="hover:text-foreground">{t('terms')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
