'use client'

import { useState } from 'react'
import { Node } from '@xyflow/react'
import { X, Plus, Trash2, Settings, Code2, Copy, Check, AlertCircle, GitBranch, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getConfigSchema, type NodeConfig } from '@/lib/node-config-schemas'
import { COMPONENT_CATALOG, getEffectiveGeneratorType, GENERATOR_TYPE_META } from '@/lib/catalog'
import { AZURE_VM_SIZES, AWS_VM_SIZES, GCP_VM_SIZES, type VMSize } from '@/lib/cloud-pricing'
import { generateCICDConfigs } from '@/lib/generators/cicd'

interface NodeConfigPanelProps {
  node: Node | null
  onClose: () => void
  onUpdate: (nodeId: string, config: NodeConfig) => void
}

export function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  // Support both 'componentId' (new) and 'component' (old) for backward compatibility
  const componentId = node?.data?.componentId || node?.data?.component
  const componentInfo = componentId ? COMPONENT_CATALOG.find(c => c.id === componentId) : null

  // Initialize state from node data - no useEffect needed because parent uses key={node.id}
  const initialConfig = node?.data?.config || {}
  const [config, setConfig] = useState<any>(initialConfig)
  const [tags, setTags] = useState<Record<string, string>>((initialConfig as any).tags || {})
  const [labels, setLabels] = useState<Record<string, string>>((initialConfig as any).labels || {})
  const [outputCopied, setOutputCopied] = useState(false)

  // Derived generator type — drives what the Output tab shows
  const generatorType = componentInfo ? getEffectiveGeneratorType(componentInfo) : 'documentation'
  const generatorMeta = GENERATOR_TYPE_META[generatorType]

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

  const renderConfigForm = () => {
    if (!componentInfo) return null
    const category = componentInfo.category

    // Resource Group config
    if (componentInfo.id.includes('resource-group')) {
      return renderResourceGroupConfig()
    }

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

    // CI/CD & Third-Party Tools
    if (componentInfo.id === 'github-actions') return renderGitHubActionsConfig()
    if (componentInfo.id === 'gitlab-ci')      return renderGitLabCIConfig()
    if (componentInfo.id === 'jenkins')        return renderGitLabCIConfig() // same fields as GitLab
    if (componentInfo.id === 'argocd')         return renderArgoCDConfig()
    if (componentInfo.id === 'helm')           return renderHelmConfig()
    if (componentInfo.id === 'datadog')        return renderDatadogConfig()
    if (componentInfo.id === 'prometheus')     return renderPrometheusConfig()
    if (componentInfo.id === 'rabbitmq')       return renderRabbitMQConfig()
    if (componentInfo.id === 'kafka')          return renderKafkaConfig()

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
        <Button variant="ghost" size="icon" onClick={onClose}>
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
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className="flex-1" onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  )
}
