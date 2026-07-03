'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, Languages } from 'lucide-react'
import { useRouter } from 'next/navigation'

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
]

export function LanguageSwitcher() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const locale = useLocale()
  const activeLanguage = languages.find(language => language.code === locale) ?? languages[0]

  const handleChange = async (locale: string) => {
    if (locale === activeLanguage.code) {
      return
    }

    setIsLoading(true)
    try {
      await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      })
      router.refresh()
    } catch {
      // silently fail
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading} className="gap-2">
          <Languages className="h-4 w-4" />
          <span aria-hidden="true">{activeLanguage.flag}</span>
          <span className="text-sm font-medium uppercase">{activeLanguage.code}</span>
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(lang => (
          <DropdownMenuItem key={lang.code} onSelect={() => handleChange(lang.code)}>
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
            {lang.code === activeLanguage.code ? <Check className="ml-2 h-4 w-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
