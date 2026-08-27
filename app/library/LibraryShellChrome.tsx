"use client"

import "@/app/library/libraryColorTheme.css"
import { LayoutFinalComponentsModal } from "@/app/library/LayoutFinalComponentsModal"
import { useLibraryPopContext } from "@/app/library/useLibraryPopContext"
import {
  libraryShellMainClass,
  libraryThemeClass,
} from "@/app/library/libraryColorTheme"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { PopWorkspaceProvider } from "@/context/PopWorkspaceContext"
import { usePopWorkspaceOptional } from "@/context/PopWorkspaceContext"
import { useAuth } from "@/context/AuthContextSupabase"
import { popMenuHref } from "@/lib/popRoutes"
import { cn } from "@/lib/utils"
import { Layers3 } from "lucide-react"
import { useState, type ReactNode } from "react"

type LibraryShellChromeProps = {
  children: ReactNode
}

function LibraryShellChromeInner({ children }: LibraryShellChromeProps) {
  const { user } = useAuth()
  const popContext = useLibraryPopContext()
  const popWorkspace = usePopWorkspaceOptional()
  const [finalComponentsOpen, setFinalComponentsOpen] = useState(false)

  const displayName =
    popWorkspace?.bootstrap?.userFullName ||
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "Usuario"

  const avatarUrl =
    popWorkspace?.bootstrap?.userImageUrl ??
    (user?.user_metadata?.avatar_url as string | undefined) ??
    null

  const backHref = popContext.hasPop
    ? popMenuHref(popContext.siteId, popContext.popId)
    : "/home"

  return (
    <>
      <DataWorkspaceModuleLayout
        siteId={popContext.siteId}
        popId={popContext.popId}
        popName={popWorkspace?.bootstrap?.popName ?? popContext.popName}
        title="Librería"
        contentFlush
        useBackdrop={false}
        usePopBackdrop={false}
        useHomeBackdrop={false}
        rootClassName={cn(libraryThemeClass, "rootsy-app-light")}
        loading={popContext.loading || Boolean(popWorkspace?.loading)}
        backHref={backHref}
        userName={displayName}
        userAvatarSrc={avatarUrl}
        userRoleLabel={popWorkspace?.bootstrap?.roleLabel || undefined}
        mainClassName={cn(
          libraryShellMainClass,
          libraryThemeClass,
          "rootsy-app-light min-h-0 flex-1 flex-col overflow-hidden",
        )}
        headerActions={
          <DataWorkspaceHeaderIconButton
            label="Componentes finales"
            headerVariant={dataWorkspaceModuleHeaderVariant}
            onClick={() => setFinalComponentsOpen(true)}
          >
            <Layers3 aria-hidden />
          </DataWorkspaceHeaderIconButton>
        }
      >
        <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          {popWorkspace?.error ? (
            <div
              role="alert"
              className="relative shrink-0 border-b border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              Cabecera: {popWorkspace.error}
            </div>
          ) : null}
          {children}
        </div>
      </DataWorkspaceModuleLayout>

      <LayoutFinalComponentsModal
        open={finalComponentsOpen}
        onOpenChange={setFinalComponentsOpen}
      />
    </>
  )
}

export function LibraryShellChrome({ children }: LibraryShellChromeProps) {
  const popContext = useLibraryPopContext()

  if (popContext.hasPop) {
    return (
      <PopWorkspaceProvider siteId={popContext.siteId} popId={popContext.popId}>
        <LibraryShellChromeInner>{children}</LibraryShellChromeInner>
      </PopWorkspaceProvider>
    )
  }

  return <LibraryShellChromeInner>{children}</LibraryShellChromeInner>
}
