"use client"

import {
  isDarkChromeHeader,
  isLayoutsTablesHeader,
  isNightForestHeader,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
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
  ...rest
}: DataWorkspaceHeaderIconButtonProps) {
  if (isLayoutsTablesHeader(headerVariant)) {
    return (
      <RootsIconButton
        label={label}
        theme="pos"
        emphasis={primary ? "primary" : "ghost"}
        size="default"
        {...rest}
      />
    )
  }

  if (isNightForestHeader(headerVariant)) {
    return (
      <RootsIconButton
        label={label}
        theme="pos"
        emphasis="outlined"
        size="default"
        {...rest}
      />
    )
  }

  if (isDarkChromeHeader(headerVariant)) {
    return (
      <RootsIconButton
        label={label}
        theme="pos"
        emphasis="ghost"
        size="default"
        {...rest}
      />
    )
  }

  return (
    <RootsIconButton
      label={label}
      theme="workspace"
      emphasis={primary ? "filled" : "ghost"}
      size="default"
      {...rest}
    />
  )
}
