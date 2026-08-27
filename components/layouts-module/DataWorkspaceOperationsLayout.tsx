"use client"

import "@/app/library/color/rootsyNaturePalette.css"
import "@/app/library/layouts/layoutsOperarTheme.css"
import "@/app/library/libraryColorTheme.css"
import { getLayoutsOperarGridCssVariables } from "@/app/library/layouts/layoutsOperarHardcodedSpec"
import {
  layoutsOperationsBodyScopeClass,
  layoutsOperationsBodyShellClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  OperarCatalogMobileChromeProvider,
  useOperarCatalogMobileChrome,
} from "@/components/layouts-module/OperarCatalogMobileChrome"
import { OperarMobileStageProvider } from "@/components/layouts-module/OperarMobileStage"
import { OperarMobileToolboxProvider } from "@/components/layouts-module/OperarMobileToolbox"
import {
  DataWorkspaceModuleLayout,
  type DataWorkspaceModuleLayoutProps,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export { dataWorkspaceModuleHeaderVariant } from "@/components/layouts-module/DataWorkspaceModuleLayout"

export type DataWorkspaceOperationsLayoutProps = DataWorkspaceModuleLayoutProps

/**
 * Shell módulo POP + cuerpo operaciones (layout · operaciones).
 * Header reutilizable + fila bruma + canvas `--op-dark-shell`. Sin fondo decorativo.
 */
export function DataWorkspaceOperationsLayout({
  children,
  contentFlush = true,
  mainClassName,
  headerMobileMoreActions,
  ...props
}: DataWorkspaceOperationsLayoutProps) {
  return (
    <OperarCatalogMobileChromeProvider>
      <OperarMobileStageProvider>
        <OperarMobileToolboxProvider>
          <OperationsLayoutWithChrome
            {...props}
            contentFlush={contentFlush}
            mainClassName={mainClassName}
            headerMobileMoreActions={headerMobileMoreActions}
          >
            {children}
          </OperationsLayoutWithChrome>
        </OperarMobileToolboxProvider>
      </OperarMobileStageProvider>
    </OperarCatalogMobileChromeProvider>
  )
}

function OperationsLayoutWithChrome({
  children,
  contentFlush = true,
  mainClassName,
  headerMobileMoreActions,
  ...props
}: DataWorkspaceOperationsLayoutProps) {
  const chrome = useOperarCatalogMobileChrome()
  const mobileMore = [
    ...(chrome?.moreActions ?? []),
    ...(headerMobileMoreActions ?? []),
  ]

  return (
    <DataWorkspaceModuleLayout
      {...props}
      hideSidebarToggleOnMobile
      headerMobileMoreActions={mobileMore.length > 0 ? mobileMore : undefined}
      contentFlush={contentFlush}
      mainClassName={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden p-0",
        mainClassName,
      )}
    >
      <OperationsModuleBody>{children}</OperationsModuleBody>
    </DataWorkspaceModuleLayout>
  )
}

/** Canvas operativo — hijo directo del row bruma del módulo. */
export function OperationsModuleBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rootsy-theme-pos rootsy-radius-system",
        layoutsOperationsBodyScopeClass,
        layoutsOperationsBodyShellClass,
        "dark relative flex min-h-0 flex-1 flex-col overflow-hidden text-white",
        className,
      )}
      style={getLayoutsOperarGridCssVariables()}
    >
      {children}
    </div>
  )
}

/** @deprecated El cuerpo de operar ya no lleva fondo decorativo. */
export function OperationsModuleBackdrop() {
  return null
}
