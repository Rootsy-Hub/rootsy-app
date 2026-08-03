"use client"

import { DOCK_SLOT_SHIFT_PX } from "@/app/[siteId]/[popId]/menu/MenuDockDndContext"
import { menuFloatingPillShellClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { Skeleton } from "@/components/ui/skeleton"
import { DEFAULT_MENU_DOCK_IDS } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"

const LABEL_WIDTHS = ["w-14", "w-16", "w-12", "w-[3.25rem]", "w-14", "w-11"] as const
const DOCK_ICON_SIZE_PX = 48
const SECTION_DOT_COUNT = 3

function MenuIconTileSkeleton({ index }: { index: number }) {
  const labelWidth = LABEL_WIDTHS[index % LABEL_WIDTHS.length]
  const delay = `${(index % 12) * 45}ms`

  return (
    <div
      aria-hidden
      className="flex w-24 flex-col items-center gap-2.5 justify-self-center"
      style={{ animationDelay: delay }}
    >
      <Skeleton
        className="size-[72px] rounded-[20px] bg-muted-foreground/12"
        style={{ animationDelay: delay }}
      />
      <Skeleton
        className={cn("h-3 rounded-full bg-muted-foreground/10", labelWidth)}
        style={{ animationDelay: delay }}
      />
    </div>
  )
}

function MenuSectionNavigatorSkeleton() {
  return (
    <div
      aria-hidden
      className={cn(
        "mb-8 inline-flex max-w-full items-center justify-between gap-2.5 px-3.5 py-1 sm:min-w-48",
        menuFloatingPillShellClass,
      )}
    >
      <Skeleton className="h-3.5 w-14 rounded-sm bg-muted-foreground/12" />

      <div className="flex shrink-0 items-center -space-x-1">
        {Array.from({ length: SECTION_DOT_COUNT }, (_, index) => (
          <div
            key={index}
            className="flex size-7 items-center justify-center"
          >
            <Skeleton
              className={cn(
                "rounded-full bg-muted-foreground/12",
                index === 0 ? "size-2" : "size-1.5",
              )}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function MenuPageSkeletonHeader() {
  return (
    <header className="relative z-20 border-b border-rootsy-hairline/80 bg-card/55 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-card/45">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,280px)_minmax(0,1fr)] items-center gap-4 px-6 py-5 sm:gap-6 sm:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Skeleton className="size-12 shrink-0 rounded-xl bg-muted-foreground/10" />
          <div className="hidden h-6 w-px shrink-0 bg-border sm:block" />
          <div className="flex min-w-0 items-center gap-4">
            <Skeleton className="size-14 shrink-0 rounded-2xl bg-muted-foreground/12" />
            <div className="flex min-w-0 flex-col gap-1.5">
              <Skeleton className="h-4 w-32 max-w-full rounded-md bg-muted-foreground/14" />
              <Skeleton className="h-3.5 w-44 max-w-full rounded-md bg-muted-foreground/10" />
              <Skeleton className="h-3.5 w-36 max-w-full rounded-md bg-muted-foreground/8" />
            </div>
          </div>
        </div>

        <Skeleton className="h-10 w-full rounded-xl bg-muted-foreground/10" />

        <div className="flex min-w-0 items-center justify-end gap-6">
          <div className="flex items-center gap-1">
            <Skeleton className="size-10 rounded-xl bg-muted-foreground/8" />
            <Skeleton className="size-10 rounded-xl bg-muted-foreground/8" />
          </div>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
            <Skeleton className="h-5 w-14 rounded-md bg-muted-foreground/12" />
            <Skeleton className="h-3 w-16 rounded-full bg-muted-foreground/8" />
          </div>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <div className="flex items-center gap-3">
            <div className="hidden min-w-0 flex-col items-end gap-1.5 sm:flex">
              <Skeleton className="h-3.5 w-24 rounded-md bg-muted-foreground/10" />
              <Skeleton className="h-2.5 w-12 rounded-full bg-muted-foreground/8" />
            </div>
            <Skeleton className="size-10 shrink-0 rounded-full bg-muted-foreground/12" />
          </div>
        </div>
      </div>
    </header>
  )
}

function MenuPageSkeletonDock() {
  const iconCount = DEFAULT_MENU_DOCK_IDS.length
  const trackWidth = iconCount * DOCK_SLOT_SHIFT_PX
  const iconInset = (DOCK_SLOT_SHIFT_PX - DOCK_ICON_SIZE_PX) / 2

  return (
    <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
      <div
        className={cn(
          "flex items-end gap-1 overflow-visible px-2.5 py-2 sm:gap-1.5 sm:px-3",
          menuFloatingPillShellClass,
        )}
      >
        <div
          aria-hidden
          className="relative min-h-12 shrink-0 pt-2.5"
          style={{ width: trackWidth }}
        >
          {Array.from({ length: iconCount }, (_, index) => (
            <Skeleton
              key={index}
              className="absolute bottom-0 size-12 rounded-[22%] bg-muted-foreground/12"
              style={{
                left: index * DOCK_SLOT_SHIFT_PX + iconInset,
                animationDelay: `${index * 60}ms`,
              }}
            />
          ))}
        </div>

        <div className="ml-1 flex shrink-0 items-end gap-2.5 self-end sm:ml-1.5">
          <div className="mb-1.5 h-8 w-px bg-border" aria-hidden />
          <Skeleton className="mb-1.5 size-9 rounded-xl bg-muted-foreground/10" />
        </div>
      </div>
    </div>
  )
}

export function MenuPageSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando menú"
      className="fixed inset-0 flex flex-col overflow-hidden bg-background"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[400px] w-[1000px] -translate-x-1/2 rounded-full bg-emerald-600/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,10,9,0.55)_100%)]" />
      </div>

      <MenuPageSkeletonHeader />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center pb-28 pt-4">
        <div className="flex w-full flex-col items-center">
          <MenuSectionNavigatorSkeleton />

          <div className="w-full px-8">
            <div className="mx-auto grid min-h-[280px] max-w-4xl grid-cols-6 gap-x-0 gap-y-8 px-6 py-6">
              {Array.from({ length: 12 }, (_, index) => (
                <MenuIconTileSkeleton key={index} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <MenuPageSkeletonDock />

      <Skeleton className="absolute bottom-4 right-4 z-20 size-12 rounded-full bg-muted-foreground/10" />

      <span className="sr-only">Cargando menú…</span>
    </div>
  )
}
