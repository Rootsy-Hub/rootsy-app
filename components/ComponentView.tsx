"use client"

import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useState, type CSSProperties, type ReactNode } from "react"

export type ComponentViewProperty = {
  name: string
  values: readonly string[]
}

export type ComponentViewChoice = {
  name: string
}

export type ComponentViewExtraRow = {
  items: readonly ComponentViewChoice[]
  initial?: string
}

const COMPONENT_VIEW_WORLDS = [
  {
    id: "bruma",
    name: "Luz filtrada",
    swatch: "var(--rootsy-bruma-50)",
    canvas: "var(--rootsy-bruma-100)",
  },
  {
    id: "eter",
    name: "Éter",
    swatch: "var(--rootsy-eter-700)",
    canvas: "var(--rootsy-eter-950)",
  },
  {
    id: "bruma-oscura",
    name: "Bruma oscura",
    swatch: "var(--rootsy-bruma-800)",
    canvas: "var(--rootsy-bruma-950)",
  },
  {
    id: "suelo",
    name: "Suelo",
    swatch: "var(--rootsy-sombra-500)",
    canvas: "var(--rootsy-sombra-950)",
  },
  {
    id: "sombra",
    name: "Sombra",
    swatch: "var(--rootsy-sombra-800)",
    canvas: "var(--rootsy-sombra-800)",
  },
  {
    id: "herramientas",
    name: "Herramientas",
    swatch: "var(--rootsy-cielo-800)",
    canvas: "var(--rootsy-eter-900)",
  },
] as const

export type ComponentViewWorldId = (typeof COMPONENT_VIEW_WORLDS)[number]["id"]

export type ComponentViewRenderContext = {
  worldId: ComponentViewWorldId | null
  canvas: string
}

export type ComponentViewProps = {
  background: string
  componentName: string
  componentProperties: readonly ComponentViewProperty[]
  variants: readonly ComponentViewChoice[]
  extras?: readonly ComponentViewExtraRow[]
  /** Si es true, el canvas arranca desplegado. */
  defaultOpen?: boolean
  render: (
    variant: string,
    extras: readonly string[],
    context: ComponentViewRenderContext,
  ) => ReactNode
}

function SwitcherRow({
  items,
  activeIndex,
  onSelect,
}: {
  items: readonly ComponentViewChoice[]
  activeIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => {
        const selected = index === activeIndex
        return (
          <button
            key={item.name}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(index)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accion)]",
              selected
                ? "bg-[var(--color-accion)] text-white"
                : "bg-[var(--color-fondo)] text-[var(--color-texto)] hover:bg-[color-mix(in_srgb,var(--color-texto)_8%,transparent)]",
            )}
          >
            {item.name}
          </button>
        )
      })}
    </div>
  )
}

function initialExtraIndex(row: ComponentViewExtraRow) {
  if (!row.initial) return 0
  const index = row.items.findIndex((item) => item.name === row.initial)
  return index >= 0 ? index : 0
}

function worldIdFromBackground(background: string) {
  return COMPONENT_VIEW_WORLDS.find((world) => world.canvas === background)?.id ?? null
}

function isLightCanvas(worldId: string | null, canvas: string) {
  if (worldId === "bruma") return true
  if (worldId) return false
  return canvas.includes("bruma-100") || canvas === "white" || canvas === "#fff"
}

export function ComponentView({
  background,
  componentName,
  componentProperties,
  variants,
  extras = [],
  defaultOpen = false,
  render,
}: ComponentViewProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [variantIndex, setVariantIndex] = useState(0)
  const [extraIndices, setExtraIndices] = useState(() => extras.map(initialExtraIndex))
  const [worldId, setWorldId] = useState<string | null>(() => worldIdFromBackground(background))

  const variant = variants[variantIndex] ?? variants[0]
  const extraNames = extras.map(
    (row, index) => row.items[extraIndices[index] ?? 0]?.name ?? row.items[0]?.name ?? "",
  )
  const resolvedWorld = COMPONENT_VIEW_WORLDS.find((world) => world.id === worldId)
  const canvas = resolvedWorld?.canvas ?? background
  const renderContext = {
    worldId: resolvedWorld?.id ?? null,
    canvas,
  } satisfies ComponentViewRenderContext
  const specimen = variant
    ? render(variant.name, extraNames, renderContext)
    : null
  const lightCanvas = isLightCanvas(resolvedWorld?.id ?? null, canvas)

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[var(--color-borde)]",
        "bg-[var(--color-elevada)]",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-4 py-3 text-left",
          "transition-colors hover:bg-[color-mix(in_srgb,var(--color-texto)_4%,transparent)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accion)]",
        )}
      >
        <span className="rootsy-text-heading-small text-[var(--color-texto)]">
          {componentName}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-[var(--color-texto-muted)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <>
          <div
            className="relative flex min-h-44 items-center justify-center px-3 py-6"
            style={{ background: canvas } satisfies CSSProperties}
          >
              <div
              className="absolute top-3 right-3 z-10 flex gap-1.5"
              role="group"
              aria-label="Mundo de fondo"
            >
              {COMPONENT_VIEW_WORLDS.map((world) => {
                const selected = world.id === worldId
                return (
                  <button
                    key={world.id}
                    type="button"
                    aria-label={world.name}
                    aria-pressed={selected}
                    title={world.name}
                    onClick={() => setWorldId(world.id)}
                    className={cn(
                      "size-3.5 rounded-full ring-1",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accion)]",
                      lightCanvas ? "ring-black/12" : "ring-white/35",
                      selected && "ring-2 ring-[var(--color-accion)]",
                    )}
                    style={{ background: world.swatch } satisfies CSSProperties}
                  />
                )
              })}
            </div>
            {specimen}
          </div>

          <div className="flex flex-col gap-4 border-t border-[var(--color-borde)] py-4">
            <div className="px-4">
              <SwitcherRow
                items={variants}
                activeIndex={variantIndex}
                onSelect={setVariantIndex}
              />
            </div>

            {extras.length > 0 ? (
              <>
                <div
                  aria-hidden
                  className="h-px w-full bg-[color-mix(in_srgb,var(--rootsy-bruma-200)_55%,transparent)]"
                />
                <div className="flex flex-col gap-4 px-4">
                  {extras.map((row, rowIndex) => (
                    <SwitcherRow
                      key={row.items.map((item) => item.name).join("-")}
                      items={row.items}
                      activeIndex={extraIndices[rowIndex] ?? 0}
                      onSelect={(index) => {
                        setExtraIndices((current) => {
                          const next = [...current]
                          next[rowIndex] = index
                          return next
                        })
                      }}
                    />
                  ))}
                </div>
              </>
            ) : null}

            <div className="px-4">
              <div className="overflow-hidden rounded-xl border border-[var(--color-borde)]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-borde)] bg-[var(--color-fondo)]">
                      <th className="px-3 py-2 font-medium text-[var(--color-texto-muted)]">
                        Propiedad
                      </th>
                      <th className="px-3 py-2 font-medium text-[var(--color-texto-muted)]">
                        Valores
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {componentProperties.map((property) => (
                      <tr
                        key={property.name}
                        className="border-b border-[var(--color-borde)] last:border-b-0"
                      >
                        <td className="px-3 py-2 font-medium text-[var(--color-texto)]">
                          {property.name}
                        </td>
                        <td className="px-3 py-2 text-[var(--color-texto-muted)]">
                          {property.values.join(" · ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
