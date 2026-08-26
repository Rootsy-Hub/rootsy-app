"use client"

import { CONCEPT_TOKENS } from "@/app/library/concept/rootsyConceptSystem"
import {
  LibraryDocLead,
  LibraryDocSection,
  LibraryPrinciplesGrid,
} from "@/app/library/libraryDocPrimitives"
import {
  ROOTSY_BODY_STYLES,
  ROOTSY_FONT_WEIGHTS,
  ROOTSY_HEADING_STYLES,
  ROOTSY_METRIC_STYLES,
  ROOTSY_TYPEFACES,
  TYPOGRAPHY_ACCESSIBILITY_NOTES,
  TYPOGRAPHY_APPLYING_GUIDELINES,
  TYPOGRAPHY_SCALE_SIMPLE,
  TYPE_SCALE_NOTES,
  type RootsyTypeface,
  type TypographyStyle,
} from "@/app/library/typography/rootsyTypographySystem"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export { LibraryRelatedLinks as TypographyRelatedLinks } from "@/app/library/libraryDocPrimitives"

const FONT_CLASS = {
  ui: "font-canopy",
  reading: "font-stream",
  numeric: "font-ledger",
  code: "font-code",
} as const

function TypographyWhiteCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("library-spec-card rounded-2xl border p-5 sm:p-6", className)}>
      {children}
    </div>
  )
}

function TypographyBrumaStage({
  caption,
  children,
  className,
}: {
  caption?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: CONCEPT_TOKENS.bruma100,
        borderColor: CONCEPT_TOKENS.bruma200,
      }}
    >
      <div className={cn("p-5 sm:p-6", className)}>{children}</div>
      {caption ? (
        <p
          className="border-t px-4 py-3 text-[11px] leading-relaxed"
          style={{
            borderColor: CONCEPT_TOKENS.bruma200,
            color: CONCEPT_TOKENS.bruma500,
          }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  )
}

function typefaceFontClass(id: RootsyTypeface["id"]) {
  if (id === "numeric") return FONT_CLASS.numeric
  if (id === "reading") return FONT_CLASS.reading
  return FONT_CLASS.ui
}

export function TypographyDocLead({ children }: { children: ReactNode }) {
  return <LibraryDocLead>{children}</LibraryDocLead>
}

export function TypographyDocSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <LibraryDocSection id={id} title={title} description={description}>
      {children}
    </LibraryDocSection>
  )
}

export function TypographyPrinciplesGrid({
  principles,
}: {
  principles: ReadonlyArray<{ title: string; detail: string }>
}) {
  return <LibraryPrinciplesGrid principles={principles} />
}

export function TypographyIntroHero() {
  return (
    <TypographyWhiteCard>
      <p
        className="text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ color: CONCEPT_TOKENS.bruma500 }}
      >
        Tipografía Rootsy
      </p>
      <p
        className="mt-3 font-canopy text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: CONCEPT_TOKENS.bruma900 }}
      >
        Ventas de hoy
      </p>
      <p className="mt-1 font-canopy text-sm" style={{ color: CONCEPT_TOKENS.bruma500 }}>
        Resumen del turno · actualizado hace 5 min
      </p>
      <p
        className="mt-4 max-w-lg font-canopy text-sm leading-relaxed"
        style={{ color: CONCEPT_TOKENS.bruma900 }}
      >
        Doce ventas cerradas con un ticket promedio saludable. Los productos de panadería
        concentran el volumen de la mañana.
      </p>
      <p
        className="mt-4 font-ledger text-3xl font-bold tabular-nums tracking-tight"
        style={{ color: CONCEPT_TOKENS.bruma900 }}
      >
        $ 48.320
      </p>
      <p className="mt-1 font-canopy text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
        Total del día
      </p>
    </TypographyWhiteCard>
  )
}

export function TypographyVoicesRow() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {ROOTSY_TYPEFACES.map((face) => (
        <TypographyWhiteCard key={face.id} className="space-y-3">
          <div>
            <p className="text-sm font-semibold" style={{ color: CONCEPT_TOKENS.bruma900 }}>
              {face.label}
            </p>
            <p className="text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
              {face.family}
            </p>
          </div>
          <p
            className={cn(
              typefaceFontClass(face.id),
              face.id === "numeric" && "text-2xl font-bold tabular-nums",
              face.id === "ui" && "text-lg font-semibold",
              face.id === "reading" && "text-base font-normal leading-relaxed",
            )}
            style={{ color: CONCEPT_TOKENS.bruma900 }}
          >
            {face.sample}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            {face.role}
          </p>
        </TypographyWhiteCard>
      ))}
    </div>
  )
}

