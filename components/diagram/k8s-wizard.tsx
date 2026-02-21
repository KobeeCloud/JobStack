'use client'

import { useState } from 'react'
import { Node, Edge } from '@xyflow/react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronRight, ChevronLeft, Server, Network, Container, Check } from 'lucide-react'

interface K8sWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (nodes: Node[], edges: Edge[]) => void
}

type KubeProvider = 'aks' | 'eks' | 'gke'

interface NodePool {
  name: string
  vmSize: string
  minCount: number
  maxCount: number
  autoscale: boolean
  purpose: 'system' | 'user'
}

const PROVIDER_META: Record<KubeProvider, { label: string; color: string; prefix: string }> = {
  aks: { label: 'Azure Kubernetes Service (AKS)', color: '#0078D4', prefix: 'azure' },
  eks: { label: 'Elastic Kubernetes Service (EKS)', color: '#FF9900', prefix: 'aws' },
  gke: { label: 'Google Kubernetes Engine (GKE)', color: '#4285F4', prefix: 'gcp' },
}

const AKS_VM_SIZES = [
  { id: 'Standard_D2s_v3', label: 'D2s v3 (2 vCPU, 8 GB) — dev/light' },
  { id: 'Standard_D4s_v3', label: 'D4s v3 (4 vCPU, 16 GB) — standard' },
  { id: 'Standard_D8s_v3', label: 'D8s v3 (8 vCPU, 32 GB) — production' },
  { id: 'Standard_F8s_v2', label: 'F8s v2 (8 vCPU, 16 GB) — compute-intensive' },
  { id: 'Standard_E4s_v3', label: 'E4s v3 (4 vCPU, 32 GB) — memory-intensive' },
  { id: 'Standard_NC6s_v3', label: 'NC6s v3 (6 vCPU, 112 GB) — GPU' },
]
const EKS_INSTANCE_TYPES = [
  { id: 't3.medium', label: 't3.medium (2 vCPU, 4 GB) — dev' },
  { id: 'm5.large', label: 'm5.large (2 vCPU, 8 GB) — standard' },
  { id: 'm5.xlarge', label: 'm5.xlarge (4 vCPU, 16 GB) — production' },
  { id: 'c5.2xlarge', label: 'c5.2xlarge (8 vCPU, 16 GB) — compute-intensive' },
  { id: 'r5.xlarge', label: 'r5.xlarge (4 vCPU, 32 GB) — memory-intensive' },
  { id: 'p3.2xlarge', label: 'p3.2xlarge (8 vCPU, 61 GB) — GPU' },
]
const GKE_MACHINE_TYPES = [
  { id: 'e2-medium', label: 'e2-medium (2 vCPU, 4 GB) — dev' },
  { id: 'n2-standard-2', label: 'n2-standard-2 (2 vCPU, 8 GB) — standard' },
  { id: 'n2-standard-4', label: 'n2-standard-4 (4 vCPU, 16 GB) — production' },
  { id: 'c2-standard-8', label: 'c2-standard-8 (8 vCPU, 32 GB) — compute-intensive' },
  { id: 'n2-highmem-4', label: 'n2-highmem-4 (4 vCPU, 32 GB) — memory-intensive' },
  { id: 'n1-standard-4-gpu', label: 'n1-standard-4 + GPU (4 vCPU) — GPU' },
]

function vmSizesFor(provider: KubeProvider) {
  if (provider === 'aks') return AKS_VM_SIZES
  if (provider === 'eks') return EKS_INSTANCE_TYPES
  return GKE_MACHINE_TYPES
}

const defaultSystemPool = (provider: KubeProvider): NodePool => ({
  name: 'system',
  vmSize: provider === 'aks' ? 'Standard_D4s_v3' : provider === 'eks' ? 'm5.large' : 'n2-standard-2',
  minCount: 1,
  maxCount: 3,
  autoscale: true,
  purpose: 'system',
})

type Addon = 'ingress' | 'cert-manager' | 'prometheus' | 'linkerd' | 'argo-cd' | 'keda'
const ALL_ADDONS: { id: Addon; label: string; description: string }[] = [
  { id: 'ingress', label: 'NGINX Ingress', description: 'HTTP/HTTPS routing' },
  { id: 'cert-manager', label: 'cert-manager', description: 'TLS certificate automation' },
  { id: 'prometheus', label: 'Prometheus + Grafana', description: 'Metrics & dashboards' },
  { id: 'linkerd', label: 'Linkerd', description: 'Lightweight service mesh' },
  { id: 'argo-cd', label: 'Argo CD', description: 'GitOps deployments' },
  { id: 'keda', label: 'KEDA', description: 'Event-driven autoscaling' },
]

