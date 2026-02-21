interface LogoProps {
  size?: number
  className?: string
}

// Inline SVG — works in dark + light mode, no external file dependency
export function Logo({ size = 24, className = '' }: LogoProps) {
  const h = size
  const w = Math.round(size * 2.8)
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 112 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="JobStack"
    >
      {/* Icon: isometric stack of 3 layers */}
      <g>
        {/* Bottom layer */}
        <rect x="2" y="26" width="32" height="8" rx="2" fill="#6366f1" opacity="0.4"/>
        {/* Middle layer */}
        <rect x="2" y="17" width="32" height="8" rx="2" fill="#6366f1" opacity="0.7"/>
        {/* Top layer */}
        <rect x="2" y="8" width="32" height="8" rx="2" fill="#6366f1"/>
        {/* Vertical connector dots */}
        <circle cx="10" cy="24" r="1.5" fill="#6366f1" opacity="0.5"/>
        <circle cx="10" cy="15" r="1.5" fill="#6366f1" opacity="0.75"/>
      </g>
      {/* Wordmark */}
      <text
        x="40"
        y="27"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize="18"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        JobStack
      </text>
    </svg>
  )
}

// Icon-only variant for tight spaces (e.g. mobile nav)
export function LogoIcon({ size = 24, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="JobStack"
    >
      {/* Bottom layer */}
      <rect x="2" y="26" width="32" height="7" rx="2.5" fill="#6366f1" opacity="0.35"/>
      {/* Middle layer */}
      <rect x="2" y="16" width="32" height="7" rx="2.5" fill="#6366f1" opacity="0.65"/>
      {/* Top layer */}
      <rect x="2" y="6"  width="32" height="7" rx="2.5" fill="#6366f1"/>
    </svg>
  )
}
