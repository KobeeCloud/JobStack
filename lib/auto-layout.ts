import dagre from 'dagre'
import { Node, Edge } from '@xyflow/react'

export function getLayoutedElements(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction })

  nodes.forEach((node) => {
    // We base dimensions on node type or data. Containers need more space.
    let width = 200
    let height = 80

    if (node.type === 'container') {
      width = 400
      height = 300
    }

    dagreGraph.setNode(node.id, { width, height })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)

    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - (node.type === 'container' ? 200 : 100),
        y: nodeWithPosition.y - (node.type === 'container' ? 150 : 40),
      },
    }
  })

  return { nodes: newNodes as Node[], edges }
}
