import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, PlayCircle, Loader2 } from 'lucide-react'
import { Node, Edge } from '@xyflow/react'

interface TerminalProps {
  nodes: Node[]
  edges: Edge[]
  onClose: () => void
}

export function Terminal({ nodes, edges, onClose }: TerminalProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of logs
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const startDryRun = async () => {
    if (isRunning) return
    setIsRunning(true)
    setLogs([])
    setHasRun(true)

    try {
      const response = await fetch('/api/terraform/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      })

      if (!response.ok) {
        setLogs(prev => [...prev, '\x1b[31mError connecting to Terraform Engine\x1b[0m'])
        setIsRunning(false)
        return
      }

      if (!response.body) {
        setIsRunning(false)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        // Parse SSE SSE format: "data: {"text":"..."}\n\n"
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6))
              setLogs(prev => [...prev, data.text])
            } catch (e) {
              console.error('Failed to parse SSE data', e)
            }
          }
        }
      }
    } catch {
      setLogs(prev => [...prev, '\x1b[31mConnection lost to Terraform Engine\x1b[0m'])
    } finally {
      setIsRunning(false)
    }
  }

  // Helper to parse simple ANSI escape codes used by the mock API
  const parseAnsi = (text: string) => {
    let result = text
    result = result.replace(/\x1b\[31m(.*?)(\x1b\[0m|$)/g, '<span style="color: #ef4444">$1</span>') // Red
    result = result.replace(/\x1b\[32m(.*?)(\x1b\[0m|$)/g, '<span style="color: #22c55e">$1</span>') // Green
    result = result.replace(/\x1b\[33m(.*?)(\x1b\[0m|$)/g, '<span style="color: #eab308">$1</span>') // Yellow
    result = result.replace(
      /\x1b\[1m(.*?)(\x1b\[0m|$)/g,
      '<span style="font-weight: bold">$1</span>'
    ) // Bold
    result = result.replace(/\n/g, '<br/>')
    return result
  }

  return (
    <Card className="fixed bottom-0 left-72 right-[320px] h-64 z-40 rounded-b-none border-b-0 shadow-2xl flex flex-col bg-slate-950 text-slate-50 border-t border-slate-800">
      <CardHeader className="p-3 border-b border-slate-800 flex flex-row items-center justify-between shrink-0 bg-slate-900 rounded-t-lg">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <span className="text-slate-400">$</span> terraform plan (Dry Run)
          </CardTitle>
          {!isRunning && !hasRun && (
            <Button
              size="sm"
              variant="secondary"
              className="h-6 text-xs bg-slate-800 hover:bg-slate-700 text-slate-100"
              onClick={startDryRun}
            >
              <PlayCircle className="w-3 h-3 mr-1" /> Run Plan
            </Button>
          )}
          {isRunning && (
            <div className="flex items-center gap-1 text-xs text-slate-400 ml-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Planning...
            </div>
          )}
          {!isRunning && hasRun && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs hover:bg-slate-800 text-slate-400"
              onClick={startDryRun}
            >
              Rerun
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-slate-800 text-slate-400"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-y-auto font-mono text-[13px] leading-snug">
        {!hasRun && (
          <div className="text-slate-500 italic h-full flex items-center justify-center">
            Click &quot;Run Plan&quot; to execute terraform plan
          </div>
        )}
        {logs.map((log, index) => (
          <span key={index} dangerouslySetInnerHTML={{ __html: parseAnsi(log) }} />
        ))}
        <div ref={bottomRef} />
      </CardContent>
    </Card>
  )
}
