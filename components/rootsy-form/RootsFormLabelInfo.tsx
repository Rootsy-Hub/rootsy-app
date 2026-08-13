"use client"

import { useRootsFormControlTone } from "@/components/rootsy-form/rootsFormFieldContext"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { layoutsOperarFormDarkIconClass } from "@/app/library/layouts/layoutsOperarStyles"
import type { RootsFormTone } from "@/app/library/ui-components/formsUiHardcodedSpec"
import { cn } from "@/lib/utils"
import { CircleHelp } from "lucide-react"
import type { ReactNode } from "react"

type Props = {
  content: ReactNode
  /** Texto para lectores de pantalla. */
  ariaLabel?: string
  tone?: RootsFormTone
}

/** Ícono de ayuda junto al label — muestra un tooltip al pasar el cursor. */
export function RootsFormLabelInfo({
  content,
  ariaLabel = "Más información",
  tone,
}: Props) {
  const resolvedTone = useRootsFormControlTone(tone)
  const isDark = resolvedTone === "dark"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex size-4 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
            isDark
              ? cn(
                  layoutsOperarFormDarkIconClass,
                  "hover:text-[color-mix(in_srgb,var(--rootsy-sombra-200)_82%,white)]",
                )
              : "text-[var(--rootsy-bruma-500)] hover:text-[var(--rootsy-bruma-700)]",
          )}
          aria-label={ariaLabel}
          onPointerDown={(event) => event.preventDefault()}
        >
          <CircleHelp className="size-3.5" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent
        variant={isDark ? "operar" : "dark"}
        side="top"
        sideOffset={6}
        className="max-w-[240px] text-center leading-relaxed"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
