interface LogoProps {
  size?: number
  className?: string
}

/**
 * Full wordmark logo — exact SVG design.
 * Text ("Job" dark / "Stack" blue) is embedded directly in the SVG.
 * `size` controls the height; width scales proportionally (220:50 ratio).
 */
export function Logo({ size = 32, className = '' }: LogoProps) {
  const h = size
  const w = Math.round(size * (220 / 50))
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 50"
      width={w}
      height={h}
      className={className}
      aria-label="JobStack"
    >
      <defs>
        <style>{`
          .js-text-job    { font-family: 'Inter', 'Segoe UI', sans-serif; font-weight: 800; font-size: 28px; fill: currentColor; }
          .js-text-stack  { font-family: 'Inter', 'Segoe UI', sans-serif; font-weight: 800; font-size: 28px; fill: #2563eb; }
          .js-node        { fill: #2563eb; }
          .js-conn        { stroke: #3b82f6; stroke-width: 3; fill: none; stroke-linecap: round; stroke-linejoin: round; }
          .js-bridge      { stroke: currentColor; stroke-width: 3; fill: none; stroke-linecap: round; }
          .js-brace       { stroke: currentColor; stroke-width: 2.5; fill: none; stroke-linecap: round; }
          .js-code        { stroke: currentColor; stroke-width: 3; stroke-linecap: round; }
          .js-code-accent { stroke: #2563eb; stroke-width: 3; stroke-linecap: round; }
        `}</style>
      </defs>

      {/* Graph nodes */}
      <circle cx="10" cy="14" r="4" className="js-node" />
      <circle cx="10" cy="36" r="4" className="js-node" />
      <path d="M 12 16 L 22 25 L 12 34" className="js-conn" />
      <circle cx="23" cy="25" r="4" className="js-node" />

      {/* Bridge */}
      <line x1="27" y1="25" x2="30" y2="25" className="js-bridge" />

      {/* Curly brace */}
      <path
        d="M 37 13 Q 34 13 34 17 L 34 21 Q 34 25 31 25 Q 34 25 34 29 L 34 33 Q 34 37 37 37"
        className="js-brace"
      />

      {/* Code lines */}
      <line x1="42" y1="15" x2="50" y2="15" className="js-code-accent" />
      <line x1="42" y1="25" x2="55" y2="25" className="js-code" />
      <line x1="42" y1="35" x2="47" y2="35" className="js-code" />

      {/* Wordmark — embedded in the SVG, no separate HTML needed */}
      <text x="66" y="35">
        <tspan className="js-text-job">Job</tspan><tspan className="js-text-stack">Stack</tspan>
      </text>
    </svg>
  )
}

/**
 * Icon-only variant — graph nodes + brace + code lines, no text.
 * Used in tight spaces: mobile nav, favicon, app header at small sizes.
 * viewBox crops the 220px canvas to the ~62px icon region.
 */
export function LogoIcon({ size = 24, className = '' }: LogoProps) {
  const w = Math.round(size * (62 / 50))
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 62 50"
      width={w}
      height={size}
      className={className}
      aria-label="JobStack"
    >
      <defs>
        <style>{`
          .js-icon-node        { fill: #2563eb; }
          .js-icon-conn        { stroke: #3b82f6; stroke-width: 3; fill: none; stroke-linecap: round; stroke-linejoin: round; }
          .js-icon-bridge      { stroke: currentColor; stroke-width: 3; fill: none; stroke-linecap: round; }
          .js-icon-brace       { stroke: currentColor; stroke-width: 2.5; fill: none; stroke-linecap: round; }
          .js-icon-code        { stroke: currentColor; stroke-width: 3; stroke-linecap: round; }
          .js-icon-code-accent { stroke: #2563eb; stroke-width: 3; stroke-linecap: round; }
        `}</style>
      </defs>

      <circle cx="10" cy="14" r="4" className="js-icon-node" />
      <circle cx="10" cy="36" r="4" className="js-icon-node" />
      <path d="M 12 16 L 22 25 L 12 34" className="js-icon-conn" />
      <circle cx="23" cy="25" r="4" className="js-icon-node" />

      <line x1="27" y1="25" x2="30" y2="25" className="js-icon-bridge" />

      <path
        d="M 37 13 Q 34 13 34 17 L 34 21 Q 34 25 31 25 Q 34 25 34 29 L 34 33 Q 34 37 37 37"
        className="js-icon-brace"
      />

      <line x1="42" y1="15" x2="50" y2="15" className="js-icon-code-accent" />
      <line x1="42" y1="25" x2="55" y2="25" className="js-icon-code" />
      <line x1="42" y1="35" x2="47" y2="35" className="js-icon-code" />
    </svg>
  )
}
