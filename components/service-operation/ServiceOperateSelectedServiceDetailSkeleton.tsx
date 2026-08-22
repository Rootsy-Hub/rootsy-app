"use client"

import {
  layoutsOperarCatalogSkeletonGhostClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"

const ghost = layoutsOperarCatalogSkeletonGhostClass

function BlockSkeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-2xl", ghost, className)} />
}

function LooseSectionSkeleton({
  rows = 2,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <BlockSkeleton className="h-3 w-28 rounded-sm" />
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: rows }, (_, index) => (
          <BlockSkeleton key={index} className="h-12" />
        ))}
      </div>
    </div>
  )
}

type SkeletonProps = {
  showRow2?: boolean
  row2TwoCols?: boolean
  showRow3?: boolean
}

/** Placeholder mientras carga artículos, grilla y condiciones del detalle. */
export function ServiceOperateSelectedServiceDetailSkeleton({
  showRow2 = true,
  row2TwoCols = true,
  showRow3 = true,
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando detalle del servicio"
      className="flex flex-col gap-4"
    >
      {showRow2 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <LooseSectionSkeleton
            rows={2}
            className={row2TwoCols ? "md:col-span-6" : "md:col-span-12"}
          />
          {row2TwoCols ? (
            <LooseSectionSkeleton rows={2} className="md:col-span-6" />
          ) : null}
        </div>
      ) : null}

      {showRow3 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="flex flex-col gap-2.5 md:col-span-12">
            <BlockSkeleton className="h-3 w-36 rounded-sm" />
            <BlockSkeleton className="h-28 w-full rounded-2xl" />
          </div>
        </div>
      ) : null}

      <span className="sr-only">Cargando detalle del servicio…</span>
    </div>
  )
}
