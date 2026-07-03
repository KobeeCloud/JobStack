'use client'

import { useState, useEffect } from 'react'
import { X, Smartphone } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function MobileWarningOverlay() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if the screen width indicates a mobile device
    const checkMobile = () => {
      if (window.innerWidth < 768 && !dismissed) {
        setShow(true)
      } else {
        setShow(false)
      }
    }

    // Initial check
    checkMobile()

    // Add resize listener
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [dismissed])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="max-w-md w-full border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Smartphone className="h-6 w-6" />
              <CardTitle>Mobile Experience Limited</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mt-2 -mr-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              onClick={() => {
                setDismissed(true)
                setShow(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-amber-700/80 dark:text-amber-300/80 pt-2">
            The infrastructure diagram builder is optimized for desktop use.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-amber-700 dark:text-amber-300">
          We noticed you&apos;re using a device with a smaller screen. While you can still view
          diagrams, editing them via drag-and-drop on mobile may be difficult.
          <div className="mt-4 flex justify-end">
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => {
                setDismissed(true)
                setShow(false)
              }}
            >
              Continue Anyway
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
