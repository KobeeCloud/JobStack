/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'

// ─── app/not-found.tsx ──────────────────────────────────────────────────────

// We test the exported component directly rather than via Next.js routing
jest.mock('next/link', () => {
  const LinkMock = ({ children, href, ...props }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href, ...props }, children)
  LinkMock.displayName = 'Link'
  return LinkMock
})

// Mock lucide-react icons to simple spans
jest.mock(
  'lucide-react',
  () =>
    new Proxy(
      {},
      {
        get: (_target, name) => {
          return (props: Record<string, unknown>) =>
            React.createElement('span', { 'data-testid': `icon-${String(name)}`, ...props })
        },
      }
    )
)

describe('NotFound page', () => {
  const NotFound = require('@/app/not-found').default

  it('renders 404 heading', () => {
    render(React.createElement(NotFound))
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders "Page not found" message', () => {
    render(React.createElement(NotFound))
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('has link to dashboard', () => {
    render(React.createElement(NotFound))
    const link = screen.getByText('Go to Dashboard').closest('a')
    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('has link to home', () => {
    render(React.createElement(NotFound))
    const link = screen.getByText('Back to Home').closest('a')
    expect(link).toHaveAttribute('href', '/')
  })
})

// ─── app/loading.tsx ────────────────────────────────────────────────────────

describe('Loading page', () => {
  const Loading = require('@/app/loading').default

  it('renders skeleton cards', () => {
    const { container } = render(React.createElement(Loading))
    const skeletonCards = container.querySelectorAll('.animate-pulse')
    expect(skeletonCards.length).toBeGreaterThan(5)
  })

  it('renders grid layout', () => {
    const { container } = render(React.createElement(Loading))
    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
  })
})

// ─── app/error.tsx ──────────────────────────────────────────────────────────

describe('Error page', () => {
  const ErrorPage = require('@/app/error').default

  it('renders error message', () => {
    const mockReset = jest.fn()
    const mockError = new Error('Test error')

    render(React.createElement(ErrorPage, { error: mockError, reset: mockReset }))
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders error digest when available', () => {
    const mockReset = jest.fn()
    const mockError = Object.assign(new Error('Test'), { digest: 'abc-123' })

    render(React.createElement(ErrorPage, { error: mockError, reset: mockReset }))
    expect(screen.getByText(/abc-123/)).toBeInTheDocument()
  })

  it('calls reset on "Try again" click', () => {
    const mockReset = jest.fn()
    const mockError = new Error('Test error')

    render(React.createElement(ErrorPage, { error: mockError, reset: mockReset }))
    screen.getByText('Try again').click()
    expect(mockReset).toHaveBeenCalledTimes(1)
  })
})
