'use client'

import { useState, useCallback, useRef } from 'react'
import {
  type EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
} from '@xyflow/react'

// ─────────────────────────────────────────────────────────────────────────────
// Semantic edge types — each maps to a distinct visual style AND terraform output
//
//  flow        → solid coloured arrow  — traffic path: LB→VM, App GW→VM, ALB→EC2
//                Generates: backend pool + target group + listener resources
//  dependency  → dashed grey arrow     — service call: App→SQL, Lambda→DynamoDB
//                Generates: connection_string in app_settings / locals.tf
//  peering     → thick blue ⇄ arrows  — network peer: VNet↔VNet, VPC↔VPC
//                Generates: azurerm_virtual_network_peering (×2), aws_vpc_peering_connection
// ─────────────────────────────────────────────────────────────────────────────
export type EdgeSemanticType = 'flow' | 'dependency' | 'peering'

const TYPE_STROKE: Record<EdgeSemanticType, string> = {
  flow: 'hsl(221 83% 53%)', // blue-ish primary
  dependency: '#9ca3af', // gray-400
  peering: '#3b82f6', // blue-500
}

const TYPE_STROKE_WIDTH: Record<EdgeSemanticType, number> = {
  flow: 2,
  dependency: 1.5,
  peering: 2.5,
}

const TYPE_DASH: Record<EdgeSemanticType, string | undefined> = {
  flow: undefined,
  dependency: '6 3',
  peering: undefined,
}

const TYPE_BADGE: Record<EdgeSemanticType, string> = {
  flow: '⟶ flow',
  dependency: '⋯ depends',
  peering: '⇄ peer',
}

const TYPE_BADGE_CLASS: Record<EdgeSemanticType, string> = {
  flow: 'bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  dependency: 'bg-muted/80 text-muted-foreground border-border',
  peering:
    'bg-indigo-100/80 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
}

/**
 * LabeledEdge — custom React Flow edge with:
 *  - Semantic type: flow / dependency / peering  (visual + Terraform impact)
 *  - Click the type badge to cycle between types
 *  - Double-click to add/edit a port label  (e.g. "HTTPS:443")
 */
export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState((data?.label as string) || '')
  const { setEdges } = useReactFlow()
  const inputRef = useRef<HTMLInputElement>(null)

  const edgeType: EdgeSemanticType = (data?.edgeType as EdgeSemanticType) || 'flow'

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const stroke = TYPE_STROKE[edgeType]
  const markerEndId = `arrowhead-${edgeType}`
  const markerStartId = edgeType === 'peering' ? `arrowhead-${edgeType}` : undefined

  const computedStyle: React.CSSProperties = {
    stroke,
    strokeWidth: TYPE_STROKE_WIDTH[edgeType],
    ...(TYPE_DASH[edgeType] ? { strokeDasharray: TYPE_DASH[edgeType] } : {}),
  }

  const handleDoubleClick = useCallback(() => {
    setInputValue((data?.label as string) || '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [data?.label])

  const commitEdit = useCallback(() => {
    setEditing(false)
    setEdges(eds =>
      eds.map(e => (e.id === id ? { ...e, data: { ...e.data, label: inputValue.trim() } } : e))
    )
  }, [id, inputValue, setEdges])

  // Click type badge to cycle: flow → dependency → peering → flow
  const cycleType = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const order: EdgeSemanticType[] = ['flow', 'dependency', 'peering']
      const next = order[(order.indexOf(edgeType) + 1) % order.length]
      setEdges(eds =>
        eds.map(edge =>
          edge.id === id ? { ...edge, data: { ...edge.data, edgeType: next } } : edge
        )
      )
    },
    [id, edgeType, setEdges]
  )

  const label = (data?.label as string) || ''

  return (
    <>
      {/* Inline SVG arrowhead markers — defined once per edge instance */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          {(['flow', 'dependency', 'peering'] as const).map(t => (
            <marker
              key={t}
              id={`arrowhead-${t}`}
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 8 3.5, 0 7" fill={TYPE_STROKE[t]} />
            </marker>
          ))}
        </defs>
      </svg>

      <BaseEdge
        id={id}
        path={edgePath}
        style={computedStyle}
        markerEnd={`url(#${markerEndId})`}
        markerStart={markerStartId ? `url(#${markerStartId})` : undefined}
      />

      <EdgeLabelRenderer>
        <div
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          className="absolute pointer-events-all nopan flex flex-col items-center gap-0.5"
          onDoubleClick={handleDoubleClick}
        >
          {/* Type badge — visible when selected; click to cycle */}
          {selected && !editing && (
            <span
              onClick={cycleType}
              className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium cursor-pointer select-none transition-opacity ${TYPE_BADGE_CLASS[edgeType]}`}
              title="Click to change type: flow → dependency → peering"
            >
              {TYPE_BADGE[edgeType]}
            </span>
          )}

          {/* Port / protocol label */}
          {editing ? (
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => {
                if (e.key === 'Enter') commitEdit()
                if (e.key === 'Escape') setEditing(false)
              }}
              placeholder="HTTPS:443"
              className="text-[10px] px-1.5 py-0.5 rounded border border-primary bg-background shadow-md outline-none w-28 font-mono"
            />
          ) : label ? (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded bg-background/95 border border-border shadow-sm text-muted-foreground font-mono cursor-pointer hover:text-foreground hover:border-primary/50 transition-colors"
              title="Double-click to edit"
            >
              {label}
            </span>
          ) : selected ? (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded bg-background/80 border border-dashed border-border/50 text-muted-foreground/60 cursor-pointer hover:border-primary/50 transition-colors"
              title="Double-click to add port label (e.g. HTTPS:443)"
            >
              + port
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
