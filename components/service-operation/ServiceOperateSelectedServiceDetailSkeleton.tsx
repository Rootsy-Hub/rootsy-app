"use client"

import {
  layoutsOperarCatalogSkeletonGhostClass,
  layoutsOperarFormDarkBorderClass,
  layoutsOperarFormDarkSurfaceClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"

const ghost = layoutsOperarCatalogSkeletonGhostClass

function DetailFieldSkeleton({ multiline = false }: { multiline?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn("h-2.5 w-24 rounded-sm", ghost)} />
      <div
        className={cn(
          multiline ? "min-h-[4.5rem] rounded-lg px-3 py-2.5" : "h-11 rounded-lg px-3",
          layoutsOperarFormDarkBorderClass,
          layoutsOperarFormDarkSurfaceClass,
          ghost,
        )}
      />
    </div>
  )
}

export function ServiceOperateSelectedServiceDetailSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando detalle del servicio"
      className="flex flex-col gap-5"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <DetailFieldSkeleton key={index} />
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className={cn("h-3 w-36 rounded-sm", ghost)} />
        <div
          className={cn(
            "flex flex-col gap-2 rounded-lg border px-3 py-3",
            layoutsOperarFormDarkBorderClass,
            layoutsOperarFormDarkSurfaceClass,
          )}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center justify-between gap-3 py-0.5">
              <div className={cn("h-3.5 flex-1 rounded-sm", ghost)} />
              <div className={cn("h-3.5 w-16 shrink-0 rounded-sm", ghost)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className={cn("h-3 w-28 rounded-sm", ghost)} />
        <div
          className={cn(
            "overflow-hidden rounded-lg border",
            layoutsOperarFormDarkBorderClass,
            layoutsOperarFormDarkSurfaceClass,
          )}
        >
          <div className={cn("h-9 border-b px-3", layoutsOperarFormDarkBorderClass, ghost)} />
          {Array.from({ length: 2 }, (_, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3 border-b px-3 py-2.5 last:border-b-0",
                layoutsOperarFormDarkBorderClass,
              )}
            >
              <div className={cn("h-3.5 flex-1 rounded-sm", ghost)} />
              <div className={cn("h-3.5 flex-1 rounded-sm", ghost)} />
              <div className={cn("h-3.5 w-20 shrink-0 rounded-sm", ghost)} />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Cargando detalle del servicio…</span>
    </div>
  )
}
