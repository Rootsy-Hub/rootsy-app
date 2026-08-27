"use client"

import {
  DataWorkspaceLayout,
  type DataWorkspaceLayoutProps,
} from "@/components/layouts/DataWorkspaceLayout"
import { layoutsModuleContentShellClass } from "@/components/layouts-module/rootsLayoutsModuleProductStyles"
import type { DataWorkspaceHeaderVariant } from "@/components/layouts/dataWorkspaceHeaderStyles"
import { cn } from "@/lib/utils"

/** Variante de header para páginas módulo POP. */
export const dataWorkspaceModuleHeaderVariant =
  "dark" satisfies DataWorkspaceHeaderVariant

export type DataWorkspaceModuleLayoutProps = DataWorkspaceLayoutProps

/**
 * Shell módulo POP — header éter + cuerpo plano.
 * Sin foto POP, sin estrellas ni fallback detrás del contenido.
 */
export function DataWorkspaceModuleLayout({
  headerVariant = dataWorkspaceModuleHeaderVariant,
  usePopBackdrop = false,
  useBackdrop = false,
  contentFlush = false,
  mainClassName,
  ...props
}: DataWorkspaceModuleLayoutProps) {
  return (
    <DataWorkspaceLayout
      {...props}
      headerVariant={headerVariant}
      usePopBackdrop={useBackdrop ? usePopBackdrop : false}
      useBackdrop={useBackdrop}
      contentFlush={contentFlush}
      mainClassName={cn(
        contentFlush && layoutsModuleContentShellClass,
        mainClassName,
      )}
    />
  )
}
