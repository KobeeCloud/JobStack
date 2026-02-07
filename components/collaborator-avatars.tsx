'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface Collaborator {
  user_id: string
  user_name: string
  avatar_url?: string
  color: string
  selected_node?: string
}

export function CollaboratorAvatars({ collaborators }: { collaborators: Collaborator[] }) {
  if (collaborators.length === 0) return null

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground mr-1">
          {collaborators.length} online
        </span>
        <div className="flex -space-x-2">
          {collaborators.slice(0, 5).map((c) => (
            <Tooltip key={c.user_id}>
              <TooltipTrigger asChild>
                <Avatar
                  className="h-7 w-7 border-2 cursor-default"
                  style={{ borderColor: c.color }}
                >
                  <AvatarImage src={c.avatar_url} alt={c.user_name} />
                  <AvatarFallback
                    className="text-[10px] text-white"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.user_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{c.user_name}</p>
                {c.selected_node && (
                  <p className="text-xs text-muted-foreground">
                    Editing a component
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
          {collaborators.length > 5 && (
            <Avatar className="h-7 w-7 border-2 border-muted">
              <AvatarFallback className="text-[10px]">
                +{collaborators.length - 5}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

// Cursor overlays for the canvas
export function CollaboratorCursors({
  collaborators,
}: {
  collaborators: Collaborator[]
}) {
  return (
    <>
      {collaborators
        .filter((c): c is Collaborator & { cursor: { x: number; y: number } } =>
          'cursor' in c && c.cursor !== undefined
        )
        .map((c) => {
          // Type assertion since we filtered above
          const cursor = (c as unknown as { cursor: { x: number; y: number } }).cursor
          return (
            <div
              key={c.user_id}
              className="absolute pointer-events-none z-50 transition-all duration-100"
              style={{
                left: cursor.x,
                top: cursor.y,
              }}
            >
              {/* Cursor arrow */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill={c.color}
                className="drop-shadow-sm"
              >
                <path d="M0 0 L16 6 L6 8 L4 16 Z" />
              </svg>
              {/* Name label */}
              <div
                className="ml-4 -mt-1 px-1.5 py-0.5 rounded text-[10px] text-white whitespace-nowrap"
                style={{ backgroundColor: c.color }}
              >
                {c.user_name.split(' ')[0]}
              </div>
            </div>
          )
        })}
    </>
  )
}
