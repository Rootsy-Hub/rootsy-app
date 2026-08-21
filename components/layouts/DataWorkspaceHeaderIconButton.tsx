"use client"

import {
  isDarkChromeHeader,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import { EterIconButton } from "@/components/eter/EterIconButton"
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
  if (isDarkChromeHeader(headerVariant)) {
    return (
      <EterIconButton
        label={label}
        intent={primary ? "primary" : "subtle"}
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
