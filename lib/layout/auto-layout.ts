import { Node, Edge } from '@xyflow/react'

/**
 * Auto-Layout Algorithms for Cloud Architecture Diagrams
 * Provides multiple layout strategies optimized for infrastructure visualization
 */

export type LayoutAlgorithm = 
  | 'hierarchical' 
  | 'layered' 
  | 'radial' 
  | 'force-directed' 
  | 'grid'
  | 'tree'

export interface LayoutOptions {
  algorithm: LayoutAlgorithm
  direction?: 'TB' | 'BT' | 'LR' | 'RL'  // Top-Bottom, Bottom-Top, Left-Right, Right-Left
  nodeSpacing?: number
  layerSpacing?: number
  centerLayout?: boolean
  alignToGrid?: boolean
  gridSize?: number
}

const DEFAULT_OPTIONS: LayoutOptions = {
  algorithm: 'hierarchical',
  direction: 'TB',
  nodeSpacing: 100,
  layerSpacing: 150,
  centerLayout: true,
  alignToGrid: true,
  gridSize: 20,
}

const NODE_WIDTH = 200
const NODE_HEIGHT = 80

// Build adjacency list from edges
function buildGraph(nodes: Node[], edges: Edge[]): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>()
  
  nodes.forEach(node => graph.set(node.id, new Set()))
  
  edges.forEach(edge => {
    graph.get(edge.source)?.add(edge.target)
  })
  
  return graph
}

// Find root nodes (nodes with no incoming edges)
function findRoots(nodes: Node[], edges: Edge[]): string[] {
  const hasIncoming = new Set(edges.map(e => e.target))
  return nodes
    .filter(n => !hasIncoming.has(n.id))
    .map(n => n.id)
}

// Topological sort using Kahn's algorithm
function topologicalSort(nodes: Node[], graph: Map<string, Set<string>>): string[] {
  const inDegree = new Map<string, number>()
  nodes.forEach(n => inDegree.set(n.id, 0))
  
  graph.forEach((targets) => {
    targets.forEach(target => {
      inDegree.set(target, (inDegree.get(target) || 0) + 1)
    })
  })
  
  const queue = nodes.filter(n => inDegree.get(n.id) === 0).map(n => n.id)
  const result: string[] = []
  
  while (queue.length > 0) {
    const current = queue.shift()!
    result.push(current)
    
    graph.get(current)?.forEach(target => {
      const newDegree = (inDegree.get(target) || 0) - 1
      inDegree.set(target, newDegree)
      if (newDegree === 0) {
        queue.push(target)
      }
    })
  }
  
  // Add any remaining nodes (in case of cycles)
  nodes.forEach(n => {
    if (!result.includes(n.id)) {
      result.push(n.id)
    }
  })
  
  return result
}

// Assign layers using longest path
function assignLayers(nodes: Node[], edges: Edge[]): Map<string, number> {
  const graph = buildGraph(nodes, edges)
  const layers = new Map<string, number>()
  const roots = findRoots(nodes, edges)
  
  // BFS to assign layers
  const queue = roots.map(id => ({ id, layer: 0 }))
  
  if (queue.length === 0 && nodes.length > 0) {
    // No roots found, start from first node
    queue.push({ id: nodes[0].id, layer: 0 })
  }
  
  while (queue.length > 0) {
    const { id, layer } = queue.shift()!
    
    if (layers.has(id)) continue
    layers.set(id, layer)
    
    graph.get(id)?.forEach(target => {
      if (!layers.has(target)) {
        queue.push({ id: target, layer: layer + 1 })
      }
    })
  }
  
  // Assign remaining nodes
  nodes.forEach(n => {
    if (!layers.has(n.id)) {
      layers.set(n.id, 0)
    }
  })
  
  return layers
}

