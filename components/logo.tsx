import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
}

// Original viewBox: 0 0 365 453 → aspect ratio ~0.806
const LOGO_ASPECT = 365 / 453

export function Logo({ size = 24, className = '' }: LogoProps) {
  const width = Math.round(size * LOGO_ASPECT)
  return (
    <Image
      src="/logo.svg"
      alt="JobStack"
      width={width}
      height={size}
      className={className}
      priority
    />
  )
}

export function LogoIcon({ size = 24, className = '' }: LogoProps) {
  const width = Math.round(size * LOGO_ASPECT)
  return (
    <Image
      src="/logo.svg"
      alt="JobStack"
      width={width}
      height={size}
      className={className}
      priority
    />
  )
}
