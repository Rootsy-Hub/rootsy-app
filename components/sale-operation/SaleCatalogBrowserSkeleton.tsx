"use client"

import {
  layoutsOperarCatalogGridClass,
  layoutsOperarCatalogGridStyle,
} from "@/app/library/layouts/layoutsOperarStyles"

const GRID_CARD_COUNT = 8
const LIST_CARD_COUNT = 4
const CARD_RADIUS_PX = 16

const cardSurfaceStyle = {
  overflow: "clip" as const,
  borderRadius: CARD_RADIUS_PX,
  background: "var(--rootsy-sombra-800)",
  borderColor: "var(--layouts-operar-border-dark-card)",
}

const ghostStyle = {
  background:
    "color-mix(in srgb, var(--rootsy-sombra-800) 70%, var(--rootsy-sombra-700))",
}

function SaleCatalogSkeletonBody() {
  return (
    <>
      <div className="space-y-2">
        <div
          className="h-3.5 animate-pulse rounded-sm"
          style={{ ...ghostStyle, width: "72%" }}
        />
        <div
          className="h-3 animate-pulse rounded-sm"
          style={{ ...ghostStyle, width: "46%" }}
        />
      </div>
      <div
        className="h-4 w-20 animate-pulse rounded-sm"
        style={ghostStyle}
      />
    </>
  )
}

function SaleCatalogProductCardGridSkeleton() {
  return (
    <article
      aria-hidden
      className="pointer-events-none relative h-48 w-full overflow-hidden border text-left"
      style={cardSurfaceStyle}
    >
      <div
        className="grid h-full w-full"
        style={{ gridTemplateRows: "88px minmax(0, 1fr) auto" }}
      >
        <div className="animate-pulse" style={ghostStyle} />
        <div className="min-h-0 px-3 pt-3">
          <div className="space-y-2">
            <div
              className="h-3.5 animate-pulse rounded-sm"
              style={{ ...ghostStyle, width: "72%" }}
            />
            <div
              className="h-3 animate-pulse rounded-sm"
              style={{ ...ghostStyle, width: "46%" }}
            />
          </div>
        </div>
        <div className="px-3 pb-3 pt-1.5">
          <div
            className="h-4 w-20 animate-pulse rounded-sm"
            style={ghostStyle}
          />
        </div>
      </div>
    </article>
  )
}

function SaleCatalogProductCardListSkeleton() {
  return (
    <article
      aria-hidden
      className="pointer-events-none relative flex min-h-20 w-full items-stretch border text-left"
      style={cardSurfaceStyle}
    >
      <div className="size-20 shrink-0 animate-pulse" style={ghostStyle} />
      <div className="flex min-h-0 min-w-0 flex-1 items-center justify-between gap-3 px-3 py-2">
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
  const cardCount = isList ? LIST_CARD_COUNT : GRID_CARD_COUNT

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Cargando productos"
      className={isList ? "flex flex-col gap-2" : layoutsOperarCatalogGridClass}
      style={isList ? undefined : layoutsOperarCatalogGridStyle}
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