// Hierarchical layout (tree-like, top to bottom)
function hierarchicalLayout(nodes: Node[], edges: Edge[], options: LayoutOptions): Node[] {
  const layers = assignLayers(nodes, edges)
  const { direction = 'TB', nodeSpacing = 100, layerSpacing = 150 } = options
  
  // Group nodes by layer
  const layerGroups = new Map<number, Node[]>()
  nodes.forEach(node => {
    const layer = layers.get(node.id) || 0
    if (!layerGroups.has(layer)) {
      layerGroups.set(layer, [])
    }
    layerGroups.get(layer)!.push(node)
  })
  
  // Position nodes
  return nodes.map(node => {
    const layer = layers.get(node.id) || 0
    const nodesInLayer = layerGroups.get(layer) || []
    const indexInLayer = nodesInLayer.indexOf(node)
    const layerWidth = nodesInLayer.length * (NODE_WIDTH + nodeSpacing) - nodeSpacing
    
    let x: number, y: number
    
    switch (direction) {
      case 'TB':
        x = indexInLayer * (NODE_WIDTH + nodeSpacing) - layerWidth / 2 + 500
        y = layer * layerSpacing + 100
        break
      case 'BT':
        x = indexInLayer * (NODE_WIDTH + nodeSpacing) - layerWidth / 2 + 500
        y = -layer * layerSpacing + 500
        break
      case 'LR':
        x = layer * layerSpacing + 100
        y = indexInLayer * (NODE_HEIGHT + nodeSpacing) - (nodesInLayer.length * (NODE_HEIGHT + nodeSpacing)) / 2 + 300
        break
      case 'RL':
        x = -layer * layerSpacing + 800
        y = indexInLayer * (NODE_HEIGHT + nodeSpacing) - (nodesInLayer.length * (NODE_HEIGHT + nodeSpacing)) / 2 + 300
        break
      default:
        x = indexInLayer * (NODE_WIDTH + nodeSpacing)
        y = layer * layerSpacing
    }
    
    return {
      ...node,
      position: { x, y }
    }
  })
}

// Grid layout (simple, organized rows and columns)
function gridLayout(nodes: Node[], options: LayoutOptions): Node[] {
  const { nodeSpacing = 100, gridSize = 20 } = options
  const columns = Math.ceil(Math.sqrt(nodes.length))
  
  return nodes.map((node, index) => {
    const row = Math.floor(index / columns)
    const col = index % columns
    
    let x = col * (NODE_WIDTH + nodeSpacing) + 100
    let y = row * (NODE_HEIGHT + nodeSpacing) + 100
    
    // Snap to grid
    if (options.alignToGrid) {
      x = Math.round(x / gridSize) * gridSize
      y = Math.round(y / gridSize) * gridSize
    }
    
    return {
      ...node,
      position: { x, y }
    }
  })
}

// Radial layout (nodes arranged in circles around center)
function radialLayout(nodes: Node[], edges: Edge[], options: LayoutOptions): Node[] {
  const layers = assignLayers(nodes, edges)
  const maxLayer = Math.max(...Array.from(layers.values()))
  const centerX = 500
  const centerY = 400
  const layerRadius = options.layerSpacing || 200
  
  // Group by layer
  const layerGroups = new Map<number, Node[]>()
  nodes.forEach(node => {
    const layer = layers.get(node.id) || 0
    if (!layerGroups.has(layer)) {
      layerGroups.set(layer, [])
    }
    layerGroups.get(layer)!.push(node)
  })
  
  return nodes.map(node => {
    const layer = layers.get(node.id) || 0
    const nodesInLayer = layerGroups.get(layer) || []
    const indexInLayer = nodesInLayer.indexOf(node)
    
    if (layer === 0) {
      // Center node
      return {
        ...node,
        position: { x: centerX - NODE_WIDTH / 2, y: centerY - NODE_HEIGHT / 2 }
      }
    }
    
    const radius = layer * layerRadius
    const angleStep = (2 * Math.PI) / nodesInLayer.length
    const angle = indexInLayer * angleStep - Math.PI / 2
    
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle) - NODE_WIDTH / 2,
        y: centerY + radius * Math.sin(angle) - NODE_HEIGHT / 2
      }
    }
  })
}

