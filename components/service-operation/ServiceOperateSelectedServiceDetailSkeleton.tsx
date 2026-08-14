"use client"

import {
  layoutsOperarCatalogSkeletonGhostClass,
  layoutsOperarFormDarkBorderClass,
  layoutsOperarFormDarkSurfaceClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"

const ghost = layoutsOperarCatalogSkeletonGhostClass

function BlockSkeleton({ className }: { className?: string }) {
  return <div className={cn("rounded-lg", ghost, className)} />
}

/** Placeholder mientras carga artículos, grilla y condiciones del detalle. */
export function ServiceOperateSelectedServiceDetailSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando detalle del servicio"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <BlockSkeleton className="size-3.5 rounded-sm" />
          <BlockSkeleton className="h-3 w-24 rounded-sm" />
        </div>
        <div
          className={cn(
            "rounded-lg px-2.5 py-1 ring-1 ring-[color-mix(in_srgb,var(--rootsy-sombra-border)_55%,transparent)]",
            layoutsOperarFormDarkSurfaceClass,
          )}
        >
          {Array.from({ length: 2 }, (_, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 py-1.5",
                index > 0 && cn("border-t", layoutsOperarFormDarkBorderClass),
              )}
            >
              <BlockSkeleton className="size-3 shrink-0 rounded-sm" />
              <BlockSkeleton className="h-3 flex-1 rounded-sm" />
              <BlockSkeleton className="h-3 w-12 shrink-0 rounded-sm" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <BlockSkeleton className="size-3.5 rounded-sm" />
          <BlockSkeleton className="h-3 w-28 rounded-sm" />
        </div>
        <BlockSkeleton className="h-24 w-full" />
      </div>

      <span className="sr-only">Cargando detalle del servicio…</span>
    </div>
  )
}
