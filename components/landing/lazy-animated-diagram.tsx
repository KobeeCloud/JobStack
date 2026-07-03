'use client'

import dynamic from 'next/dynamic'

const AnimatedDiagramDemo = dynamic(
  () =>
    import('@/components/animated-diagram-demo').then(m => ({ default: m.AnimatedDiagramDemo })),
  { ssr: false }
)

export function LazyAnimatedDiagramDemo() {
  return <AnimatedDiagramDemo />
}
