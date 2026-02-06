'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Keyboard, Command } from 'lucide-react'

interface ShortcutCategory {
  name: string
  shortcuts: {
    keys: string[]
    description: string
    mac?: string[]
  }[]
}

const SHORTCUTS: ShortcutCategory[] = [
  {
    name: 'General',
    shortcuts: [
      { keys: ['Ctrl', 'S'], mac: ['⌘', 'S'], description: 'Save diagram' },
      { keys: ['Ctrl', 'Z'], mac: ['⌘', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], mac: ['⌘', 'Shift', 'Z'], description: 'Redo' },
      { keys: ['Ctrl', 'A'], mac: ['⌘', 'A'], description: 'Select all nodes' },
      { keys: ['Delete'], description: 'Delete selected' },
      { keys: ['Escape'], description: 'Deselect all / Close panels' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
  {
    name: 'Navigation',
    shortcuts: [
      { keys: ['Space + Drag'], description: 'Pan canvas' },
      { keys: ['Scroll'], description: 'Zoom in/out' },
      { keys: ['Ctrl', '0'], mac: ['⌘', '0'], description: 'Reset zoom to 100%' },
      { keys: ['Ctrl', '+'], mac: ['⌘', '+'], description: 'Zoom in' },
      { keys: ['Ctrl', '-'], mac: ['⌘', '-'], description: 'Zoom out' },
      { keys: ['F'], description: 'Fit diagram to view' },
      { keys: ['Arrow Keys'], description: 'Nudge selected nodes' },
    ],
  },
  {
    name: 'Selection',
    shortcuts: [
      { keys: ['Click'], description: 'Select node' },
      { keys: ['Shift + Click'], description: 'Add to selection' },
      { keys: ['Ctrl + Click'], mac: ['⌘ + Click'], description: 'Toggle selection' },
      { keys: ['Drag (empty space)'], description: 'Box selection' },
    ],
  },
  {
    name: 'Editing',
    shortcuts: [
      { keys: ['Ctrl', 'C'], mac: ['⌘', 'C'], description: 'Copy selected' },
      { keys: ['Ctrl', 'V'], mac: ['⌘', 'V'], description: 'Paste' },
      { keys: ['Ctrl', 'D'], mac: ['⌘', 'D'], description: 'Duplicate selected' },
      { keys: ['Enter'], description: 'Edit selected node' },
      { keys: ['G'], description: 'Group selected nodes' },
      { keys: ['Ctrl', 'G'], mac: ['⌘', 'G'], description: 'Ungroup' },
    ],
  },
  {
    name: 'Tools',
    shortcuts: [
      { keys: ['V'], description: 'Select tool (default)' },
      { keys: ['H'], description: 'Hand/Pan tool' },
      { keys: ['C'], description: 'Connect mode' },
      { keys: ['T'], description: 'Add text annotation' },
      { keys: ['R'], description: 'Add rectangle region' },
    ],
  },
  {
    name: 'Panels',
    shortcuts: [
      { keys: ['1'], description: 'Toggle component catalog' },
      { keys: ['2'], description: 'Toggle properties panel' },
      { keys: ['3'], description: 'Toggle AI assistant' },
      { keys: ['Ctrl', 'E'], mac: ['⌘', 'E'], description: 'Export diagram' },
      { keys: ['Ctrl', 'I'], mac: ['⌘', 'I'], description: 'Import' },
      { keys: ['Ctrl', ','], mac: ['⌘', ','], description: 'Open settings' },
    ],
  },
]

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function KeyBadge({ children }: { children: string }) {
  return (
    <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
      {children}
    </Badge>
  )
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quick reference for all available keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {SHORTCUTS.map((category) => (
              <div key={category.name}>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, index) => {
                    const keys = isMac && shortcut.mac ? shortcut.mac : shortcut.keys
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {keys.map((key, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <KeyBadge>{key}</KeyBadge>
                              {i < keys.length - 1 && (
                                <span className="text-muted-foreground text-xs">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-center gap-2 pt-4 border-t text-sm text-muted-foreground">
          <Command className="h-4 w-4" />
          <span>Press <KeyBadge>?</KeyBadge> anytime to show this dialog</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook to listen for keyboard shortcuts
export function useKeyboardShortcuts(handlers: {
  onSave?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onDelete?: () => void
  onSelectAll?: () => void
  onCopy?: () => void
  onPaste?: () => void
  onDuplicate?: () => void
  onShowHelp?: () => void
  onFitView?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetZoom?: () => void
  onToggleCatalog?: () => void
  onToggleProperties?: () => void
  onToggleAI?: () => void
  onExport?: () => void
  onImport?: () => void
  onSettings?: () => void
  onEscape?: () => void
}) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if typing in input fields
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement).isContentEditable
    ) {
      return
    }

    const isMod = e.metaKey || e.ctrlKey

    // Help
    if (e.key === '?' && !isMod) {
      e.preventDefault()
      handlers.onShowHelp?.()
      return
    }

    // Escape
    if (e.key === 'Escape') {
      e.preventDefault()
      handlers.onEscape?.()
      return
    }

    // Fit view
    if (e.key === 'f' && !isMod) {
      e.preventDefault()
      handlers.onFitView?.()
      return
    }

    // Panel toggles (number keys)
    if (e.key === '1' && !isMod) {
      e.preventDefault()
      handlers.onToggleCatalog?.()
      return
    }
    if (e.key === '2' && !isMod) {
      e.preventDefault()
      handlers.onToggleProperties?.()
      return
    }
    if (e.key === '3' && !isMod) {
      e.preventDefault()
      handlers.onToggleAI?.()
      return
    }

    // Delete
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!isMod) {
        e.preventDefault()
        handlers.onDelete?.()
        return
      }
    }

    // Mod + key shortcuts
    if (isMod) {
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault()
          handlers.onSave?.()
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            handlers.onRedo?.()
          } else {
            handlers.onUndo?.()
          }
          break
        case 'a':
          e.preventDefault()
          handlers.onSelectAll?.()
          break
        case 'c':
          e.preventDefault()
          handlers.onCopy?.()
          break
        case 'v':
          e.preventDefault()
          handlers.onPaste?.()
          break
        case 'd':
          e.preventDefault()
          handlers.onDuplicate?.()
          break
        case 'e':
          e.preventDefault()
          handlers.onExport?.()
          break
        case 'i':
          e.preventDefault()
          handlers.onImport?.()
          break
        case ',':
          e.preventDefault()
          handlers.onSettings?.()
          break
        case '0':
          e.preventDefault()
          handlers.onResetZoom?.()
          break
        case '=':
        case '+':
          e.preventDefault()
          handlers.onZoomIn?.()
          break
        case '-':
          e.preventDefault()
          handlers.onZoomOut?.()
          break
      }
    }
  }, [handlers])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
