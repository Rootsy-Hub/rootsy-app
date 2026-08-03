"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { menuFloatingPillShellClass } from "@/app/[siteId]/[popId]/menu/menuFloatingPillStyles"
import { cn } from "@/lib/utils"

const LABEL_WIDTHS = ["w-14", "w-16", "w-12", "w-[3.25rem]", "w-14", "w-11"] as const

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
  return (
    <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2",
          menuFloatingPillShellClass,
        )}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton
              className="size-12 rounded-xl bg-muted-foreground/12"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          </div>
        ))}
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
          <div
            className={cn(
              "mb-8 flex w-48 items-center justify-between px-3.5 py-1",
              menuFloatingPillShellClass,
            )}
          >
            <Skeleton className="h-4 w-16 rounded-md bg-white/15" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-2 rounded-full bg-emerald-400/60" />
              <Skeleton className="size-1.5 rounded-full bg-white/20" />
              <Skeleton className="size-1.5 rounded-full bg-white/20" />
            </div>
          </div>

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
