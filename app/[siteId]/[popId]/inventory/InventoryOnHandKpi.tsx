"use client"

import type { InventoryUnitStock } from "@/app/[siteId]/[popId]/inventory/actions"
import { formatInventoryQty } from "@/app/[siteId]/[popId]/inventory/inventoryFormat"
import {
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardStatValueLargeClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { labelUnitOfMeasure, shortUnitOfMeasure } from "@/lib/articleItemKind"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import "@/app/[siteId]/[popId]/inventory/inventoryOnHandKpi.css"

const SLIDE_MS = 4200

type Props = {
  units: InventoryUnitStock[]
  articleCount: number
}

export function InventoryOnHandKpi({ units, articleCount }: Props) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const canSlide = units.length > 1
  const current = units[index] ?? null

  useEffect(() => {
    setIndex(0)
  }, [units])

  useEffect(() => {
    if (!canSlide || paused) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % units.length)
    }, SLIDE_MS)
    return () => window.clearInterval(timer)
  }, [canSlide, paused, units.length])

  const goNext = () => {
    setIndex((prev) => (prev + 1) % units.length)
  }

  const value = current ? formatInventoryQty(current.quantity) : "0"
  const unitShort = current ? shortUnitOfMeasure(current.unitOfMeasure) : ""
  const unitLabel = current ? labelUnitOfMeasure(current.unitOfMeasure) : "—"
  const hint = current
    ? current.articleCount === 1
      ? `${unitLabel} · 1 artículo`
      : `${unitLabel} · ${current.articleCount} artículos`
    : articleCount === 1
      ? "1 artículo en el punto"
      : `${articleCount} artículos en el punto`

  return (
    <div
      className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "p-5")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={dataWorkspaceEntityCardEyebrowClass}>Lo que hay</p>
          <div className="relative mt-3 overflow-hidden">
            <p
              key={`${current?.unitOfMeasure ?? "empty"}-${index}`}
              className={cn(
                dataWorkspaceEntityCardStatValueLargeClass,
                "flex items-baseline gap-1.5",
                canSlide && "inventory-onhand-slide",
              )}
            >
              {value}
              {unitShort ? (
                <span className="font-canopy text-base font-semibold text-rootsy-bruma-500">
                  {unitShort}
                </span>
              ) : null}
            </p>
          </div>
          <p className="mt-2 font-canopy text-xs leading-relaxed text-rootsy-bruma-500">
            {hint}
          </p>
        </div>
        {canSlide ? (
          <button
            type="button"
            onClick={goNext}
            className="mt-6 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-rootsy-bruma-400 transition-colors duration-200 hover:bg-rootsy-bruma-50 hover:text-rootsy-bruma-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)]"
            aria-label="Ver siguiente unidad"
          >
            <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  )
}
