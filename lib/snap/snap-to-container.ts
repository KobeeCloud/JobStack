'use client';

import { useCallback, useMemo } from 'react';
import { Node, XYPosition } from '@xyflow/react';

// ============================================================================
// Types
// ============================================================================

export interface ContainerNode extends Node {
  data: {
    label?: string;
    isContainer?: boolean;
    acceptedTypes?: string[];
    padding?: number;
    [key: string]: unknown;
  };
}

export interface SnapResult {
  snappedPosition: XYPosition;
  containerId: string | null;
  snapType: 'container' | 'grid' | 'edge' | 'none';
  snapDistance: number;
}

export interface SnapConfig {
  enabled: boolean;
  containerSnapThreshold: number;
  gridSize: number;
  edgeSnapThreshold: number;
  showSnapIndicators: boolean;
  magneticEdges: boolean;
  containerPadding: number;
}

export interface ContainerBounds {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  padding: number;
  acceptedTypes: string[];
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: true,
  containerSnapThreshold: 30,
  gridSize: 20,
  edgeSnapThreshold: 15,
  showSnapIndicators: true,
  magneticEdges: true,
  containerPadding: 20,
};

// Container node types
const CONTAINER_NODE_TYPES = [
  'group',
  'vpc',
  'subnet',
  'region',
  'availability-zone',
  'resource-group',
  'vnet',
  'security-group',
  'cluster',
  'namespace',
];

// ============================================================================
// Utility Functions
// ============================================================================

function isContainerNode(node: Node): boolean {
  return (
    CONTAINER_NODE_TYPES.includes(node.type || '') ||
    (node.data as Record<string, unknown>)?.isContainer === true
  );
}

function getContainerBounds(node: Node, padding: number = 20): ContainerBounds {
  const width = node.measured?.width || 400;
  const height = node.measured?.height || 300;

  return {
    id: node.id,
    left: node.position.x + padding,
    right: node.position.x + width - padding,
    top: node.position.y + padding,
    bottom: node.position.y + height - padding,
    padding,
    acceptedTypes: ((node.data as Record<string, unknown>)?.acceptedTypes as string[]) || [],
  };
}

function isPointInBounds(point: XYPosition, bounds: ContainerBounds): boolean {
  return (
    point.x >= bounds.left &&
    point.x <= bounds.right &&
    point.y >= bounds.top &&
    point.y <= bounds.bottom
  );
}

function getDistanceToBounds(point: XYPosition, bounds: ContainerBounds): number {
  // If inside, return negative distance (depth into container)
  if (isPointInBounds(point, bounds)) {
    const distances = [
      point.x - bounds.left,
      bounds.right - point.x,
      point.y - bounds.top,
      bounds.bottom - point.y,
    ];
    return -Math.min(...distances);
  }

  // Calculate distance to nearest edge
  const dx = Math.max(bounds.left - point.x, 0, point.x - bounds.right);
  const dy = Math.max(bounds.top - point.y, 0, point.y - bounds.bottom);
  return Math.sqrt(dx * dx + dy * dy);
}

function snapToGrid(position: XYPosition, gridSize: number): XYPosition {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}

function snapToContainerEdge(
  position: XYPosition,
  nodeWidth: number,
  nodeHeight: number,
  bounds: ContainerBounds,
  threshold: number
): XYPosition {
  let snappedX = position.x;
  let snappedY = position.y;

  // Snap to left edge
  if (Math.abs(position.x - bounds.left) < threshold) {
    snappedX = bounds.left;
  }
  // Snap to right edge (accounting for node width)
  if (Math.abs(position.x + nodeWidth - bounds.right) < threshold) {
    snappedX = bounds.right - nodeWidth;
  }
  // Snap to top edge
  if (Math.abs(position.y - bounds.top) < threshold) {
    snappedY = bounds.top;
  }
  // Snap to bottom edge (accounting for node height)
  if (Math.abs(position.y + nodeHeight - bounds.bottom) < threshold) {
    snappedY = bounds.bottom - nodeHeight;
  }

  return { x: snappedX, y: snappedY };
}

// ============================================================================
// Main Snap Function
// ============================================================================

