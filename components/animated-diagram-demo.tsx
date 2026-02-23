'use client'

import { useState, useEffect } from 'react'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion'
import { Code2, LayoutDashboard, DollarSign } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

type Phase = 'diagram' | 'terraform' | 'cost'
const PHASES: Phase[] = ['diagram', 'terraform', 'cost']
const PHASE_DURATION = 5200

const W = 112
const NODES = [
  { id: 'agw', label: 'App Gateway', sub: 'WAF v2',          color: '#3b82f6', x: 180, y: 12,  icon: '⚖️' },
  { id: 'vm1', label: 'Web Server',  sub: 'Standard_D2s_v3', color: '#22c55e', x: 42,  y: 110, icon: '🖥️' },
  { id: 'vm2', label: 'API Server',  sub: 'Standard_D2s_v3', color: '#22c55e', x: 318, y: 110, icon: '⚙️' },
  { id: 'sql', label: 'Azure SQL',   sub: 'S2 Standard',     color: '#a855f7', x: 148, y: 205, icon: '🗄️' },
  { id: 'kv',  label: 'Key Vault',   sub: 'Standard SKU',    color: '#f59e0b', x: 358, y: 205, icon: '🔑' },
]

const cx = (id: string) => NODES.find(n => n.id === id)!.x + W / 2
const cy = (id: string) => NODES.find(n => n.id === id)!.y + 28

const EDGES = [
  { from: 'agw', to: 'vm1' }, { from: 'agw', to: 'vm2' },
  { from: 'vm1', to: 'sql' }, { from: 'vm2', to: 'sql' },
  { from: 'vm2', to: 'kv'  },
]

const TF_LINES: { text: string; t: 'kw' | 'str' | 'val' | 'dim' | '' }[] = [
  { text: 'resource "azurerm_virtual_network" "prod_vnet" {', t: 'kw' },
  { text: '  name                = "${var.project_name}-vnet"', t: 'str' },
  { text: '  address_space       = ["10.0.0.0/16"]',           t: 'val' },
  { text: '  location            = var.azure_location',        t: 'val' },
  { text: '  resource_group_name = azurerm_resource_group.rg.name', t: 'val' },
  { text: '}',                                                 t: 'dim' },
  { text: '',                                                  t: ''    },
  { text: '# Attachment Associations — auto-generated',        t: 'dim' },
  { text: 'resource "azurerm_subnet_network_security_group_association" "nsg_assoc" {', t: 'kw' },
  { text: '  subnet_id                 = azurerm_subnet.web_subnet.id', t: 'val' },
  { text: '  network_security_group_id = azurerm_network_security_group.prod_nsg.id', t: 'val' },
  { text: '}',                                                 t: 'dim' },
  { text: '',                                                  t: ''    },
  { text: '# Traffic Flow — from LB → VM edge',               t: 'dim' },
  { text: 'resource "azurerm_lb_backend_address_pool" "pool_lb" {', t: 'kw' },
  { text: '  loadbalancer_id = azurerm_lb.prod_lb.id',         t: 'val' },
  { text: '  name            = "BackendPool"',                 t: 'str' },
  { text: '}',                                                 t: 'dim' },
]

