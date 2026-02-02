import { toast as sonnerToast } from 'sonner'

type ToastVariant = 'default' | 'destructive'

export function useToast() {
  return {
    toast: ({ title, description, variant }: { title: string; description?: string; variant?: ToastVariant }) => {
      if (variant === 'destructive') {
        sonnerToast.error(title, { description })
      } else {
        sonnerToast(title, { description })
      }
    }
  }
}
