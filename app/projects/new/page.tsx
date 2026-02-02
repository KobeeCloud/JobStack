'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Boxes, ArrowLeft, ArrowRight, Loader2, Server,
  Cloud, Globe, Check, ChevronRight
} from 'lucide-react'
import { createProjectSchema, type CreateProjectInput } from '@/lib/validation/schemas'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'
import { useToast } from '@/hooks/use-toast'

const ProviderLogo = ({ provider }: { provider: string }) => {
  const colors: Record<string, string> = {
    azure: 'text-blue-500',
    aws: 'text-orange-500',
    gcp: 'text-red-500',
    vercel: 'text-foreground',
    netlify: 'text-teal-500',
    cloudflare: 'text-orange-400'
  }

  return (
    <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${colors[provider] || ''}`}>
      <Cloud className="w-6 h-6" />
    </div>
  )
}

type ProjectType = 'iaas' | 'paas' | 'saas' | 'hosting'
type CloudProvider = 'azure' | 'aws' | 'gcp' | 'vercel' | 'netlify' | 'cloudflare'

interface ProjectTypeConfig {
  id: ProjectType
  name: string
  description: string
  icon: typeof Server
  features: string[]
}

interface ProviderConfig {
  id: CloudProvider
  name: string
  description: string
  regions: string[]
  forTypes: ProjectType[]
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

const providers: ProviderConfig[] = [
  {
    id: 'azure',
    name: 'Microsoft Azure',
    description: 'Enterprise cloud with global presence',
    regions: ['East US', 'West Europe', 'Southeast Asia', 'Australia East'],
    forTypes: ['iaas', 'paas', 'saas']
  },
  {
    id: 'aws',
    name: 'Amazon Web Services',
    description: 'Most comprehensive cloud platform',
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1', 'ap-northeast-1'],
    forTypes: ['iaas', 'paas', 'saas']
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    description: 'AI-first cloud with strong analytics',
    regions: ['us-central1', 'europe-west1', 'asia-east1', 'australia-southeast1'],
    forTypes: ['iaas', 'paas', 'saas']
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Deploy Next.js with zero config',
    regions: ['Global Edge Network'],
    forTypes: ['hosting']
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'JAMstack deployment platform',
    regions: ['Global CDN'],
    forTypes: ['hosting']
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Pages',
    description: 'Ultra-fast edge hosting',
    regions: ['200+ Edge Locations'],
    forTypes: ['hosting']
  }
]

function NewProjectPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const templateId = searchParams.get('template')

  const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  })

  const availableProviders = selectedType
    ? providers.filter(p => p.forTypes.includes(selectedType))
    : []

  const selectedTypeConfig = projectTypes.find(t => t.id === selectedType)
  const selectedProviderConfig = providers.find(p => p.id === selectedProvider)

  const onSubmit = async (data: CreateProjectInput) => {
    if (!selectedType || !selectedProvider) return

    setIsSubmitting(true)
    try {
      const response = await fetchWithTimeout('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          projectType: selectedType,
          cloudProvider: selectedProvider,
          templateId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create project')
      }

      const project = await response.json()
      toast({
        title: 'Project created!',
        description: data.name + ' is ready for design'
      })

      router.push('/projects/' + project.id)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create project'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedToStep2 = selectedType !== null
  const canProceedToStep3 = selectedProvider !== null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/projects" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              {[
                { num: 1, label: 'Type' },
                { num: 2, label: 'Provider' },
                { num: 3, label: 'Details' }
              ].map((s, idx) => (
                <div key={s.num} className="flex items-center">
                  <div className={
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold ' +
                    (step >= s.num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground')
                  }>
                    {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={'ml-2 ' + (step >= s.num ? 'text-foreground' : 'text-muted-foreground')}>
                    {s.label}
                  </span>
                  {idx < 2 && (
                    <ChevronRight className="w-5 h-5 mx-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold">What are you building?</h1>
                <p className="text-muted-foreground mt-2">
                  Choose the type of cloud infrastructure you need
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = selectedType === type.id

                  return (
                    <Card
                      key={type.id}
                      className={'cursor-pointer transition-all hover:border-primary ' +
                        (isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary' : '')
                      }
                      onClick={() => setSelectedType(type.id)}
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
                        <p className="text-muted-foreground text-sm mb-4">
                          {type.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {type.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2}
                  className="min-w-[140px]"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold">Choose your cloud</h1>
                <p className="text-muted-foreground mt-2">
                  Select the cloud provider for your {selectedTypeConfig?.name}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableProviders.map((provider) => {
                  const isSelected = selectedProvider === provider.id

                  return (
                    <Card
                      key={provider.id}
                      className={'cursor-pointer transition-all hover:border-primary ' +
                        (isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary' : '')
                      }
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <ProviderLogo provider={provider.id} />
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-3">{provider.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-3">
                          {provider.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Regions:</span>{' '}
                          {provider.regions[0]}{provider.regions.length > 1 ? ' +' + (provider.regions.length - 1) + ' more' : ''}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!canProceedToStep3}
                  className="min-w-[140px]"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold">Name your project</h1>
                <p className="text-muted-foreground mt-2">
                  Give your {selectedProviderConfig?.name} project a name
                </p>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <ProviderLogo provider={selectedProvider!} />
                    <div>
                      <p className="font-medium">{selectedProviderConfig?.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedTypeConfig?.name}</p>
                    </div>
                    <div className="ml-auto flex flex-wrap gap-1.5 max-w-[300px] justify-end">
                      {selectedTypeConfig?.features.slice(0, 4).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="my-cloud-infrastructure"
                      {...register('name')}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Production infrastructure for our web application..."
                      {...register('description')}
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[160px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Project
                        <Boxes className="w-4 h-4 ml-2" />
                      </>
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