const COSTS = [
  { name: 'App Gateway WAF v2', cost: '$145', pct: 38, color: '#3b82f6' },
  { name: 'VMs × 2  D2s_v3',   cost: '$148', pct: 40, color: '#22c55e' },
  { name: 'Azure SQL S2',       cost: '$75',  pct: 20, color: '#a855f7' },
  { name: 'Key Vault',          cost: '$5',   pct:  2, color: '#f59e0b' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Sub-views
// ─────────────────────────────────────────────────────────────────────────────

function DiagramPhase() {
  return (
    <div className="relative w-full h-full">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {EDGES.map((e, i) => (
          <m.line
            key={i}
            x1={cx(e.from)} y1={cy(e.from)}
            x2={cx(e.to)}   y2={cy(e.to)}
            stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="5 3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.35 }}
            transition={{ delay: 0.9 + i * 0.13, duration: 0.55 }}
          />
        ))}
      </svg>
      {NODES.map((node, i) => (
        <m.div
          key={node.id}
          className="absolute"
          style={{ left: node.x, top: node.y, width: W }}
          initial={{ opacity: 0, scale: 0.65, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: i * 0.12, type: 'spring', stiffness: 300, damping: 24 }}
        >
          <div
            className="rounded-xl border-2 px-3 py-2 shadow-sm"
            style={{ borderColor: node.color, backgroundColor: `${node.color}16` }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm leading-none">{node.icon}</span>
              <span className="text-[11px] font-semibold truncate" style={{ color: node.color }}>
                {node.label}
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5 ml-5 truncate">{node.sub}</p>
          </div>
        </m.div>
      ))}
      <m.div
        className="absolute bottom-0 left-0 flex items-center gap-1.5 text-[10px] bg-background/80 backdrop-blur px-2.5 py-1 rounded-full border"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-muted-foreground">Auto-saved</span>
      </m.div>
    </div>
  )
}

function TerraformPhase() {
  const [lines, setLines] = useState(0)
  useEffect(() => {
    setLines(0)
    const t = setInterval(() => {
      setLines(p => {
        if (p >= TF_LINES.length) {
          clearInterval(t)
          return p
        }
        return p + 1
      })
    }, 88)
    return () => clearInterval(t)
  }, [])

  const cls: Record<string, string> = {
    kw:  'text-violet-400', str: 'text-emerald-300',
    val: 'text-sky-300',    dim: 'text-zinc-600',
    '': 'h-2 block',
  }

  return (
    <div className="h-full bg-zinc-950 dark:bg-zinc-900/80 overflow-hidden font-mono text-[10.5px] leading-relaxed p-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-2 text-zinc-600 text-[9.5px]">resources.tf — generated</span>
      </div>
      {TF_LINES.slice(0, lines).map((l, i) => (
        <m.div
          key={i}
          initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
          className={l.t === '' ? 'h-2' : cls[l.t]}
        >
          {l.text || null}
        </m.div>
      ))}
      {lines < TF_LINES.length && (
        <m.span
          className="text-emerald-400"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.65 }}
        >▋</m.span>
      )}
    </div>
  )
}

function CostPhase() {
  return (
    <div className="h-full p-5 flex flex-col justify-center gap-4">
      <div>
        <m.p
          className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        >
          Estimated monthly cost
        </m.p>
        <m.p
          className="text-4xl font-bold text-primary"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring' }}
        >
          $373<span className="text-base font-normal text-muted-foreground"> /mo</span>
        </m.p>
      </div>
      <div className="space-y-3.5">
        {COSTS.map((c, i) => (
          <div key={c.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{c.name}</span>
              <span className="font-mono font-semibold">{c.cost}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <m.div
                className="h-full rounded-full"
                style={{ backgroundColor: c.color }}
                initial={{ width: 0 }}
                animate={{ width: `${c.pct}%` }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.85, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function AnimatedDiagramDemo() {
  const [idx, setIdx] = useState(0)
  const phase = PHASES[idx]

  useEffect(() => {
    const t = setTimeout(() => setIdx(i => (i + 1) % PHASES.length), PHASE_DURATION)
    return () => clearTimeout(t)
  }, [idx])

  const PHASE_META = {
    diagram:   { icon: <LayoutDashboard className="h-3.5 w-3.5" />, label: 'Diagram'   },
    terraform: { icon: <Code2            className="h-3.5 w-3.5" />, label: 'Terraform' },
    cost:      { icon: <DollarSign       className="h-3.5 w-3.5" />, label: 'Costs'     },
  }

  return (
    <LazyMotion features={domAnimation}>
    <div className="relative w-full max-w-[480px] mx-auto select-none">
      {/* Ambient glow */}
      <div className="absolute -inset-12 bg-primary/6 blur-3xl rounded-full pointer-events-none" />

      {/* Window chrome */}
      <m.div
        className="relative rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 180 }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/40 border-b border-border/40">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <p className="flex-1 text-center text-[11px] text-muted-foreground">
            prod-azure-3tier.diagram — JobStack
          </p>
          <div className="w-12" />
        </div>

        {/* Tab bar */}
        <div className="flex items-center border-b border-border/40 bg-background/30">
          {PHASES.map((p, i) => {
            const meta = PHASE_META[p]
            return (
              <button
                key={p}
                onClick={() => setIdx(i)}
                className={[
                  'flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-all',
                  phase === p
                    ? 'border-primary text-primary bg-background/60'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {meta.icon}{meta.label}
              </button>
            )
          })}
          <div className="flex-1 flex justify-end items-center pr-3">
            <div className="h-1 w-14 rounded-full bg-muted overflow-hidden">
              <m.div
                key={idx}
                className="h-full bg-primary/50 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: PHASE_DURATION / 1000, ease: 'linear' }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="h-[272px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            <m.div
              key={phase}
              className="absolute inset-0 p-3 w-full h-full"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {phase === 'diagram'   && <DiagramPhase />}
              {phase === 'terraform' && <TerraformPhase />}
              {phase === 'cost'      && <CostPhase />}
            </m.div>
          </AnimatePresence>
        </div>
      </m.div>

      {/* Floating badges */}
      <m.div
        className="absolute -top-2.5 -right-2 bg-emerald-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-semibold shadow-lg"
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
      >
        ✓ 0 errors
      </m.div>
      <m.div
        className="absolute -bottom-2.5 -left-2 bg-primary text-primary-foreground text-[10px] px-2.5 py-0.5 rounded-full font-semibold shadow-lg"
        animate={{ y: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 1 }}
      >
        ⚡ Live sync
      </m.div>
    </div>
    </LazyMotion>
  )
}
