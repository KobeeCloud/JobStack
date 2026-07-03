/**
 * Generator Test Suite
 *
 * Covers: graph-utils (shared core), terraform generator,
 * cloudformation generator, ARM generator, pulumi generator,
 * catalog lookup, cloud-mappings, and snap-to-container.
 */

import { Node, Edge } from '@xyflow/react'
import {
  buildNodeMap,
  getNodeComponentId,
  sanitizeName,
  uniqueName,
  findAncestor,
  findAncestorByComponentId,
  findConnectedNodes,
  getNodeDepth,
  detectCycles,
} from '@/lib/generators/core/graph-utils'
import { getComponentById } from '@/lib/catalog'
import { generateCloudFormation } from '@/lib/export/cloudformation-generator'
import { generateARM } from '@/lib/export/arm-generator'
import { generatePulumi } from '@/lib/export/pulumi-generator'

// ─── Test Helpers ────────────────────────────────────────────────────────────

/** Minimal React-Flow node factory */
function makeNode(id: string, componentId: string, label?: string, parentId?: string): Node {
  return {
    id,
    type: 'default',
    position: { x: 0, y: 0 },
    data: { label: label ?? id, componentId },
    ...(parentId ? { parentId } : {}),
  }
}

function makeEdge(source: string, target: string): Edge {
  return { id: `${source}-${target}`, source, target }
}

// ─── graph-utils – sanitizeName ──────────────────────────────────────────────

describe('sanitizeName', () => {
  it('lowercases and replaces non-alphanumeric chars (terraform)', () => {
    expect(sanitizeName('My Web Server', 'terraform')).toBe('my_web_server')
  })

  it('collapses consecutive separators', () => {
    expect(sanitizeName('a---b___c', 'terraform')).toBe('a_b_c')
  })

  it('strips leading/trailing separators', () => {
    expect(sanitizeName('__hello__', 'terraform')).toBe('hello')
  })

  it('returns "resource" for empty input (terraform)', () => {
    expect(sanitizeName('', 'terraform')).toBe('resource')
  })

  it('supports cfn format (alphanumeric only)', () => {
    expect(sanitizeName('My App 123', 'cfn')).toBe('MyApp123')
  })

  it('supports arm format (lowercase, hyphen-friendly)', () => {
    expect(sanitizeName('My-App 123', 'arm')).toBe('my-app123')
  })

  it('supports pulumi format', () => {
    expect(sanitizeName('My Web Server', 'pulumi')).toBe('my_web_server')
  })
})

// ─── graph-utils – uniqueName ────────────────────────────────────────────────

describe('uniqueName', () => {
  it('returns the base name when no collision', () => {
    const issued = new Set<string>()
    expect(uniqueName('web', 'terraform', issued)).toBe('web')
    expect(issued.has('web')).toBe(true)
  })

  it('appends suffix on collision', () => {
    const issued = new Set<string>(['web'])
    expect(uniqueName('web', 'terraform', issued)).toBe('web_1')
    expect(issued.has('web_1')).toBe(true)
  })

  it('handles multiple collisions', () => {
    const issued = new Set<string>(['api', 'api_1', 'api_2'])
    expect(uniqueName('api', 'terraform', issued)).toBe('api_3')
  })
})

// ─── graph-utils – buildNodeMap ──────────────────────────────────────────────

describe('buildNodeMap', () => {
  it('creates a map keyed by node ID', () => {
    const nodes = [makeNode('a', 'aws-ec2'), makeNode('b', 'aws-s3')]
    const map = buildNodeMap(nodes)
    expect(map.size).toBe(2)
    expect(map.get('a')).toBe(nodes[0])
    expect(map.get('b')).toBe(nodes[1])
  })

  it('returns empty map for empty input', () => {
    expect(buildNodeMap([]).size).toBe(0)
  })
})

// ─── graph-utils – getNodeComponentId ────────────────────────────────────────