// Force-directed layout (spring simulation)
function forceDirectedLayout(nodes: Node[], edges: Edge[], options: LayoutOptions): Node[] {
  const iterations = 100
  const k = options.nodeSpacing || 150 // Optimal distance
  const cooling = 0.95
  let temperature = 200
  
  // Initialize random positions if needed
  let positions = nodes.map(node => ({
    id: node.id,
    x: node.position.x || Math.random() * 800 + 100,
    y: node.position.y || Math.random() * 600 + 100
  }))
  
  const getPos = (id: string) => positions.find(p => p.id === id)!
  
  for (let i = 0; i < iterations; i++) {
    const forces = new Map<string, { fx: number; fy: number }>()
    nodes.forEach(n => forces.set(n.id, { fx: 0, fy: 0 }))
    
    // Repulsive forces between all node pairs
    for (let a = 0; a < nodes.length; a++) {
      for (let b = a + 1; b < nodes.length; b++) {
        const posA = getPos(nodes[a].id)
        const posB = getPos(nodes[b].id)
        
        const dx = posB.x - posA.x
        const dy = posB.y - posA.y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        
        const force = (k * k) / dist
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        
        forces.get(nodes[a].id)!.fx -= fx
        forces.get(nodes[a].id)!.fy -= fy
        forces.get(nodes[b].id)!.fx += fx
        forces.get(nodes[b].id)!.fy += fy
      }
    }
    
    // Attractive forces along edges
    edges.forEach(edge => {
      const posA = getPos(edge.source)
      const posB = getPos(edge.target)
      if (!posA || !posB) return
      
      const dx = posB.x - posA.x
      const dy = posB.y - posA.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      
      const force = (dist * dist) / k
      const fx = (dx / dist) * force * 0.5
      const fy = (dy / dist) * force * 0.5
      
      forces.get(edge.source)!.fx += fx
      forces.get(edge.source)!.fy += fy
      forces.get(edge.target)!.fx -= fx
      forces.get(edge.target)!.fy -= fy
    })
    
    // Apply forces
    positions = positions.map(pos => {
      const f = forces.get(pos.id)!
      const disp = Math.sqrt(f.fx * f.fx + f.fy * f.fy) || 1
      
      return {
        id: pos.id,
        x: pos.x + (f.fx / disp) * Math.min(disp, temperature),
        y: pos.y + (f.fy / disp) * Math.min(disp, temperature)
      }
    })
    
    temperature *= cooling
  }
  
  // Normalize positions (move to positive space)
  const minX = Math.min(...positions.map(p => p.x))
  const minY = Math.min(...positions.map(p => p.y))
  
  return nodes.map(node => {
    const pos = getPos(node.id)
    return {
      ...node,
      position: {
        x: pos.x - minX + 100,
        y: pos.y - minY + 100
      }
    }
  })
}

// Main layout function
export function applyLayout(
  nodes: Node[], 
  edges: Edge[], 
  options: Partial<LayoutOptions> = {}
): Node[] {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  
  if (nodes.length === 0) return []
  
  switch (mergedOptions.algorithm) {
    case 'hierarchical':
    case 'layered':
    case 'tree':
      return hierarchicalLayout(nodes, edges, mergedOptions)
    case 'grid':
      return gridLayout(nodes, mergedOptions)
    case 'radial':
      return radialLayout(nodes, edges, mergedOptions)
    case 'force-directed':
      return forceDirectedLayout(nodes, edges, mergedOptions)
    default:
      return hierarchicalLayout(nodes, edges, mergedOptions)
  }
}

// Snap single node to grid
export function snapToGrid(position: { x: number; y: number }, gridSize = 20): { x: number; y: number } {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  }
}

// Center layout in viewport
export function centerLayout(
  nodes: Node[], 
  viewportWidth: number, 
  viewportHeight: number
): Node[] {
  if (nodes.length === 0) return []
  
  const minX = Math.min(...nodes.map(n => n.position.x))
  const maxX = Math.max(...nodes.map(n => n.position.x + NODE_WIDTH))
  const minY = Math.min(...nodes.map(n => n.position.y))
  const maxY = Math.max(...nodes.map(n => n.position.y + NODE_HEIGHT))
  
  const layoutWidth = maxX - minX
  const layoutHeight = maxY - minY
  
  const offsetX = (viewportWidth - layoutWidth) / 2 - minX
  const offsetY = (viewportHeight - layoutHeight) / 2 - minY
  
  return nodes.map(node => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY
    }
  }))
}
