"use client"

import {
  isCustomUnitOfMeasure,
  shortUnitOfMeasure,
} from "@/lib/articleItemKind"
import { PenLine } from "lucide-react"
import type { ReactNode } from "react"

export type UnitOfMeasureAffix = {
  prefix: ReactNode
  prefixClassName?: string
  /** Nombre completo de la unidad personalizada — va en la descripción del campo. */
  hint?: string
}

export function unitOfMeasureAffix(
  unitOfMeasure: string | null | undefined,
  fallback = "uds.",
): UnitOfMeasureAffix {
  const value = unitOfMeasure?.trim()
  if (!value) {
    return { prefix: fallback }
  }

  if (isCustomUnitOfMeasure(value)) {
    return {
      prefix: <PenLine aria-hidden />,
      hint: value,
    }
  }

  return { prefix: shortUnitOfMeasure(value) }
}