describe('getNodeComponentId', () => {
  it('returns componentId from data.componentId', () => {
    const node = makeNode('n', 'aws-ec2')
    expect(getNodeComponentId(node)).toBe('aws-ec2')
  })

  it('falls back to data.component', () => {
    const node: Node = {
      id: 'n',
      type: 'default',
      position: { x: 0, y: 0 },
      data: { component: 'aws-s3' },
    }
    expect(getNodeComponentId(node)).toBe('aws-s3')
  })

  it('falls back to node.type when no componentId or component field', () => {
    const node: Node = {
      id: 'n',
      type: 'default',
      position: { x: 0, y: 0 },
      data: {},
    }
    // getNodeComponentId falls back to node.type as last resort
    expect(getNodeComponentId(node)).toBe('default')
  })
})

// ─── graph-utils – ancestor traversal ────────────────────────────────────────

describe('findAncestor / findAncestorByComponentId', () => {
  it('walks up parentId chain', () => {
    const nodes = [
      makeNode('vpc', 'aws-vpc', 'VPC'),
      makeNode('subnet', 'aws-subnet', 'Subnet', 'vpc'),
      makeNode('vm', 'aws-ec2', 'VM', 'subnet'),
    ]
    const map = buildNodeMap(nodes)

    // findAncestor by predicate
    const ancestor = findAncestor('vm', map, n => getNodeComponentId(n) === 'aws-vpc')
    expect(ancestor?.id).toBe('vpc')
  })

  it('returns null when no match', () => {
    const nodes = [makeNode('a', 'aws-ec2')]
    const map = buildNodeMap(nodes)
    expect(findAncestor('a', map, () => true)).toBeNull()
  })

  it('findAncestorByComponentId finds by component ID', () => {
    const nodes = [
      makeNode('rg', 'azure-resource-group', 'RG'),
      makeNode('vm', 'azure-vm', 'VM', 'rg'),
    ]
    const map = buildNodeMap(nodes)
    expect(findAncestorByComponentId('vm', 'azure-resource-group', map)?.id).toBe('rg')
  })
})

// ─── graph-utils – connected nodes ──────────────────────────────────────────

describe('findConnectedNodes / findConnectedNames', () => {
  it('finds connected nodes by component ID', () => {
    const nodes = [makeNode('vm1', 'aws-ec2', 'web'), makeNode('sg', 'aws-security-group', 'sg')]
    const edges = [makeEdge('vm1', 'sg')]
    const map = buildNodeMap(nodes)

    const connected = findConnectedNodes('vm1', ['aws-security-group'], edges, map)
    expect(connected).toHaveLength(1)
    expect(connected[0].id).toBe('sg')
  })

  it('returns empty array when no connections', () => {
    const nodes = [makeNode('vm1', 'aws-ec2', 'web')]
    const map = buildNodeMap(nodes)
    expect(findConnectedNodes('vm1', ['aws-s3'], [], map)).toHaveLength(0)
  })
})

// ─── graph-utils – getNodeDepth ──────────────────────────────────────────────

describe('getNodeDepth', () => {
  it('returns 0 for root nodes', () => {
    const nodes = [makeNode('a', 'aws-ec2')]
    const map = buildNodeMap(nodes)
    expect(getNodeDepth(nodes[0], map)).toBe(0)
  })

  it('returns correct depth for nested nodes', () => {
    const nodes = [
      makeNode('a', 'aws-vpc'),
      makeNode('b', 'aws-subnet', 'Sub', 'a'),
      makeNode('c', 'aws-ec2', 'VM', 'b'),
    ]
    const map = buildNodeMap(nodes)
    expect(getNodeDepth(nodes[2], map)).toBe(2)
  })
})

// ─── graph-utils – detectCycles ──────────────────────────────────────────────

