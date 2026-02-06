'use client';

import { useState, useEffect, useCallback } from 'react';
import { Node } from '@xyflow/react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface DragPreviewConfig {
  showGhost: boolean;
  showDropZones: boolean;
  showSnapLines: boolean;
  ghostOpacity: number;
  snapThreshold: number;
  animateGhost: boolean;
}

export interface DropZone {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  accepts: string[];
  isHighlighted: boolean;
}

export interface SnapLine {
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
  label?: string;
}

interface DragPreviewOverlayProps {
  isDragging: boolean;
  draggedNode: Node | null;
  mousePosition: { x: number; y: number };
  dropZones: DropZone[];
  snapLines: SnapLine[];
  config: DragPreviewConfig;
  zoom: number;
  viewportOffset: { x: number; y: number };
  onDropZoneEnter?: (zoneId: string) => void;
  onDropZoneLeave?: (zoneId: string) => void;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: DragPreviewConfig = {
  showGhost: true,
  showDropZones: true,
  showSnapLines: true,
  ghostOpacity: 0.6,
  snapThreshold: 10,
  animateGhost: true,
};

// Node type icons (simplified representations)
const NODE_ICONS: Record<string, string> = {
  'ec2': '🖥️',
  's3': '📦',
  'rds': '🗄️',
  'lambda': 'λ',
  'vpc': '🌐',
  'load-balancer': '⚖️',
  'api-gateway': '🚪',
  'dynamodb': '📊',
  'cloudfront': '☁️',
  'sns': '📢',
  'sqs': '📬',
  'container': '📦',
  'kubernetes': '☸️',
  'default': '◼️',
};

// ============================================================================
// Subcomponents
// ============================================================================

function GhostPreview({
  node,
  mousePosition,
  config,
  zoom,
}: {
  node: Node;
  mousePosition: { x: number; y: number };
  config: DragPreviewConfig;
  zoom: number;
}) {
  const nodeWidth = (node.measured?.width || 150) * zoom;
  const nodeHeight = (node.measured?.height || 50) * zoom;
  const icon = NODE_ICONS[node.type || 'default'] || NODE_ICONS.default;

  return (
    <div
      className={cn(
        'fixed pointer-events-none z-50 rounded-lg border-2 border-dashed border-blue-500 bg-blue-50',
        config.animateGhost && 'transition-all duration-75 ease-out'
      )}
      style={{
        left: mousePosition.x - nodeWidth / 2,
        top: mousePosition.y - nodeHeight / 2,
        width: nodeWidth,
        height: nodeHeight,
        opacity: config.ghostOpacity,
      }}
    >
      <div className="flex items-center justify-center h-full gap-2 text-blue-600">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium truncate max-w-[100px]">
          {node.data?.label as string || node.id}
        </span>
      </div>
    </div>
  );
}

function DropZoneHighlight({
  zone,
  zoom,
  viewportOffset,
}: {
  zone: DropZone;
  zoom: number;
  viewportOffset: { x: number; y: number };
}) {
  const x = zone.x * zoom + viewportOffset.x;
  const y = zone.y * zoom + viewportOffset.y;
  const width = zone.width * zoom;
  const height = zone.height * zoom;

  return (
    <div
      className={cn(
        'fixed pointer-events-none rounded-lg border-2 transition-all duration-200',
        zone.isHighlighted
          ? 'border-green-500 bg-green-100/50 shadow-lg shadow-green-200'
          : 'border-gray-300 bg-gray-50/30'
      )}
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    >
      <div
        className={cn(
          'absolute -top-6 left-2 px-2 py-0.5 rounded text-xs font-medium',
          zone.isHighlighted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
        )}
      >
        {zone.label}
        {zone.isHighlighted && ' ✓'}
      </div>
      {zone.isHighlighted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-green-600 font-medium">Drop here</span>
        </div>
      )}
    </div>
  );
}

