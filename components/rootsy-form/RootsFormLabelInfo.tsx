"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CircleHelp } from "lucide-react"
import type { ReactNode } from "react"

type Props = {
  content: ReactNode
  /** Texto para lectores de pantalla. */
  ariaLabel?: string
}

/** Ícono de ayuda junto al label — muestra un tooltip al pasar el cursor. */
export function RootsFormLabelInfo({ content, ariaLabel = "Más información" }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[var(--rootsy-bruma-500)] transition-colors hover:text-[var(--rootsy-bruma-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]"
          aria-label={ariaLabel}
        >
          <CircleHelp className="size-3.5" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent
        variant="dark"
        side="top"
        sideOffset={6}
        className="max-w-[240px] text-center leading-relaxed"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
