/**
 * Shared Graph Utilities for All Generators
 *
 * Single source of truth for:
 * - Node map construction
 * - Component ID extraction
 * - Ancestor traversal
 * - Connected node discovery
 * - Name sanitization with collision avoidance
 * - Cycle detection (Kahn's algorithm)
 *
 * Eliminates code duplication across terraform.ts, cloudformation-generator.ts,
 * arm-generator.ts, pulumi-generator.ts, and cicd.ts.
 */

import { Node, Edge } from '@xyflow/react'
import { getComponentById, ComponentConfig } from '@/lib/catalog'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ResolvedNode {
  id: string
  componentId: string
  label: string
  sanitizedName: string
  catalog: ComponentConfig
  config: Record<string, unknown>
  parentId: string | null
  parentNode: ResolvedNode | null
  children: ResolvedNode[]
  depth: number
  provider: string
  terraformResource: string | null
}

export interface ResolvedEdge {
  id: string
  source: ResolvedNode
  target: ResolvedNode
  data: Record<string, unknown>
}

export interface InfraGraph {
  nodes: Map<string, ResolvedNode>
  edges: ResolvedEdge[]
  providers: Set<string>
  roots: ResolvedNode[]
  topologicalOrder: ResolvedNode[]
  validationErrors: GraphError[]
  warnings: string[]
}

export interface GraphError {
  nodeId: string
  label: string
  message: string
  severity: 'error' | 'warning'
}

// ─── Node Map & Component ID ─────────────────────────────────────────────────

/** Build a Map<nodeId, Node> for O(1) lookups */
export function buildNodeMap<T extends Record<string, unknown> = Record<string, unknown>>(nodes: Node<T>[]): Map<string, Node<T>> {
  const m = new Map<string, Node<T>>()
  for (const n of nodes) m.set(n.id, n)
  return m
}

/** Extract the componentId from a node's data (supports both `componentId` and `component` fields) */
export function getNodeComponentId(node: Node): string {
  return (node.data as Record<string, unknown>)?.componentId as string
    || (node.data as Record<string, unknown>)?.component as string
    || node.type
    || ''
}

// ─── Name Sanitization ──────────────────────────────────────────────────────

export type SanitizeFormat = 'terraform' | 'cfn' | 'arm' | 'pulumi'

/**
 * Sanitize a label into a valid resource name for the target format.
 * Each format has different rules for valid characters.
 */
export function sanitizeName(label: string, format: SanitizeFormat): string {
  switch (format) {
    case 'terraform':
      return label
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || 'resource'
    case 'cfn':
      return label.replace(/[^a-zA-Z0-9]/g, '').replace(/^[0-9]/, 'R$&') || 'Resource'
    case 'arm':
      return label.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 24) || 'resource'
    case 'pulumi':
      return label.replace(/[^a-zA-Z0-9]/g, '_').replace(/^[0-9]/, '_$&').toLowerCase() || 'resource'
    default:
      return label.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_') || 'resource'
  }
}

/**
 * Issue a unique name, tracking collisions with a `Set<string>`.
 * If the sanitized name was already issued, append a numeric suffix.
 */
export function uniqueName(label: string, format: SanitizeFormat, issuedNames: Set<string>): string {
  const base = sanitizeName(label, format)
  let name = base
  let counter = 1
  while (issuedNames.has(name)) {
    name = `${base}_${counter++}`
  }
  issuedNames.add(name)
  return name
}

// ─── Ancestor Traversal ─────────────────────────────────────────────────────

/**
 * Walk up the parentId chain to find the nearest ancestor matching a predicate.
 * Works across all generator formats.
 */
export function findAncestor<T extends Record<string, unknown> = Record<string, unknown>>(
  nodeId: string,
  nodeMap: Map<string, Node<T>>,
  predicate: (node: Node<T>) => boolean
): Node<T> | null {
  let current = nodeMap.get(nodeId)
  while (current?.parentId) {
    const parent = nodeMap.get(current.parentId)
    if (!parent) break
    if (predicate(parent)) return parent
    current = parent
  }
  return null
}

/**
 * Find an ancestor with a specific componentId.
 */
export function findAncestorByComponentId(
  nodeId: string,
  targetComponentId: string,
  nodeMap: Map<string, Node>
): Node | null {
  return findAncestor(nodeId, nodeMap, (node) => getNodeComponentId(node) === targetComponentId)
}

/**
 * Find an ancestor whose catalog component maps to the given Terraform resource type.
 */