export function TypographyScalePreview() {
  return (
    <TypographyBrumaStage caption="Cinco niveles cubren casi toda la UI — título, sección, cuerpo, metadato y monto.">
      <TypographyWhiteCard className="space-y-0 divide-y p-0">
        {TYPOGRAPHY_SCALE_SIMPLE.map((step) => (
          <div
            key={step.id}
            className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-4"
            style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
                {step.label}
              </p>
              <p
                className={cn(
                  step.font === "numeric" ? FONT_CLASS.numeric : FONT_CLASS.ui,
                  step.font === "numeric" && "tabular-nums",
                )}
                style={{
                  fontSize: step.sizePx,
                  fontWeight: step.weight,
                  color: CONCEPT_TOKENS.bruma900,
                  lineHeight: 1.25,
                }}
              >
                {step.sample}
              </p>
            </div>
            <p
              className="shrink-0 font-mono text-[10px]"
              style={{ color: CONCEPT_TOKENS.bruma500 }}
            >
              {step.sizePx}px
            </p>
          </div>
        ))}
      </TypographyWhiteCard>
    </TypographyBrumaStage>
  )
}

export function TypographyInContextDemo() {
  const items = [
    { name: "Medialuna clásica", meta: "Panadería · x2", price: "$ 1.200" },
    { name: "Café con leche", meta: "Bebidas · x1", price: "$ 2.800" },
  ] as const

  return (
    <TypographyBrumaStage caption="En una lista: nombre en body, contexto en metadatos, monto en números — tres niveles, sin mezclar pesos.">
      <TypographyWhiteCard className="overflow-hidden p-0">
        <div
          className="border-b px-4 py-3"
          style={{
            borderColor: CONCEPT_TOKENS.bruma200,
            backgroundColor: CONCEPT_TOKENS.bruma50,
          }}
        >
          <p
            className="font-canopy text-xs font-semibold uppercase tracking-wide"
            style={{ color: CONCEPT_TOKENS.bruma500 }}
          >
            Tu pedido
          </p>
        </div>
        <ul>
          {items.map((item, index) => (
            <li
              key={item.name}
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{
                borderBottom:
                  index < items.length - 1
                    ? `1px solid ${CONCEPT_TOKENS.bruma200}`
                    : undefined,
              }}
            >
              <div>
                <p
                  className="font-canopy text-sm font-medium"
                  style={{ color: CONCEPT_TOKENS.bruma900 }}
                >
                  {item.name}
                </p>
                <p className="font-canopy text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
                  {item.meta}
                </p>
              </div>
              <p
                className="font-ledger text-sm font-semibold tabular-nums"
                style={{ color: CONCEPT_TOKENS.bruma900 }}
              >
                {item.price}
              </p>
            </li>
          ))}
        </ul>
        <div
          className="flex items-center justify-between border-t px-4 py-3"
          style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
        >
          <span className="font-canopy text-sm" style={{ color: CONCEPT_TOKENS.bruma900 }}>
            Total
          </span>
          <span
            className="font-ledger text-lg font-bold tabular-nums"
            style={{ color: CONCEPT_TOKENS.bruma900 }}
          >
            $ 4.000
          </span>
        </div>
      </TypographyWhiteCard>
    </TypographyBrumaStage>
  )
}

