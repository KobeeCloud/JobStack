'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { TABS, type TabId } from './feature-tabs-data'
import { CodeLine } from './code-highlighter'

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function FeatureTabs() {
  const [active, setActive] = useState<TabId>('iaas')
  const tab = TABS.find(t => t.id === active)!

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-xl">
      <div className="grid lg:grid-cols-[220px_1fr]">
        {/* ── left sidebar – vertical tabs ── */}
        <div className="bg-muted/30 border-b lg:border-b-0 lg:border-r border-border/40 flex lg:flex-col">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={[
                'flex items-center gap-2.5 px-4 py-3.5 text-xs font-medium border-b lg:border-b lg:last:border-b-0 border-border/30 transition-all text-left relative',
                active === t.id
                  ? 'text-foreground bg-background/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/30',
              ].join(' ')}
            >
              {active === t.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* ── right panel ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.22 }}
            className="grid md:grid-cols-[1fr_1.3fr] min-h-[340px]"
          >
            {/* description */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-border/40 flex flex-col gap-4 justify-center">
              <span className={`inline-flex w-fit text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${tab.badgeColor}`}>
                {tab.badge}
              </span>
              <div>
                <h3 className="text-sm font-semibold mb-1.5">{tab.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tab.desc}</p>
              </div>
              <ul className="space-y-2">
                {tab.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary mt-px shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* code preview */}
            <div className="bg-zinc-950 flex flex-col overflow-hidden">
              {/* file bar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800">
                <div className="flex gap-1 mr-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">{tab.fileName}</span>
                <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded border font-mono ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              </div>

              {/* code body */}
              <div className="flex overflow-auto flex-1 font-mono text-[10.5px] leading-none py-3">
                {/* line numbers */}
                <div className="text-zinc-700 text-right pr-4 pl-3 select-none shrink-0">
                  {tab.code.map((_, i) => (
                    <div key={i} className="leading-[1.65]">{i + 1}</div>
                  ))}
                </div>
                {/* code */}
                <div className="flex-1 pr-4">
                  {tab.code.map((line, i) => (
                    <CodeLine key={i} line={line} lang={tab.lang} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