export function findAncestorByTfResource(
  nodeId: string,
  nodeMap: Map<string, Node>,
  tfResource: string
): Node | null {
  return findAncestor(nodeId, nodeMap, (node) => {
    const compId = getNodeComponentId(node)
    if (!compId) return false
    const comp = getComponentById(compId)
    return comp?.terraform?.resource === tfResource
  })
}

// ─── Connected Node Discovery ───────────────────────────────────────────────

/**
 * Find all nodes connected to `nodeId` (via edges, in either direction)
 * that match one of the given component types.
 * Returns the node objects.
 */
export function findConnectedNodes(
  nodeId: string,
  targetTypes: string[],
  edges: Edge[],
  nodeMap: Map<string, Node>
): Node[] {
  const results: Node[] = []
  for (const edge of edges) {
    const otherId = edge.source === nodeId ? edge.target : edge.target === nodeId ? edge.source : null
    if (!otherId) continue
    const other = nodeMap.get(otherId)
    if (other && targetTypes.includes(getNodeComponentId(other))) {
      results.push(other)
    }
  }
  return results
}

/**
 * Find connected nodes and return their sanitized names from the nodeIdToName map.
 */
export function findConnectedNames(
  nodeId: string,
  targetTypes: string[],
  edges: Edge[],
  nodeMap: Map<string, Node>,
  nodeIdToName: Map<string, string>
): string[] {
  const results: string[] = []
  for (const edge of edges) {
    const otherId = edge.source === nodeId ? edge.target : edge.target === nodeId ? edge.source : null
    if (!otherId) continue
    const other = nodeMap.get(otherId)
    if (other && targetTypes.includes(getNodeComponentId(other))) {
      const name = nodeIdToName.get(otherId)
      if (name) results.push(name)
    }
  }
  return results
}

/**
 * Find an ancestor by componentId and return its sanitized name from the nodeIdToName map.
 */
export function findAncestorName(
  nodeId: string,
  targetComponentId: string,
  nodeMap: Map<string, Node>,
  nodeIdToName: Map<string, string>
): string | null {
  const ancestor = findAncestorByComponentId(nodeId, targetComponentId, nodeMap)
  if (ancestor) return nodeIdToName.get(ancestor.id) || null
  return null
}

// ─── Sibling Discovery ──────────────────────────────────────────────────────

/**
 * Find all sibling nodes (same parent) that match target component types.
 */
export function findSiblings(
  nodeId: string,
  targetTypes: string[],
  nodes: Node[],
  nodeIdToName: Map<string, string>
): string[] {
  const node = nodes.find(n => n.id === nodeId)
  if (!node?.parentId) return []
  return nodes
    .filter(n => n.id !== nodeId && n.parentId === node.parentId && targetTypes.includes(getNodeComponentId(n)))
    .map(n => nodeIdToName.get(n.id)!)
    .filter(Boolean)
}

// ─── Depth Calculation ──────────────────────────────────────────────────────

/** Return the depth of a node in the hierarchy (0 = root, higher = deeper) */
export function getNodeDepth(node: Node, nodeMap: Map<string, Node>): number {
  let depth = 0
  let current = node
  while (current.parentId) {
    const parent = nodeMap.get(current.parentId)
    if (!parent) break
    depth++
    current = parent
  }
  return depth
}

// ─── Cycle Detection ────────────────────────────────────────────────────────

/**
 * Detect cycles in the graph using Kahn's algorithm.
 * Considers both explicit edges and parent-child hierarchy.
 * Returns arrays of node IDs that participate in cycles.
 */
export function detectCycles(
  nodeIds: string[],
  edges: Edge[],
  nodeMap: Map<string, Node>
): string[][] {
  const inDegree = new Map<string, number>()
  const adj = new Map<string, string[]>()

  for (const id of nodeIds) {
    inDegree.set(id, 0)
    adj.set(id, [])
  }

  // Add edge-based adjacency
  for (const e of edges) {
    if (adj.has(e.source) && inDegree.has(e.target)) {
      adj.get(e.source)!.push(e.target)
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1)
    }
  }

  // Add parent → child adjacency
  for (const id of nodeIds) {
    const node = nodeMap.get(id)
    if (node?.parentId && adj.has(node.parentId)) {
      adj.get(node.parentId)!.push(id)
      inDegree.set(id, (inDegree.get(id) || 0) + 1)
    }
  }

  // Kahn's algorithm
  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const visited = new Set<string>()
  while (queue.length > 0) {
    const id = queue.shift()!
    visited.add(id)
    for (const next of adj.get(id) || []) {
      const newDeg = (inDegree.get(next) || 1) - 1
      inDegree.set(next, newDeg)
      if (newDeg === 0) queue.push(next)
    }
  }

  const cycleNodes = nodeIds.filter(id => !visited.has(id))
  return cycleNodes.length > 0 ? [cycleNodes] : []
}

