"use client"

import { cn } from "@/lib/utils"

type Props = {
  descripcion?: string | null
  showDescripcion?: boolean
}

export function CartLineSubtitleRow({
  descripcion,
  showDescripcion = Boolean(descripcion?.trim()),
}: Props) {
  const text =
    showDescripcion && descripcion?.trim() ? descripcion.trim() : null

  return (
    <p
      className={cn(
        "mt-0.5 line-clamp-1 text-xs leading-snug text-slate-500",
        !text && "invisible select-none",
      )}
      aria-hidden={!text}
    >
      {text ?? "\u00a0"}
    </p>
  )
}
