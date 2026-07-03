'use client'

import { useState } from 'react'
import { Node, Edge } from '@xyflow/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronRight, ChevronLeft, Shield, Check, Plus, Trash2 } from 'lucide-react'

interface GovernanceWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (nodes: Node[], edges: Edge[]) => void
}

interface Subscription {
  name: string
  environment: 'dev' | 'staging' | 'production'
}

type PolicyTemplate =
  | 'require-tags'
  | 'allowed-locations'
  | 'allowed-vm-skus'
  | 'no-public-ips'
  | 'require-https'
  | 'audit-diagnostics'

const POLICY_TEMPLATES: {
  id: PolicyTemplate
  label: string
  effect: string
  description: string
}[] = [
  {
    id: 'require-tags',
    label: 'Require Tags',
    effect: 'deny',
    description: 'Enforce Environment and CostCenter tags on all resources',
  },
  {
    id: 'allowed-locations',
    label: 'Allowed Locations',
    effect: 'deny',
    description: 'Restrict deployments to approved Azure regions',
  },
  {
    id: 'allowed-vm-skus',
    label: 'Allowed VM SKUs',
    effect: 'deny',
    description: 'Permit only approved VM sizes to control costs',
  },
  {
    id: 'no-public-ips',
    label: 'No Public IPs',
    effect: 'audit',
    description: 'Audit resources with public IP addresses',
  },
  {
    id: 'require-https',
    label: 'Require HTTPS',
    effect: 'deny',
    description: 'Enforce HTTPS-only for App Services and Storage',
  },
  {
    id: 'audit-diagnostics',
    label: 'Audit Diagnostics',
    effect: 'auditIfNotExists',
    description: 'Audit resources missing diagnostic settings',
  },
]

type RbacRole =
  | 'Owner'
  | 'Contributor'
  | 'Reader'
  | 'DevOps Engineer'
  | 'Network Contributor'
  | 'Security Admin'
const RBAC_ROLES: RbacRole[] = [
  'Owner',
  'Contributor',
  'Reader',
  'DevOps Engineer',
  'Network Contributor',
  'Security Admin',
]

interface RbacAssignment {
  group: string
  role: RbacRole
}

const STEPS = ['Hierarchy', 'Subscriptions', 'Policies', 'RBAC', 'Review']

// ─── Node generation ─────────────────────────────────────────────────────────

