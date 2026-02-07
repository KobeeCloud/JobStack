'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function ResendVerificationButton() {
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(false)

  const handleResend = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        toast.error('No email found. Please sign in again.')
        return
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })

      if (error) throw error

      toast.success('Verification email sent! Check your inbox.')
      setCooldown(true)
      setTimeout(() => setCooldown(false), 60000) // 60s cooldown
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to resend verification email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleResend}
      disabled={loading || cooldown}
      variant="outline"
      className="w-full"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Mail className="mr-2 h-4 w-4" />
      )}
      {cooldown ? 'Email sent (wait 60s)' : 'Resend verification email'}
    </Button>
  )
}
