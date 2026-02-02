'use client'

import { useState, useEffect } from 'react'
import { Node } from '@xyflow/react'
import { X, Plus, Trash2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getConfigSchema, type NodeConfig } from '@/lib/node-config-schemas'
import { COMPONENT_CATALOG } from '@/lib/catalog'
import { AZURE_VM_SIZES, AWS_VM_SIZES, GCP_VM_SIZES, type VMSize } from '@/lib/cloud-pricing'

interface NodeConfigPanelProps {
  node: Node | null
  onClose: () => void
  onUpdate: (nodeId: string, config: NodeConfig) => void
}

export function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  const [config, setConfig] = useState<any>({})
  const [tags, setTags] = useState<Record<string, string>>({})
  const [labels, setLabels] = useState<Record<string, string>>({})

  const componentInfo = node ? COMPONENT_CATALOG.find(c => c.id === node.data.component) : null

  useEffect(() => {
    if (node?.data?.config) {
      const nodeConfig = node.data.config as any
      setConfig(nodeConfig)
      setTags(nodeConfig.tags || {})
      setLabels(nodeConfig.labels || {})
    } else {
      setConfig({})
      setTags({})
      setLabels({})
    }
  }, [node])

  if (!node || !componentInfo) return null

  const handleSave = () => {
    const finalConfig = {
      ...config,
      tags: Object.keys(tags).length > 0 ? tags : undefined,
      labels: Object.keys(labels).length > 0 ? labels : undefined,
    }

    try {
      const schema = getConfigSchema(componentInfo.id)
      const validated = schema.parse(finalConfig)
      onUpdate(node.id, validated)
      onClose()
    } catch (error) {
      console.error('Validation error:', error)
    }
  }

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }))
  }

  const addTag = () => {
    const key = prompt('Tag key:')
    if (key) setTags(prev => ({ ...prev, [key]: '' }))
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
    const key = prompt('Label key:')
    if (key) setLabels(prev => ({ ...prev, [key]: '' }))
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
      </>
    )
  }

  const renderNetworkingConfig = () => {
    if (componentInfo && (componentInfo.id.includes('vnet') || componentInfo.id.includes('vpc'))) {
      return (
        <>
          <div className="space-y-2">
            <Label>Address Space (CIDR)</Label>
            <Input placeholder="10.0.0.0/16" value={config.addressSpace || ''} onChange={(e) => updateConfig('addressSpace', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>DNS Servers (comma-separated)</Label>
            <Input placeholder="8.8.8.8, 8.8.4.4" value={config.dnsServers?.join(', ') || ''} onChange={(e) => updateConfig('dnsServers', e.target.value.split(',').map((s: string) => s.trim()))} />
          </div>
        </>
      )
    }

    if (componentInfo && componentInfo.id.includes('subnet')) {
      return (
        <div className="space-y-2">
          <Label>Address Prefix (CIDR)</Label>
          <Input placeholder="10.0.1.0/24" value={config.addressPrefix || ''} onChange={(e) => updateConfig('addressPrefix', e.target.value)} />
        </div>
      )
    }

    return null
  }

  const renderStorageConfig = () => (
    <>
      <div className="space-y-2">
        <Label>Size (GB)</Label>
        <Input type="number" min={1} max={65536} value={config.size || 100} onChange={(e) => updateConfig('size', parseInt(e.target.value))} />
      </div>

      {componentInfo && componentInfo.id.includes('storage') && (
        <>
          <div className="space-y-2">
            <Label>Account Tier</Label>
            <Select value={config.accountTier || 'standard'} onValueChange={(v) => updateConfig('accountTier', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Replication Type</Label>
            <Select value={config.replicationType || 'lrs'} onValueChange={(v) => updateConfig('replicationType', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lrs">LRS (Locally Redundant)</SelectItem>
                <SelectItem value="grs">GRS (Geo-Redundant)</SelectItem>
                <SelectItem value="ragrs">RA-GRS (Read-Access Geo-Redundant)</SelectItem>
                <SelectItem value="zrs">ZRS (Zone-Redundant)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {componentInfo && componentInfo.id.includes('disk') && (
        <div className="space-y-2">
          <Label>Disk SKU</Label>
          <Select value={config.sku || 'premium_ssd'} onValueChange={(v) => updateConfig('sku', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard_hdd">Standard HDD</SelectItem>
              <SelectItem value="standard_ssd">Standard SSD</SelectItem>
              <SelectItem value="premium_ssd">Premium SSD</SelectItem>
              <SelectItem value="ultrassd">Ultra SSD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  )

  const renderDatabaseConfig = () => (
    <>
      <div className="space-y-2">
        <Label>SKU / Tier</Label>
        <Select value={config.sku || 'S0'} onValueChange={(v) => updateConfig('sku', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="S0">S0 - 10 DTU</SelectItem>
            <SelectItem value="S1">S1 - 20 DTU</SelectItem>
            <SelectItem value="S2">S2 - 50 DTU</SelectItem>
            <SelectItem value="P1">P1 - 125 DTU</SelectItem>
            <SelectItem value="P2">P2 - 250 DTU</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Max Size (GB)</Label>
        <Input type="number" value={config.maxSizeGb || 50} onChange={(e) => updateConfig('maxSizeGb', parseInt(e.target.value))} />
      </div>

      <div className="space-y-2">
        <Label>Backup Retention (days)</Label>
        <Input type="number" min={1} max={35} value={config.backupRetentionDays || 7} onChange={(e) => updateConfig('backupRetentionDays', parseInt(e.target.value))} />
      </div>
    </>
  )

  const renderAppServiceConfig = () => (
    <>
      <div className="space-y-2">
        <Label>SKU</Label>
        <Select value={config.sku || 'B1'} onValueChange={(v) => updateConfig('sku', v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="F1">F1 - Free</SelectItem>
            <SelectItem value="B1">B1 - Basic</SelectItem>
            <SelectItem value="S1">S1 - Standard</SelectItem>
            <SelectItem value="P1v2">P1v2 - Premium v2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Runtime</Label>
        <Select value={config.runtime || ''} onValueChange={(v) => updateConfig('runtime', v)}>
          <SelectTrigger><SelectValue placeholder="Select runtime" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="node|18-lts">Node.js 18 LTS</SelectItem>
            <SelectItem value="node|20-lts">Node.js 20 LTS</SelectItem>
            <SelectItem value="python|3.11">Python 3.11</SelectItem>
            <SelectItem value="python|3.10">Python 3.10</SelectItem>
            <SelectItem value="dotnet|7.0">dotnet 7.0</SelectItem>
            <SelectItem value="dotnet|8.0">dotnet 8.0</SelectItem>
            <SelectItem value="java|17">Java 17</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" id="alwaysOn" checked={config.alwaysOn !== false} onChange={(e) => updateConfig('alwaysOn', e.target.checked)} className="w-4 h-4" />
        <Label htmlFor="alwaysOn">Always On</Label>
      </div>
    </>
  )

  const renderGenericConfig = () => (
    <div className="space-y-2">
      <Label>Replicas</Label>
      <Input type="number" min={1} max={100} value={config.replicas || 1} onChange={(e) => updateConfig('replicas', parseInt(e.target.value))} />
    </div>
  )

  const renderConfigForm = () => {
    if (!componentInfo) return null
    const category = componentInfo.category

    if (componentInfo.id.includes('vm') || componentInfo.id.includes('ec2') || componentInfo.id.includes('compute')) {
      return renderComputeConfig()
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

    return renderGenericConfig()
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-semibold">{String(node.data.label || componentInfo.name)}</h2>
            <p className="text-xs text-muted-foreground">{componentInfo.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="labels">Labels</TabsTrigger>
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
        </Tabs>
      </div>

      <div className="p-4 border-t flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  )
}
