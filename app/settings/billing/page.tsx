import Link from 'next/link'
import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Lock, Sparkles, Building2, Zap, ArrowLeft } from 'lucide-react'
import { LogoIcon } from '@/components/logo'

export const metadata: Metadata = {
  title: 'Billing — JobStack',
  description: 'Manage your subscription plan.',
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for individuals and small projects',
    features: [
      '3 projects',
      '1 user',
      'Community support',
      'Basic diagram export',
      '30-day version history',
    ],
    cta: 'Current plan',
    ctaDisabled: true,
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For teams that need collaboration and more power',
    features: [
      'Unlimited projects',
      'Organizations (up to 5 members)',
      'Real-time collaboration',
      'Version history (unlimited)',
      'Priority support',
      'Terraform export',
      'AI diagram analysis',
    ],
    cta: 'Coming Soon',
    ctaDisabled: true,
    highlighted: true,
    badge: 'Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with advanced needs',
    features: [
      'Everything in Pro',
      'Unlimited members',
      'SSO / SAML',
      'Audit log export',
      'SLA 99.9%',
      'Dedicated support',
      'Custom integrations',
    ],
    cta: 'Contact us',
    ctaDisabled: false,
    ctaHref: 'mailto:kuba.pospieszny@gmail.com?subject=JobStack%20Enterprise',
    highlighted: false,
  },
]

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoIcon size={24} />
            <span className="font-bold text-xl">JobStack</span>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Button>
          </Link>
        </div>
      </nav>

      <main className="container py-12 max-w-5xl mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Free during launch — no credit card needed
          </div>
          <h1 className="text-4xl font-bold mb-3">Simple, transparent pricing</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            JobStack is <strong>completely free</strong> for the first 6 months as we grow and
            improve. Paid plans will unlock soon — you&apos;ll get plenty of notice.
          </p>
        </div>

        {/* Current plan banner */}
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-4 mb-10">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              You&apos;re on the Free plan — enjoy all features!
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              During our launch period every user gets access to all features at no cost. Billing
              will activate on&nbsp;<strong>September 2026</strong>.
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map(plan => (
            <Card
              key={plan.id}
              className={
                plan.highlighted ? 'border-primary ring-2 ring-primary/30 relative' : 'relative'
              }
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-3">{plan.badge}</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  {plan.id === 'free' && <Zap className="h-5 w-5 text-muted-foreground" />}
                  {plan.id === 'pro' && <Sparkles className="h-5 w-5 text-primary" />}
                  {plan.id === 'enterprise' && <Building2 className="h-5 w-5 text-purple-500" />}
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <div className="mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.ctaHref ? (
                  <a href={plan.ctaHref}>
                    <Button className="w-full" variant="outline">
                      {plan.cta}
                    </Button>
                  </a>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    disabled={plan.ctaDisabled}
                  >
                    {plan.ctaDisabled && plan.id !== 'free' && (
                      <Lock className="h-3.5 w-3.5 mr-2" />
                    )}
                    {plan.cta}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium">When will paid plans be available?</p>
              <p className="text-muted-foreground mt-1">
                We plan to activate billing in September 2026. You&apos;ll receive an email
                notification at least 30 days in advance.
              </p>
            </div>
            <div>
              <p className="font-medium">Will there be a grandfathered rate for early adopters?</p>
              <p className="text-muted-foreground mt-1">
                Yes — users who sign up during the free period will receive a discounted rate when
                paid plans launch.
              </p>
            </div>
            <div>
              <p className="font-medium">What payment methods will you accept?</p>
              <p className="text-muted-foreground mt-1">
                We plan to support credit/debit cards via Stripe and PayPal.
              </p>
            </div>
            <div>
              <p className="font-medium">Is my data safe if I switch plans?</p>
              <p className="text-muted-foreground mt-1">
                Absolutely. Downgrading limits new project creation but never deletes existing data.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
