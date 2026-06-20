'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Settings, Code2, Copy, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { getConfigSchema } from '@/lib/node-config-schemas'
import { COMPONENT_CATALOG, getEffectiveGeneratorType, GENERATOR_TYPE_META } from '@/lib/catalog'
import { AZURE_VM_SIZES, AWS_VM_SIZES, GCP_VM_SIZES, type VMSize } from '@/lib/cloud-pricing'
import { generateCICDConfigs } from '@/lib/generators/cicd'

import { useDiagramStore } from '@/lib/store/diagram-store'

export function NodeConfigPanel() {
  const { selectedNode: node, configPanelOpen, setConfigPanelOpen, setNodes } = useDiagramStore()

  // Support both 'componentId' (new) and 'component' (old) for backward compatibility
  const componentId = node?.data?.componentId || node?.data?.component
  const componentInfo = componentId ? COMPONENT_CATALOG.find(c => c.id === componentId) : null

  // Initialize state from node data - no useEffect needed because parent uses key={node.id}
  const initialConfig = node?.data?.config || {}
  const [config, setConfig] = useState<any>(initialConfig)
  const [tags, setTags] = useState<Record<string, string>>((initialConfig as any).tags || {})
  const [labels, setLabels] = useState<Record<string, string>>((initialConfig as any).labels || {})
  const [outputCopied, setOutputCopied] = useState(false)

  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [newTagKey, setNewTagKey] = useState('')
  const [labelDialogOpen, setLabelDialogOpen] = useState(false)
  const [newLabelKey, setNewLabelKey] = useState('')

  // Derived generator type — drives what the Output tab shows
  const generatorType = componentInfo ? getEffectiveGeneratorType(componentInfo) : 'documentation'
  const generatorMeta = GENERATOR_TYPE_META[generatorType]

  if (!node || !configPanelOpen) return null

  // Fallback for components not found in the catalog (e.g. from outdated templates)
  if (!componentInfo) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="font-semibold text-sm">{String(node.data?.label || componentId || '')}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setConfigPanelOpen(false)}><X className="w-4 h-4" /></Button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Component type <code className="font-mono">{String(componentId ?? '')}</code> not found in catalog. Basic editing only.</span>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Label</Label>
            <Input
              value={config.label ?? (node.data?.label as string) ?? ''}
              onChange={(e) => setConfig((prev: any) => ({ ...prev, label: e.target.value }))}
              placeholder="Component label"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Notes</Label>
            <Input
              value={config.notes ?? ''}
              onChange={(e) => setConfig((prev: any) => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes or description..."
            />
          </div>
        </div>
        <div className="p-4 border-t flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => {
              setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, config } } : n))
              setConfigPanelOpen(false)
            }}
          >
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setConfigPanelOpen(false)}>Cancel</Button>
        </div>
      </div>
    )
  }

  const handleSave = () => {
    const finalConfig = {
      ...config,
      tags: Object.keys(tags).length > 0 ? tags : undefined,
      labels: Object.keys(labels).length > 0 ? labels : undefined,
    }

    try {
      const schema = getConfigSchema(componentInfo.id)
      const validated = schema.parse(finalConfig)
      setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, config: validated } } : n))
      setConfigPanelOpen(false)
    } catch (error) {
      console.error('Validation error:', error)
    }
  }

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }))
  }

  const addTag = () => {
    setNewTagKey('')
    setTagDialogOpen(true)
  }

  const handleAddTagConfirm = () => {
    if (newTagKey.trim()) setTags(prev => ({ ...prev, [newTagKey.trim()]: '' }))
    setTagDialogOpen(false)
  }

  const updateTag = (key: string, value: string) => {
    setTags(prev => ({ ...prev, [key]: value }))
  }

  const removeTag = (key: string) => {
    setTags(prev => {
      const newTags = { ...prev }
      delete newTags[key]
      return newTags
    })
  }

  const addLabel = () => {
    setNewLabelKey('')
    setLabelDialogOpen(true)
  }

  const handleAddLabelConfirm = () => {
    if (newLabelKey.trim()) setLabels(prev => ({ ...prev, [newLabelKey.trim()]: '' }))
    setLabelDialogOpen(false)
  }

  const updateLabel = (key: string, value: string) => {
    setLabels(prev => ({ ...prev, [key]: value }))
  }

  const removeLabel = (key: string) => {
    setLabels(prev => {
      const newLabels = { ...prev }
      delete newLabels[key]
      return newLabels
    })
  }

  const renderComputeConfig = () => {
    const provider = componentInfo?.provider || 'azure'
    let vmSizes: VMSize[] = []
    if (provider === 'azure') vmSizes = AZURE_VM_SIZES
    else if (provider === 'aws') vmSizes = AWS_VM_SIZES
    else if (provider === 'gcp') vmSizes = GCP_VM_SIZES

    return (
      <>
        <div className="space-y-2">
          <Label>VM Size</Label>
          <Select value={config.size || ''} onValueChange={(v) => updateConfig('size', v)}>
            <SelectTrigger><SelectValue placeholder="Select VM size" /></SelectTrigger>
            <SelectContent>
              {vmSizes.map(size => (
                <SelectItem key={size.id} value={size.id}>
                  {size.name} - {size.vcpus} vCPU, {size.memory}GB RAM - ${size.pricePerHour}/hr
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>OS Image</Label>
          <Select value={config.osImage || ''} onValueChange={(v) => updateConfig('osImage', v)}>
            <SelectTrigger><SelectValue placeholder="Select OS" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ubuntu-22.04">Ubuntu 22.04 LTS</SelectItem>
              <SelectItem value="ubuntu-20.04">Ubuntu 20.04 LTS</SelectItem>
              <SelectItem value="windows-server-2022">Windows Server 2022</SelectItem>
              <SelectItem value="windows-server-2019">Windows Server 2019</SelectItem>
              <SelectItem value="rhel-8">Red Hat Enterprise Linux 8</SelectItem>
              <SelectItem value="centos-8">CentOS 8</SelectItem>
              <SelectItem value="debian-11">Debian 11</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Replicas</Label>
          <Input type="number" min={1} max={100} value={config.replicas || 1} onChange={(e) => updateConfig('replicas', parseInt(e.target.value))} />
        </div>

        <div className="space-y-2">
          <Label>Disk Size (GB)</Label>
          <Input type="number" min={30} max={4096} value={config.diskSize || 128} onChange={(e) => updateConfig('diskSize', parseInt(e.target.value))} />
        </div>

        <div className="space-y-2">
          <Label>Disk Type</Label>
          <Select value={config.diskType || 'premium_ssd'} onValueChange={(v) => updateConfig('diskType', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard_hdd">Standard HDD</SelectItem>
              <SelectItem value="standard_ssd">Standard SSD</SelectItem>
              <SelectItem value="premium_ssd">Premium SSD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="publicIp" checked={config.publicIp || false} onChange={(e) => updateConfig('publicIp', e.target.checked)} className="w-4 h-4" />
          <Label htmlFor="publicIp">Assign Public IP</Label>
        </div>

        {/* ─── Azure-specific fields ─────────────────────────────── */}
        {provider === 'azure' && (
          <>
            <div className="space-y-2">
              <Label>Availability Zone</Label>
              <Select value={config.availability_zone || '__none__'} onValueChange={(v) => updateConfig('availability_zone', v === '__none__' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No preference</SelectItem>
                  <SelectItem value="1">Zone 1</SelectItem>
                  <SelectItem value="2">Zone 2</SelectItem>
                  <SelectItem value="3">Zone 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admin Username</Label>
              <Input placeholder="azureuser" value={config.admin_username || ''} onChange={(e) => updateConfig('admin_username', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>SSH Public Key Data</Label>
              <Input placeholder="ssh-rsa AAAA..." value={config.ssh_key_data || ''} onChange={(e) => updateConfig('ssh_key_data', e.target.value)} />
              <p className="text-xs text-muted-foreground">Paste your public key or leave blank to use file(&quot;~/.ssh/id_rsa.pub&quot;)</p>
            </div>

            <div className="space-y-2">
              <Label>OS Disk Type</Label>
              <Select value={config.os_disk_type || 'Premium_LRS'} onValueChange={(v) => updateConfig('os_disk_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard_LRS">Standard HDD (Standard_LRS)</SelectItem>
                  <SelectItem value="StandardSSD_LRS">Standard SSD (StandardSSD_LRS)</SelectItem>
                  <SelectItem value="Premium_LRS">Premium SSD (Premium_LRS)</SelectItem>
                  <SelectItem value="UltraSSD_LRS">Ultra SSD (UltraSSD_LRS)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>OS Disk Size (GB)</Label>
              <Input type="number" min={30} max={4096} value={config.os_disk_size_gb || 64} onChange={(e) => updateConfig('os_disk_size_gb', parseInt(e.target.value))} />
            </div>

            <div className="space-y-2">
              <Label>Managed Identity</Label>
              <Select value={config.identity_type || '__none__'} onValueChange={(v) => updateConfig('identity_type', v === '__none__' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  <SelectItem value="SystemAssigned">System Assigned</SelectItem>
                  <SelectItem value="UserAssigned">User Assigned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="bootDiag" checked={config.boot_diagnostics_enabled || false} onChange={(e) => updateConfig('boot_diagnostics_enabled', e.target.checked)} className="w-4 h-4" />
              <Label htmlFor="bootDiag" className="font-normal">Enable Boot Diagnostics</Label>
            </div>
          </>
        )}

        {/* ─── AWS-specific fields ─────────────────────────────── */}
        {provider === 'aws' && (
          <>
            <div className="space-y-2">
              <Label>Availability Zone</Label>
              <Select value={config.availability_zone || '__none__'} onValueChange={(v) => updateConfig('availability_zone', v === '__none__' ? undefined : v)}>
                <SelectTrigger><SelectValue placeholder="No preference (auto-place)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No preference</SelectItem>
                  <SelectItem value="a">Zone a</SelectItem>
                  <SelectItem value="b">Zone b</SelectItem>
                  <SelectItem value="c">Zone c</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>AMI ID (optional override)</Label>
              <Input placeholder="ami-0c55b159cbfafe1f0" value={config.ami || ''}
                onChange={(e) => updateConfig('ami', e.target.value || undefined)} />
              <p className="text-xs text-muted-foreground">Leave blank to use latest for selected OS/region</p>
            </div>
            <div className="space-y-2">
              <Label>Key Pair Name</Label>
              <Input placeholder="my-keypair" value={config.key_name || ''}
                onChange={(e) => updateConfig('key_name', e.target.value || undefined)} />
            </div>
            <div className="space-y-2">
              <Label>IAM Instance Profile</Label>
              <Input placeholder="my-ec2-role" value={config.iam_instance_profile || ''}
                onChange={(e) => updateConfig('iam_instance_profile', e.target.value || undefined)} />
            </div>
            <div className="space-y-2">
              <Label>Instance Lifecycle</Label>
              <Select value={config.instance_market_type || 'on_demand'} onValueChange={(v) => updateConfig('instance_market_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_demand">On-Demand</SelectItem>
                  <SelectItem value="spot">Spot (up to 90% cheaper, interruptible)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>User Data (startup script)</Label>
              <Input placeholder="#!/bin/bash ..." value={config.user_data || ''}
                onChange={(e) => updateConfig('user_data', e.target.value || undefined)} />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="awsTermProt" checked={config.disable_api_termination || false}
                onChange={(e) => updateConfig('disable_api_termination', e.target.checked)} className="w-4 h-4" />
              <Label htmlFor="awsTermProt" className="font-normal">Termination Protection</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="awsMonitoring" checked={config.monitoring || false}
                onChange={(e) => updateConfig('monitoring', e.target.checked)} className="w-4 h-4" />
              <Label htmlFor="awsMonitoring" className="font-normal">Detailed Monitoring (CloudWatch 1-min)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="awsEbsOpt" checked={config.ebs_optimized !== false}
                onChange={(e) => updateConfig('ebs_optimized', e.target.checked)} className="w-4 h-4" />
              <Label htmlFor="awsEbsOpt" className="font-normal">EBS Optimized</Label>
            </div>
          </>
        )}

        {/* ─── GCP-specific fields ─────────────────────────────── */}
        {provider === 'gcp' && (
          <>
            <div className="space-y-2">
              <Label>Zone</Label>
              <Input placeholder="us-central1-a" value={config.zone || ''}
                onChange={(e) => updateConfig('zone', e.target.value || undefined)} />
            </div>
            <div className="space-y-2">
              <Label>Boot Disk Type</Label>
              <Select value={config.boot_disk_type || 'pd-balanced'} onValueChange={(v) => updateConfig('boot_disk_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pd-standard">Standard Persistent Disk (HDD)</SelectItem>
                  <SelectItem value="pd-balanced">Balanced Persistent Disk (SSD)</SelectItem>
                  <SelectItem value="pd-ssd">SSD Persistent Disk</SelectItem>
                  <SelectItem value="pd-extreme">Extreme Persistent Disk</SelectItem>
                  <SelectItem value="hyperdisk-balanced">Hyperdisk Balanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Service Account Email</Label>
              <Input placeholder="sa@project.iam.gserviceaccount.com" value={config.service_account || ''}
                onChange={(e) => updateConfig('service_account', e.target.value || undefined)} />
            </div>
            <div className="space-y-2">
              <Label>Startup Script</Label>
              <Input placeholder="#!/bin/bash" value={config.metadata_startup_script || ''}
                onChange={(e) => updateConfig('metadata_startup_script', e.target.value || undefined)} />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="gcpSpot" checked={config.preemptible || false}
                onChange={(e) => { updateConfig('preemptible', e.target.checked); updateConfig('provisioning_model', e.target.checked ? 'SPOT' : 'STANDARD') }} className="w-4 h-4" />
              <Label htmlFor="gcpSpot" className="font-normal">Spot VM (Preemptible — up to 91% savings)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="gcpDelProt" checked={config.deletion_protection || false}
                onChange={(e) => updateConfig('deletion_protection', e.target.checked)} className="w-4 h-4" />
              <Label htmlFor="gcpDelProt" className="font-normal">Deletion Protection</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="gcpShielded" checked={config.enable_shielded_vm || false}
                onChange={(e) => updateConfig('enable_shielded_vm', e.target.checked)} className="w-4 h-4" />
              <Label htmlFor="gcpShielded" className="font-normal">Shielded VM (Secure Boot + vTPM)</Label>
            </div>
          </>
        )}
      </>
    )
  }

  const renderNetworkingConfig = () => {
    const provider = componentInfo?.provider || 'azure'
    const id = componentInfo?.id || ''

    // ── VNet / VPC ─────────────────────────────────────────────────────────
    if (componentInfo && (id.includes('vnet') || id.includes('vpc'))) {
      return (
        <>
          <div className="space-y-2">
            <Label>{provider === 'aws' ? 'CIDR Block' : 'Address Space (CIDR, comma-separated)'}</Label>
            <Input
              placeholder="10.0.0.0/16"
              value={Array.isArray(config.address_space) ? config.address_space.join(', ') : (config.cidr_block || config.addressSpace || '')}
              onChange={(e) => {
                const val = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                updateConfig('address_space', val)
                updateConfig('cidr_block', val[0] || undefined)
                updateConfig('addressSpace', e.target.value)
              }}
            />
          </div>

          {provider === 'azure' && (
            <>
              <div className="space-y-2">
                <Label>DNS Servers (comma-separated, empty = Azure default)</Label>
                <Input placeholder="168.63.129.16"
                  value={Array.isArray(config.dns_servers) ? config.dns_servers.join(', ') : (config.dnsServers?.join(', ') || '')}
                  onChange={(e) => { const v = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean); updateConfig('dns_servers', v); updateConfig('dnsServers', v) }} />
              </div>
              <div className="space-y-2">
                <Label>BGP Community (optional)</Label>
                <Input placeholder="12076:20010" value={config.bgp_community || ''}
                  onChange={(e) => updateConfig('bgp_community', e.target.value || undefined)} />
              </div>
              <div className="space-y-2">
                <Label>Flow Timeout (minutes, 4–30)</Label>
                <Input type="number" min={4} max={30} value={config.flow_timeout_in_minutes || 4}
                  onChange={(e) => updateConfig('flow_timeout_in_minutes', parseInt(e.target.value))} />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="ddosEnabled" checked={config.ddos_protection_enabled || false}
                  onChange={(e) => updateConfig('ddos_protection_enabled', e.target.checked)} className="w-4 h-4" />
                <Label htmlFor="ddosEnabled" className="font-normal">Enable DDoS Protection Plan</Label>
              </div>
              {config.ddos_protection_enabled && (
                <div className="space-y-2">
                  <Label>DDoS Protection Plan ID</Label>
                  <Input placeholder="/subscriptions/.../ddosProtectionPlans/..."
                    value={config.ddos_protection_plan_id || ''}
                    onChange={(e) => updateConfig('ddos_protection_plan_id', e.target.value || undefined)} />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="vmProtect" checked={config.vm_protection_enabled || false}
                  onChange={(e) => updateConfig('vm_protection_enabled', e.target.checked)} className="w-4 h-4" />
                <Label htmlFor="vmProtect" className="font-normal">Enable VM Protection</Label>
              </div>
            </>
          )}

          {provider === 'aws' && (
            <>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="vpcDnsH" checked={config.enable_dns_hostnames !== false}
                  onChange={(e) => updateConfig('enable_dns_hostnames', e.target.checked)} className="w-4 h-4" />
                <Label htmlFor="vpcDnsH" className="font-normal">Enable DNS Hostnames (required for EKS/RDS)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="vpcDnsS" checked={config.enable_dns_support !== false}
                  onChange={(e) => updateConfig('enable_dns_support', e.target.checked)} className="w-4 h-4" />
                <Label htmlFor="vpcDnsS" className="font-normal">Enable DNS Support</Label>
              </div>
              <div className="space-y-2">
                <Label>Instance Tenancy</Label>
                <Select value={config.instance_tenancy || 'default'} onValueChange={(v) => updateConfig('instance_tenancy', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">default (shared hardware)</SelectItem>
                    <SelectItem value="dedicated">dedicated (compliance)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="vpcIpv6" checked={config.assign_generated_ipv6_cidr_block || false}
                  onChange={(e) => updateConfig('assign_generated_ipv6_cidr_block', e.target.checked)} className="w-4 h-4" />
                <Label htmlFor="vpcIpv6" className="font-normal">Assign IPv6 CIDR Block</Label>
              </div>
            </>
          )}

          {provider === 'gcp' && (
            <>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="gcpAutoSub" checked={config.auto_create_subnetworks || false}
                  onChange={(e) => updateConfig('auto_create_subnetworks', e.target.checked)} className="w-4 h-4" />
                <Label htmlFor="gcpAutoSub" className="font-normal">Auto Create Subnetworks (NOT for prod)</Label>
              </div>
              <div className="space-y-2">
                <Label>Routing Mode</Label>
                <Select value={config.routing_mode || 'REGIONAL'} onValueChange={(v) => updateConfig('routing_mode', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGIONAL">Regional (default)</SelectItem>
                    <SelectItem value="GLOBAL">Global (cross-region routes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>MTU</Label>
                <Select value={String(config.mtu || 1460)} onValueChange={(v) => updateConfig('mtu', parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1460">1460 (standard)</SelectItem>
                    <SelectItem value="1500">1500 (DPDK)</SelectItem>
                    <SelectItem value="8896">8896 (jumbo frames)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="gcpDelDef" checked={config.delete_default_routes_on_create || false}
                  onChange={(e) => updateConfig('delete_default_routes_on_create', e.target.checked)} className="w-4 h-4" />
                <Label htmlFor="gcpDelDef" className="font-normal">Delete Default Routes on Create</Label>
              </div>
            </>
          )}
        </>
      )
    }

    // ── Subnet ──────────────────────────────────────────────────────────────
    if (componentInfo && id.includes('subnet')) {
      return (
        <>
          <div className="space-y-2">
            <Label>{provider === 'aws' ? 'CIDR Block' : 'Address Prefixes (CIDR)'}</Label>
            <Input
              placeholder="10.0.1.0/24"
              value={Array.isArray(config.address_prefixes) ? config.address_prefixes.join(', ') : (config.cidr_block || config.addressPrefix || '')}
              onChange={(e) => {
                const val = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                updateConfig('address_prefixes', val)
                updateConfig('cidr_block', val[0] || undefined)
                updateConfig('addressPrefix', e.target.value)
              }}
            />
          </div>

          {provider === 'azure' && (() => {
            const SERVICE_ENDPOINTS = [
              'Microsoft.Storage', 'Microsoft.Sql', 'Microsoft.AzureCosmosDB',
              'Microsoft.KeyVault', 'Microsoft.ServiceBus', 'Microsoft.EventHub',
              'Microsoft.ContainerRegistry', 'Microsoft.CognitiveServices',
              'Microsoft.Web', 'Microsoft.AzureActiveDirectory',
            ]
            const DELEGATIONS: Record<string, string> = {
              '': 'None',
              'Microsoft.ContainerInstance/containerGroups': 'Container Instances',
              'Microsoft.Databricks/workspaces': 'Databricks',
              'Microsoft.Web/serverFarms': 'App Service',
              'Microsoft.Web/hostingEnvironments': 'App Service Environment',
              'Microsoft.Sql/managedInstances': 'SQL Managed Instance',
              'Microsoft.DBforPostgreSQL/flexibleServers': 'PostgreSQL Flexible',
              'Microsoft.DBforMySQL/flexibleServers': 'MySQL Flexible',
              'Microsoft.Network/virtualNetworkGateways': 'VPN/ExpressRoute Gateway',
              'Microsoft.Network/azureFirewalls': 'Azure Firewall',
              'Microsoft.AzureCosmosDB/clusters': 'Cosmos DB',
              'Microsoft.Batch/batchAccounts': 'Azure Batch',
              'Microsoft.Logic/integrationServiceEnvironments': 'Logic Apps ISE',
            }
            return (
              <>
                <div className="space-y-2">
                  <Label>Service Delegation</Label>
                  <Select value={config.delegation || ''} onValueChange={(v) => updateConfig('delegation', v || undefined)}>
                    <SelectTrigger><SelectValue placeholder="None (general purpose)" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DELEGATIONS).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Service Endpoints</Label>
                  <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto border rounded p-2">
                    {SERVICE_ENDPOINTS.map((ep) => {
                      const current: string[] = Array.isArray(config.service_endpoints) ? config.service_endpoints : []
                      const checked = current.includes(ep)
                      return (
                        <div key={ep} className="flex items-center space-x-2">
                          <input type="checkbox" id={`ep-${ep}`} checked={checked}
                            onChange={(e) => {
                              const next = e.target.checked ? [...current, ep] : current.filter((x) => x !== ep)
                              updateConfig('service_endpoints', next)
                            }} className="w-3.5 h-3.5" />
                          <Label htmlFor={`ep-${ep}`} className="font-normal text-xs">{ep}</Label>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Private Endpoint Network Policies</Label>
                  <Select value={config.private_endpoint_network_policies ?? 'Disabled'}
                    onValueChange={(v) => updateConfig('private_endpoint_network_policies', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disabled">Disabled (default)</SelectItem>
                      <SelectItem value="Enabled">Enabled</SelectItem>
                      <SelectItem value="NetworkSecurityGroupEnabled">NSG Enabled</SelectItem>
                      <SelectItem value="RouteTableEnabled">Route Table Enabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="plsNetPolicies"
                    checked={config.private_link_service_network_policies_enabled !== false}
                    onChange={(e) => updateConfig('private_link_service_network_policies_enabled', e.target.checked)}
                    className="w-4 h-4" />
                  <Label htmlFor="plsNetPolicies" className="font-normal">Private Link Service Network Policies Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="defaultOutbound"
                    checked={config.default_outbound_access_enabled !== false}
                    onChange={(e) => updateConfig('default_outbound_access_enabled', e.target.checked)}
                    className="w-4 h-4" />
                  <Label htmlFor="defaultOutbound" className="font-normal">Default Outbound Access Enabled</Label>
                </div>
              </>
            )
          })()}

          {provider === 'aws' && (
            <>
              <div className="space-y-2">
                <Label>Availability Zone</Label>
                <Select value={config.availability_zone || '__none__'} onValueChange={(v) => updateConfig('availability_zone', v === '__none__' ? undefined : v)}>
                  <SelectTrigger><SelectValue placeholder="Any (AWS selects)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Any</SelectItem>
                    <SelectItem value="a">AZ a (e.g. us-east-1a)</SelectItem>
                    <SelectItem value="b">AZ b</SelectItem>
                    <SelectItem value="c">AZ c</SelectItem>
                    <SelectItem value="d">AZ d</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="mapPublicIp"
                  checked={config.map_public_ip_on_launch || false}
                  onChange={(e) => updateConfig('map_public_ip_on_launch', e.target.checked)}
                  className="w-4 h-4" />
                <Label htmlFor="mapPublicIp" className="font-normal">Map Public IP on Launch (public subnet)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="subnetIpv6" checked={config.assign_ipv6_address_on_creation || false}
                  onChange={(e) => updateConfig('assign_ipv6_address_on_creation', e.target.checked)} className="w-4 h-4" />
                <Label htmlFor="subnetIpv6" className="font-normal">Assign IPv6 Address on Creation</Label>
              </div>
              <div className="space-y-2">
                <Label>Customer-Owned IPv4 Pool (optional, Outpost)</Label>
                <Input placeholder="ipv4pool-coip-..." value={config.customer_owned_ipv4_pool || ''}
                  onChange={(e) => updateConfig('customer_owned_ipv4_pool', e.target.value || undefined)} />
              </div>
            </>
          )}

          {provider === 'gcp' && (
            <>
              <div className="space-y-2">
                <Label>Region</Label>
                <Input placeholder="us-central1" value={config.region || ''}
                  onChange={(e) => updateConfig('region', e.target.value || undefined)} />
              </div>
              <div className="space-y-2">
                <Label>Purpose</Label>
                <Select value={config.purpose || 'PRIVATE'} onValueChange={(v) => updateConfig('purpose', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIVATE">PRIVATE (default)</SelectItem>
                    <SelectItem value="PRIVATE_SERVICE_CONNECT">Private Service Connect</SelectItem>
                    <SelectItem value="REGIONAL_MANAGED_PROXY">Regional Managed Proxy (L7 LB)</SelectItem>
                    <SelectItem value="GLOBAL_MANAGED_PROXY">Global Managed Proxy</SelectItem>
                    <SelectItem value="INTERNAL_HTTPS_LOAD_BALANCER">Internal HTTPS LB (legacy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="gcpPrivGoogleAccess"
                  checked={config.private_ip_google_access || false}
                  onChange={(e) => updateConfig('private_ip_google_access', e.target.checked)} className="w-4 h-4" />
                <Label htmlFor="gcpPrivGoogleAccess" className="font-normal">Private Google Access (VMs without public IP can reach Google APIs)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="gcpFlowLogs" checked={config.log_config_enable || false}
                  onChange={(e) => updateConfig('log_config_enable', e.target.checked)} className="w-4 h-4" />
                <Label htmlFor="gcpFlowLogs" className="font-normal">Enable VPC Flow Logs</Label>
              </div>
              {config.log_config_enable && (
                <div className="space-y-2">
                  <Label>Flow Log Aggregation Interval</Label>
                  <Select value={config.log_config_aggregation_interval || 'INTERVAL_5_SEC'}
                    onValueChange={(v) => updateConfig('log_config_aggregation_interval', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERVAL_5_SEC">5 seconds</SelectItem>
                      <SelectItem value="INTERVAL_30_SEC">30 seconds</SelectItem>
                      <SelectItem value="INTERVAL_1_MIN">1 minute</SelectItem>
                      <SelectItem value="INTERVAL_5_MIN">5 minutes</SelectItem>
                      <SelectItem value="INTERVAL_10_MIN">10 minutes</SelectItem>
                      <SelectItem value="INTERVAL_15_MIN">15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </>
      )
    }

    // ── NIC (Network Interface) ─────────────────────────────────────────────
    if (componentInfo && componentInfo.id.includes('nic')) {
      return (
        <>
          <div className="space-y-2">
            <Label>Private IP Allocation</Label>
            <Select value={config.private_ip_address_allocation || 'Dynamic'} onValueChange={(v) => updateConfig('private_ip_address_allocation', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Dynamic">Dynamic (auto-assigned)</SelectItem>
                <SelectItem value="Static">Static (fixed IP)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {config.private_ip_address_allocation === 'Static' && (
            <div className="space-y-2">
              <Label>Private IP Address</Label>
              <Input placeholder="10.0.1.10" value={config.private_ip_address || ''} onChange={(e) => updateConfig('private_ip_address', e.target.value)} />
            </div>
          )}
          <div className="space-y-2">
            <Label>IP Version</Label>
            <Select value={config.private_ip_address_version || 'IPv4'} onValueChange={(v) => updateConfig('private_ip_address_version', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IPv4">IPv4</SelectItem>
                <SelectItem value="IPv6">IPv6</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="nicAccNet" checked={config.accelerated_networking_enabled || false}
              onChange={(e) => updateConfig('accelerated_networking_enabled', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="nicAccNet" className="font-normal">Accelerated Networking</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="nicIpFwd" checked={config.ip_forwarding_enabled || false}
              onChange={(e) => updateConfig('ip_forwarding_enabled', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="nicIpFwd" className="font-normal">IP Forwarding Enabled</Label>
          </div>
        </>
      )
    }

    // ── NSG (Network Security Group) ────────────────────────────────────────
    if (componentInfo && componentInfo.id.includes('nsg')) {
      return (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Define inbound/outbound rules. Priority: lower number = higher priority (100–4096).
          </p>
          <div className="space-y-2">
            <Label>Inbound Rules (simplified)</Label>
            <div className="space-y-2">
              {(config.security_rules || []).map((rule: any, i: number) => (
                <div key={i} className="border rounded p-2 space-y-1.5 text-xs">
                  <div className="flex gap-1">
                    <Input className="h-7 text-xs" placeholder="rule-name" value={rule.name || ''} onChange={(e) => {
                      const rules = [...(config.security_rules || [])]
                      rules[i] = { ...rules[i], name: e.target.value }
                      updateConfig('security_rules', rules)
                    }} />
                    <Input className="h-7 text-xs w-20" type="number" placeholder="priority" value={rule.priority || 100} onChange={(e) => {
                      const rules = [...(config.security_rules || [])]
                      rules[i] = { ...rules[i], priority: parseInt(e.target.value) }
                      updateConfig('security_rules', rules)
                    }} />
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => {
                      const rules = (config.security_rules || []).filter((_: any, idx: number) => idx !== i)
                      updateConfig('security_rules', rules)
                    }}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <Select value={rule.direction || 'Inbound'} onValueChange={(v) => {
                      const rules = [...(config.security_rules || [])]
                      rules[i] = { ...rules[i], direction: v }
                      updateConfig('security_rules', rules)
                    }}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Inbound">Inbound</SelectItem><SelectItem value="Outbound">Outbound</SelectItem></SelectContent>
                    </Select>
                    <Select value={rule.access || 'Allow'} onValueChange={(v) => {
                      const rules = [...(config.security_rules || [])]
                      rules[i] = { ...rules[i], access: v }
                      updateConfig('security_rules', rules)
                    }}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Allow">Allow</SelectItem><SelectItem value="Deny">Deny</SelectItem></SelectContent>
                    </Select>
                    <Select value={rule.protocol || 'Tcp'} onValueChange={(v) => {
                      const rules = [...(config.security_rules || [])]
                      rules[i] = { ...rules[i], protocol: v }
                      updateConfig('security_rules', rules)
                    }}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tcp">TCP</SelectItem>
                        <SelectItem value="Udp">UDP</SelectItem>
                        <SelectItem value="Icmp">ICMP</SelectItem>
                        <SelectItem value="*">Any</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <Input className="h-7 text-xs" placeholder="src: * or CIDR" value={rule.source_address_prefix || '*'} onChange={(e) => {
                      const rules = [...(config.security_rules || [])]
                      rules[i] = { ...rules[i], source_address_prefix: e.target.value }
                      updateConfig('security_rules', rules)
                    }} />
                    <Input className="h-7 text-xs" placeholder="dst: * or CIDR" value={rule.destination_address_prefix || '*'} onChange={(e) => {
                      const rules = [...(config.security_rules || [])]
                      rules[i] = { ...rules[i], destination_address_prefix: e.target.value }
                      updateConfig('security_rules', rules)
                    }} />
                    <Input className="h-7 text-xs" placeholder="src port: *" value={rule.source_port_range || '*'} onChange={(e) => {
                      const rules = [...(config.security_rules || [])]
                      rules[i] = { ...rules[i], source_port_range: e.target.value }
                      updateConfig('security_rules', rules)
                    }} />
                    <Input className="h-7 text-xs" placeholder="dst port: 80,443" value={rule.destination_port_range || '*'} onChange={(e) => {
                      const rules = [...(config.security_rules || [])]
                      rules[i] = { ...rules[i], destination_port_range: e.target.value }
                      updateConfig('security_rules', rules)
                    }} />
                  </div>
                </div>
              ))}
              <Button size="sm" variant="outline" className="w-full" onClick={() => {
                const rules = [...(config.security_rules || []), {
                  name: `rule-${(config.security_rules || []).length + 1}`,
                  priority: 100 + (config.security_rules || []).length * 10,
                  direction: 'Inbound', access: 'Allow', protocol: 'Tcp',
                  source_address_prefix: '*', destination_address_prefix: '*',
                  source_port_range: '*', destination_port_range: '80',
                }]
                updateConfig('security_rules', rules)
              }}>
                <Plus className="w-3 h-3 mr-1" /> Add Rule
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // ── Public IP ───────────────────────────────────────────────────────────
    if (componentInfo && componentInfo.id.includes('public-ip')) {
      return (
        <>
          <div className="space-y-2">
            <Label>Allocation Method</Label>
            <Select value={config.allocation_method || 'Static'} onValueChange={(v) => updateConfig('allocation_method', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Static">Static</SelectItem>
                <SelectItem value="Dynamic">Dynamic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>SKU</Label>
            <Select value={config.sku || 'Standard'} onValueChange={(v) => updateConfig('sku', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Basic">Basic (legacy)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>SKU Tier</Label>
            <Select value={config.sku_tier || 'Regional'} onValueChange={(v) => updateConfig('sku_tier', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Regional">Regional</SelectItem>
                <SelectItem value="Global">Global</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>IP Version</Label>
            <Select value={config.ip_version || 'IPv4'} onValueChange={(v) => updateConfig('ip_version', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IPv4">IPv4</SelectItem>
                <SelectItem value="IPv6">IPv6</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Availability Zones</Label>
            <Select value={config.zones || 'zone-redundant'} onValueChange={(v) => {
              const map: Record<string, string[]> = { 'zone-redundant': ['1', '2', '3'], '1': ['1'], '2': ['2'], '3': ['3'], 'none': [] }
              updateConfig('zones', map[v] ?? [])
              updateConfig('_zones_ui', v)
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="zone-redundant">Zone-Redundant (1, 2, 3)</SelectItem>
                <SelectItem value="1">Zone 1 only</SelectItem>
                <SelectItem value="2">Zone 2 only</SelectItem>
                <SelectItem value="3">Zone 3 only</SelectItem>
                <SelectItem value="none">No Zone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Idle Timeout (minutes, 4–30)</Label>
            <Input type="number" min={4} max={30} value={config.idle_timeout_in_minutes || 4}
              onChange={(e) => updateConfig('idle_timeout_in_minutes', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>DNS Label (optional)</Label>
            <Input placeholder="my-app" value={config.domain_name_label || ''}
              onChange={(e) => updateConfig('domain_name_label', e.target.value || undefined)} />
            <p className="text-xs text-muted-foreground">Results in: &lt;label&gt;.&lt;region&gt;.cloudapp.azure.com</p>
          </div>
          <div className="space-y-2">
            <Label>DDoS Protection Mode</Label>
            <Select value={config.ddos_protection_mode || 'VirtualNetworkInherited'} onValueChange={(v) => updateConfig('ddos_protection_mode', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VirtualNetworkInherited">VNet Inherited (default)</SelectItem>
                <SelectItem value="Disabled">Disabled</SelectItem>
                <SelectItem value="Enabled">Enabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )
    }

    // ── Route Table ─────────────────────────────────────────────────────────
    if (componentInfo && componentInfo.id.includes('route-table')) {
      return (
        <>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="disableBgp" checked={config.disable_bgp_route_propagation || false}
              onChange={(e) => updateConfig('disable_bgp_route_propagation', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="disableBgp" className="font-normal">Disable BGP Route Propagation</Label>
          </div>
          <div className="space-y-2">
            <Label>Routes</Label>
            {(config.routes || []).map((route: any, i: number) => (
              <div key={i} className="border rounded p-2 space-y-1.5">
                <div className="flex gap-1">
                  <Input className="h-7 text-xs" placeholder="route-name" value={route.name || ''} onChange={(e) => {
                    const routes = [...(config.routes || [])]
                    routes[i] = { ...routes[i], name: e.target.value }
                    updateConfig('routes', routes)
                  }} />
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => {
                    const routes = (config.routes || []).filter((_: any, idx: number) => idx !== i)
                    updateConfig('routes', routes)
                  }}><Trash2 className="w-3 h-3" /></Button>
                </div>
                <Input className="h-7 text-xs" placeholder="address prefix: 0.0.0.0/0" value={route.address_prefix || ''} onChange={(e) => {
                  const routes = [...(config.routes || [])]
                  routes[i] = { ...routes[i], address_prefix: e.target.value }
                  updateConfig('routes', routes)
                }} />
                <Select value={route.next_hop_type || 'VnetLocal'} onValueChange={(v) => {
                  const routes = [...(config.routes || [])]
                  routes[i] = { ...routes[i], next_hop_type: v }
                  updateConfig('routes', routes)
                }}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VnetLocal">VNet Local</SelectItem>
                    <SelectItem value="Internet">Internet</SelectItem>
                    <SelectItem value="VirtualAppliance">Virtual Appliance (NVA)</SelectItem>
                    <SelectItem value="VirtualNetworkGateway">VNet Gateway</SelectItem>
                    <SelectItem value="None">None (drop)</SelectItem>
                  </SelectContent>
                </Select>
                {route.next_hop_type === 'VirtualAppliance' && (
                  <Input className="h-7 text-xs" placeholder="next hop IP: 10.0.2.4" value={route.next_hop_in_ip_address || ''} onChange={(e) => {
                    const routes = [...(config.routes || [])]
                    routes[i] = { ...routes[i], next_hop_in_ip_address: e.target.value }
                    updateConfig('routes', routes)
                  }} />
                )}
              </div>
            ))}
            <Button size="sm" variant="outline" className="w-full" onClick={() => {
              const routes = [...(config.routes || []), { name: `route-${(config.routes || []).length + 1}`, address_prefix: '0.0.0.0/0', next_hop_type: 'Internet' }]
              updateConfig('routes', routes)
            }}>
              <Plus className="w-3 h-3 mr-1" /> Add Route
            </Button>
          </div>
        </>
      )
    }

    // ── NAT Gateway ─────────────────────────────────────────────────────────
    if (componentInfo && componentInfo.id.includes('nat-gateway')) {
      return (
        <>
          <div className="space-y-2">
            <Label>SKU</Label>
            <Select value={config.sku_name || 'Standard'} onValueChange={(v) => updateConfig('sku_name', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Idle Timeout (minutes, 4–120)</Label>
            <Input type="number" min={4} max={120} value={config.idle_timeout_in_minutes || 4}
              onChange={(e) => updateConfig('idle_timeout_in_minutes', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Availability Zone</Label>
            <Select value={config.zone || '__none__'} onValueChange={(v) => updateConfig('zone', v === '__none__' ? undefined : v)}>
              <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No preference</SelectItem>
                <SelectItem value="1">Zone 1</SelectItem>
                <SelectItem value="2">Zone 2</SelectItem>
                <SelectItem value="3">Zone 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )
    }

    // ── Load Balancer ───────────────────────────────────────────────────────
    if (componentInfo && (componentInfo.id.includes('lb') || componentInfo.id.includes('load-balancer'))) {
      return (
        <>
          <div className="space-y-2">
            <Label>SKU</Label>
            <Select value={config.sku || 'Standard'} onValueChange={(v) => updateConfig('sku', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Basic">Basic (legacy)</SelectItem>
                <SelectItem value="Gateway">Gateway</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>SKU Tier</Label>
            <Select value={config.sku_tier || 'Regional'} onValueChange={(v) => updateConfig('sku_tier', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Regional">Regional</SelectItem>
                <SelectItem value="Global">Global</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Frontend IP Allocation</Label>
            <Select value={config.frontend_ip_allocation || 'Dynamic'} onValueChange={(v) => updateConfig('frontend_ip_allocation', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Dynamic">Dynamic</SelectItem>
                <SelectItem value="Static">Static</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Frontend IP Type</Label>
            <Select value={config.frontend_ip_type || 'public'} onValueChange={(v) => updateConfig('frontend_ip_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public (Internet-facing)</SelectItem>
                <SelectItem value="private">Private (Internal)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )
    }

    // ── Application Gateway ─────────────────────────────────────────────────
    if (componentInfo && componentInfo.id.includes('app-gw')) {
      return (
        <>
          <div className="space-y-2">
            <Label>SKU Name</Label>
            <Select value={config.sku_name || 'Standard_v2'} onValueChange={(v) => updateConfig('sku_name', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard_v2">Standard v2</SelectItem>
                <SelectItem value="WAF_v2">WAF v2 (with firewall)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Capacity (0 = autoscale)</Label>
            <Input type="number" min={0} max={125} value={config.capacity ?? 2}
              onChange={(e) => updateConfig('capacity', parseInt(e.target.value))} />
          </div>
          {(config.capacity === 0 || config.capacity === '0') && (
            <>
              <div className="space-y-2">
                <Label>Autoscale Min Capacity</Label>
                <Input type="number" min={0} max={100} value={config.autoscale_min_capacity ?? 1}
                  onChange={(e) => updateConfig('autoscale_min_capacity', parseInt(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Autoscale Max Capacity</Label>
                <Input type="number" min={1} max={125} value={config.autoscale_max_capacity ?? 10}
                  onChange={(e) => updateConfig('autoscale_max_capacity', parseInt(e.target.value))} />
              </div>
            </>
          )}
          {config.sku_name === 'WAF_v2' && (
            <>
              <div className="space-y-2">
                <Label>WAF Mode</Label>
                <Select value={config.waf_mode || 'Detection'} onValueChange={(v) => updateConfig('waf_mode', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Detection">Detection (log only)</SelectItem>
                    <SelectItem value="Prevention">Prevention (block)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>WAF Rule Set Version</Label>
                <Select value={config.waf_rule_set_version || '3.2'} onValueChange={(v) => updateConfig('waf_rule_set_version', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3.2">OWASP 3.2 (recommended)</SelectItem>
                    <SelectItem value="3.1">OWASP 3.1</SelectItem>
                    <SelectItem value="3.0">OWASP 3.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label>Zones</Label>
            <Select value={config._zones_ui || 'zone-redundant'} onValueChange={(v) => {
              const map: Record<string, string[]> = { 'zone-redundant': ['1', '2', '3'], '1': ['1'], '2': ['2'], '3': ['3'], 'none': [] }
              updateConfig('zones', map[v] ?? [])
              updateConfig('_zones_ui', v)
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="zone-redundant">Zone-Redundant</SelectItem>
                <SelectItem value="1">Zone 1</SelectItem><SelectItem value="2">Zone 2</SelectItem>
                <SelectItem value="3">Zone 3</SelectItem>
                <SelectItem value="none">No Zone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )
    }

    // ── AKS ─────────────────────────────────────────────────────────────────
    if (componentInfo && componentInfo.id.includes('aks')) {
      return (
        <>
          <div className="space-y-2">
            <Label>DNS Prefix</Label>
            <Input placeholder="my-aks" value={config.dns_prefix || ''}
              onChange={(e) => updateConfig('dns_prefix', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Kubernetes Version</Label>
            <Select value={config.kubernetes_version || '1.31'} onValueChange={(v) => updateConfig('kubernetes_version', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1.31">1.31 (latest)</SelectItem>
                <SelectItem value="1.30">1.30</SelectItem>
                <SelectItem value="1.29">1.29</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>SKU Tier</Label>
            <Select value={config.sku_tier || 'Free'} onValueChange={(v) => updateConfig('sku_tier', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free (dev/test)</SelectItem>
                <SelectItem value="Standard">Standard (SLA 99.9%)</SelectItem>
                <SelectItem value="Premium">Premium (SLA 99.95%, LTS)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default Node Pool — VM Size</Label>
            <Input placeholder="Standard_D2s_v3" value={config.default_node_pool_vm_size || 'Standard_D2s_v3'}
              onChange={(e) => updateConfig('default_node_pool_vm_size', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Node Count</Label>
            <Input type="number" min={1} max={1000} value={config.node_count || 3}
              onChange={(e) => updateConfig('node_count', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Node Pool Zones</Label>
            <Select value={config._node_zones_ui || 'zone-redundant'} onValueChange={(v) => {
              const map: Record<string, string[]> = { 'zone-redundant': ['1', '2', '3'], '1': ['1'], '2': ['2'], '3': ['3'], 'none': [] }
              updateConfig('node_pool_zones', map[v] ?? [])
              updateConfig('_node_zones_ui', v)
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="zone-redundant">Zone-Redundant (1,2,3)</SelectItem>
                <SelectItem value="1">Zone 1</SelectItem><SelectItem value="2">Zone 2</SelectItem><SelectItem value="3">Zone 3</SelectItem>
                <SelectItem value="none">No Zone</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Max Pods per Node</Label>
            <Input type="number" min={10} max={250} value={config.max_pods || 110}
              onChange={(e) => updateConfig('max_pods', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>OS Disk Size (GB)</Label>
            <Input type="number" min={30} max={2048} value={config.os_disk_size_gb || 128}
              onChange={(e) => updateConfig('os_disk_size_gb', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Network Plugin</Label>
            <Select value={config.network_plugin || 'azure'} onValueChange={(v) => updateConfig('network_plugin', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="azure">Azure CNI (assign pod IPs from subnet)</SelectItem>
                <SelectItem value="kubenet">Kubenet (basic, NAT)</SelectItem>
                <SelectItem value="none">None (BYO CNI)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Network Policy</Label>
            <Select value={config.network_policy || 'azure'} onValueChange={(v) => updateConfig('network_policy', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="azure">Azure NPM</SelectItem>
                <SelectItem value="calico">Calico</SelectItem>
                <SelectItem value="cilium">Cilium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Identity Type</Label>
            <Select value={config.identity_type || 'SystemAssigned'} onValueChange={(v) => updateConfig('identity_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SystemAssigned">System Assigned</SelectItem>
                <SelectItem value="UserAssigned">User Assigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="oidcIssuer" checked={config.oidc_issuer_enabled || false}
              onChange={(e) => updateConfig('oidc_issuer_enabled', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="oidcIssuer" className="font-normal">OIDC Issuer Enabled (for Workload Identity)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="workloadIdentity" checked={config.workload_identity_enabled || false}
              onChange={(e) => updateConfig('workload_identity_enabled', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="workloadIdentity" className="font-normal">Workload Identity Enabled</Label>
          </div>
        </>
      )
    }

    // ── AWS Security Group ──────────────────────────────────────────────────
    if (id.includes('security-group') || id.includes('aws-sg')) {
      const ingressRules: Array<{ protocol: string; from_port: number; to_port: number; cidr_blocks: string; description: string }> =
        Array.isArray(config.ingress) ? config.ingress : []
      const egressRules: Array<{ protocol: string; from_port: number; to_port: number; cidr_blocks: string; description: string }> =
        Array.isArray(config.egress) ? config.egress : []
      const addRule = (direction: 'ingress' | 'egress') => {
        const newRule = { protocol: 'tcp', from_port: 443, to_port: 443, cidr_blocks: '0.0.0.0/0', description: '' }
        updateConfig(direction, [...(direction === 'ingress' ? ingressRules : egressRules), newRule])
      }
      const removeRule = (direction: 'ingress' | 'egress', idx: number) => {
        const rules = direction === 'ingress' ? ingressRules : egressRules
        updateConfig(direction, rules.filter((_, i) => i !== idx))
      }
      const updateRule = (direction: 'ingress' | 'egress', idx: number, field: string, value: string | number) => {
        const rules = [...(direction === 'ingress' ? ingressRules : egressRules)]
        rules[idx] = { ...rules[idx], [field]: value }
        updateConfig(direction, rules)
      }
      const renderRules = (direction: 'ingress' | 'egress', rules: typeof ingressRules) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium capitalize">{direction} Rules</Label>
            <button onClick={() => addRule(direction)} className="text-xs text-blue-600 hover:underline">+ Add rule</button>
          </div>
          {rules.map((r, i) => (
            <div key={i} className="border rounded p-2 space-y-1 text-xs">
              <div className="flex gap-1">
                <Select value={r.protocol} onValueChange={(v) => updateRule(direction, i, 'protocol', v)}>
                  <SelectTrigger className="h-7 text-xs flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tcp">TCP</SelectItem>
                    <SelectItem value="udp">UDP</SelectItem>
                    <SelectItem value="icmp">ICMP</SelectItem>
                    <SelectItem value="-1">All (-1)</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="h-7 w-16" type="number" placeholder="from" value={r.from_port}
                  onChange={(e) => updateRule(direction, i, 'from_port', parseInt(e.target.value) || 0)} />
                <Input className="h-7 w-16" type="number" placeholder="to" value={r.to_port}
                  onChange={(e) => updateRule(direction, i, 'to_port', parseInt(e.target.value) || 0)} />
              </div>
              <Input className="h-7" placeholder="CIDR (0.0.0.0/0)" value={r.cidr_blocks}
                onChange={(e) => updateRule(direction, i, 'cidr_blocks', e.target.value)} />
              <div className="flex gap-1">
                <Input className="h-7 flex-1" placeholder="description" value={r.description}
                  onChange={(e) => updateRule(direction, i, 'description', e.target.value)} />
                <button onClick={() => removeRule(direction, i)} className="text-red-500 hover:text-red-700 px-1">✕</button>
              </div>
            </div>
          ))}
        </div>
      )
      return (
        <>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input placeholder="My security group" value={config.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)} />
          </div>
          {renderRules('ingress', ingressRules)}
          {renderRules('egress', egressRules)}
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="sgRevoke" checked={config.revoke_rules_on_delete || false}
              onChange={(e) => updateConfig('revoke_rules_on_delete', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="sgRevoke" className="font-normal">Revoke rules before delete (avoid cyclic dependency)</Label>
          </div>
        </>
      )
    }

    // ── GCP Firewall ────────────────────────────────────────────────────────
    if (id.includes('gcp-firewall') || id.includes('gcp-fw')) {
      return (
        <>
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select value={config.direction || 'INGRESS'} onValueChange={(v) => updateConfig('direction', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INGRESS">INGRESS</SelectItem>
                <SelectItem value="EGRESS">EGRESS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority (1–65534; lower = higher priority)</Label>
            <Input type="number" min={1} max={65534} value={config.priority || 1000}
              onChange={(e) => updateConfig('priority', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Allowed Protocol:Port (e.g. tcp:443, icmp)</Label>
            <Input placeholder="tcp:22,tcp:443,icmp" value={config.allow_ports || ''}
              onChange={(e) => updateConfig('allow_ports', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Source Ranges (CIDR, INGRESS only)</Label>
            <Input placeholder="0.0.0.0/0, 10.0.0.0/8" value={config.source_ranges || ''}
              onChange={(e) => updateConfig('source_ranges', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Target Tags (comma-separated, empty = all instances)</Label>
            <Input placeholder="web-tier, app-tier" value={Array.isArray(config.target_tags) ? config.target_tags.join(', ') : (config.target_tags || '')}
              onChange={(e) => updateConfig('target_tags', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />
          </div>
          <div className="space-y-2">
            <Label>Source Tags (INGRESS only)</Label>
            <Input placeholder="app-tier" value={Array.isArray(config.source_tags) ? config.source_tags.join(', ') : (config.source_tags || '')}
              onChange={(e) => updateConfig('source_tags', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="gcpFwDisabled" checked={config.disabled || false}
              onChange={(e) => updateConfig('disabled', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="gcpFwDisabled" className="font-normal">Disabled (soft-disabled without deleting)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="gcpFwLog" checked={config.enable_logging || false}
              onChange={(e) => updateConfig('enable_logging', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="gcpFwLog" className="font-normal">Enable Firewall Logging</Label>
          </div>
        </>
      )
    }

    // ── AWS ALB / NLB / ELB ─────────────────────────────────────────────────
    if (id.includes('aws-alb') || id.includes('aws-nlb') || id.includes('aws-elb') || id.includes('aws-lb')) {
      const isNlb = id.includes('nlb')
      return (
        <>
          <div className="space-y-2">
            <Label>Scheme</Label>
            <Select value={config.internal ? 'internal' : 'internet-facing'} onValueChange={(v) => updateConfig('internal', v === 'internal')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="internet-facing">internet-facing (public)</SelectItem>
                <SelectItem value="internal">internal (private)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Load Balancer Type</Label>
            <Select value={config.load_balancer_type || (isNlb ? 'network' : 'application')}
              onValueChange={(v) => updateConfig('load_balancer_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="application">application (ALB)</SelectItem>
                <SelectItem value="network">network (NLB)</SelectItem>
                <SelectItem value="gateway">gateway (GWLB)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>IP Address Type</Label>
            <Select value={config.ip_address_type || 'ipv4'} onValueChange={(v) => updateConfig('ip_address_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ipv4">ipv4</SelectItem>
                <SelectItem value="dualstack">dualstack (IPv4+IPv6)</SelectItem>
                <SelectItem value="dualstack-without-public-ipv4">dualstack-without-public-ipv4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Idle Timeout (seconds, ALB only)</Label>
            <Input type="number" min={1} max={4000} value={config.idle_timeout || 60}
              onChange={(e) => updateConfig('idle_timeout', parseInt(e.target.value))} />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="lbDelProt" checked={config.enable_deletion_protection || false}
              onChange={(e) => updateConfig('enable_deletion_protection', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="lbDelProt" className="font-normal">Enable Deletion Protection</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="lbHttp2" checked={config.enable_http2 !== false}
              onChange={(e) => updateConfig('enable_http2', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="lbHttp2" className="font-normal">Enable HTTP/2 (ALB only)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="lbAccessLogs" checked={config.access_logs_enabled || false}
              onChange={(e) => updateConfig('access_logs_enabled', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="lbAccessLogs" className="font-normal">Enable Access Logs to S3</Label>
          </div>
          {config.access_logs_enabled && (
            <div className="space-y-2">
              <Label>Access Logs S3 Bucket</Label>
              <Input placeholder="my-alb-logs-bucket" value={config.access_logs_bucket || ''}
                onChange={(e) => updateConfig('access_logs_bucket', e.target.value)} />
            </div>
          )}
        </>
      )
    }

    // ── GCP Cloud Load Balancer ──────────────────────────────────────────────
    if (id.includes('gcp-cloud-lb') || id.includes('gcp-lb')) {
      return (
        <>
          <div className="space-y-2">
            <Label>Load Balancing Scheme</Label>
            <Select value={config.load_balancing_scheme || 'EXTERNAL_MANAGED'} onValueChange={(v) => updateConfig('load_balancing_scheme', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EXTERNAL_MANAGED">EXTERNAL_MANAGED (Global LB)</SelectItem>
                <SelectItem value="EXTERNAL">EXTERNAL (Classic)</SelectItem>
                <SelectItem value="INTERNAL_MANAGED">INTERNAL_MANAGED (Internal L7)</SelectItem>
                <SelectItem value="INTERNAL_SELF_MANAGED">INTERNAL_SELF_MANAGED (Traffic Director)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Protocol</Label>
            <Select value={config.protocol || 'HTTPS'} onValueChange={(v) => updateConfig('protocol', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HTTP">HTTP</SelectItem>
                <SelectItem value="HTTPS">HTTPS</SelectItem>
                <SelectItem value="HTTP2">HTTP/2</SelectItem>
                <SelectItem value="TCP">TCP</SelectItem>
                <SelectItem value="SSL">SSL</SelectItem>
                <SelectItem value="UDP">UDP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Port</Label>
            <Input type="number" min={1} max={65535} value={config.port || 443}
              onChange={(e) => updateConfig('port', parseInt(e.target.value))} />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="gcpCdn" checked={config.enable_cdn || false}
              onChange={(e) => updateConfig('enable_cdn', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="gcpCdn" className="font-normal">Enable Cloud CDN</Label>
          </div>
          {config.enable_cdn && (
            <div className="space-y-2">
              <Label>CDN Cache Mode</Label>
              <Select value={config.cdn_cache_mode || 'CACHE_ALL_STATIC'} onValueChange={(v) => updateConfig('cdn_cache_mode', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CACHE_ALL_STATIC">Cache All Static</SelectItem>
                  <SelectItem value="USE_ORIGIN_HEADERS">Use Origin Headers</SelectItem>
                  <SelectItem value="FORCE_CACHE_ALL">Force Cache All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="gcpLbLog" checked={config.enable_logging || false}
              onChange={(e) => updateConfig('enable_logging', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="gcpLbLog" className="font-normal">Enable Logging</Label>
          </div>
        </>
      )
    }

    return null
  }

  const renderStorageConfig = () => {
    const provider = componentInfo?.provider || 'azure'
    const id = componentInfo?.id || ''

    // ── AWS S3 ──────────────────────────────────────────────────────────────
    if (id.includes('aws-s3') || (provider === 'aws' && id.includes('s3'))) {
      return (
        <>
          <div className="space-y-2">
            <Label>Bucket Name (blank = auto-generated)</Label>
            <Input placeholder="my-app-bucket" value={config.bucket || ''}
              onChange={(e) => updateConfig('bucket', e.target.value || undefined)} />
          </div>
          <div className="space-y-2">
            <Label>ACL (legacy — use Bucket Policy instead)</Label>
            <Select value={config.acl || 'private'} onValueChange={(v) => updateConfig('acl', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private (recommended)</SelectItem>
                <SelectItem value="public-read">Public Read</SelectItem>
                <SelectItem value="authenticated-read">Authenticated Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Server-Side Encryption</Label>
            <Select value={config.sse_algorithm || 'AES256'} onValueChange={(v) => updateConfig('sse_algorithm', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AES256">AES-256 (S3-managed)</SelectItem>
                <SelectItem value="aws:kms">AWS KMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {config.sse_algorithm === 'aws:kms' && (
            <div className="space-y-2">
              <Label>KMS Key ID (blank = AWS-managed KMS)</Label>
              <Input placeholder="arn:aws:kms:us-east-1:..." value={config.kms_master_key_id || ''}
                onChange={(e) => updateConfig('kms_master_key_id', e.target.value || undefined)} />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="s3Version" checked={config.versioning || false}
              onChange={(e) => updateConfig('versioning', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="s3Version" className="font-normal">Enable Versioning</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="s3BlockAll" checked={config.block_public_acls !== false}
              onChange={(e) => updateConfig('block_public_acls', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="s3BlockAll" className="font-normal">Block All Public Access (recommended)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="s3WebHosting" checked={config.static_website_hosting || false}
              onChange={(e) => updateConfig('static_website_hosting', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="s3WebHosting" className="font-normal">Static Website Hosting</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="s3ForceDestroy" checked={config.force_destroy || false}
              onChange={(e) => updateConfig('force_destroy', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="s3ForceDestroy" className="font-normal">Force Destroy (delete non-empty bucket)</Label>
          </div>
        </>
      )
    }

    // ── GCP Cloud Storage ────────────────────────────────────────────────────
    if (id.includes('gcp-cloud-storage') || (provider === 'gcp' && id.includes('storage'))) {
      return (
        <>
          <div className="space-y-2">
            <Label>Location</Label>
            <Select value={config.location || 'US'} onValueChange={(v) => updateConfig('location', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="US">US (multi-region)</SelectItem>
                <SelectItem value="EU">EU (multi-region)</SelectItem>
                <SelectItem value="ASIA">ASIA (multi-region)</SelectItem>
                <SelectItem value="us-central1">us-central1 (Iowa)</SelectItem>
                <SelectItem value="us-east1">us-east1 (S. Carolina)</SelectItem>
                <SelectItem value="europe-west1">europe-west1 (Belgium)</SelectItem>
                <SelectItem value="europe-west4">europe-west4 (Netherlands)</SelectItem>
                <SelectItem value="asia-east1">asia-east1 (Taiwan)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Storage Class</Label>
            <Select value={config.storage_class || 'STANDARD'} onValueChange={(v) => updateConfig('storage_class', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="STANDARD">Standard (frequent access)</SelectItem>
                <SelectItem value="NEARLINE">Nearline (≥30 days, monthly access)</SelectItem>
                <SelectItem value="COLDLINE">Coldline (≥90 days, quarterly access)</SelectItem>
                <SelectItem value="ARCHIVE">Archive (≥365 days, rarely accessed)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="gcsVersioning" checked={config.versioning || false}
              onChange={(e) => updateConfig('versioning', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="gcsVersioning" className="font-normal">Enable Versioning</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="gcsUniform" checked={config.uniform_bucket_level_access !== false}
              onChange={(e) => updateConfig('uniform_bucket_level_access', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="gcsUniform" className="font-normal">Uniform Bucket-Level Access (recommended)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="gcsForceDel" checked={config.force_destroy || false}
              onChange={(e) => updateConfig('force_destroy', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="gcsForceDel" className="font-normal">Force Destroy (delete non-empty)</Label>
          </div>
          <div className="space-y-2">
            <Label>Retention Policy (days, 0 = none)</Label>
            <Input type="number" min={0} value={config.retention_policy_days || 0}
              onChange={(e) => updateConfig('retention_policy_days', parseInt(e.target.value) || undefined)} />
          </div>
        </>
      )
    }

    // ── GCP Persistent Disk ──────────────────────────────────────────────────
    if (id.includes('gcp-persistent-disk') || (provider === 'gcp' && id.includes('disk'))) {
      return (
        <>
          <div className="space-y-2">
            <Label>Disk Size (GB)</Label>
            <Input type="number" min={10} max={65536} value={config.size || 100}
              onChange={(e) => updateConfig('size', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Disk Type</Label>
            <Select value={config.type || 'pd-balanced'} onValueChange={(v) => updateConfig('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pd-standard">Standard (HDD)</SelectItem>
                <SelectItem value="pd-balanced">Balanced (SSD)</SelectItem>
                <SelectItem value="pd-ssd">SSD</SelectItem>
                <SelectItem value="pd-extreme">Extreme</SelectItem>
                <SelectItem value="hyperdisk-balanced">Hyperdisk Balanced</SelectItem>
                <SelectItem value="hyperdisk-extreme">Hyperdisk Extreme</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Zone</Label>
            <Input placeholder="us-central1-a" value={config.zone || ''}
              onChange={(e) => updateConfig('zone', e.target.value)} />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="gcpDiskDel" checked={config.allow_stopping_for_update !== false}
              onChange={(e) => updateConfig('allow_stopping_for_update', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="gcpDiskDel" className="font-normal">Allow Stopping for Update</Label>
          </div>
        </>
      )
    }

    // ── AWS EBS ──────────────────────────────────────────────────────────────
    if (id.includes('aws-ebs') || (provider === 'aws' && id.includes('disk'))) {
      return (
        <>
          <div className="space-y-2">
            <Label>Volume Size (GB)</Label>
            <Input type="number" min={1} max={65536} value={config.size || 20}
              onChange={(e) => updateConfig('size', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Volume Type</Label>
            <Select value={config.type || 'gp3'} onValueChange={(v) => updateConfig('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gp3">gp3 — General Purpose SSD (recommended)</SelectItem>
                <SelectItem value="gp2">gp2 — General Purpose SSD (legacy)</SelectItem>
                <SelectItem value="io1">io1 — Provisioned IOPS SSD</SelectItem>
                <SelectItem value="io2">io2 — Provisioned IOPS SSD (durable)</SelectItem>
                <SelectItem value="st1">st1 — Throughput Optimized HDD</SelectItem>
                <SelectItem value="sc1">sc1 — Cold HDD</SelectItem>
                <SelectItem value="standard">standard — Magnetic (legacy)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(config.type === 'io1' || config.type === 'io2') && (
            <div className="space-y-2">
              <Label>IOPS</Label>
              <Input type="number" min={100} max={64000} value={config.iops || 3000}
                onChange={(e) => updateConfig('iops', parseInt(e.target.value))} />
            </div>
          )}
          {config.type === 'gp3' && (
            <div className="space-y-2">
              <Label>Throughput (MB/s, optional override)</Label>
              <Input type="number" min={125} max={1000} value={config.throughput || 125}
                onChange={(e) => updateConfig('throughput', parseInt(e.target.value))} />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="ebsEncrypt" checked={config.encrypted !== false}
              onChange={(e) => updateConfig('encrypted', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="ebsEncrypt" className="font-normal">Encrypted</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="ebsDeleteOnTerm" checked={config.delete_on_termination !== false}
              onChange={(e) => updateConfig('delete_on_termination', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="ebsDeleteOnTerm" className="font-normal">Delete on Termination</Label>
          </div>
        </>
      )
    }

    // ── Azure Storage (default) ──────────────────────────────────────────────
    return (
      <>
        <div className="space-y-2">
          <Label>Size (GB)</Label>
          <Input type="number" min={1} max={65536} value={config.size || 100}
            onChange={(e) => updateConfig('size', parseInt(e.target.value))} />
        </div>
        {componentInfo && id.includes('storage') && (
          <>
            <div className="space-y-2">
              <Label>Account Kind</Label>
              <Select value={config.account_kind || 'StorageV2'} onValueChange={(v) => updateConfig('account_kind', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="StorageV2">StorageV2 (general purpose v2)</SelectItem>
                  <SelectItem value="Storage">Storage (general purpose v1)</SelectItem>
                  <SelectItem value="BlobStorage">Blob Storage</SelectItem>
                  <SelectItem value="BlockBlobStorage">Block Blob Storage (premium)</SelectItem>
                  <SelectItem value="FileStorage">File Storage (premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Account Tier</Label>
              <Select value={config.accountTier || 'Standard'} onValueChange={(v) => updateConfig('accountTier', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Replication Type</Label>
              <Select value={config.replicationType || 'LRS'} onValueChange={(v) => updateConfig('replicationType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LRS">LRS (Locally Redundant)</SelectItem>
                  <SelectItem value="GRS">GRS (Geo-Redundant)</SelectItem>
                  <SelectItem value="RAGRS">RA-GRS (Read-Access Geo-Redundant)</SelectItem>
                  <SelectItem value="ZRS">ZRS (Zone-Redundant)</SelectItem>
                  <SelectItem value="GZRS">GZRS (Geo-Zone-Redundant)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Access Tier</Label>
              <Select value={config.access_tier || 'Hot'} onValueChange={(v) => updateConfig('access_tier', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hot">Hot (frequent access)</SelectItem>
                  <SelectItem value="Cool">Cool (infrequent, ≥30 days)</SelectItem>
                  <SelectItem value="Cold">Cold (rare, ≥90 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Minimum TLS Version</Label>
              <Select value={config.min_tls_version || 'TLS1_2'} onValueChange={(v) => updateConfig('min_tls_version', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TLS1_2">TLS 1.2 (recommended)</SelectItem>
                  <SelectItem value="TLS1_0">TLS 1.0 (legacy)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="blobHttps" checked={config.enable_https_traffic_only !== false}
                onChange={(e) => updateConfig('enable_https_traffic_only', e.target.checked)} className="w-4 h-4" />
              <Label htmlFor="blobHttps" className="font-normal">HTTPS Traffic Only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="blobSoftDelete" checked={config.blob_soft_delete_enabled || false}
                onChange={(e) => updateConfig('blob_soft_delete_enabled', e.target.checked)} className="w-4 h-4" />
              <Label htmlFor="blobSoftDelete" className="font-normal">Blob Soft Delete</Label>
            </div>
            {config.blob_soft_delete_enabled && (
              <div className="space-y-2">
                <Label>Soft Delete Retention Days</Label>
                <Input type="number" min={1} max={365} value={config.blob_soft_delete_days || 7}
                  onChange={(e) => updateConfig('blob_soft_delete_days', parseInt(e.target.value))} />
              </div>
            )}
          </>
        )}
        {componentInfo && id.includes('disk') && (
          <div className="space-y-2">
            <Label>Disk SKU</Label>
            <Select value={config.sku || 'Premium_LRS'} onValueChange={(v) => updateConfig('sku', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard_LRS">Standard HDD</SelectItem>
                <SelectItem value="StandardSSD_LRS">Standard SSD</SelectItem>
                <SelectItem value="Premium_LRS">Premium SSD</SelectItem>
                <SelectItem value="UltraSSD_LRS">Ultra SSD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </>
    )
  }

  const renderDatabaseConfig = () => {
    const provider = componentInfo?.provider || 'azure'
    const id = componentInfo?.id || ''

    // ── AWS RDS ──────────────────────────────────────────────────────────────
    if (provider === 'aws' || id.includes('aws-rds')) {
      return (
        <>
          <div className="space-y-2">
            <Label>Database Engine</Label>
            <Select value={config.engine || 'mysql'} onValueChange={(v) => updateConfig('engine', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="postgres">PostgreSQL</SelectItem>
                <SelectItem value="mariadb">MariaDB</SelectItem>
                <SelectItem value="aurora-mysql">Aurora MySQL (Serverless-capable)</SelectItem>
                <SelectItem value="aurora-postgresql">Aurora PostgreSQL (Serverless-capable)</SelectItem>
                <SelectItem value="sqlserver-se">SQL Server SE</SelectItem>
                <SelectItem value="sqlserver-ee">SQL Server EE</SelectItem>
                <SelectItem value="oracle-se2">Oracle SE2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Engine Version</Label>
            <Input placeholder="8.0.35 / 15.5 / 3.04.1" value={config.engine_version || ''}
              onChange={(e) => updateConfig('engine_version', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Instance Class</Label>
            <Select value={config.instance_class || 'db.t3.micro'} onValueChange={(v) => updateConfig('instance_class', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="db.t3.micro">db.t3.micro (1 vCPU, 1 GB)</SelectItem>
                <SelectItem value="db.t3.small">db.t3.small (2 vCPU, 2 GB)</SelectItem>
                <SelectItem value="db.t3.medium">db.t3.medium (2 vCPU, 4 GB)</SelectItem>
                <SelectItem value="db.t3.large">db.t3.large (2 vCPU, 8 GB)</SelectItem>
                <SelectItem value="db.m5.large">db.m5.large (2 vCPU, 8 GB)</SelectItem>
                <SelectItem value="db.m5.xlarge">db.m5.xlarge (4 vCPU, 16 GB)</SelectItem>
                <SelectItem value="db.m5.2xlarge">db.m5.2xlarge (8 vCPU, 32 GB)</SelectItem>
                <SelectItem value="db.r5.large">db.r5.large (2 vCPU, 16 GB)</SelectItem>
                <SelectItem value="db.r5.xlarge">db.r5.xlarge (4 vCPU, 32 GB)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Allocated Storage (GB)</Label>
            <Input type="number" min={20} max={65536} value={config.allocated_storage || 20}
              onChange={(e) => updateConfig('allocated_storage', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Storage Type</Label>
            <Select value={config.storage_type || 'gp3'} onValueChange={(v) => updateConfig('storage_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gp3">gp3 (General Purpose SSD, recommended)</SelectItem>
                <SelectItem value="gp2">gp2 (General Purpose SSD)</SelectItem>
                <SelectItem value="io1">io1 (Provisioned IOPS)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Backup Retention (days)</Label>
            <Input type="number" min={0} max={35} value={config.backup_retention_period || 7}
              onChange={(e) => updateConfig('backup_retention_period', parseInt(e.target.value))} />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="rdsMultiAZ" checked={config.multi_az || false}
              onChange={(e) => updateConfig('multi_az', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="rdsMultiAZ" className="font-normal">Multi-AZ Deployment (HA with standby)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="rdsEncrypt" checked={config.storage_encrypted !== false}
              onChange={(e) => updateConfig('storage_encrypted', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="rdsEncrypt" className="font-normal">Storage Encrypted</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="rdsPublic" checked={config.publicly_accessible || false}
              onChange={(e) => updateConfig('publicly_accessible', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="rdsPublic" className="font-normal">Publicly Accessible</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="rdsDeletionProt" checked={config.deletion_protection || false}
              onChange={(e) => updateConfig('deletion_protection', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="rdsDeletionProt" className="font-normal">Deletion Protection</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="rdsAutoUpgrade" checked={config.auto_minor_version_upgrade !== false}
              onChange={(e) => updateConfig('auto_minor_version_upgrade', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="rdsAutoUpgrade" className="font-normal">Auto Minor Version Upgrade</Label>
          </div>
        </>
      )
    }

    // ── GCP Cloud SQL ────────────────────────────────────────────────────────
    if (provider === 'gcp' || id.includes('gcp-cloud-sql')) {
      return (
        <>
          <div className="space-y-2">
            <Label>Database Version</Label>
            <Select value={config.database_version || 'POSTGRES_15'} onValueChange={(v) => updateConfig('database_version', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="POSTGRES_16">PostgreSQL 16</SelectItem>
                <SelectItem value="POSTGRES_15">PostgreSQL 15</SelectItem>
                <SelectItem value="POSTGRES_14">PostgreSQL 14</SelectItem>
                <SelectItem value="MYSQL_8_0">MySQL 8.0</SelectItem>
                <SelectItem value="MYSQL_5_7">MySQL 5.7</SelectItem>
                <SelectItem value="SQLSERVER_2022_STANDARD">SQL Server 2022 Standard</SelectItem>
                <SelectItem value="SQLSERVER_2022_ENTERPRISE">SQL Server 2022 Enterprise</SelectItem>
                <SelectItem value="SQLSERVER_2019_STANDARD">SQL Server 2019 Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Machine Tier</Label>
            <Select value={config.tier || 'db-f1-micro'} onValueChange={(v) => updateConfig('tier', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="db-f1-micro">db-f1-micro (shared, dev only)</SelectItem>
                <SelectItem value="db-g1-small">db-g1-small (shared)</SelectItem>
                <SelectItem value="db-n1-standard-1">db-n1-standard-1 (1 vCPU, 3.75 GB)</SelectItem>
                <SelectItem value="db-n1-standard-2">db-n1-standard-2 (2 vCPU, 7.5 GB)</SelectItem>
                <SelectItem value="db-n1-standard-4">db-n1-standard-4 (4 vCPU, 15 GB)</SelectItem>
                <SelectItem value="db-n1-highmem-2">db-n1-highmem-2 (2 vCPU, 13 GB)</SelectItem>
                <SelectItem value="db-n1-highmem-4">db-n1-highmem-4 (4 vCPU, 26 GB)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Availability Type</Label>
            <Select value={config.availability_type || 'ZONAL'} onValueChange={(v) => updateConfig('availability_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ZONAL">Zonal (single AZ, lower cost)</SelectItem>
                <SelectItem value="REGIONAL">Regional (HA — automatic failover)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Disk Size (GB)</Label>
            <Input type="number" min={10} max={65536} value={config.disk_size || 10}
              onChange={(e) => updateConfig('disk_size', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Disk Type</Label>
            <Select value={config.disk_type || 'PD_SSD'} onValueChange={(v) => updateConfig('disk_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PD_SSD">PD SSD (recommended)</SelectItem>
                <SelectItem value="PD_HDD">PD HDD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="csqlAutoResize" checked={config.disk_autoresize !== false}
              onChange={(e) => updateConfig('disk_autoresize', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="csqlAutoResize" className="font-normal">Disk Auto-Resize</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="csqlBackup" checked={config.backup_configuration_enabled !== false}
              onChange={(e) => updateConfig('backup_configuration_enabled', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="csqlBackup" className="font-normal">Automated Backups</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="csqlDelProt" checked={config.deletion_protection || false}
              onChange={(e) => updateConfig('deletion_protection', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="csqlDelProt" className="font-normal">Deletion Protection</Label>
          </div>
        </>
      )
    }

    // ── Azure SQL (default) ──────────────────────────────────────────────────
    return (
      <>
        <div className="space-y-2">
          <Label>SKU / Tier</Label>
          <Select value={config.sku || 'GP_Gen5_2'} onValueChange={(v) => updateConfig('sku', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Basic">Basic (5 DTU)</SelectItem>
              <SelectItem value="S0">S0 - Standard (10 DTU)</SelectItem>
              <SelectItem value="S1">S1 - Standard (20 DTU)</SelectItem>
              <SelectItem value="S2">S2 - Standard (50 DTU)</SelectItem>
              <SelectItem value="P1">P1 - Premium (125 DTU)</SelectItem>
              <SelectItem value="P2">P2 - Premium (250 DTU)</SelectItem>
              <SelectItem value="GP_Gen5_2">General Purpose Gen5 2vCores</SelectItem>
              <SelectItem value="GP_Gen5_4">General Purpose Gen5 4vCores</SelectItem>
              <SelectItem value="BC_Gen5_2">Business Critical Gen5 2vCores</SelectItem>
              <SelectItem value="HS_Gen5_2">Hyperscale Gen5 2vCores</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Max Size (GB)</Label>
          <Input type="number" value={config.maxSizeGb || 50}
            onChange={(e) => updateConfig('maxSizeGb', parseInt(e.target.value))} />
        </div>
        <div className="space-y-2">
          <Label>Collation</Label>
          <Input placeholder="SQL_Latin1_General_CP1_CI_AS" value={config.collation || ''}
            onChange={(e) => updateConfig('collation', e.target.value || undefined)} />
        </div>
        <div className="space-y-2">
          <Label>Backup Retention (days)</Label>
          <Input type="number" min={1} max={35} value={config.backupRetentionDays || 7}
            onChange={(e) => updateConfig('backupRetentionDays', parseInt(e.target.value))} />
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="sqlZoneRedundant" checked={config.zone_redundant || false}
            onChange={(e) => updateConfig('zone_redundant', e.target.checked)} className="w-4 h-4" />
          <Label htmlFor="sqlZoneRedundant" className="font-normal">Zone Redundant (Premium/Business Critical only)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="sqlReadScale" checked={config.read_scale || false}
            onChange={(e) => updateConfig('read_scale', e.target.checked)} className="w-4 h-4" />
          <Label htmlFor="sqlReadScale" className="font-normal">Read Scale-Out (Premium/BC only)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="sqlGeoBackup" checked={config.geo_backup_enabled !== false}
            onChange={(e) => updateConfig('geo_backup_enabled', e.target.checked)} className="w-4 h-4" />
          <Label htmlFor="sqlGeoBackup" className="font-normal">Geo-Redundant Backup</Label>
        </div>
      </>
    )
  }

  const renderAppServiceConfig = () => {
    const id = componentInfo?.id || ''

    // ── AWS Lambda ────────────────────────────────────────────────────────────
    if (id.includes('aws-lambda') || id.includes('lambda')) {
      return (
        <>
          <div className="space-y-2">
            <Label>Runtime</Label>
            <Select value={config.runtime || 'nodejs20.x'} onValueChange={(v) => updateConfig('runtime', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nodejs20.x">Node.js 20.x</SelectItem>
                <SelectItem value="nodejs18.x">Node.js 18.x</SelectItem>
                <SelectItem value="python3.12">Python 3.12</SelectItem>
                <SelectItem value="python3.11">Python 3.11</SelectItem>
                <SelectItem value="python3.10">Python 3.10</SelectItem>
                <SelectItem value="java21">Java 21</SelectItem>
                <SelectItem value="java17">Java 17</SelectItem>
                <SelectItem value="go1.x">Go 1.x</SelectItem>
                <SelectItem value="dotnet8">dotnet 8</SelectItem>
                <SelectItem value="provided.al2023">Custom Runtime (AL2023)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Handler</Label>
            <Input placeholder="index.handler" value={config.handler || 'index.handler'}
              onChange={(e) => updateConfig('handler', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Memory Size (MB)</Label>
            <Select value={String(config.memory_size || 128)} onValueChange={(v) => updateConfig('memory_size', parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[128, 256, 512, 1024, 2048, 4096, 8192, 10240].map(m => (
                  <SelectItem key={m} value={String(m)}>{m} MB</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timeout (seconds)</Label>
            <Input type="number" min={1} max={900} value={config.timeout || 30}
              onChange={(e) => updateConfig('timeout', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Architecture</Label>
            <Select value={config.architectures || 'x86_64'} onValueChange={(v) => updateConfig('architectures', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="x86_64">x86_64</SelectItem>
                <SelectItem value="arm64">arm64 (Graviton2 — ~20% cheaper)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reserved Concurrency (-1 = unreserved)</Label>
            <Input type="number" min={-1} value={config.reserved_concurrent_executions ?? -1}
              onChange={(e) => updateConfig('reserved_concurrent_executions', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Ephemeral Storage /tmp (MB)</Label>
            <Input type="number" min={512} max={10240} value={config.ephemeral_storage_size || 512}
              onChange={(e) => updateConfig('ephemeral_storage_size', parseInt(e.target.value))} />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="lambdaSnapStart" checked={config.snap_start || false}
              onChange={(e) => updateConfig('snap_start', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="lambdaSnapStart" className="font-normal">SnapStart (Java only — fast cold starts)</Label>
          </div>
        </>
      )
    }

    // ── AWS ECS ────────────────────────────────────────────────────────────────
    if (id.includes('aws-ecs')) {
      return (
        <>
          <div className="space-y-2">
            <Label>Launch Type</Label>
            <Select value={config.launch_type || 'FARGATE'} onValueChange={(v) => updateConfig('launch_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FARGATE">Fargate (serverless, no EC2 managed)</SelectItem>
                <SelectItem value="EC2">EC2 (self-managed cluster)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Task CPU (vCPU units)</Label>
            <Select value={String(config.task_cpu || 256)} onValueChange={(v) => updateConfig('task_cpu', parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="256">0.25 vCPU (256)</SelectItem>
                <SelectItem value="512">0.5 vCPU (512)</SelectItem>
                <SelectItem value="1024">1 vCPU (1024)</SelectItem>
                <SelectItem value="2048">2 vCPU (2048)</SelectItem>
                <SelectItem value="4096">4 vCPU (4096)</SelectItem>
                <SelectItem value="8192">8 vCPU (8192)</SelectItem>
                <SelectItem value="16384">16 vCPU (16384)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Task Memory (MB)</Label>
            <Select value={String(config.task_memory || 512)} onValueChange={(v) => updateConfig('task_memory', parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[512, 1024, 2048, 4096, 8192, 16384, 30720].map(m => (
                  <SelectItem key={m} value={String(m)}>{m} MB</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Desired Count (running tasks)</Label>
            <Input type="number" min={0} max={5000} value={config.desired_count || 1}
              onChange={(e) => updateConfig('desired_count', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Network Mode</Label>
            <Select value={config.network_mode || 'awsvpc'} onValueChange={(v) => updateConfig('network_mode', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="awsvpc">awsvpc (required for Fargate)</SelectItem>
                <SelectItem value="bridge">bridge (EC2 only)</SelectItem>
                <SelectItem value="host">host (EC2 only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="ecsCapSpot" checked={config.capacity_provider === 'FARGATE_SPOT'}
              onChange={(e) => updateConfig('capacity_provider', e.target.checked ? 'FARGATE_SPOT' : 'FARGATE')} className="w-4 h-4" />
            <Label htmlFor="ecsCapSpot" className="font-normal">Use Fargate Spot (up to 70% cheaper, interruptible)</Label>
          </div>
        </>
      )
    }

    // ── GCP Cloud Run ─────────────────────────────────────────────────────────
    if (id.includes('gcp-cloud-run')) {
      return (
        <>
          <div className="space-y-2">
            <Label>Container Image URL</Label>
            <Input placeholder="us-docker.pkg.dev/project/repo/image:tag" value={config.image || ''}
              onChange={(e) => updateConfig('image', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Region</Label>
            <Input placeholder="us-central1" value={config.location || ''}
              onChange={(e) => updateConfig('location', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>CPU (vCPU)</Label>
            <Select value={config.cpu || '1'} onValueChange={(v) => updateConfig('cpu', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 vCPU</SelectItem>
                <SelectItem value="2">2 vCPU</SelectItem>
                <SelectItem value="4">4 vCPU</SelectItem>
                <SelectItem value="8">8 vCPU</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Memory</Label>
            <Select value={config.memory || '512Mi'} onValueChange={(v) => updateConfig('memory', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['256Mi', '512Mi', '1Gi', '2Gi', '4Gi', '8Gi', '16Gi', '32Gi'].map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Min Instances</Label>
            <Input type="number" min={0} max={1000} value={config.min_instance_count ?? 0}
              onChange={(e) => updateConfig('min_instance_count', parseInt(e.target.value))} />
            <p className="text-xs text-muted-foreground">Set &gt;0 to prevent cold starts (incurs cost)</p>
          </div>
          <div className="space-y-2">
            <Label>Max Instances</Label>
            <Input type="number" min={1} max={1000} value={config.max_instance_count || 100}
              onChange={(e) => updateConfig('max_instance_count', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Concurrency (requests per instance)</Label>
            <Input type="number" min={1} max={1000} value={config.container_concurrency || 80}
              onChange={(e) => updateConfig('container_concurrency', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Timeout (seconds)</Label>
            <Input type="number" min={1} max={3600} value={config.timeout_seconds || 300}
              onChange={(e) => updateConfig('timeout_seconds', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Ingress</Label>
            <Select value={config.ingress || 'INGRESS_TRAFFIC_ALL'} onValueChange={(v) => updateConfig('ingress', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INGRESS_TRAFFIC_ALL">All (public internet)</SelectItem>
                <SelectItem value="INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER">Load Balancer only</SelectItem>
                <SelectItem value="INGRESS_TRAFFIC_INTERNAL_ONLY">Internal only (VPC)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )
    }

    // ── GCP Cloud Functions ────────────────────────────────────────────────────
    if (id.includes('gcp-cloud-functions')) {
      return (
        <>
          <div className="space-y-2">
            <Label>Runtime</Label>
            <Select value={config.runtime || 'nodejs20'} onValueChange={(v) => updateConfig('runtime', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="nodejs20">Node.js 20</SelectItem>
                <SelectItem value="nodejs18">Node.js 18</SelectItem>
                <SelectItem value="python312">Python 3.12</SelectItem>
                <SelectItem value="python311">Python 3.11</SelectItem>
                <SelectItem value="python310">Python 3.10</SelectItem>
                <SelectItem value="go122">Go 1.22</SelectItem>
                <SelectItem value="java21">Java 21</SelectItem>
                <SelectItem value="dotnet8">dotnet 8</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Entry Point</Label>
            <Input placeholder="helloWorld" value={config.entry_point || ''}
              onChange={(e) => updateConfig('entry_point', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Available Memory</Label>
            <Select value={config.available_memory || '256M'} onValueChange={(v) => updateConfig('available_memory', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['128M', '256M', '512M', '1Gi', '2Gi', '4Gi', '8Gi', '16Gi', '32Gi'].map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timeout (seconds)</Label>
            <Input type="number" min={1} max={3600} value={config.timeout || 60}
              onChange={(e) => updateConfig('timeout', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Trigger Type</Label>
            <Select value={config.trigger_type || 'http'} onValueChange={(v) => updateConfig('trigger_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="http">HTTP (HTTPS endpoint)</SelectItem>
                <SelectItem value="pubsub">Pub/Sub</SelectItem>
                <SelectItem value="storage">Cloud Storage (object event)</SelectItem>
                <SelectItem value="firestore">Firestore event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Min Instances</Label>
            <Input type="number" min={0} value={config.min_instance_count ?? 0}
              onChange={(e) => updateConfig('min_instance_count', parseInt(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Max Instances</Label>
            <Input type="number" min={1} value={config.max_instance_count || 100}
              onChange={(e) => updateConfig('max_instance_count', parseInt(e.target.value))} />
          </div>
        </>
      )
    }

    // ── Azure App Service / Functions (default) ─────────────────────────────────
    return (
      <>
        <div className="space-y-2">
          <Label>SKU</Label>
          <Select value={config.sku || 'B1'} onValueChange={(v) => updateConfig('sku', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="F1">F1 - Free</SelectItem>
              <SelectItem value="B1">B1 - Basic</SelectItem>
              <SelectItem value="B2">B2 - Basic (2 cores)</SelectItem>
              <SelectItem value="S1">S1 - Standard</SelectItem>
              <SelectItem value="S2">S2 - Standard (2 cores)</SelectItem>
              <SelectItem value="P1v3">P1v3 - Premium v3</SelectItem>
              <SelectItem value="P2v3">P2v3 - Premium v3 (2 cores)</SelectItem>
              <SelectItem value="P3v3">P3v3 - Premium v3 (4 cores)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Runtime</Label>
          <Select value={config.runtime || ''} onValueChange={(v) => updateConfig('runtime', v)}>
            <SelectTrigger><SelectValue placeholder="Select runtime" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NODE:20-lts">Node.js 20 LTS</SelectItem>
              <SelectItem value="NODE:18-lts">Node.js 18 LTS</SelectItem>
              <SelectItem value="PYTHON:3.12">Python 3.12</SelectItem>
              <SelectItem value="PYTHON:3.11">Python 3.11</SelectItem>
              <SelectItem value="DOTNETCORE:8.0">dotnet 8.0</SelectItem>
              <SelectItem value="DOTNETCORE:7.0">dotnet 7.0</SelectItem>
              <SelectItem value="JAVA:17-java17">Java 17</SelectItem>
              <SelectItem value="PHP:8.2">PHP 8.2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="alwaysOn" checked={config.alwaysOn !== false}
            onChange={(e) => updateConfig('alwaysOn', e.target.checked)} className="w-4 h-4" />
          <Label htmlFor="alwaysOn">Always On</Label>
        </div>
      </>
    )
  }

  const renderGenericConfig = () => (
    <div className="space-y-2">
      <Label>Replicas</Label>
      <Input type="number" min={1} max={100} value={config.replicas || 1} onChange={(e) => updateConfig('replicas', parseInt(e.target.value))} />
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // CI/CD & Third-Party Tool Config Renderers
  // ─────────────────────────────────────────────────────────────────────────

  const renderGitHubActionsConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Trigger Events</Label>
        {['push', 'pull_request', 'schedule', 'workflow_dispatch'].map(t => (
          <div key={t} className="flex items-center gap-2">
            <input type="checkbox" id={`trigger-${t}`}
              checked={(config.triggers || ['push', 'pull_request']).includes(t)}
              onChange={(e) => {
                const cur = config.triggers || ['push', 'pull_request']
                updateConfig('triggers', e.target.checked ? [...cur, t] : cur.filter((x: string) => x !== t))
              }} className="w-4 h-4" />
            <Label htmlFor={`trigger-${t}`} className="font-normal capitalize">{t.replace(/_/g, ' ')}</Label>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Protected Branches (comma-separated)</Label>
        <Input placeholder="main, develop" value={(config.branches || ['main']).join(', ')}
          onChange={(e) => updateConfig('branches', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} />
      </div>
      <div className="space-y-2">
        <Label>Runner</Label>
        <Select value={config.runsOn || 'ubuntu-latest'} onValueChange={(v) => updateConfig('runsOn', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ubuntu-latest">ubuntu-latest</SelectItem>
            <SelectItem value="ubuntu-22.04">ubuntu-22.04</SelectItem>
            <SelectItem value="windows-latest">windows-latest</SelectItem>
            <SelectItem value="macos-latest">macos-latest</SelectItem>
            <SelectItem value="self-hosted">self-hosted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Node.js Version</Label>
        <Select value={config.nodeVersion || '20'} onValueChange={(v) => updateConfig('nodeVersion', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="20">20 LTS</SelectItem>
            <SelectItem value="18">18 LTS</SelectItem>
            <SelectItem value="16">16</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Deploy Target</Label>
        <Select value={config.deployTarget || 'kubernetes'} onValueChange={(v) => updateConfig('deployTarget', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="kubernetes">Kubernetes</SelectItem>
            <SelectItem value="ecs">AWS ECS</SelectItem>
            <SelectItem value="appservice">Azure App Service</SelectItem>
            <SelectItem value="lambda">AWS Lambda</SelectItem>
            <SelectItem value="custom">Custom Script</SelectItem>
            <SelectItem value="none">None (build only)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  const renderGitLabCIConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Default Branch</Label>
        <Input placeholder="main" value={(config.branches || ['main'])[0]}
          onChange={(e) => updateConfig('branches', [e.target.value, ...((config.branches || ['main']).slice(1))])} />
      </div>
      <div className="space-y-2">
        <Label>Runner Type</Label>
        <Select value={config.runsOn || 'docker'} onValueChange={(v) => updateConfig('runsOn', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="docker">docker</SelectItem>
            <SelectItem value="shell">shell</SelectItem>
            <SelectItem value="kubernetes">kubernetes</SelectItem>
            <SelectItem value="self-hosted">self-hosted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Deploy Target</Label>
        <Select value={config.deployTarget || 'kubernetes'} onValueChange={(v) => updateConfig('deployTarget', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="kubernetes">Kubernetes</SelectItem>
            <SelectItem value="ecs">AWS ECS</SelectItem>
            <SelectItem value="appservice">Azure App Service</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  const renderArgoCDConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Git Repository URL</Label>
        <Input placeholder="https://github.com/org/repo" value={config.repoUrl || ''}
          onChange={(e) => updateConfig('repoUrl', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Target Revision</Label>
        <Input placeholder="HEAD" value={config.targetRevision || 'HEAD'}
          onChange={(e) => updateConfig('targetRevision', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Destination Namespace</Label>
        <Input placeholder="default" value={config.destinationNamespace || 'default'}
          onChange={(e) => updateConfig('destinationNamespace', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Sync Policy</Label>
        <Select value={config.syncPolicy || 'automated'} onValueChange={(v) => updateConfig('syncPolicy', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="automated">Automated (GitOps)</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {config.syncPolicy !== 'manual' && (
        <>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="selfHeal" checked={config.selfHeal !== false}
              onChange={(e) => updateConfig('selfHeal', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="selfHeal" className="font-normal">Self-heal (auto-revert drift)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="prune" checked={config.prune !== false}
              onChange={(e) => updateConfig('prune', e.target.checked)} className="w-4 h-4" />
            <Label htmlFor="prune" className="font-normal">Prune deleted resources</Label>
          </div>
        </>
      )}
    </>
  )

  const renderHelmConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Chart Name</Label>
        <Input placeholder="my-app" value={config.chartName || ''}
          onChange={(e) => updateConfig('chartName', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Image Repository</Label>
        <Input placeholder="my-registry/my-app" value={config.imageRepository || ''}
          onChange={(e) => updateConfig('imageRepository', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Image Tag</Label>
        <Input placeholder="latest" value={config.imageTag || 'latest'}
          onChange={(e) => updateConfig('imageTag', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Replica Count</Label>
        <Input type="number" min={1} max={50} value={config.replicaCount || 1}
          onChange={(e) => updateConfig('replicaCount', parseInt(e.target.value))} />
      </div>
      <div className="space-y-2">
        <Label>Service Type</Label>
        <Select value={config.serviceType || 'ClusterIP'} onValueChange={(v) => updateConfig('serviceType', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ClusterIP">ClusterIP (internal)</SelectItem>
            <SelectItem value="NodePort">NodePort</SelectItem>
            <SelectItem value="LoadBalancer">LoadBalancer (external)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="ingressEnabled" checked={config.ingressEnabled || false}
          onChange={(e) => updateConfig('ingressEnabled', e.target.checked)} className="w-4 h-4" />
        <Label htmlFor="ingressEnabled" className="font-normal">Enable Ingress</Label>
      </div>
    </>
  )

  const renderDatadogConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Datadog Site</Label>
        <Select value={config.site || 'datadoghq.com'} onValueChange={(v) => updateConfig('site', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="datadoghq.com">US (datadoghq.com)</SelectItem>
            <SelectItem value="datadoghq.eu">EU (datadoghq.eu)</SelectItem>
            <SelectItem value="us3.datadoghq.com">US3</SelectItem>
            <SelectItem value="us5.datadoghq.com">US5</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Environment</Label>
        <Input placeholder="production" value={config.env || 'production'}
          onChange={(e) => updateConfig('env', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Service Name</Label>
        <Input placeholder="my-app" value={config.service || ''}
          onChange={(e) => updateConfig('service', e.target.value)} />
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="apmEnabled" checked={config.apmEnabled !== false}
          onChange={(e) => updateConfig('apmEnabled', e.target.checked)} className="w-4 h-4" />
        <Label htmlFor="apmEnabled" className="font-normal">Enable APM (tracing)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="logsEnabled" checked={config.logsEnabled !== false}
          onChange={(e) => updateConfig('logsEnabled', e.target.checked)} className="w-4 h-4" />
        <Label htmlFor="logsEnabled" className="font-normal">Enable Log Collection</Label>
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="processAgent" checked={config.processAgentEnabled || false}
          onChange={(e) => updateConfig('processAgentEnabled', e.target.checked)} className="w-4 h-4" />
        <Label htmlFor="processAgent" className="font-normal">Enable Process Agent</Label>
      </div>
    </>
  )

  const renderPrometheusConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Scrape Interval</Label>
        <Select value={config.scrapeInterval || '15s'} onValueChange={(v) => updateConfig('scrapeInterval', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="5s">5 seconds</SelectItem>
            <SelectItem value="15s">15 seconds</SelectItem>
            <SelectItem value="30s">30 seconds</SelectItem>
            <SelectItem value="60s">60 seconds</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Retention Time</Label>
        <Select value={config.retentionTime || '15d'} onValueChange={(v) => updateConfig('retentionTime', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="15d">15 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Port</Label>
        <Input type="number" value={config.port || 9090}
          onChange={(e) => updateConfig('port', parseInt(e.target.value))} />
      </div>
    </>
  )

  const renderRabbitMQConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Admin Username</Label>
        <Input placeholder="admin" value={config.defaultUser || 'admin'}
          onChange={(e) => updateConfig('defaultUser', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>AMQP Port</Label>
        <Input type="number" value={config.amqpPort || 5672}
          onChange={(e) => updateConfig('amqpPort', parseInt(e.target.value))} />
      </div>
      <div className="space-y-2">
        <Label>Management Port</Label>
        <Input type="number" value={config.managementPort || 15672}
          onChange={(e) => updateConfig('managementPort', parseInt(e.target.value))} />
      </div>
      <div className="space-y-2">
        <Label>Virtual Host</Label>
        <Input placeholder="/" value={config.vhost || '/'}
          onChange={(e) => updateConfig('vhost', e.target.value)} />
      </div>
    </>
  )

  const renderKafkaConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Broker Port</Label>
        <Input type="number" value={config.port || 9092}
          onChange={(e) => updateConfig('port', parseInt(e.target.value))} />
      </div>
      <div className="space-y-2">
        <Label>Default Partitions</Label>
        <Input type="number" min={1} max={100} value={config.partitions || 3}
          onChange={(e) => updateConfig('partitions', parseInt(e.target.value))} />
      </div>
      <div className="space-y-2">
        <Label>Replication Factor</Label>
        <Input type="number" min={1} max={10} value={config.replicationFactor || 1}
          onChange={(e) => updateConfig('replicationFactor', parseInt(e.target.value))} />
      </div>
      <div className="space-y-2">
        <Label>Log Retention (hours)</Label>
        <Input type="number" value={config.retentionHours || 168}
          onChange={(e) => updateConfig('retentionHours', parseInt(e.target.value))} />
      </div>
    </>
  )

  // Resource Group config - Azure specific
  const renderResourceGroupConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Resource Group Name</Label>
        <Input
          placeholder="rg-my-project"
          value={config.name || ''}
          onChange={(e) => updateConfig('name', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Used to group and manage related Azure resources</p>
      </div>
      <div className="space-y-2">
        <Label>Location</Label>
        <Select value={config.location || 'westeurope'} onValueChange={(v) => updateConfig('location', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="westeurope">West Europe</SelectItem>
            <SelectItem value="northeurope">North Europe</SelectItem>
            <SelectItem value="eastus">East US</SelectItem>
            <SelectItem value="eastus2">East US 2</SelectItem>
            <SelectItem value="westus">West US</SelectItem>
            <SelectItem value="westus2">West US 2</SelectItem>
            <SelectItem value="centralus">Central US</SelectItem>
            <SelectItem value="uksouth">UK South</SelectItem>
            <SelectItem value="ukwest">UK West</SelectItem>
            <SelectItem value="germanywestcentral">Germany West Central</SelectItem>
            <SelectItem value="japaneast">Japan East</SelectItem>
            <SelectItem value="southeastasia">Southeast Asia</SelectItem>
            <SelectItem value="australiaeast">Australia East</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  // ── Management Group / Landing Zone ─────────────────────────────────────
  const renderManagementGroupConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Display Name</Label>
        <Input
          placeholder="Contoso Platform"
          value={config.display_name || ''}
          onChange={(e) => updateConfig('display_name', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Friendly name shown in Azure Portal (<code>display_name</code>)
        </p>
      </div>

      <div className="space-y-2">
        <Label>Management Group ID (optional)</Label>
        <Input
          placeholder="mg-platform (auto-generated if empty)"
          value={config.name || ''}
          onChange={(e) => updateConfig('name', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Unique identifier — letters, digits, hyphens, underscores</p>
      </div>

      <div className="space-y-2">
        <Label>Parent Management Group ID (optional)</Label>
        <Input
          placeholder="mg-root (leave empty for tenant root)"
          value={config.parent_management_group_id || ''}
          onChange={(e) => updateConfig('parent_management_group_id', e.target.value || undefined)}
        />
      </div>

      <div className="space-y-2">
        <Label>Associated Subscription IDs (comma-separated, optional)</Label>
        <Input
          placeholder="00000000-0000-0000-0000-000000000000"
          value={Array.isArray(config.subscription_ids) ? config.subscription_ids.join(', ') : (config.subscription_ids || '')}
          onChange={(e) => updateConfig('subscription_ids', e.target.value ? e.target.value.split(',').map((s: string) => s.trim()) : [])}
        />
        <p className="text-xs text-muted-foreground">Moves these subscriptions under this management group</p>
      </div>
    </>
  )

  // ── Azure Subscription ───────────────────────────────────────────────────
  const renderSubscriptionConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Subscription Name</Label>
        <Input
          placeholder="sub-platform-prod"
          value={config.subscription_name || ''}
          onChange={(e) => updateConfig('subscription_name', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Alias (Terraform resource name)</Label>
        <Input
          placeholder="sub-platform-prod"
          value={config.alias || ''}
          onChange={(e) => updateConfig('alias', e.target.value || undefined)}
        />
        <p className="text-xs text-muted-foreground">Used for Terraform resource naming — no spaces</p>
      </div>

      <div className="space-y-2">
        <Label>Existing Subscription ID (optional)</Label>
        <Input
          placeholder="00000000-0000-0000-0000-000000000000"
          value={config.subscription_id || ''}
          onChange={(e) => updateConfig('subscription_id', e.target.value || undefined)}
        />
        <p className="text-xs text-muted-foreground">Set if managing an existing subscription; leave empty for new</p>
      </div>

      <div className="space-y-2">
        <Label>Workload</Label>
        <Select value={config.workload || 'Production'} onValueChange={(v) => updateConfig('workload', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Production">Production</SelectItem>
            <SelectItem value="DevTest">Dev/Test (lower price)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Billing Scope ID (optional)</Label>
        <Input
          placeholder="/billingAccounts/123456/enrollmentAccounts/123456"
          value={config.billing_scope_id || ''}
          onChange={(e) => updateConfig('billing_scope_id', e.target.value || undefined)}
        />
        <p className="text-xs text-muted-foreground">EA enrollment account, MCA billing profile, or MPA</p>
      </div>

      <div className="space-y-2">
        <Label>Environment (display only)</Label>
        <Select value={config.environment || '__none__'} onValueChange={(v) => updateConfig('environment', v === '__none__' ? undefined : v)}>
          <SelectTrigger><SelectValue placeholder="Select environment" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            <SelectItem value="dev">Development</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="production">Production</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )

  const renderConfigForm = () => {
    if (!componentInfo) return null
    const category = componentInfo.category

    // Azure governance hierarchy
    if (componentInfo.id.includes('management-group') || componentInfo.id.includes('landing-zone')) {
      return renderManagementGroupConfig()
    }
    if (componentInfo.id.includes('subscription')) {
      return renderSubscriptionConfig()
    }

    // Resource Group config
    if (componentInfo.id.includes('resource-group')) {
      return renderResourceGroupConfig()
    }

    if (componentInfo.id.includes('vm') || componentInfo.id.includes('ec2') || componentInfo.id.includes('compute')) {
      return renderComputeConfig()
    }

    // AKS / EKS / GKE — dispatched before generic networking
    if (componentInfo.id.includes('aks') || componentInfo.id.includes('eks') || componentInfo.id.includes('gke')) {
      return renderNetworkingConfig()
    }

    if (category === 'networking') {
      return renderNetworkingConfig()
    }

    if (category === 'storage' || componentInfo.id.includes('disk') || componentInfo.id.includes('storage')) {
      return renderStorageConfig()
    }

    if (category === 'database') {
      return renderDatabaseConfig()
    }

    if (componentInfo.id.includes('app-service') || componentInfo.id.includes('functions') || componentInfo.id.includes('lambda')) {
      return renderAppServiceConfig()
    }

    // CI/CD & Third-Party Tools
    if (componentInfo.id === 'github-actions') return renderGitHubActionsConfig()
    if (componentInfo.id === 'gitlab-ci') return renderGitLabCIConfig()
    if (componentInfo.id === 'jenkins') return renderGitLabCIConfig() // same fields as GitLab
    if (componentInfo.id === 'argocd') return renderArgoCDConfig()
    if (componentInfo.id === 'helm') return renderHelmConfig()
    if (componentInfo.id === 'datadog') return renderDatadogConfig()
    if (componentInfo.id === 'prometheus') return renderPrometheusConfig()
    if (componentInfo.id === 'rabbitmq') return renderRabbitMQConfig()
    if (componentInfo.id === 'kafka') return renderKafkaConfig()

    return renderGenericConfig()
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Settings className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="font-semibold truncate">{String(node.data.label || componentInfo.name)}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-muted-foreground truncate">{componentInfo.name}</p>
              <Badge className={`text-[10px] px-1 py-0 flex-shrink-0 ${generatorMeta.bgColor}`}>
                {generatorMeta.label}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setConfigPanelOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="labels">Labels</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="p-4 space-y-4">
            {renderConfigForm()}
          </TabsContent>

          <TabsContent value="tags" className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Tags</Label>
              <Button size="sm" variant="outline" onClick={addTag}>
                <Plus className="w-3 h-3 mr-1" />
                Add Tag
              </Button>
            </div>
            <div className="space-y-2">
              {Object.entries(tags).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Input value={key} disabled className="flex-1 text-sm" />
                  <Input value={value} onChange={(e) => updateTag(key, e.target.value)} placeholder="Value" className="flex-1 text-sm" />
                  <Button size="icon" variant="ghost" onClick={() => removeTag(key)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {Object.keys(tags).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No tags added yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="labels" className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Labels</Label>
              <Button size="sm" variant="outline" onClick={addLabel}>
                <Plus className="w-3 h-3 mr-1" />
                Add Label
              </Button>
            </div>
            <div className="space-y-2">
              {Object.entries(labels).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Input value={key} disabled className="flex-1 text-sm" />
                  <Input value={value} onChange={(e) => updateLabel(key, e.target.value)} placeholder="Value" className="flex-1 text-sm" />
                  <Button size="icon" variant="ghost" onClick={() => removeLabel(key)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {Object.keys(labels).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No labels added yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="output" className="p-4 space-y-3">
            {/* ── TERRAFORM ─────────────────────────────────────────────── */}
            {generatorType === 'terraform' && componentInfo?.terraform && (() => {
              const resourceName = String(node?.data?.label || componentInfo.name)
                .toLowerCase().replace(/[^a-z0-9]/g, '_')
              const mergedConfig = { ...componentInfo.terraform!.defaultConfig, ...config }
              const props = Object.entries(mergedConfig)
                .filter(([, v]) => v !== undefined && v !== null && v !== '')
                .map(([k, v]) => {
                  if (typeof v === 'string') return `  ${k} = "${v}"`
                  if (typeof v === 'boolean') return `  ${k} = ${v}`
                  if (Array.isArray(v)) return `  ${k} = ${JSON.stringify(v)}`
                  return `  ${k} = ${JSON.stringify(v)}`
                })
              const tagsBlock = Object.keys(tags).length > 0
                ? `\n  tags = {\n${Object.entries(tags).map(([k, v]) => `    ${k} = "${v}"`).join('\n')}\n  }`
                : ''
              const hcl = `resource "${componentInfo.terraform!.resource}" "${resourceName}" {\n${props.join('\n')}${tagsBlock}\n}`
              return (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Resource: <code className="bg-muted px-1 rounded text-xs">{componentInfo.terraform!.resource}</code></p>
                      <p className="text-xs text-muted-foreground">Provider: {componentInfo.terraform!.provider} · file: resources.tf</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      navigator.clipboard.writeText(hcl).then(() => {
                        setOutputCopied(true)
                        setTimeout(() => setOutputCopied(false), 2000)
                      })
                    }}>
                      {outputCopied ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
                      {outputCopied ? 'Copied!' : 'Copy HCL'}
                    </Button>
                  </div>
                  <div className="bg-muted rounded-md p-3 font-mono text-xs overflow-auto max-h-72">
                    <pre className="whitespace-pre-wrap text-foreground/80">{hcl}</pre>
                  </div>
                  <div className="rounded-md border p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estimated Monthly Cost</p>
                    <p className="text-sm font-semibold">
                      ${componentInfo.estimatedCost.min}
                      {componentInfo.estimatedCost.max > componentInfo.estimatedCost.min ? ` – $${componentInfo.estimatedCost.max}` : ''}
                      <span className="text-xs font-normal text-muted-foreground ml-1">/month</span>
                    </p>
                  </div>
                </>
              )
            })()}

            {/* ── CI/CD / KUBERNETES / DOCKER / MONITORING ──────────────── */}
            {(generatorType === 'cicd' || generatorType === 'kubernetes' || generatorType === 'docker' || generatorType === 'monitoring') && (() => {
              const previewNode = { ...node, data: { ...node.data, config: { ...(componentInfo.cicd?.defaultConfig || {}), ...config } } } as any
              const result = generateCICDConfigs([previewNode], [])
              const output = result.outputs[0]
              if (!output) return (
                <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No preview available. Save your config and use Export to generate this file.</p>
                </div>
              )
              return (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">File: <code className="bg-muted px-1 rounded text-xs">{output.filename}</code></p>
                      <p className="text-xs text-muted-foreground">Generator: {output.generatorType} · {output.language.toUpperCase()}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      navigator.clipboard.writeText(output.content).then(() => {
                        setOutputCopied(true)
                        setTimeout(() => setOutputCopied(false), 2000)
                      })
                    }}>
                      {outputCopied ? <Check className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
                      {outputCopied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-muted rounded-md p-3 font-mono text-xs overflow-auto max-h-80">
                    <pre className="whitespace-pre-wrap text-foreground/80">{output.content}</pre>
                  </div>
                  {componentInfo.estimatedCost.max > 0 && (
                    <div className="rounded-md border p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estimated Monthly Cost</p>
                      <p className="text-sm font-semibold">
                        ${componentInfo.estimatedCost.min}
                        {componentInfo.estimatedCost.max > componentInfo.estimatedCost.min ? ` – $${componentInfo.estimatedCost.max}` : ''}
                        <span className="text-xs font-normal text-muted-foreground ml-1">/month</span>
                      </p>
                    </div>
                  )}
                </>
              )
            })()}

            {/* ── ANNOTATION / DOCUMENTATION ONLY ──────────────────────── */}
            {generatorType === 'documentation' && (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Annotation-only component</p>
                  <p className="text-xs text-muted-foreground max-w-64">
                    This component is used to document your architecture. It does not generate
                    Terraform, CI/CD files, or any other code output. It will be mentioned in
                    the exported README only.
                  </p>
                </div>
                <div className="rounded-md border border-dashed p-3 w-full text-left space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">What generates code from your diagram:</p>
                  <p className="text-xs text-muted-foreground">• <strong className="text-foreground">AWS / Azure / GCP</strong> components → Terraform HCL</p>
                  <p className="text-xs text-muted-foreground">• <strong className="text-foreground">GitHub Actions / GitLab CI / Jenkins</strong> → CI/CD YAML</p>
                  <p className="text-xs text-muted-foreground">• <strong className="text-foreground">ArgoCD / Helm</strong> → Kubernetes manifests</p>
                  <p className="text-xs text-muted-foreground">• <strong className="text-foreground">Datadog / Prometheus</strong> → Monitoring config</p>
                  <p className="text-xs text-muted-foreground">• <strong className="text-foreground">RabbitMQ / Kafka / NATS</strong> → docker-compose</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t flex gap-2">
        <Button size="sm" className="flex-1" onClick={handleSave}>Save</Button>
        <Button size="sm" variant="outline" onClick={() => setConfigPanelOpen(false)}>Cancel</Button>
      </div>

      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Tag Key</Label>
            <Input
              value={newTagKey}
              onChange={e => setNewTagKey(e.target.value)}
              placeholder="e.g. Environment"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTagConfirm();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTagConfirm}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={labelDialogOpen} onOpenChange={setLabelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Label</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label>Label Key</Label>
            <Input
              value={newLabelKey}
              onChange={e => setNewLabelKey(e.target.value)}
              placeholder="e.g. app.kubernetes.io/name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLabelConfirm();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLabelDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLabelConfirm}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