function SnapLineIndicator({
  line,
  zoom,
  viewportOffset,
}: {
  line: SnapLine;
  zoom: number;
  viewportOffset: { x: number; y: number };
}) {
  if (line.type === 'horizontal') {
    const y = line.position * zoom + viewportOffset.y;
    const startX = line.start * zoom + viewportOffset.x;
    const endX = line.end * zoom + viewportOffset.x;

    return (
      <div className="fixed pointer-events-none">
        <div
          className="absolute h-px bg-red-500"
          style={{
            top: y,
            left: startX,
            width: endX - startX,
          }}
        />
        {line.label && (
          <div
            className="absolute -translate-y-1/2 bg-red-500 text-white text-[10px] px-1 rounded"
            style={{
              top: y,
              left: startX - 30,
            }}
          >
            {line.label}
          </div>
        )}
        {/* Markers at ends */}
        <div
          className="absolute w-2 h-2 rounded-full bg-red-500 -translate-x-1/2 -translate-y-1/2"
          style={{ top: y, left: startX }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-red-500 -translate-x-1/2 -translate-y-1/2"
          style={{ top: y, left: endX }}
        />
      </div>
    );
  }

  // Vertical line
  const x = line.position * zoom + viewportOffset.x;
  const startY = line.start * zoom + viewportOffset.y;
  const endY = line.end * zoom + viewportOffset.y;

  return (
    <div className="fixed pointer-events-none">
      <div
        className="absolute w-px bg-red-500"
        style={{
          left: x,
          top: startY,
          height: endY - startY,
        }}
      />
      {line.label && (
        <div
          className="absolute -translate-x-1/2 bg-red-500 text-white text-[10px] px-1 rounded"
          style={{
            left: x,
            top: startY - 16,
          }}
        >
          {line.label}
        </div>
      )}
      {/* Markers at ends */}
      <div
        className="absolute w-2 h-2 rounded-full bg-red-500 -translate-x-1/2 -translate-y-1/2"
        style={{ left: x, top: startY }}
      />
      <div
        className="absolute w-2 h-2 rounded-full bg-red-500 -translate-x-1/2 -translate-y-1/2"
        style={{ left: x, top: endY }}
      />
    </div>
  );
}

function DragInfo({
  node,
  mousePosition,
}: {
  node: Node;
  mousePosition: { x: number; y: number };
}) {
  return (
    <div
      className="fixed pointer-events-none bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-50"
      style={{
        left: mousePosition.x + 20,
        top: mousePosition.y + 20,
      }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{node.data?.label as string || node.id}</span>
        <span className="text-gray-400">
          x: {Math.round(mousePosition.x)}, y: {Math.round(mousePosition.y)}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function DragPreviewOverlay({
  isDragging,
  draggedNode,
  mousePosition,
  dropZones,
  snapLines,
  config = DEFAULT_CONFIG,
  zoom = 1,
  viewportOffset = { x: 0, y: 0 },
  onDropZoneEnter,
  onDropZoneLeave,
}: DragPreviewOverlayProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null);

  // Check which drop zone the cursor is over
  useEffect(() => {
    if (!isDragging || !config.showDropZones) {
      setActiveZone(null);
      return;
    }

    const hoveredZone = dropZones.find((zone) => {
      const zoneX = zone.x * zoom + viewportOffset.x;
      const zoneY = zone.y * zoom + viewportOffset.y;
      const zoneWidth = zone.width * zoom;
      const zoneHeight = zone.height * zoom;

      return (
        mousePosition.x >= zoneX &&
        mousePosition.x <= zoneX + zoneWidth &&
        mousePosition.y >= zoneY &&
        mousePosition.y <= zoneY + zoneHeight
      );
    });

    const newZoneId = hoveredZone?.id || null;

    if (newZoneId !== activeZone) {
      if (activeZone) {
        onDropZoneLeave?.(activeZone);
      }
      if (newZoneId) {
        onDropZoneEnter?.(newZoneId);
      }
      setActiveZone(newZoneId);
    }
  }, [isDragging, mousePosition, dropZones, zoom, viewportOffset, activeZone, config.showDropZones, onDropZoneEnter, onDropZoneLeave]);

  if (!isDragging || !draggedNode) {
    return null;
  }

  return (
    <>
      {/* Drop zones */}
      {config.showDropZones &&
        dropZones.map((zone) => (
          <DropZoneHighlight
            key={zone.id}
            zone={{
              ...zone,
              isHighlighted: zone.id === activeZone,
            }}
            zoom={zoom}
            viewportOffset={viewportOffset}
          />
        ))}

      {/* Snap lines */}
      {config.showSnapLines &&
        snapLines.map((line, index) => (
          <SnapLineIndicator
            key={`${line.type}-${line.position}-${index}`}
            line={line}
            zoom={zoom}
            viewportOffset={viewportOffset}
          />
        ))}

      {/* Ghost preview */}
      {config.showGhost && (
        <GhostPreview
          node={draggedNode}
          mousePosition={mousePosition}
          config={config}
          zoom={zoom}
        />
      )}

      {/* Drag info tooltip */}
      <DragInfo node={draggedNode} mousePosition={mousePosition} />
    </>
  );
}

// ============================================================================
// Hooks
// ============================================================================

export function useDragPreview(nodes: Node[]) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<Node | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [snapLines, setSnapLines] = useState<SnapLine[]>([]);

  const calculateSnapLines = useCallback(
    (nodeId: string, position: { x: number; y: number }, threshold: number = 10) => {
      const lines: SnapLine[] = [];
      const otherNodes = nodes.filter((n) => n.id !== nodeId);

      for (const other of otherNodes) {
        // Horizontal alignment (same Y)
        if (Math.abs(position.y - other.position.y) < threshold) {
          lines.push({
            type: 'horizontal',
            position: other.position.y,
            start: Math.min(position.x, other.position.x) - 50,
            end: Math.max(position.x, other.position.x) + 200,
            label: 'Align Y',
          });
        }

        // Vertical alignment (same X)
        if (Math.abs(position.x - other.position.x) < threshold) {
          lines.push({
            type: 'vertical',
            position: other.position.x,
            start: Math.min(position.y, other.position.y) - 50,
            end: Math.max(position.y, other.position.y) + 100,
            label: 'Align X',
          });
        }
      }

      setSnapLines(lines);
      return lines;
    },
    [nodes]
  );

  const onDragStart = useCallback((node: Node) => {
    setIsDragging(true);
    setDraggedNode(node);
  }, []);

  const onDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
      calculateSnapLines(node.id, node.position);
    },
    [calculateSnapLines]
  );

  const onDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedNode(null);
    setSnapLines([]);
  }, []);

  return {
    isDragging,
    draggedNode,
    mousePosition,
    snapLines,
    onDragStart,
    onDrag,
    onDragEnd,
  };
}

// ============================================================================
// Example Drop Zones Generator
// ============================================================================

export function generateDropZonesFromNodes(nodes: Node[]): DropZone[] {
  // Find container/group nodes and convert to drop zones
  return nodes
    .filter((node) => node.type === 'group' || node.type === 'vpc' || node.type === 'subnet')
    .map((node) => ({
      id: node.id,
      label: (node.data?.label as string) || node.id,
      x: node.position.x,
      y: node.position.y,
      width: node.measured?.width || 400,
      height: node.measured?.height || 300,
      accepts: ['ec2', 's3', 'rds', 'lambda'], // Example accepted types
      isHighlighted: false,
    }));
}

export default DragPreviewOverlay;
