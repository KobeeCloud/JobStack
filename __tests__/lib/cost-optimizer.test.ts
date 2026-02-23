/**
 * Tests for lib/cost-optimizer.ts
 * Verifies that cost optimization suggestions reference valid catalog IDs.
 */
import { analyzeCosts } from '@/lib/cost-optimizer'
import { COMPONENT_CATALOG } from '@/lib/catalog'

function makeNode(id: string, componentId: string, config: Record<string, unknown> = {}) {
  return {
    id,
    type: 'custom',
    position: { x: 0, y: 0 },
    data: { componentId, label: componentId, config },
  } as any
}

describe('analyzeCosts', () => {
  it('returns empty optimizations for empty nodes', () => {
    const report = analyzeCosts([])
    expect(report.optimizations).toEqual([])
    expect(report.totalCurrentCost.min).toBe(0)
  })

  it('produces optimizations for expensive components', () => {
    const report = analyzeCosts([
      makeNode('1', 'aws-ec2'),
      makeNode('2', 'azure-vm'),
      makeNode('3', 'gcp-compute-engine'),
    ])
    // Should suggest serverless alternatives
    expect(report.optimizations.length).toBeGreaterThan(0)
  })

  it('all suggested alternative IDs exist in catalog', () => {
    // Run optimizer on every single-node scenario from the catalog
    const allAlternativeIds = new Set<string>()

    COMPONENT_CATALOG.forEach(comp => {
      const report = analyzeCosts([
        makeNode('test', comp.id),
      ])
      report.optimizations.forEach(opt => {
        if (opt.suggestion?.componentId) {
          allAlternativeIds.add(opt.suggestion.componentId)
        }
      })
    })

    const catalogIds = new Set(COMPONENT_CATALOG.map(c => c.id))
    const missing = [...allAlternativeIds].filter(id => !catalogIds.has(id))
    expect(missing).toEqual([])
  })

  it('identifies reserved pricing opportunities for eligible components', () => {
    // aws-elasticache is RESERVED_ELIGIBLE but has no COST_ALTERNATIVES,
    // so it should get a 'reserved' pricing suggestion
    const report = analyzeCosts([
      makeNode('1', 'aws-elasticache'),
    ])
    const reservedOpt = report.optimizations.find(o =>
      o.category === 'reserved' || o.suggestion?.reason?.toLowerCase().includes('reserved')
    )
    expect(reservedOpt).toBeDefined()
  })

  it('identifies spot pricing for eligible components', () => {
    const report = analyzeCosts([
      makeNode('1', 'aws-ec2'),
      makeNode('2', 'azure-vmss'),
    ])
    const spotOpts = report.optimizations.filter(o =>
      o.category === 'spot' || o.suggestion?.reason?.toLowerCase().includes('spot') || o.suggestion?.reason?.toLowerCase().includes('preemptible')
    )
    expect(spotOpts.length).toBeGreaterThan(0)
  })
})