describe('detectCycles', () => {
  it('returns empty array for acyclic graph', () => {
    const nodes = [makeNode('a', 'aws-ec2'), makeNode('b', 'aws-s3')]
    const edges = [makeEdge('a', 'b')]
    const map = buildNodeMap(nodes)
    expect(
      detectCycles(
        nodes.map(n => n.id),
        edges,
        map
      )
    ).toHaveLength(0)
  })

  it('detects a simple cycle', () => {
    const nodes = [makeNode('a', 'aws-ec2'), makeNode('b', 'aws-s3'), makeNode('c', 'aws-rds')]
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'c'), makeEdge('c', 'a')]
    const map = buildNodeMap(nodes)
    const cycles = detectCycles(
      nodes.map(n => n.id),
      edges,
      map
    )
    expect(cycles.length).toBeGreaterThan(0)
  })
})

// ─── catalog – O(1) map lookup ───────────────────────────────────────────────

describe('getComponentById', () => {
  it('returns a known component', () => {
    const comp = getComponentById('aws-ec2')
    expect(comp).toBeDefined()
    expect(comp?.id).toBe('aws-ec2')
  })

  it('returns undefined for unknown ID', () => {
    expect(getComponentById('nonexistent-xyz')).toBeUndefined()
  })

  it('returns consistent results on repeated calls', () => {
    const a = getComponentById('azure-vm')
    const b = getComponentById('azure-vm')
    expect(a).toBe(b)
  })
})

// ─── CloudFormation Generator ────────────────────────────────────────────────

describe('generateCloudFormation', () => {
  it('returns valid YAML for a single EC2 node', () => {
    const nodes = [makeNode('vm1', 'aws-ec2', 'WebServer')]
    const output = generateCloudFormation(nodes, [], 'yaml')
    expect(output).toContain('AWSTemplateFormatVersion')
    expect(output).toContain('WebServer')
    expect(output).toContain('AWS::EC2::Instance')
  })

  it('returns valid JSON when format is json', () => {
    const nodes = [makeNode('vm1', 'aws-ec2', 'WebServer')]
    const output = generateCloudFormation(nodes, [], 'json')
    const parsed = JSON.parse(output)
    expect(parsed.AWSTemplateFormatVersion).toBeDefined()
    expect(parsed.Resources).toBeDefined()
  })

  it('handles empty nodes without crashing', () => {
    const output = generateCloudFormation([], [])
    expect(output).toContain('AWSTemplateFormatVersion')
  })

  it('handles undefined edges gracefully (BUG-2 fix)', () => {
    const nodes = [makeNode('vm1', 'aws-ec2', 'WebApp')]
    // The default parameter should handle this:
    expect(() => generateCloudFormation(nodes)).not.toThrow()
  })

  it('deduplicates colliding resource names (BUG-1 fix)', () => {
    const nodes = [makeNode('a', 'aws-ec2', 'WebServer'), makeNode('b', 'aws-ec2', 'WebServer')]
    const output = generateCloudFormation(nodes, [], 'json')
    const parsed = JSON.parse(output)
    const resourceKeys = Object.keys(parsed.Resources)
    // Both should exist, second one suffixed to avoid collision
    expect(resourceKeys.length).toBeGreaterThanOrEqual(2)
    // All names unique
    expect(new Set(resourceKeys).size).toBe(resourceKeys.length)
  })
})

// ─── ARM Generator ───────────────────────────────────────────────────────────