export function calculateSnapPosition(
  draggedNode: Node,
  allNodes: Node[],
  config: SnapConfig = DEFAULT_SNAP_CONFIG
): SnapResult {
  if (!config.enabled) {
    return {
      snappedPosition: draggedNode.position,
      containerId: null,
      snapType: 'none',
      snapDistance: 0,
    };
  }

  const nodeWidth = draggedNode.measured?.width || 150;
  const nodeHeight = draggedNode.measured?.height || 50;
  const nodeCenter: XYPosition = {
    x: draggedNode.position.x + nodeWidth / 2,
    y: draggedNode.position.y + nodeHeight / 2,
  };

  // Find all container nodes
  const containers = allNodes
    .filter((n) => n.id !== draggedNode.id && isContainerNode(n))
    .map((n) => getContainerBounds(n, config.containerPadding));

  // Find the best container to snap to
  let bestContainer: ContainerBounds | null = null;
  let bestDistance = Infinity;

  for (const container of containers) {
    // Check if node type is accepted
    const nodeType = draggedNode.type || 'default';
    if (
      container.acceptedTypes.length > 0 &&
      !container.acceptedTypes.includes(nodeType)
    ) {
      continue;
    }

    const distance = getDistanceToBounds(nodeCenter, container);
    
    // If inside container (negative distance = deeper inside)
    if (distance < 0 && distance < bestDistance) {
      bestDistance = distance;
      bestContainer = container;
    }
    // If within snap threshold
    else if (distance >= 0 && distance < config.containerSnapThreshold && distance < bestDistance) {
      bestDistance = distance;
      bestContainer = container;
    }
  }

  // Calculate snapped position
  let snappedPosition = draggedNode.position;
  let snapType: SnapResult['snapType'] = 'none';

  if (bestContainer) {
    // Snap to container
    if (config.magneticEdges) {
      snappedPosition = snapToContainerEdge(
        draggedNode.position,
        nodeWidth,
        nodeHeight,
        bestContainer,
        config.edgeSnapThreshold
      );
    }

    // Constrain within container bounds
    snappedPosition = {
      x: Math.max(bestContainer.left, Math.min(bestContainer.right - nodeWidth, snappedPosition.x)),
      y: Math.max(bestContainer.top, Math.min(bestContainer.bottom - nodeHeight, snappedPosition.y)),
    };

    snapType = 'container';
  } else {
    // Snap to grid if not in container
    snappedPosition = snapToGrid(draggedNode.position, config.gridSize);
    snapType = 'grid';
  }

  return {
    snappedPosition,
    containerId: bestContainer?.id || null,
    snapType,
    snapDistance: bestDistance,
  };
}

// ============================================================================
// React Hook
// ============================================================================

export function useSnapToContainer(
  nodes: Node[],
  config: Partial<SnapConfig> = {}
) {
  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_SNAP_CONFIG, ...config }),
    [config]
  );

  const containers = useMemo(
    () =>
      nodes.filter((n) => isContainerNode(n)).map((n) => ({
        ...n,
        bounds: getContainerBounds(n, mergedConfig.containerPadding),
      })),
    [nodes, mergedConfig.containerPadding]
  );

  const findContainerForNode = useCallback(
    (node: Node): string | null => {
      const nodeCenter: XYPosition = {
        x: node.position.x + (node.measured?.width || 150) / 2,
        y: node.position.y + (node.measured?.height || 50) / 2,
      };

      for (const container of containers) {
        if (isPointInBounds(nodeCenter, container.bounds)) {
          const nodeType = node.type || 'default';
          if (
            container.bounds.acceptedTypes.length === 0 ||
            container.bounds.acceptedTypes.includes(nodeType)
          ) {
            return container.id;
          }
        }
      }

      return null;
    },
    [containers]
  );

  const snapNodePosition = useCallback(
    (node: Node): SnapResult => {
      return calculateSnapPosition(node, nodes, mergedConfig);
    },
    [nodes, mergedConfig]
  );

  const getContainerHighlights = useCallback(
    (draggedNode: Node): Array<{ id: string; isValid: boolean }> => {
      const nodeType = draggedNode.type || 'default';
      const nodeCenter: XYPosition = {
        x: draggedNode.position.x + (draggedNode.measured?.width || 150) / 2,
        y: draggedNode.position.y + (draggedNode.measured?.height || 50) / 2,
      };

      return containers.map((container) => {
        const isInside = isPointInBounds(nodeCenter, container.bounds);
        const isNearby =
          getDistanceToBounds(nodeCenter, container.bounds) <
          mergedConfig.containerSnapThreshold;
        const isAccepted =
          container.bounds.acceptedTypes.length === 0 ||
          container.bounds.acceptedTypes.includes(nodeType);

        return {
          id: container.id,
          isValid: (isInside || isNearby) && isAccepted,
        };
      });
    },
    [containers, mergedConfig.containerSnapThreshold]
  );

  return {
    containers,
    findContainerForNode,
    snapNodePosition,
    getContainerHighlights,
    config: mergedConfig,
  };
}

// ============================================================================
// Reparenting Logic
// ============================================================================

export function reparentNode(
  node: Node,
  newParentId: string | null,
  nodes: Node[]
): Node[] {
  return nodes.map((n) => {
    if (n.id === node.id) {
      if (newParentId) {
        // Find parent to calculate relative position
        const parent = nodes.find((p) => p.id === newParentId);
        if (parent) {
          const relativeX = node.position.x - parent.position.x;
          const relativeY = node.position.y - parent.position.y;
          return {
            ...n,
            parentId: newParentId,
            position: { x: relativeX, y: relativeY },
            extent: 'parent' as const,
          };
        }
      }
      // Remove from parent
      const { parentId, extent, ...rest } = n;
      return {
        ...rest,
        parentId: undefined,
        extent: undefined,
      };
    }
    return n;
  });
}

export function getAbsolutePosition(node: Node, nodes: Node[]): XYPosition {
  if (!node.parentId) {
    return node.position;
  }

  const parent = nodes.find((n) => n.id === node.parentId);
  if (!parent) {
    return node.position;
  }

  const parentAbsolute = getAbsolutePosition(parent, nodes);
  return {
    x: parentAbsolute.x + node.position.x,
    y: parentAbsolute.y + node.position.y,
  };
}

// ============================================================================
// Export
// ============================================================================

export const SnapToContainerUtils = {
  isContainerNode,
  getContainerBounds,
  isPointInBounds,
  getDistanceToBounds,
  snapToGrid,
  snapToContainerEdge,
  calculateSnapPosition,
  reparentNode,
  getAbsolutePosition,
};

export default useSnapToContainer;