// ─── InfraGraph Builder ─────────────────────────────────────────────────────

/**
 * Build a fully resolved infrastructure graph from raw React Flow nodes and edges.
 * This is the central IR that all generators should consume.
 */
export function buildInfraGraph(rawNodes: Node[], rawEdges: Edge[]): InfraGraph {
  const errors: GraphError[] = []
  const warnings: string[] = []
  const nodeMap = new Map<string, ResolvedNode>()
  const providers = new Set<string>()
  const issuedNames = new Set<string>()

  // Pass 1: Resolve all nodes
  for (const raw of rawNodes) {
    const componentId = getNodeComponentId(raw)
    if (!componentId) {
      errors.push({
        nodeId: raw.id,
        label: String((raw.data as Record<string, unknown>)?.label || 'Unknown'),
        message: 'Missing componentId',
        severity: 'error',
      })
      continue
    }
    const catalog = getComponentById(componentId)
    if (!catalog) {
      errors.push({
        nodeId: raw.id,
        label: String((raw.data as Record<string, unknown>)?.label || componentId),
        message: `Unknown component: ${componentId}`,
        severity: 'error',
      })
      continue
    }

    const label = String((raw.data as Record<string, unknown>)?.label || catalog.name)
    const baseName = sanitizeName(label, 'terraform')
    let finalName = baseName
    let counter = 1
    while (issuedNames.has(finalName)) finalName = `${baseName}_${counter++}`
    issuedNames.add(finalName)

    const resolved: ResolvedNode = {
      id: raw.id,
      componentId,
      label,
      sanitizedName: finalName,
      catalog,
      config: {
        ...(catalog.terraform?.defaultConfig || {}),
        ...((raw.data as Record<string, unknown>)?.config as Record<string, unknown> || {}),
      },
      parentId: raw.parentId || null,
      parentNode: null,
      children: [],
      depth: 0,
      provider: catalog.terraform?.provider || catalog.provider || 'generic',
      terraformResource: catalog.terraform?.resource || null,
    }

    if (catalog.terraform?.provider) providers.add(catalog.terraform.provider)
    nodeMap.set(raw.id, resolved)
  }

  // Pass 2: Link parent-child & compute depth
  for (const node of nodeMap.values()) {
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId)
      if (parent) {
        node.parentNode = parent
        parent.children.push(node)
      }
    }
  }

  for (const node of nodeMap.values()) {
    let d = 0
    let cur: ResolvedNode | null = node
    while (cur?.parentNode) {
      d++
      cur = cur.parentNode
    }
    node.depth = d
  }

  // Pass 3: Resolve edges
  const resolvedEdges: ResolvedEdge[] = []
  for (const raw of rawEdges) {
    const src = nodeMap.get(raw.source)
    const tgt = nodeMap.get(raw.target)
    if (!src || !tgt) continue
    resolvedEdges.push({
      id: raw.id,
      source: src,
      target: tgt,
      data: (raw.data as Record<string, unknown>) || {},
    })
  }

  // Pass 4: Cycle detection
  const allNodeIds = [...nodeMap.keys()]
  const rawNodeMap = new Map<string, Node>()
  for (const raw of rawNodes) rawNodeMap.set(raw.id, raw)

  const cycles = detectCycles(allNodeIds, rawEdges, rawNodeMap)
  for (const cycle of cycles) {
    errors.push({
      nodeId: cycle[0],
      label: nodeMap.get(cycle[0])?.label || '',
      message: `Circular dependency detected: ${cycle.map(id => nodeMap.get(id)?.label || id).join(' → ')}`,
      severity: 'error',
    })
  }

  // Pass 5: Topological sort (parents first, then deterministic by componentId + name)
  const topologicalOrder = [...nodeMap.values()]
  topologicalOrder.sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth
    if (a.componentId !== b.componentId) return a.componentId.localeCompare(b.componentId)
    return a.sanitizedName.localeCompare(b.sanitizedName)
  })

  const roots = [...nodeMap.values()].filter(n => !n.parentNode)

  return {
    nodes: nodeMap,
    edges: resolvedEdges,
    providers,
    roots,
    topologicalOrder,
    validationErrors: errors,
    warnings,
  }
}
