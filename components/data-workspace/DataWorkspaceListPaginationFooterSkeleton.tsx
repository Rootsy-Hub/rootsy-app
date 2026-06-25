"use client"

import {
  darkTableFooterCenterClass,
  darkTableFooterNavGroupClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

export type DataWorkspaceListPaginationFooterSkeletonProps = {
  variant?: "default" | "dark"
}

const darkSkBlock = "animate-pulse bg-zinc-800/75"
const lightSkBar = "animate-pulse rounded-[3px] bg-muted-foreground/12"
const lightSkBox = "animate-pulse rounded-md bg-muted-foreground/10"

/** Skeleton del pie de paginación; replica el layout real (nav · selects · total · nav). */
export function DataWorkspaceListPaginationFooterSkeleton({
  variant = "dark",
}: DataWorkspaceListPaginationFooterSkeletonProps) {
  if (variant === "dark") {
    return (
      <div className="flex w-full items-stretch" aria-hidden>
        <div className={cn(darkTableFooterNavGroupClass, "justify-start")}>
          <div
            className={cn(
              "size-16 shrink-0 border-r border-zinc-800/90",
              darkSkBlock,
            )}
          />
          <div className={cn("size-16 shrink-0", darkSkBlock)} />
        </div>

        <div className={darkTableFooterCenterClass}>
          <div className={cn("h-11 w-[4.25rem] shrink-0 rounded-lg", darkSkBlock)} />
          <span className="size-1 shrink-0 rounded-full bg-zinc-700/80" aria-hidden />
          <div className={cn("h-11 w-[4.25rem] shrink-0 rounded-lg", darkSkBlock)} />
          <span className="size-1 shrink-0 rounded-full bg-zinc-700/80" aria-hidden />
          <div className={cn("h-3.5 w-10 shrink-0 rounded md:w-[4.5rem]", darkSkBlock)} />
        </div>

        <div className={cn(darkTableFooterNavGroupClass, "justify-end")}>
          <div
            className={cn(
              "size-16 shrink-0 border-l border-zinc-800/90",
              darkSkBlock,
            )}
          />
          <div className={cn("size-16 shrink-0", darkSkBlock)} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-[3.25rem] min-w-0 flex-wrap items-center justify-between gap-3 px-3 py-3 sm:flex-row sm:items-center sm:px-4"
      aria-hidden
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <div className={cn("h-3.5 w-52 max-w-[min(100%,20rem)]", lightSkBar)} />
        <div className={cn("h-8 w-[4.25rem] rounded-md", lightSkBox)} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
        <div className={cn("size-8 rounded-md", lightSkBox)} />
        <div className={cn("h-8 w-36 rounded-md", lightSkBox)} />
        <div className={cn("size-8 rounded-md", lightSkBox)} />
      </div>
    </div>
  )
}
