"use client"

import { cn } from "@/lib/utils"

type Props = {
  descripcion?: string | null
  showDescripcion?: boolean
  className?: string
}

export function CartLineSubtitleRow({
  descripcion,
  showDescripcion = Boolean(descripcion?.trim()),
  className,
}: Props) {
  const text =
    showDescripcion && descripcion?.trim() ? descripcion.trim() : null

  return (
    <p
      className={cn(
        "mt-0.5 line-clamp-1 text-xs leading-snug text-slate-500",
        className,
        !text && "invisible select-none",
      )}
      aria-hidden={!text}
    >
      {text ?? "\u00a0"}
    </p>
  )
}
