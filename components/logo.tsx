import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 24, className = '' }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="JobStack"
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}

export function LogoIcon({ size = 24, className = '' }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="js-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="js-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect x="16" y="16" width="480" height="480" rx="96" fill="url(#js-bg)" />
      <rect x="96" y="320" width="320" height="64" rx="12" fill="white" opacity="0.3" />
      <rect x="96" y="232" width="320" height="64" rx="12" fill="white" opacity="0.5" />
      <rect x="96" y="144" width="320" height="64" rx="12" fill="white" opacity="0.85" />
      <circle cx="160" cy="176" r="10" fill="url(#js-accent)" />
      <circle cx="256" cy="176" r="10" fill="url(#js-accent)" />
      <circle cx="352" cy="176" r="10" fill="url(#js-accent)" />
      <line x1="160" y1="186" x2="192" y2="232" stroke="white" strokeWidth="3" opacity="0.6" />
      <line x1="256" y1="186" x2="256" y2="232" stroke="white" strokeWidth="3" opacity="0.6" />
      <line x1="352" y1="186" x2="320" y2="232" stroke="white" strokeWidth="3" opacity="0.6" />
      <line x1="192" y1="296" x2="224" y2="320" stroke="white" strokeWidth="3" opacity="0.4" />
      <line x1="256" y1="296" x2="256" y2="320" stroke="white" strokeWidth="3" opacity="0.4" />
      <line x1="320" y1="296" x2="288" y2="320" stroke="white" strokeWidth="3" opacity="0.4" />
    </svg>
  )
}
