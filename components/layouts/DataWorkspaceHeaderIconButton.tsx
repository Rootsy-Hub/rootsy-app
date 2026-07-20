"use client"

import {
  dataWorkspaceHeaderIconButtonClass,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { cn } from "@/lib/utils"
import type { ButtonHTMLAttributes, ReactNode } from "react"

export type DataWorkspaceHeaderIconButtonProps = {
  /** Etiqueta accesible y tooltip. */
  label: string
  headerVariant?: DataWorkspaceHeaderVariant
  /** Resalta acciones principales (ej. Nuevo). */
  primary?: boolean
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label">

export function DataWorkspaceHeaderIconButton({
  label,
  headerVariant = "default",
  primary = false,
  className,
  type = "button",
  children,
  ...rest
}: DataWorkspaceHeaderIconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        dataWorkspaceHeaderIconButtonClass(headerVariant, { primary }),
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