const STEPS = ['Provider', 'System Pool', 'Add-ons', 'Review']

// ─── Node generation ─────────────────────────────────────────────────────────

function generateK8sNodes(
  provider: KubeProvider,
  clusterName: string,
  nodePools: NodePool[],
  addons: Addon[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const pid = PROVIDER_META[provider].prefix
  const clusterId = `k8s-cluster-${Date.now()}`
  let xOffset = 80

  // Container node: VPC/VNet/VPC
  const containerLabel = provider === 'aks' ? 'Resource Group' : provider === 'eks' ? 'VPC' : 'GCP Project'
  const containerCompId = provider === 'aks' ? 'azure-resource-group' : provider === 'eks' ? 'aws-vpc' : 'gcp-project'
  const containerId = `k8s-container-${Date.now()}`
  const clusterCompId = provider === 'aks' ? 'azure-aks' : provider === 'eks' ? 'aws-eks' : 'gcp-gke'

  nodes.push({
    id: containerId,
    type: 'container',
    position: { x: 100, y: 100 },
    data: {
      label: `${clusterName}-rg`,
      componentId: containerCompId,
      config: {},
    },
    style: { width: 700, height: 500 },
  } as Node)

  // Cluster node
  nodes.push({
    id: clusterId,
    type: 'custom',
    position: { x: 40, y: 60 },
    parentId: containerId,
    data: {
      label: clusterName,
      componentId: clusterCompId,
      config: {
        node_count: nodePools[0]?.minCount || 2,
        vm_size: nodePools[0]?.vmSize,
      },
    },
  } as Node)

  // Node pool nodes
  nodePools.forEach((pool, i) => {
    const poolId = `k8s-pool-${Date.now()}-${i}`
    nodes.push({
      id: poolId,
      type: 'custom',
      position: { x: 40 + i * 200, y: 180 },
      parentId: containerId,
      data: {
        label: `${pool.name} pool`,
        componentId: provider === 'aks' ? 'azure-aks-nodepool' : 'aws-eks-nodegroup',
        config: {
          vm_size: pool.vmSize,
          min_count: pool.minCount,
          max_count: pool.maxCount,
          enable_auto_scaling: pool.autoscale,
        },
      },
    } as Node)
    edges.push({ id: `edge-cluster-pool-${i}`, source: clusterId, target: poolId, type: 'default' })
  })

  // Add-on nodes below the container
  addons.forEach((addon, i) => {
    const addonCompMap: Record<Addon, string> = {
      'ingress': 'k8s-ingress',
      'cert-manager': 'k8s-ingress',
      'prometheus': 'prometheus',
      'linkerd': 'istio',
      'argo-cd': 'argocd',
      'keda': 'k8s-ingress',
    }
    const addonId = `k8s-addon-${Date.now()}-${i}`
    nodes.push({
      id: addonId,
      type: 'custom',
      position: { x: 100 + i * 160, y: 620 + Math.floor(i / 4) * 100 },
      data: {
        label: ALL_ADDONS.find(a => a.id === addon)?.label || addon,
        componentId: addonCompMap[addon] || 'k8s-ingress',
        config: {},
      },
    } as Node)
    edges.push({ id: `edge-addon-${i}`, source: clusterId, target: addonId, type: 'default' })
  })

  return { nodes, edges }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function K8sWizard({ open, onOpenChange, onComplete }: K8sWizardProps) {
  const [step, setStep] = useState(0)
  const [provider, setProvider] = useState<KubeProvider>('aks')
  const [clusterName, setClusterName] = useState('my-cluster')
  const [systemPool, setSystemPool] = useState<NodePool>(defaultSystemPool('aks'))
  const [selectedAddons, setSelectedAddons] = useState<Set<Addon>>(new Set(['ingress', 'prometheus']))

  const handleProviderChange = (p: KubeProvider) => {
    setProvider(p)
    setSystemPool(defaultSystemPool(p))
  }

  const toggleAddon = (id: Addon) => {
    setSelectedAddons(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleComplete = () => {
    const { nodes, edges } = generateK8sNodes(provider, clusterName, [systemPool], Array.from(selectedAddons))
    onComplete(nodes, edges)
    onOpenChange(false)
    // reset
    setStep(0)
    setProvider('aks')
    setClusterName('my-cluster')
    setSystemPool(defaultSystemPool('aks'))
    setSelectedAddons(new Set(['ingress', 'prometheus']))
  }

  const vmSizes = vmSizesFor(provider)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Container className="h-5 w-5 text-blue-400" />
            Kubernetes Cluster Wizard
          </DialogTitle>
          <DialogDescription>
            Generate a pre-built Kubernetes cluster diagram with your chosen provider and configuration.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                i < step ? 'bg-blue-600 text-white' :
                i === step ? 'bg-blue-500 text-white ring-2 ring-blue-300' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`text-sm ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label}</span>
              {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step 0: Provider */}
        {step === 0 && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Cluster Name</Label>
              <Input value={clusterName} onChange={(e) => setClusterName(e.target.value)} placeholder="my-cluster" />
            </div>
            <div className="space-y-2">
              <Label>Kubernetes Provider</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['aks', 'eks', 'gke'] as KubeProvider[]).map(p => (
                  <button
                    key={p}
                    onClick={() => handleProviderChange(p)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      provider === p
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-border hover:border-blue-500/50'
                    }`}
                  >
                    <div className="font-semibold text-sm uppercase tracking-wider mb-1" style={{ color: PROVIDER_META[p].color }}>
                      {p.toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground leading-snug">{PROVIDER_META[p].label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: System node pool */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 mb-1">
              <Server className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">System Node Pool</span>
              <Badge variant="secondary" className="ml-auto">Required</Badge>
            </div>
            <div className="space-y-2">
              <Label>Pool Name</Label>
              <Input value={systemPool.name} onChange={(e) => setSystemPool(p => ({ ...p, name: e.target.value }))} placeholder="system" />
            </div>
            <div className="space-y-2">
              <Label>VM / Instance Size</Label>
              <Select value={systemPool.vmSize} onValueChange={(v) => setSystemPool(p => ({ ...p, vmSize: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {vmSizes.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Nodes</Label>
                <Input type="number" min={1} max={50} value={systemPool.minCount} onChange={(e) => setSystemPool(p => ({ ...p, minCount: parseInt(e.target.value) || 1 }))} />
              </div>
              <div className="space-y-2">
                <Label>Max Nodes</Label>
                <Input type="number" min={1} max={100} value={systemPool.maxCount} onChange={(e) => setSystemPool(p => ({ ...p, maxCount: parseInt(e.target.value) || 3 }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="autoscale" checked={systemPool.autoscale} onChange={(e) => setSystemPool(p => ({ ...p, autoscale: e.target.checked }))} className="w-4 h-4" />
              <Label htmlFor="autoscale" className="font-normal cursor-pointer">Enable Cluster Autoscaler</Label>
            </div>
          </div>
        )}

        {/* Step 2: Add-ons */}
        {step === 2 && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Select the tools and services to include in your cluster.</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_ADDONS.map(addon => (
                <button
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    selectedAddons.has(addon.id)
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-border hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-sm">{addon.label}</span>
                    {selectedAddons.has(addon.id) && <Check className="h-4 w-4 text-blue-400" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{addon.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-3 py-2">
            <div className="rounded-lg border border-border p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-semibold" style={{ color: PROVIDER_META[provider].color }}>{provider.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cluster Name</span>
                <span className="font-medium">{clusterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">System Pool</span>
                <span className="font-medium">{systemPool.vmSize} × {systemPool.minCount}–{systemPool.maxCount}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Add-ons</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                  {Array.from(selectedAddons).map(a => (
                    <Badge key={a} variant="secondary" className="text-xs">{ALL_ADDONS.find(x => x.id === a)?.label}</Badge>
                  ))}
                  {selectedAddons.size === 0 && <span className="text-muted-foreground">None</span>}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This will generate {1 + selectedAddons.size + 1} nodes on the canvas. You can adjust any settings after placing them.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => step === 0 ? onOpenChange(false) : setStep(s => s - 1)}>
            {step === 0 ? 'Cancel' : <><ChevronLeft className="h-4 w-4 mr-1" /> Back</>}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-blue-600 hover:bg-blue-700">
              <Container className="h-4 w-4 mr-1.5" />
              Generate Diagram
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
