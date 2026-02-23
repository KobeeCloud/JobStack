/**
 * Tests for lib/catalog.ts integrity
 * Ensures all component IDs are unique, all required fields are present,
 * and all cross-references resolve correctly.
 */
import { COMPONENT_CATALOG, type ComponentConfig } from '@/lib/catalog'

describe('COMPONENT_CATALOG integrity', () => {
  it('has no duplicate component IDs', () => {
    const ids = COMPONENT_CATALOG.map(c => c.id)
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(duplicates).toEqual([])
  })

  it('every component has required fields', () => {
    COMPONENT_CATALOG.forEach(comp => {
      expect(comp.id).toBeTruthy()
      expect(comp.name).toBeTruthy()
      expect(comp.category).toBeTruthy()
      expect(comp.description).toBeTruthy()
      expect(comp.estimatedCost).toBeDefined()
      expect(typeof comp.estimatedCost.min).toBe('number')
      expect(typeof comp.estimatedCost.max).toBe('number')
      expect(comp.estimatedCost.max).toBeGreaterThanOrEqual(comp.estimatedCost.min)
    })
  })

  it('has expected key components', () => {
    const ids = new Set(COMPONENT_CATALOG.map(c => c.id))

    // AWS
    expect(ids.has('aws-ec2')).toBe(true)
    expect(ids.has('aws-rds')).toBe(true)
    expect(ids.has('aws-s3')).toBe(true)
    expect(ids.has('aws-lambda')).toBe(true)
    expect(ids.has('dynamodb')).toBe(true)
    expect(ids.has('aws-elasticache')).toBe(true)
    expect(ids.has('aws-redshift')).toBe(true)

    // Azure
    expect(ids.has('azure-vm')).toBe(true)
    expect(ids.has('azure-sql')).toBe(true)
    expect(ids.has('azure-cosmos')).toBe(true)
    expect(ids.has('azure-storage-account')).toBe(true)
    expect(ids.has('azure-managed-disk')).toBe(true)
    expect(ids.has('azure-redis')).toBe(true)
    expect(ids.has('azure-cdn')).toBe(true)
    expect(ids.has('azure-sql-serverless')).toBe(true)

    // GCP
    expect(ids.has('gcp-compute-instance')).toBe(true)
    expect(ids.has('gcp-cloud-storage')).toBe(true)
    expect(ids.has('gcp-persistent-disk')).toBe(true)
    expect(ids.has('gcp-cloud-lb')).toBe(true)
    expect(ids.has('gcp-firestore')).toBe(true)
    expect(ids.has('gcp-spanner')).toBe(true)
    expect(ids.has('gcp-memorystore')).toBe(true)
    expect(ids.has('gcp-secret-manager')).toBe(true)
    expect(ids.has('gcp-cloud-dns')).toBe(true)
  })

  it('canContain references only valid component IDs', () => {
    const allIds = new Set(COMPONENT_CATALOG.map(c => c.id))
    COMPONENT_CATALOG.forEach(comp => {
      if (comp.canContain) {
        comp.canContain.forEach(childId => {
          expect(allIds.has(childId)).toBe(true)
        })
      }
    })
  })

  it('terraform provider matches component provider', () => {
    COMPONENT_CATALOG.forEach(comp => {
      if (comp.terraform && comp.provider && comp.provider !== 'generic') {
        expect(comp.terraform.provider).toBe(comp.provider)
      }
    })
  })
})
