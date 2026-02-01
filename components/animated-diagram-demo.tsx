'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Database, Server, Zap, Globe, Lock, ArrowRight } from 'lucide-react'

const demoNodes = [
  { id: 1, icon: Globe, label: 'CDN', color: '#F38020', x: 50, y: 50 },
  { id: 2, icon: Server, label: 'Next.js', color: '#000000', x: 200, y: 50 },
  { id: 3, icon: Zap, label: 'Lambda', color: '#FF9900', x: 350, y: 50 },
  { id: 4, icon: Database, label: 'PostgreSQL', color: '#336791', x: 200, y: 180 },
  { id: 5, icon: Lock, label: 'Auth', color: '#6366F1', x: 350, y: 180 },
  { id: 6, icon: Cloud, label: 'S3', color: '#FF9900', x: 500, y: 115 },
]

const demoEdges = [
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 5 },
  { from: 3, to: 6 },
  { from: 5, to: 4 },
]

function DiagramNode({ node, index, isVisible }: { node: typeof demoNodes[0], index: number, isVisible: boolean }) {
  const Icon = node.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
      transition={{ delay: index * 0.2, duration: 0.4, type: 'spring' }}
      className="absolute flex flex-col items-center"
      style={{ left: node.x, top: node.y }}
    >
      <motion.div
        className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg border-2"
        style={{ backgroundColor: `${node.color}15`, borderColor: node.color }}
        whileHover={{ scale: 1.1 }}
      >
        <Icon className="w-8 h-8" style={{ color: node.color }} />
      </motion.div>
      <span className="mt-2 text-xs font-medium text-foreground/80">{node.label}</span>
    </motion.div>
  )
}

function DiagramEdge({ from, to, index, isVisible }: {
  from: typeof demoNodes[0],
  to: typeof demoNodes[0],
  index: number,
  isVisible: boolean
}) {
  const x1 = from.x + 32
  const y1 = from.y + 32
  const x2 = to.x + 32
  const y2 = to.y + 32

  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="5,5"
      className="text-primary/30"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={isVisible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
      transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
    />
  )
}

export function AnimatedDiagramDemo() {
  const [isVisible, setIsVisible] = useState(false)
  const [showCode, setShowCode] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => setIsVisible(true), 500)
    const timer2 = setTimeout(() => setShowCode(true), 2500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Diagram Canvas */}
      <div className="relative h-80 bg-gradient-to-br from-background to-muted/50 rounded-2xl border shadow-2xl overflow-hidden">
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* SVG for edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {demoEdges.map((edge, i) => {
            const fromNode = demoNodes.find(n => n.id === edge.from)!
            const toNode = demoNodes.find(n => n.id === edge.to)!
            return (
              <DiagramEdge
                key={i}
                from={fromNode}
                to={toNode}
                index={i}
                isVisible={isVisible}
              />
            )
          })}
        </svg>

        {/* Nodes */}
        {demoNodes.map((node, i) => (
          <DiagramNode
            key={node.id}
            node={node}
            index={i}
            isVisible={isVisible}
          />
        ))}

        {/* Floating Labels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 2 }}
          className="absolute bottom-4 left-4 flex items-center gap-2 text-xs bg-background/80 backdrop-blur px-3 py-1.5 rounded-full border"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-muted-foreground">Auto-saving...</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 2.2 }}
          className="absolute bottom-4 right-4 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20"
        >
          Est. Cost: $127/mo
        </motion.div>
      </div>

      {/* Generated Code Preview */}
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 relative"
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Generated Terraform Code</span>
            </div>
            <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-xs overflow-hidden">
              <motion.pre
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <code>{`resource "aws_lambda_function" "api" {
  function_name = "jobstack-api"
  runtime       = "nodejs18.x"
  handler       = "index.handler"
  memory_size   = 256
}

resource "aws_db_instance" "postgres" {
  engine         = "postgres"
  engine_version = "15"
  instance_class = "db.t3.micro"
}`}</code>
              </motion.pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
