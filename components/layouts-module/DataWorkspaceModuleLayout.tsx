"use client"

import {
  DataWorkspaceLayout,
  type DataWorkspaceLayoutProps,
} from "@/components/layouts/DataWorkspaceLayout"
import {
  layoutsModuleContentShellClass,
  layoutsModuleHeaderVariant,
} from "@/components/layouts-module/rootsLayoutsModuleProductStyles"
import type { DataWorkspaceHeaderVariant } from "@/components/layouts/dataWorkspaceHeaderStyles"
import { cn } from "@/lib/utils"

/** Variante de header para páginas módulo POP. */
export const dataWorkspaceModuleHeaderVariant =
  layoutsModuleHeaderVariant satisfies DataWorkspaceHeaderVariant

export type DataWorkspaceModuleLayoutProps = DataWorkspaceLayoutProps

/**
 * Shell módulo POP — fondo POP + header cristal sombra · savia + contenido bruma.
 * Envuelve DataWorkspaceLayout con defaults del design system layout · módulo.
 */
export function DataWorkspaceModuleLayout({
  headerVariant = dataWorkspaceModuleHeaderVariant,
  usePopBackdrop = true,
  contentFlush = false,
  mainClassName,
  ...props
}: DataWorkspaceModuleLayoutProps) {
  return (
    <DataWorkspaceLayout
      {...props}
      headerVariant={headerVariant}
      usePopBackdrop={usePopBackdrop}
      contentFlush={contentFlush}
      mainClassName={cn(
        contentFlush && layoutsModuleContentShellClass,
        mainClassName,
      )}
    />
  )
}
