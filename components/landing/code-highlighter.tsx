// ─────────────────────────────────────────────────────────────────────────────
// Inline syntax highlighter (extracted from feature-tabs.tsx — SR-5)
// ─────────────────────────────────────────────────────────────────────────────

export function highlightHCL(line: string) {
  if (!line.trim()) return <span>&nbsp;</span>

  // Comment
  if (line.trimStart().startsWith('#')) {
    return <span className="text-zinc-600">{line}</span>
  }

  // resource / data / variable / output keywords
  const kwMatch = line.match(/^(\s*)(resource|data|variable|output|locals|module|provider)\b(.*)$/)
  if (kwMatch) {
    return (
      <>
        <span>{kwMatch[1]}</span>
        <span className="text-violet-400">{kwMatch[2]}</span>
        <span className="text-emerald-300">{kwMatch[3]}</span>
      </>
    )
  }

  // Key = "string"
  const strMatch = line.match(/^(\s*)(\w+)\s*(=)\s*(".*")(.*)$/)
  if (strMatch) {
    return (
      <>
        <span>{strMatch[1]}</span>
        <span className="text-sky-300">{strMatch[2]}</span>
        <span className="text-zinc-500">{' = '}</span>
        <span className="text-emerald-300">{strMatch[4]}</span>
        <span className="text-zinc-400">{strMatch[5]}</span>
      </>
    )
  }

  // Key = value (non-string)
  const valMatch = line.match(/^(\s*)(\w+)\s*(=)\s*(.+)$/)
  if (valMatch) {
    return (
      <>
        <span>{valMatch[1]}</span>
        <span className="text-sky-300">{valMatch[2]}</span>
        <span className="text-zinc-500">{' = '}</span>
        <span className="text-amber-300">{valMatch[4]}</span>
      </>
    )
  }

  // Brackets
  if (line.trim() === '}' || line.trim() === '{') {
    return <span className="text-zinc-600">{line}</span>
  }

  return <span className="text-zinc-300">{line}</span>
}

export function highlightYAML(line: string) {
  if (!line.trim()) return <span>&nbsp;</span>

  // Comment
  if (line.trimStart().startsWith('#')) {
    return <span className="text-zinc-600">{line}</span>
  }

  // List item
  const listMatch = line.match(/^(\s*-\s+)(.*)$/)
  if (listMatch) {
    return (
      <>
        <span className="text-amber-400">{listMatch[1]}</span>
        <span className="text-zinc-300">{listMatch[2]}</span>
      </>
    )
  }

  // key: "value" / key: value
  const kvMatch = line.match(/^(\s*)([\w-]+)(\s*:\s*)(.*)$/)
  if (kvMatch) {
    const val = kvMatch[4]
    const valEl = val.startsWith("'") || val.startsWith('"')
      ? <span className="text-emerald-300">{val}</span>
      : <span className="text-sky-300">{val}</span>
    return (
      <>
        <span>{kvMatch[1]}</span>
        <span className="text-violet-400">{kvMatch[2]}</span>
        <span className="text-zinc-500">{kvMatch[3]}</span>
        {valEl}
      </>
    )
  }

  return <span className="text-zinc-300">{line}</span>
}

export function CodeLine({ line, lang }: { line: string; lang: 'hcl' | 'yaml' }) {
  return (
    <div className="px-4 leading-[1.65] hover:bg-white/[0.02] transition-colors">
      {lang === 'hcl' ? highlightHCL(line) : highlightYAML(line)}
    </div>
  )
}
