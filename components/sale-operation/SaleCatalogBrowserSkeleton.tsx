"use client"

import {
  layoutsOperarCatalogGridClass,
  layoutsOperarCatalogGridStyle,
} from "@/app/library/layouts/layoutsOperarStyles"

const GRID_CARD_COUNT = 8
const LIST_CARD_COUNT = 4
const CARD_RADIUS_PX = 16

const cardSurfaceStyle = {
  overflow: "hidden" as const,
  borderRadius: CARD_RADIUS_PX,
  background: "var(--rootsy-sombra-700)",
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
      className="pointer-events-none relative grid h-64 w-full border text-left"
      style={{
        ...cardSurfaceStyle,
        gridTemplateRows: "120px 1fr",
      }}
    >
      <div className="animate-pulse" style={ghostStyle} />
      <div
        className="grid h-full min-h-0 gap-1.5 p-3"
        style={{ gridTemplateRows: "minmax(0, 1fr) auto" }}
      >
        <SaleCatalogSkeletonBody />
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