export function TypographyProductScreenDemo() {
  return (
    <TypographyBrumaStage caption="Pantalla completa en miniatura — título, copy de apoyo, campo y acción. Todo en UI excepto el total.">
      <TypographyWhiteCard className="mx-auto max-w-md space-y-4">
        <div>
          <p
            className="font-canopy text-xl font-bold tracking-tight"
            style={{ color: CONCEPT_TOKENS.bruma900 }}
          >
            Nuevo artículo
          </p>
          <p className="mt-1 font-canopy text-sm" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            Completá los datos del producto.
          </p>
        </div>
        <label className="block space-y-1.5">
          <span
            className="font-canopy text-sm font-medium"
            style={{ color: CONCEPT_TOKENS.bruma900 }}
          >
            Nombre
          </span>
          <div
            className="rounded-lg border px-3 py-2 font-canopy text-sm"
            style={{
              borderColor: CONCEPT_TOKENS.bruma200,
              color: CONCEPT_TOKENS.bruma900,
            }}
          >
            Medialuna clásica
          </div>
          <span className="font-canopy text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            Visible en ventas y catálogo.
          </span>
        </label>
        <div className="flex items-end justify-between gap-4 pt-2">
          <div>
            <p className="font-canopy text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
              Precio
            </p>
            <p
              className="font-ledger text-2xl font-bold tabular-nums"
              style={{ color: CONCEPT_TOKENS.bruma900 }}
            >
              $ 600
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-4 py-2 font-canopy text-sm font-medium text-white"
            style={{ backgroundColor: CONCEPT_TOKENS.savia600 }}
          >
            Guardar
          </button>
        </div>
      </TypographyWhiteCard>
    </TypographyBrumaStage>
  )
}

export function TypographyMetricComparison() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TypographyWhiteCard className="text-center">
        <p
          className="font-ledger text-3xl font-bold tabular-nums"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          45%
        </p>
        <p className="mt-1 font-canopy text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
          Capacidad usada
        </p>
        <p className="mt-4 text-[11px]" style={{ color: CONCEPT_TOKENS.savia800 }}>
          Número en Inter bold · etiqueta en body chico
        </p>
      </TypographyWhiteCard>
      <TypographyWhiteCard className="text-center opacity-70">
        <p
          className="font-ledger text-3xl font-bold tabular-nums"
          style={{ color: CONCEPT_TOKENS.bruma900 }}
        >
          45%
        </p>
        <p
          className="mt-1 font-ledger text-sm font-bold tabular-nums"
          style={{ color: CONCEPT_TOKENS.bruma500 }}
        >
          Capacidad usada
        </p>
        <p className="mt-4 text-[11px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
          Mismo peso en número y etiqueta — cuesta leer la jerarquía
        </p>
      </TypographyWhiteCard>
    </div>
  )
}

export function TypographyGuidelinesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {TYPOGRAPHY_APPLYING_GUIDELINES.map((item) => (
        <TypographyWhiteCard key={item.id} className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: CONCEPT_TOKENS.bruma900 }}>
            {item.title}
          </p>
          <div className="space-y-2 text-xs leading-relaxed">
            <p style={{ color: CONCEPT_TOKENS.savia800 }}>✓ {item.doText}</p>
            <p style={{ color: CONCEPT_TOKENS.bruma500 }}>✗ {item.dontText}</p>
          </div>
        </TypographyWhiteCard>
      ))}
    </div>
  )
}

export function TypographyAccessibilityCard() {
  return (
    <TypographyWhiteCard>
      <ul className="space-y-2">
        {TYPOGRAPHY_ACCESSIBILITY_NOTES.map((note) => (
          <li
            key={note}
            className="flex gap-2 text-sm leading-relaxed"
            style={{ color: CONCEPT_TOKENS.bruma600 }}
          >
            <span style={{ color: CONCEPT_TOKENS.savia600 }}>·</span>
            {note}
          </li>
        ))}
      </ul>
    </TypographyWhiteCard>
  )
}

export function TypographyScaleLadder() {
  return (
    <TypographyWhiteCard className="space-y-4">
      <p className="text-sm leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma600 }}>
        Base {TYPE_SCALE_NOTES.basePx}px · ratio {TYPE_SCALE_NOTES.ratio} (minor third).{" "}
        {TYPE_SCALE_NOTES.rule}
      </p>
      <div className="space-y-4">
        {TYPOGRAPHY_SCALE_SIMPLE.map((step) => (
          <div key={step.id} className="flex items-baseline gap-4">
            <span
              className="w-28 shrink-0 text-[11px]"
              style={{ color: CONCEPT_TOKENS.bruma500 }}
            >
              {step.label}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1",
                step.font === "numeric" ? FONT_CLASS.numeric : FONT_CLASS.ui,
                step.font === "numeric" && "tabular-nums",
              )}
              style={{
                fontSize: step.sizePx,
                fontWeight: step.weight,
                color: CONCEPT_TOKENS.bruma900,
              }}
            >
              {step.sample}
            </span>
            <span
              className="hidden shrink-0 font-mono text-[10px] sm:inline"
              style={{ color: CONCEPT_TOKENS.bruma500 }}
            >
              {step.token}
            </span>
          </div>
        ))}
      </div>
    </TypographyWhiteCard>
  )
}

