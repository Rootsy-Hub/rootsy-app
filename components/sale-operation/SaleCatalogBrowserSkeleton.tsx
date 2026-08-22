"use client"

import {
  layoutsOperarCatalogGridClass,
  layoutsOperarCatalogGridTemplate,
  layoutsOperarCatalogSkeletonGhostClass,
  layoutsOperarProductCardGridBodyClass,
  layoutsOperarProductCardListBodyClass,
  layoutsOperarProductCardListMediaClass,
  layoutsOperarProductCardListSkeletonShellClass,
  layoutsOperarProductCardMediaClass,
  layoutsOperarProductCardSkeletonShellClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import { useLayoutsOperarCatalogColumnCount } from "@/hooks/useLayoutsOperarCatalogColumnCount"
import { cn } from "@/lib/utils"
import { useState } from "react"

const GRID_ROWS = 2
const LIST_CARD_COUNT = 4

const ghost = layoutsOperarCatalogSkeletonGhostClass

function SaleCatalogSkeletonBody() {
  return (
    <>
      <div className="space-y-2">
        <div className={cn("h-3.5 w-[72%] rounded-sm", ghost)} />
        <div className={cn("h-3 w-[46%] rounded-sm", ghost)} />
      </div>
      <div className={cn("h-4 w-20 rounded-sm", ghost)} />
    </>
  )
}

function SaleCatalogProductCardGridSkeleton() {
  return (
    <article aria-hidden className={layoutsOperarProductCardSkeletonShellClass}>
      <div className={cn(layoutsOperarProductCardMediaClass, ghost, "rounded-none")} />
      <div className={layoutsOperarProductCardGridBodyClass}>
        <SaleCatalogSkeletonBody />
      </div>
    </article>
  )
}

function SaleCatalogProductCardListSkeleton() {
  return (
    <article aria-hidden className={layoutsOperarProductCardListSkeletonShellClass}>
      <div className={cn(layoutsOperarProductCardListMediaClass, ghost, "rounded-none")} />
      <div className={layoutsOperarProductCardListBodyClass}>
        <SaleCatalogSkeletonBody />
      </div>
    </article>
  )
}

type Props = {
  variant?: "grid" | "lista"
}

export function SaleCatalogBrowserSkeleton({ variant = "grid" }: Props) {
  const isList = variant === "lista"
  const [gridEl, setGridEl] = useState<HTMLDivElement | null>(null)
  const columns = useLayoutsOperarCatalogColumnCount(
    isList ? "lista" : "grid",
    gridEl,
  )
  const cardCount = isList ? LIST_CARD_COUNT : columns * GRID_ROWS

  return (
    <div
      ref={setGridEl}
      role="status"
      aria-busy="true"
      aria-label="Cargando productos"
      className={isList ? "flex flex-col gap-2" : layoutsOperarCatalogGridClass}
      style={
        isList
          ? undefined
          : { gridTemplateColumns: layoutsOperarCatalogGridTemplate(columns) }
      }
    >
      {Array.from({ length: cardCount }, (_, index) =>
        isList ? (
          <SaleCatalogProductCardListSkeleton key={index} />
        ) : (
          <SaleCatalogProductCardGridSkeleton key={index} />
        ),
      )}
      <span className="sr-only">Cargando productos…</span>
    </div>
  )
}
