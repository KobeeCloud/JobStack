'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, ArrowRight, Loader2, Server,
  Cloud, Globe, Check, ChevronRight, Boxes, Building2
} from 'lucide-react'
import { LogoIcon } from '@/components/logo'
import { createProjectSchema, type CreateProjectInput } from '@/lib/validation/schemas'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'
import { toast } from 'sonner'

type EnvironmentType = 'development' | 'staging' | 'production'

interface OrganizationOption {
  id: string
  name: string
  slug: string
  plan: string
  role: string
}

type ProjectType = 'iaas' | 'paas' | 'saas' | 'hosting'

interface ProjectTypeConfig {
  id: ProjectType
  name: string
  description: string
  icon: typeof Server
  features: string[]
}

const projectTypes: ProjectTypeConfig[] = [
  {
    id: 'iaas',
    name: 'Infrastructure (IaaS)',
    description: 'Virtual machines, networks, storage, containers',
    icon: Server,
    features: ['VMs', 'VNets', 'Storage', 'Load Balancers', 'Kubernetes', 'Terraform Export']
  },
  {
    id: 'paas',
    name: 'Platform (PaaS)',
    description: 'App Services, Functions, Databases, Queues',
    icon: Cloud,
    features: ['App Services', 'Functions', 'Managed DBs', 'Redis', 'Message Queues', 'Terraform Export']
  },
  {
    id: 'saas',
    name: 'Software (SaaS)',
    description: 'AI/ML, Cognitive Services, Analytics',
    icon: Boxes,
    features: ['AI Services', 'Analytics', 'Monitoring', 'Identity', 'IoT', 'Terraform Export']
  },
  {
    id: 'hosting',
    name: 'Web Hosting',
    description: 'Static sites, JAMstack, Edge functions',
    icon: Globe,
    features: ['Static Sites', 'Edge Functions', 'CDN', 'SSL', 'Instant Deploys', 'Git Integration']
  }
]

function NewProjectPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState(1)
  const [selectedTypes, setSelectedTypes] = useState<ProjectType[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentType>('development')
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([])
  // Start as true so spinner shows immediately — avoids "no orgs" flash
  const [orgsLoading, setOrgsLoading] = useState(true)
  const [orgsError, setOrgsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const templateId = searchParams.get('template')

  // Fetch user's organizations on mount
  useEffect(() => {
    let cancelled = false
    setOrgsLoading(true)
    setOrgsError(false)
    fetch('/api/organizations')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setOrganizations(data.organizations ?? [])
      })
      .catch(() => {
        if (!cancelled) setOrgsError(true)
      })
      .finally(() => {
        if (!cancelled) setOrgsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', description: '' }
  })

  const toggleType = (type: ProjectType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const onSubmit = async (data: CreateProjectInput) => {
    if (selectedTypes.length === 0) return

    setIsSubmitting(true)
    try {
      const response = await fetchWithTimeout('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          project_types: selectedTypes,
          environment: selectedEnvironment,
          organization_id: selectedOrgId ?? undefined,
          templateId: templateId ?? undefined,
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create project')
      }

      const project = await response.json()
      toast.success('Project created!', { description: data.name + ' is ready for design' })
      router.push('/projects/' + project.id)
    } catch (error) {
      toast.error('Error', { description: error instanceof Error ? error.message : 'Failed to create project' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedToStep2 = selectedTypes.length > 0
  const STEPS = [{ num: 1, label: 'Type' }, { num: 2, label: 'Details' }]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link href="/projects" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <div className="h-4 border-l" />
          <div className="flex items-center gap-2">
            <LogoIcon size={22} />
            <span className="font-semibold text-sm">New Project</span>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Step indicator */}
          <div className="flex items-center justify-center mb-10">
            {STEPS.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className={
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold ' +
                  (step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')
                }>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <span className={'ml-2 text-sm font-medium ' + (step >= s.num ? 'text-foreground' : 'text-muted-foreground')}>
                  {s.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-5 h-5 mx-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          {/* ── Step 1: project type ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold">What are you building?</h1>
                <p className="text-muted-foreground mt-2">
                  Choose the type of cloud infrastructure you need. You can mix components from any cloud provider inside the diagram.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = selectedTypes.includes(type.id)
                  return (
                    <Card
                      key={type.id}
                      className={'cursor-pointer transition-all hover:border-primary ' +
                        (isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary' : '')
                      }
                      onClick={() => toggleType(type.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-xl mt-3">{type.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-4">{type.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {type.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">{feature}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!canProceedToStep2} className="min-w-[140px]">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: project details ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold">Name your project</h1>
                <p className="text-muted-foreground mt-2">
                  Give your project a name and configure basic settings.
                </p>
              </div>

              {/* Selected types summary */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTypes.map(t => {
                        const config = projectTypes.find(pt => pt.id === t)
                        return config ? (
                          <Badge key={t} variant="outline" className="capitalize">
                            {config.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground ml-auto">
                      Use components from any cloud provider in the diagram editor
                    </p>
                  </div>
                </CardContent>
              </Card>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Environment */}
                <div className="space-y-2">
                  <Label>Environment</Label>
                  <div className="flex gap-2">
                    {(['development', 'staging', 'production'] as EnvironmentType[]).map((env) => (
                      <button
                        key={env}
                        type="button"
                        onClick={() => setSelectedEnvironment(env)}
                        className={
                          'flex-1 py-2 px-3 rounded-md border text-sm font-medium capitalize transition-all ' +
                          (selectedEnvironment === env
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/50')
                        }
                      >
                        {env}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Organization <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  {orgsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading organizations...
                    </div>
                  ) : orgsError ? (
                    <p className="text-sm text-destructive">
                      Could not load organizations — project will be personal.
                    </p>
                  ) : organizations.length > 0 ? (
                    <Select
                      value={selectedOrgId ?? 'personal'}
                      onValueChange={(val) => setSelectedOrgId(val === 'personal' ? null : val)}
                    >
                      <SelectTrigger className="w-full md:w-80">
                        <SelectValue placeholder="Personal project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal project</SelectItem>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                            <span className="ml-2 text-xs text-muted-foreground capitalize">({org.role})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No organizations yet —{' '}
                      <Link href="/organizations/new" className="text-primary hover:underline">create one</Link>{' '}
                      or this will be a personal project.
                    </p>
                  )}
                </div>

                {/* Name + description */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="my-cloud-infrastructure"
                      {...register('name')}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Textarea
                      id="description"
                      placeholder="Production infrastructure for our web application..."
                      {...register('description')}
                      rows={3}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                    ) : (
                      <>Create Project <Boxes className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <NewProjectPageContent />
    </Suspense>
  )
}
