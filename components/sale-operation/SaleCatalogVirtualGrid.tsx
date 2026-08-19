"use client"

import { ROOTSY_LAYOUTS_OPERAR_ANATOMY } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Fragment, useEffect, useState, type ReactNode } from "react"

const GRID_GAP_PX = 16
const LIST_GAP_PX = 8
const FOOTER_SIZE_PX = 56
const XL_MQ = "(min-width: 1280px)"

function catalogColumnCount(modoVista: "grid" | "lista") {
  if (modoVista === "lista") return 1
  if (typeof window === "undefined") return 2
  return window.matchMedia(XL_MQ).matches
    ? ROOTSY_LAYOUTS_OPERAR_ANATOMY.catalogGridColsDesktop
    : 2
}

function useCatalogColumnCount(modoVista: "grid" | "lista") {
  const [columns, setColumns] = useState(() => catalogColumnCount(modoVista))

  useEffect(() => {
    if (modoVista === "lista") {
      setColumns(1)
      return
    }
    const media = window.matchMedia(XL_MQ)
    const sync = () =>
      setColumns(
        media.matches ? ROOTSY_LAYOUTS_OPERAR_ANATOMY.catalogGridColsDesktop : 2,
      )
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [modoVista])

  return columns
}

type Props<T> = {
  items: T[]
  modoVista: "grid" | "lista"
  scrollRoot: HTMLElement | null
  resetKey: string
  getItemKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  footer?: ReactNode
}

export function SaleCatalogVirtualGrid<T>({
  items,
  modoVista,
  scrollRoot,
  resetKey,
  getItemKey,
  renderItem,
  footer,
}: Props<T>) {
  const columns = useCatalogColumnCount(modoVista)
  const rowCount = Math.ceil(items.length / columns)
  const hasFooter = footer != null
  const count = rowCount + (hasFooter ? 1 : 0)
  const rowGap = modoVista === "grid" ? GRID_GAP_PX : LIST_GAP_PX
  const rowEstimate =
    modoVista === "grid"
      ? ROOTSY_LAYOUTS_OPERAR_ANATOMY.productCardHeightPx
      : ROOTSY_LAYOUTS_OPERAR_ANATOMY.productCardMediaHeightPx

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRoot,
    estimateSize: (index) =>
      hasFooter && index === rowCount ? FOOTER_SIZE_PX : rowEstimate,
    overscan: 4,
    gap: rowGap,
  })

  useEffect(() => {
    virtualizer.scrollToOffset(0)
    // Solo al cambiar filtro, vista o búsqueda. El virtualizer no es dependencia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  return (
    <div
      className="relative w-full"
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((virtualRow) => {
        const isFooter = hasFooter && virtualRow.index === rowCount
        const start = virtualRow.index * columns
        const cells = isFooter ? [] : items.slice(start, start + columns)

        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            className={
              isFooter
                ? undefined
                : modoVista === "grid"
                  ? "grid gap-4"
                  : "flex flex-col"
            }
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
              gridTemplateColumns:
                !isFooter && modoVista === "grid"
                  ? `repeat(${columns}, minmax(0, 1fr))`
                  : undefined,
            }}
          >
            {isFooter
              ? footer
              : cells.map((item) => (
                  <Fragment key={getItemKey(item)}>{renderItem(item)}</Fragment>
                ))}
          </div>
        )
      })}
    </div>
  )
}