export function TypographyWeightsDemo() {
  return (
    <TypographyWhiteCard className="divide-y">
      {ROOTSY_FONT_WEIGHTS.map((weight) => (
        <div
          key={weight.value}
          className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
        >
          <span
            className="font-canopy text-base"
            style={{ fontWeight: weight.value, color: CONCEPT_TOKENS.bruma900 }}
          >
            {weight.label} — Confirmar venta
          </span>
          <span className="text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            {weight.usage}
          </span>
        </div>
      ))}
    </TypographyWhiteCard>
  )
}

export function TypographyTypefacesDetail() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {ROOTSY_TYPEFACES.map((face) => (
        <TypographyWhiteCard key={face.id} className="space-y-2">
          <p className="text-sm font-semibold" style={{ color: CONCEPT_TOKENS.bruma900 }}>
            {face.label}
          </p>
          <p className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            {face.cssVar}
          </p>
          <p
            className={cn(
              typefaceFontClass(face.id),
              face.id === "numeric" && "text-xl font-bold tabular-nums",
              face.id === "reading" && "text-base leading-relaxed",
            )}
            style={{ color: CONCEPT_TOKENS.bruma900 }}
          >
            {face.sample}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: CONCEPT_TOKENS.bruma500 }}>
            {face.description}
          </p>
        </TypographyWhiteCard>
      ))}
    </div>
  )
}

function TokenRow({ style }: { style: TypographyStyle }) {
  const fontClass =
    style.fontFamily === "numeric"
      ? FONT_CLASS.numeric
      : style.fontFamily === "reading"
        ? FONT_CLASS.reading
        : FONT_CLASS.ui

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-b py-3 last:border-b-0"
      style={{ borderColor: CONCEPT_TOKENS.bruma200 }}
    >
      <span
        className={cn(fontClass, style.fontFamily === "numeric" && "tabular-nums")}
        style={{
          fontWeight: style.fontWeight,
          fontSize: style.fontSizeRem,
          lineHeight: style.lineHeightRem,
          color: CONCEPT_TOKENS.bruma900,
        }}
      >
        {style.preview}
      </span>
      <div className="text-right">
        <p className="font-mono text-[10px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
          {style.token}
        </p>
        <p className="text-[11px]" style={{ color: CONCEPT_TOKENS.bruma500 }}>
          {style.fontSizePx}px · {style.fontWeightLabel}
        </p>
      </div>
    </div>
  )
}

export function TypographyTokensReference() {
  const groups = [
    { title: "Títulos", styles: ROOTSY_HEADING_STYLES },
    { title: "Cuerpo", styles: ROOTSY_BODY_STYLES },
    { title: "Montos", styles: ROOTSY_METRIC_STYLES },
  ] as const

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {groups.map((group) => (
        <TypographyWhiteCard key={group.title}>
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-wide"
            style={{ color: CONCEPT_TOKENS.bruma500 }}
          >
            {group.title}
          </p>
          {group.styles.map((style) => (
            <TokenRow key={style.id} style={style} />
          ))}
        </TypographyWhiteCard>
      ))}
    </div>
  )
}

export function TypographyReadingDemo() {
  return (
    <TypographyWhiteCard>
      <p
        className="font-stream text-base leading-relaxed"
        style={{ color: CONCEPT_TOKENS.bruma900 }}
      >
        Rootsy conecta inventario, ventas y tesorería en un solo lugar. La tipografía de
        lectura entra cuando hay párrafos largos — descripciones de artículos, ayuda de
        campo o copy explicativo. En pantallas de trabajo, la UI lleva casi todo.
      </p>
      <p className="mt-3 text-xs" style={{ color: CONCEPT_TOKENS.bruma500 }}>
        Nunito Sans · 16px / 1.5 · 65ch. Cambia la familia y el ritmo: no es chrome.
      </p>
    </TypographyWhiteCard>
  )
}
