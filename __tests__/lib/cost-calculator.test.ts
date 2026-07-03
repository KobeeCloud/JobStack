/**
 * Tests for lib/cost-calculator.ts
 * Verifies that component cost estimation works correctly with catalog IDs.
 */
import { calculateInfrastructureCost } from '@/lib/cost-calculator'

// Helper to make a minimal Node for testing
function makeNode(id: string, componentId: string, config: Record<string, unknown> = {}) {
  return {
    id,
    type: 'custom',
    position: { x: 0, y: 0 },
    data: { componentId, label: componentId, config },
  } as any
}

describe('calculateInfrastructureCost', () => {
  it('returns zero for empty nodes array', () => {
    const result = calculateInfrastructureCost([])
    expect(result.min).toBe(0)
    expect(result.max).toBe(0)
    expect(result.breakdown).toEqual([])
  })

  it('returns zero for nodes with non-existent component IDs', () => {
    const result = calculateInfrastructureCost([makeNode('1', 'nonexistent-component')])
    expect(result.min).toBe(0)
    expect(result.max).toBe(0)
  })

  it('calculates cost for a single VM node', () => {
    const result = calculateInfrastructureCost([makeNode('1', 'azure-vm')])
    expect(result.min).toBeGreaterThan(0)
    expect(result.max).toBeGreaterThanOrEqual(result.min)
    expect(result.breakdown).toHaveLength(1)
    expect(result.breakdown[0].componentId).toBe('azure-vm')
  })

  it('handles GCP compute instance (not gcp-compute)', () => {
    // This was a bug — 'gcp-compute' didn't exist in catalog
    const result = calculateInfrastructureCost([makeNode('1', 'gcp-compute-instance')])
    expect(result.min).toBeGreaterThan(0)
  })

  it('handles azure-storage-account (not azure-storage)', () => {
    const result = calculateInfrastructureCost([makeNode('1', 'azure-storage-account')])
    expect(result.min).toBeGreaterThanOrEqual(0)
    expect(result.breakdown).toHaveLength(1)
  })

  it('handles gcp-cloud-storage (not gcp-storage)', () => {
    const result = calculateInfrastructureCost([makeNode('1', 'gcp-cloud-storage')])
    expect(result.breakdown).toHaveLength(1)
  })

  it('handles azure-managed-disk (not azure-disk)', () => {
    const result = calculateInfrastructureCost([makeNode('1', 'azure-managed-disk')])
    expect(result.breakdown).toHaveLength(1)
  })

  it('handles gcp-persistent-disk (not gcp-disk)', () => {
    const result = calculateInfrastructureCost([makeNode('1', 'gcp-persistent-disk')])
    expect(result.breakdown).toHaveLength(1)
  })

  it('handles azure-sql (not azure-sql-database)', () => {
    const result = calculateInfrastructureCost([makeNode('1', 'azure-sql', { sku: 'S0' })])
    expect(result.min).toBeGreaterThan(0)
  })

  it('applies VM size pricing', () => {
    const defaultResult = calculateInfrastructureCost([makeNode('1', 'aws-ec2')])
    const sizedResult = calculateInfrastructureCost([
      makeNode('1', 'aws-ec2', { size: 'Standard_D4s_v3' }),
    ])
    // Sized result should differ from default
    expect(sizedResult.min).not.toBe(defaultResult.min)
  })

  it('multiplies cost by replicas', () => {
    const singleResult = calculateInfrastructureCost([makeNode('1', 'aws-ec2')])
    const tripleResult = calculateInfrastructureCost([makeNode('1', 'aws-ec2', { replicas: 3 })])
    // 3 replicas should cost ~3x
    expect(tripleResult.min).toBeGreaterThan(singleResult.min)
  })

  it('sums costs across multiple nodes', () => {
    const result = calculateInfrastructureCost([
      makeNode('1', 'azure-vm'),
      makeNode('2', 'aws-rds'),
      makeNode('3', 'gcp-cloud-storage'),
    ])
    expect(result.breakdown).toHaveLength(3)
    expect(result.min).toBeGreaterThan(0)
    const sumMin = result.breakdown.reduce((s, b) => s + b.minCost, 0)
    expect(result.min).toBe(sumMin)
  })
})
