/**
 * Tests for lib/multi-cloud/cloud-mappings.ts
 * Verifies that all component IDs referenced in cloud mappings exist in the catalog.
 */
import { CLOUD_AGNOSTIC_MAPPINGS, convertDiagramToProvider } from '@/lib/multi-cloud/cloud-mappings'
import { COMPONENT_CATALOG } from '@/lib/catalog'

const catalogIds = new Set(COMPONENT_CATALOG.map(c => c.id))

describe('CLOUD_AGNOSTIC_MAPPINGS', () => {
  it('all provider componentIds exist in COMPONENT_CATALOG', () => {
    const missingIds: string[] = []

    CLOUD_AGNOSTIC_MAPPINGS.forEach(mapping => {
      const providers = mapping.providers
      for (const [provider, config] of Object.entries(providers)) {
        if (!catalogIds.has(config.componentId)) {
          missingIds.push(`${mapping.genericId} → ${provider}: ${config.componentId}`)
        }
      }
    })

    expect(missingIds).toEqual([])
  })

  it('all mappings have AWS, Azure, and GCP variants', () => {
    CLOUD_AGNOSTIC_MAPPINGS.forEach(mapping => {
      expect(mapping.providers.aws).toBeDefined()
      expect(mapping.providers.azure).toBeDefined()
      expect(mapping.providers.gcp).toBeDefined()
    })
  })

  it('has expected generic mappings', () => {
    const genericIds = CLOUD_AGNOSTIC_MAPPINGS.map(m => m.genericId)
    expect(genericIds).toContain('generic-vm')
    expect(genericIds).toContain('generic-database')
    expect(genericIds).toContain('generic-load-balancer')
    expect(genericIds).toContain('generic-cache')
    expect(genericIds).toContain('generic-cdn')
    expect(genericIds).toContain('generic-nosql-database')
    expect(genericIds).toContain('generic-secret-store')
    expect(genericIds).toContain('generic-dns')
  })
})

describe('convertDiagramToProvider', () => {
  it('converts AWS nodes to Azure', () => {
    const nodes = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { component: 'aws-ec2', label: 'Web Server', config: {} },
      },
    ]
    const edges = [{ id: 'e1', source: '1', target: '1', type: 'smoothstep' }]

    const result = convertDiagramToProvider(nodes as any, edges as any, 'azure')
    expect(result.nodes[0].data.component).toBe('azure-vm')
  })

  it('converts Azure nodes to GCP', () => {
    const nodes = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { component: 'azure-sql', label: 'Database', config: {} },
      },
    ]
    const edges: any[] = []

    const result = convertDiagramToProvider(nodes as any, edges, 'gcp')
    expect(result.nodes[0].data.component).toBe('gcp-cloud-sql')
  })

  it('preserves nodes that cannot be converted', () => {
    const nodes = [
      {
        id: '1',
        type: 'custom',
        position: { x: 0, y: 0 },
        data: { component: 'docker', label: 'Docker', config: {} },
      },
    ]
    const edges: any[] = []

    const result = convertDiagramToProvider(nodes as any, edges, 'aws')
    // Docker is provider-agnostic — should remain unchanged
    expect(result.nodes[0].data.component).toBe('docker')
  })

  it('preserves edge references', () => {
    const nodes = [
      { id: '1', type: 'custom', position: { x: 0, y: 0 }, data: { component: 'aws-ec2', label: 'A', config: {} } },
      { id: '2', type: 'custom', position: { x: 0, y: 0 }, data: { component: 'aws-rds', label: 'B', config: {} } },
    ]
    const edges = [{ id: 'e1', source: '1', target: '2', type: 'smoothstep' }]

    const result = convertDiagramToProvider(nodes as any, edges as any, 'azure')
    expect(result.edges).toHaveLength(1)
    expect(result.edges[0].source).toBe('1')
    expect(result.edges[0].target).toBe('2')
  })
})
