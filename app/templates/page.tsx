'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Boxes, ArrowLeft, Layers, Search, Server,
  Database, Shield, Globe, Cpu, HardDrive, Network,
  Box, Copy
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Template {
  id: string
  name: string
  description: string | null
  category: string
  cloud_provider: string
  nodes: any[]
  edges: any[]
  is_public: boolean
  created_at: string
}

// Default templates that are always available
const defaultTemplates: Omit<Template, 'id' | 'created_at'>[] = [
  {
    name: 'Basic Web Application',
    description: 'Simple 3-tier web application with load balancer, web servers, and database',
    category: 'web',
    cloud_provider: 'aws',
    nodes: [
      { id: '1', type: 'cloud', position: { x: 250, y: 50 }, data: { label: 'Load Balancer', category: 'networking' } },
      { id: '2', type: 'cloud', position: { x: 100, y: 200 }, data: { label: 'Web Server 1', category: 'backend' } },
      { id: '3', type: 'cloud', position: { x: 400, y: 200 }, data: { label: 'Web Server 2', category: 'backend' } },
      { id: '4', type: 'cloud', position: { x: 250, y: 350 }, data: { label: 'Database', category: 'database' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e2-4', source: '2', target: '4' },
      { id: 'e3-4', source: '3', target: '4' },
    ],
    is_public: true,
  },
  {
    name: 'Microservices Architecture',
    description: 'Containerized microservices with API Gateway, multiple services, and message queue',
    category: 'microservices',
    cloud_provider: 'aws',
    nodes: [
      { id: '1', type: 'cloud', position: { x: 300, y: 50 }, data: { label: 'API Gateway', category: 'networking' } },
      { id: '2', type: 'cloud', position: { x: 100, y: 180 }, data: { label: 'User Service', category: 'backend' } },
      { id: '3', type: 'cloud', position: { x: 300, y: 180 }, data: { label: 'Order Service', category: 'backend' } },
      { id: '4', type: 'cloud', position: { x: 500, y: 180 }, data: { label: 'Payment Service', category: 'backend' } },
      { id: '5', type: 'cloud', position: { x: 300, y: 320 }, data: { label: 'Message Queue', category: 'service' } },
      { id: '6', type: 'cloud', position: { x: 100, y: 450 }, data: { label: 'Users DB', category: 'database' } },
      { id: '7', type: 'cloud', position: { x: 300, y: 450 }, data: { label: 'Orders DB', category: 'database' } },
      { id: '8', type: 'cloud', position: { x: 500, y: 450 }, data: { label: 'Payments DB', category: 'database' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e1-4', source: '1', target: '4' },
      { id: 'e2-5', source: '2', target: '5' },
      { id: 'e3-5', source: '3', target: '5' },
      { id: 'e4-5', source: '4', target: '5' },
      { id: 'e2-6', source: '2', target: '6' },
      { id: 'e3-7', source: '3', target: '7' },
      { id: 'e4-8', source: '4', target: '8' },
    ],
    is_public: true,
  },
  {
    name: 'Serverless Backend',
    description: 'Event-driven serverless architecture with Lambda, API Gateway, and DynamoDB',
    category: 'serverless',
    cloud_provider: 'aws',
    nodes: [
      { id: '1', type: 'cloud', position: { x: 300, y: 50 }, data: { label: 'API Gateway', category: 'networking' } },
      { id: '2', type: 'cloud', position: { x: 150, y: 180 }, data: { label: 'Lambda Auth', category: 'backend' } },
      { id: '3', type: 'cloud', position: { x: 450, y: 180 }, data: { label: 'Lambda API', category: 'backend' } },
      { id: '4', type: 'cloud', position: { x: 300, y: 320 }, data: { label: 'DynamoDB', category: 'database' } },
      { id: '5', type: 'cloud', position: { x: 500, y: 320 }, data: { label: 'S3 Storage', category: 'storage' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e1-3', source: '1', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e3-5', source: '3', target: '5' },
    ],
    is_public: true,
  },
  {
    name: 'Static Website with CDN',
    description: 'Static website hosting with CloudFront CDN and S3 bucket',
    category: 'web',
    cloud_provider: 'aws',
    nodes: [
      { id: '1', type: 'cloud', position: { x: 300, y: 50 }, data: { label: 'Route 53', category: 'networking' } },
      { id: '2', type: 'cloud', position: { x: 300, y: 180 }, data: { label: 'CloudFront', category: 'networking' } },
      { id: '3', type: 'cloud', position: { x: 300, y: 320 }, data: { label: 'S3 Bucket', category: 'storage' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
    ],
    is_public: true,
  },
  {
    name: 'Data Pipeline',
    description: 'ETL data pipeline with Kinesis, Lambda, and data warehouse',
    category: 'analytics',
    cloud_provider: 'aws',
    nodes: [
      { id: '1', type: 'cloud', position: { x: 100, y: 150 }, data: { label: 'Data Source', category: 'service' } },
      { id: '2', type: 'cloud', position: { x: 300, y: 150 }, data: { label: 'Kinesis Stream', category: 'service' } },
      { id: '3', type: 'cloud', position: { x: 500, y: 150 }, data: { label: 'Lambda Process', category: 'backend' } },
      { id: '4', type: 'cloud', position: { x: 300, y: 300 }, data: { label: 'S3 Data Lake', category: 'storage' } },
      { id: '5', type: 'cloud', position: { x: 500, y: 300 }, data: { label: 'Redshift', category: 'database' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' },
    ],
    is_public: true,
  },
  {
    name: 'Kubernetes Cluster',
    description: 'EKS cluster with node groups, ingress controller, and monitoring',
    category: 'containers',
    cloud_provider: 'aws',
    nodes: [
      { id: '1', type: 'cloud', position: { x: 300, y: 50 }, data: { label: 'ALB Ingress', category: 'networking' } },
      { id: '2', type: 'cloud', position: { x: 300, y: 180 }, data: { label: 'EKS Cluster', category: 'devops' } },
      { id: '3', type: 'cloud', position: { x: 100, y: 320 }, data: { label: 'Node Group 1', category: 'backend' } },
      { id: '4', type: 'cloud', position: { x: 300, y: 320 }, data: { label: 'Node Group 2', category: 'backend' } },
      { id: '5', type: 'cloud', position: { x: 500, y: 320 }, data: { label: 'Node Group 3', category: 'backend' } },
      { id: '6', type: 'cloud', position: { x: 300, y: 450 }, data: { label: 'RDS Database', category: 'database' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e2-4', source: '2', target: '4' },
      { id: 'e2-5', source: '2', target: '5' },
      { id: 'e3-6', source: '3', target: '6' },
      { id: 'e4-6', source: '4', target: '6' },
    ],
    is_public: true,
  },
]

const categoryIcons: Record<string, any> = {
  web: Globe,
  microservices: Server,
  serverless: Cpu,
  analytics: Database,
  containers: Box,
  security: Shield,
  networking: Network,
  storage: HardDrive,
}

const providerColors: Record<string, string> = {
  aws: 'bg-orange-500/10 text-orange-600 border-orange-200',
  gcp: 'bg-blue-500/10 text-blue-600 border-blue-200',
  azure: 'bg-sky-500/10 text-sky-600 border-sky-200',
  generic: 'bg-gray-500/10 text-gray-600 border-gray-200',
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    const supabase = createClient()

    // Try to load templates from database
    const { data: dbTemplates } = await supabase
      .from('templates')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    // Combine with default templates
    const allTemplates = [
      ...(dbTemplates || []),
      ...defaultTemplates.map((t, i) => ({
        ...t,
        id: `default-${i}`,
        created_at: new Date().toISOString(),
      })),
    ]

    setTemplates(allTemplates as Template[])
    setLoading(false)
  }

  const handleUseTemplate = async (template: Template) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to use templates',
        variant: 'destructive',
      })
      return
    }

    try {
      // Create new project from template
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: `${template.name} (Copy)`,
          description: template.description,
          cloud_provider: template.cloud_provider,
          status: 'draft',
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Create diagram with template nodes/edges
      const { error: diagramError } = await supabase
        .from('diagrams')
        .insert({
          project_id: project.id,
          name: 'Main Diagram',
          nodes: template.nodes,
          edges: template.edges,
        })

      if (diagramError) throw diagramError

      toast({
        title: 'Project created!',
        description: 'Template has been applied to your new project',
      })

      // Redirect to the new project
      window.location.href = `/projects/${project.id}`
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to create project from template',
        variant: 'destructive',
      })
    }
  }

  const categories = [...new Set(templates.map(t => t.category))]

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || t.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">JobStack</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Layers className="h-8 w-8 text-primary" />
            Templates
          </h1>
          <p className="text-muted-foreground">
            Start with pre-built architecture patterns and customize them for your needs
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(category => {
              const Icon = categoryIcons[category] || Layers
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  <Icon className="mr-1 h-4 w-4" />
                  {category}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="h-24 bg-muted rounded mb-4" />
                  <div className="h-8 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'No templates available in this category'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const CategoryIcon = categoryIcons[template.category] || Layers
              return (
                <Card key={template.id} className="group hover:shadow-lg transition-all hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <CategoryIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs uppercase ${providerColors[template.cloud_provider] || providerColors.generic}`}
                      >
                        {template.cloud_provider}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Mini preview */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-4 h-32 flex items-center justify-center relative overflow-hidden">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {template.nodes.slice(0, 5).map((node, i) => (
                          <div
                            key={i}
                            className="bg-background border rounded px-2 py-1 text-xs font-medium shadow-sm"
                          >
                            {node.data?.label || 'Node'}
                          </div>
                        ))}
                        {template.nodes.length > 5 && (
                          <div className="bg-primary/10 text-primary rounded px-2 py-1 text-xs font-medium">
                            +{template.nodes.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{template.nodes.length} nodes</span>
                        <span>•</span>
                        <span className="capitalize">{template.category}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                        className="group-hover:bg-primary group-hover:text-primary-foreground"
                      >
                        <Copy className="mr-1 h-4 w-4" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 JobStack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
