'use client'

import { useState, useCallback, useRef } from 'react'
import { Node, Edge } from '@xyflow/react'

interface HistoryState {
  nodes: Node[]
  edges: Edge[]
  timestamp: number
}

interface UseHistoryReturn {
  canUndo: boolean
  canRedo: boolean
  undo: () => HistoryState | null
  redo: () => HistoryState | null
  pushState: (nodes: Node[], edges: Edge[]) => void
  clear: () => void
  currentIndex: number
  historyLength: number
}

const MAX_HISTORY = 50 // Maximum number of states to keep

export function useHistory(initialNodes: Node[] = [], initialEdges: Edge[] = []): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryState[]>([
    { nodes: initialNodes, edges: initialEdges, timestamp: Date.now() }
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentIndexRef = useRef(0)
  const lastPushTime = useRef(0)
  const DEBOUNCE_MS = 300 // Debounce rapid changes

  // Keep ref in sync with state
  currentIndexRef.current = currentIndex

  const pushState = useCallback((nodes: Node[], edges: Edge[]) => {
    const now = Date.now()

    // Debounce rapid changes
    if (now - lastPushTime.current < DEBOUNCE_MS) {
      return
    }
    lastPushTime.current = now

    setHistory(prev => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, currentIndexRef.current + 1)

      // Add new state
      const newState: HistoryState = { nodes, edges, timestamp: now }
      newHistory.push(newState)

      // Limit history size
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift()
        return newHistory
      }

      return newHistory
    })

    setCurrentIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1))
  }, [])

  const undo = useCallback(() => {
    if (currentIndex <= 0) return null

    const newIndex = currentIndex - 1
    setCurrentIndex(newIndex)
    return history[newIndex]
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1) return null

    const newIndex = currentIndex + 1
    setCurrentIndex(newIndex)
    return history[newIndex]
  }, [currentIndex, history])

  const clear = useCallback(() => {
    setHistory([{ nodes: [], edges: [], timestamp: Date.now() }])
    setCurrentIndex(0)
  }, [])

  return {
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    undo,
    redo,
    pushState,
    clear,
    currentIndex,
    historyLength: history.length,
  }
}
