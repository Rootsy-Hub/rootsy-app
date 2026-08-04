"use client"

import {
  rootsIconButtonActionClass,
  rootsIconButtonClass,
  type RootsIconButtonActionIntent,
  type RootsIconButtonSize,
  type RootsIconButtonTone,
} from "@/components/rootsy-button/rootsButtonStyles"
import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes, ReactNode } from "react"

export type RootsIconButtonProps = {
  /** Etiqueta accesible — obligatoria en icon-only. */
  label: string
  tone?: RootsIconButtonTone
  /** Solo con tone="action" — neutral, edit (verde), destructive (rojo). */
  intent?: RootsIconButtonActionIntent
  size?: RootsIconButtonSize
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label">

export function RootsIconButton({
  label,
  tone = "light",
  intent = "edit",
  size = "default",
  className,
  type = "button",
  children,
  ...rest
}: RootsIconButtonProps) {
  const buttonClass =
    tone === "action"
      ? rootsIconButtonActionClass({ intent, size })
      : rootsIconButtonClass({ tone, size })

  return (
    <button
      type={type}
      aria-label={label}
      className={cn(buttonClass, className)}
      {...rest}
    >
      {children}
    </button>
  )
}
