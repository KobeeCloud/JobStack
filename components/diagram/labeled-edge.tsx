'use client'

import { useState, useCallback, useRef } from 'react'
import {
  type EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  useReactFlow,
} from '@xyflow/react'

/**
 * LabeledEdge — a custom React Flow edge that supports an editable label.
 *
 * Usage:
 *   - Double-click any edge to add/edit a label (e.g. "HTTPS:443", "TCP:5432")
 *   - Press Enter or click away to save
 *   - Press Escape to cancel
 *   - The label is stored in edge.data.label
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
  markerEnd,
  style,
  selected,
}: EdgeProps) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState((data?.label as string) || '')
  const { setEdges } = useReactFlow()
  const inputRef = useRef<HTMLInputElement>(null)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const handleDoubleClick = useCallback(() => {
    setInputValue((data?.label as string) || '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [data?.label])

  const commitEdit = useCallback(() => {
    setEditing(false)
    setEdges((eds) =>
      eds.map((e) =>
        e.id === id ? { ...e, data: { ...e.data, label: inputValue.trim() } } : e
      )
    )
  }, [id, inputValue, setEdges])

  const label = (data?.label as string) || ''

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="absolute pointer-events-all nopan"
          onDoubleClick={handleDoubleClick}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
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
              title="Double-click to add label (e.g. HTTPS:443)"
            >
              + label
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