describe('generateARM', () => {
  it('returns valid ARM template for a single VM node', () => {
    const nodes = [makeNode('vm1', 'azure-vm', 'AppVM')]
    const output = generateARM(nodes, [])
    const parsed = JSON.parse(output)
    expect(parsed.$schema).toBeDefined()
    expect(parsed.contentVersion).toBe('1.0.0.0')
    expect(parsed.resources.length).toBeGreaterThanOrEqual(1)
  })

  it('handles empty nodes', () => {
    const output = generateARM([], [])
    const parsed = JSON.parse(output)
    expect(parsed.$schema).toBeDefined()
    expect(parsed.resources).toBeDefined()
  })

  it('handles undefined edges gracefully (BUG-2 fix)', () => {
    const nodes = [makeNode('vm1', 'azure-vm', 'MyVM')]
    expect(() => generateARM(nodes)).not.toThrow()
  })

  it('deduplicates colliding resource names (BUG-1 fix)', () => {
    const nodes = [makeNode('a', 'azure-vm', 'AppVM'), makeNode('b', 'azure-vm', 'AppVM')]
    const output = generateARM(nodes, [])
    const parsed = JSON.parse(output)
    const names = parsed.resources.map((r: { name: string }) => r.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('does not produce nested brackets in outputs (BUG-3 fix)', () => {
    const nodes = [makeNode('vm1', 'azure-vm', 'AppVM')]
    const output = generateARM(nodes, [])
    // ARM output values should NOT have [[...]] — only single brackets
    expect(output).not.toMatch(/\[\[/)
  })
})

// ─── Pulumi Generator ───────────────────────────────────────────────────────

describe('generatePulumi', () => {
  it('returns valid TypeScript for a single EC2 node', () => {
    const nodes = [makeNode('vm1', 'aws-ec2', 'WebServer')]
    const output = generatePulumi(nodes, [])
    expect(output).toContain('import')
    expect(output).toContain('pulumi')
  })

  it('handles empty nodes', () => {
    const output = generatePulumi([], [])
    expect(output).toContain('import')
  })

  it('handles undefined edges gracefully (BUG-2 fix)', () => {
    const nodes = [makeNode('vm1', 'aws-ec2', 'MyApp')]
    expect(() => generatePulumi(nodes)).not.toThrow()
  })

  it('deduplicates colliding resource names (BUG-1 fix)', () => {
    const nodes = [makeNode('a', 'aws-ec2', 'web'), makeNode('b', 'aws-ec2', 'web')]
    const output = generatePulumi(nodes, [])
    // Both names should appear in the output, with the second one being suffixed
    expect(output).toContain('web')
    // The collision-safe logic should produce a unique second name like web_1
    expect(output).toMatch(/web_1|web_2|web2/)
  })
})

// ─── cloud-mappings – tryConvertComponent IDs ────────────────────────────────

describe('cloud-mappings', () => {
  // Verify CLOUD_AGNOSTIC_MAPPINGS references correct catalog IDs
  it.each([
    'aws-ec2',
    'aws-rds',
    'aws-s3',
    'aws-alb',
    'aws-vpc',
    'azure-vm',
    'azure-sql',
    'azure-blob',
    'azure-vnet',
    'gcp-compute-instance',
    'gcp-cloud-sql',
    'gcp-cloud-storage',
    'gcp-vpc',
  ])('catalog contains component "%s"', id => {
    expect(getComponentById(id)).toBeDefined()
  })
})

// ─── snap-to-container – CONTAINER_NODE_TYPES ────────────────────────────────

describe('snap-to-container', () => {
  // We import the function to verify the 'container' type is now detected

  it('includes "container" in CONTAINER_NODE_TYPES (used by templates)', async () => {
    // We test indirectly via calculateSnapPosition
    const { calculateSnapPosition } = await import('@/lib/snap/snap-to-container')

    // A container node with type: 'container' (as used in all templates)
    const containerNode: Node = {
      id: 'vpc',
      type: 'container',
      position: { x: 0, y: 0 },
      data: { label: 'VPC', isContainer: true },
      measured: { width: 800, height: 600 },
    }

    // A child node dragged inside the container
    const child: Node = {
      id: 'vm',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'VM' },
      measured: { width: 150, height: 50 },
    }

    const result = calculateSnapPosition(child, [containerNode, child], {
      enabled: true,
      containerSnapThreshold: 30,
      gridSize: 20,
      edgeSnapThreshold: 15,
      showSnapIndicators: true,
      magneticEdges: true,
      containerPadding: 20,
    })

    // The container should be detected and snap type should be 'container'
    expect(result.containerId).toBe('vpc')
    expect(result.snapType).toBe('container')
  })
})