function generateGovernanceNodes(
  orgName: string,
  mgmtGroupName: string,
  subscriptions: Subscription[],
  policies: PolicyTemplate[],
  rbacAssignments: RbacAssignment[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const now = Date.now()

  // Root Management Group
  const mgRootId = `mg-root-${now}`
  nodes.push({
    id: mgRootId,
    type: 'container',
    position: { x: 100, y: 60 },
    data: {
      label: orgName || 'Tenant Root Group',
      componentId: 'azure-management-group',
      config: {},
    },
    style: { width: 800, height: 560 },
  } as Node)

  // Child management group
  const mgChildId = `mg-child-${now}`
  nodes.push({
    id: mgChildId,
    type: 'container',
    position: { x: 40, y: 60 },
    parentId: mgRootId,
    data: {
      label: mgmtGroupName || 'Platform',
      componentId: 'azure-management-group',
      config: {},
    },
    style: { width: 700, height: 420 },
  } as Node)

  // Subscriptions inside child MG
  subscriptions.forEach((sub, i) => {
    const subId = `sub-${now}-${i}`
    nodes.push({
      id: subId,
      type: 'container',
      position: { x: 40 + i * 220, y: 60 },
      parentId: mgChildId,
      data: {
        label: sub.name,
        componentId: 'azure-subscription',
        config: { environment: sub.environment },
      },
      style: { width: 200, height: 280 },
    } as Node)

    // Resource Group inside each subscription
    const rgId = `rg-${now}-${i}`
    nodes.push({
      id: rgId,
      type: 'container',
      position: { x: 20, y: 60 },
      parentId: subId,
      data: {
        label: `rg-${sub.environment}`,
        componentId: 'azure-resource-group',
        config: { location: 'westeurope' },
      },
      style: { width: 160, height: 200 },
    } as Node)
  })

  // Policy assignment nodes — positioned below the hierarchy
  let policyX = 100
  policies.forEach((policy, i) => {
    const policyId = `policy-${now}-${i}`
    const meta = POLICY_TEMPLATES.find(p => p.id === policy)!
    nodes.push({
      id: policyId,
      type: 'custom',
      position: { x: policyX, y: 680 },
      data: {
        label: meta.label,
        componentId: 'azure-policy',
        config: { effect: meta.effect, policyType: policy },
      },
    } as Node)
    edges.push({ id: `edge-policy-${i}`, source: mgChildId, target: policyId, type: 'default' })
    policyX += 200
  })

  // RBAC assignment nodes
  let rbacX = 100
  rbacAssignments.forEach((assignment, i) => {
    const rbacId = `rbac-${now}-${i}`
    nodes.push({
      id: rbacId,
      type: 'custom',
      position: { x: rbacX, y: 820 },
      data: {
        label: `${assignment.group}: ${assignment.role}`,
        componentId: 'azure-role-assignment',
        config: { group: assignment.group, role: assignment.role },
      },
    } as Node)
    edges.push({ id: `edge-rbac-${i}`, source: mgChildId, target: rbacId, type: 'default' })
    rbacX += 240
  })

  return { nodes, edges }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function GovernanceWizard({ open, onOpenChange, onComplete }: GovernanceWizardProps) {
  const [step, setStep] = useState(0)
  const [orgName, setOrgName] = useState('Contoso')
  const [mgmtGroupName, setMgmtGroupName] = useState('Platform')
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { name: 'sub-dev', environment: 'dev' },
    { name: 'sub-staging', environment: 'staging' },
    { name: 'sub-prod', environment: 'production' },
  ])
  const [selectedPolicies, setSelectedPolicies] = useState<Set<PolicyTemplate>>(
    new Set(['require-tags', 'allowed-locations'])
  )
  const [rbacAssignments, setRbacAssignments] = useState<RbacAssignment[]>([
    { group: 'platform-admins', role: 'Owner' },
    { group: 'developers', role: 'Contributor' },
    { group: 'security-team', role: 'Security Admin' },
  ])

  const togglePolicy = (id: PolicyTemplate) => {
    setSelectedPolicies(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addSubscription = () => {
    setSubscriptions(prev => [...prev, { name: `sub-${prev.length + 1}`, environment: 'dev' }])
  }

  const removeSubscription = (i: number) => {
    setSubscriptions(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateSubscription = (i: number, field: keyof Subscription, value: string) => {
    setSubscriptions(prev => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)))
  }

  const addRbac = () => {
    setRbacAssignments(prev => [...prev, { group: 'new-group', role: 'Reader' }])
  }

  const removeRbac = (i: number) => {
    setRbacAssignments(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateRbac = (i: number, field: keyof RbacAssignment, value: string) => {
    setRbacAssignments(prev => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  }

  const handleComplete = () => {
    const { nodes, edges } = generateGovernanceNodes(
      orgName,
      mgmtGroupName,
      subscriptions,
      Array.from(selectedPolicies),
      rbacAssignments
    )
    onComplete(nodes, edges)
    onOpenChange(false)
    setStep(0)
  }

  const envBadgeClass: Record<Subscription['environment'], string> = {
    dev: 'bg-green-500/20 text-green-400',
    staging: 'bg-yellow-500/20 text-yellow-400',
    production: 'bg-red-500/20 text-red-400',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Cloud Governance Wizard
          </DialogTitle>
          <DialogDescription>
            Set up Azure Landing Zone with Management Groups, Subscriptions, RBAC, and Policy
            assignments.
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 py-2 overflow-x-auto">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-1.5 shrink-0">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                  i < step
                    ? 'bg-blue-600 text-white'
                    : i === step
                      ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={`text-xs ${i === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Hierarchy */}
        {step === 0 && (
          <div className="space-y-4 py-2">
            <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground border border-border">
              <strong className="text-foreground">Azure Landing Zone pattern:</strong>
              <br />
              Tenant Root MG → Platform MG → Subscriptions (DEV / STAGING / PROD) → Resource Groups
            </div>
            <div className="space-y-2">
              <Label>Organisation / Tenant Root Group Name</Label>
              <Input
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="Contoso"
              />
            </div>
            <div className="space-y-2">
              <Label>Platform Management Group Name</Label>
              <Input
                value={mgmtGroupName}
                onChange={e => setMgmtGroupName(e.target.value)}
                placeholder="Platform"
              />
            </div>
          </div>
        )}

        {/* Step 1: Subscriptions */}
        {step === 1 && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Define Azure subscriptions under the Platform Management Group.
            </p>
            {subscriptions.map((sub, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  className="flex-1"
                  value={sub.name}
                  onChange={e => updateSubscription(i, 'name', e.target.value)}
                  placeholder="sub-name"
                />
                <Select
                  value={sub.environment}
                  onValueChange={v => updateSubscription(i, 'environment', v)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dev">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${envBadgeClass[sub.environment]}`}
                >
                  {sub.environment}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeSubscription(i)}
                  disabled={subscriptions.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addSubscription} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Subscription
            </Button>
          </div>
        )}

        {/* Step 2: Policies */}
        {step === 2 && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Select Azure Policy definitions to assign at the Management Group level.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {POLICY_TEMPLATES.map(p => (
                <button
                  key={p.id}
                  onClick={() => togglePolicy(p.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    selectedPolicies.has(p.id)
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-border hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-sm leading-snug">{p.label}</span>
                    {selectedPolicies.has(p.id) && (
                      <Check className="h-4 w-4 text-blue-400 shrink-0 ml-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {p.effect}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{p.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: RBAC */}
        {step === 3 && (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Assign Azure AD groups to roles at the Management Group scope.
            </p>
            {rbacAssignments.map((r, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  className="flex-1"
                  value={r.group}
                  onChange={e => updateRbac(i, 'group', e.target.value)}
                  placeholder="group-name"
                />
                <Select value={r.role} onValueChange={v => updateRbac(i, 'role', v as RbacRole)}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RBAC_ROLES.map(role => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeRbac(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addRbac} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add RBAC Assignment
            </Button>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-3 py-2 text-sm">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organisation</span>
                <span className="font-medium">{orgName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform MG</span>
                <span className="font-medium">{mgmtGroupName}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Subscriptions</span>
                <div className="flex flex-col items-end gap-1">
                  {subscriptions.map((s, i) => (
                    <span key={i} className="font-medium">
                      {s.name}{' '}
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${envBadgeClass[s.environment]}`}
                      >
                        {s.environment}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Policies</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                  {Array.from(selectedPolicies).map(p => (
                    <Badge key={p} variant="secondary" className="text-xs">
                      {POLICY_TEMPLATES.find(t => t.id === p)?.label}
                    </Badge>
                  ))}
                  {selectedPolicies.size === 0 && (
                    <span className="text-muted-foreground">None</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">RBAC Assignments</span>
                <span className="font-medium">{rbacAssignments.length} role(s)</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This will generate{' '}
              {2 + subscriptions.length * 2 + selectedPolicies.size + rbacAssignments.length} nodes.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => (step === 0 ? onOpenChange(false) : setStep(s => s - 1))}
          >
            {step === 0 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </>
            )}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="bg-blue-600 hover:bg-blue-700">
              <Shield className="h-4 w-4 mr-1.5" />
              Generate Diagram
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
