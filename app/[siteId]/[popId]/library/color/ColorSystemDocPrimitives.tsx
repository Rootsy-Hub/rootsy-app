"use client"

import type {
  ColorTheme,
  ComplementaryPairing,
  ContrastPair,
  SemanticToken,
  SurfaceLayer,
} from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import {
  COLOR_TOKENS,
  ROOTSY_CHART_SEQUENCE,
  ROOTSY_CHART_STATUS,
  ROOTSY_COLOR_ROLES,
  ROOTSY_INTERACTION_STATES,
  ROOTSY_PRODUCT_EMPHASIS,
  ROOTSY_THEMES,
} from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

function ColorWhiteCard({
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

function ColorBrumaStage({
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
        backgroundColor: COLOR_TOKENS.bruma100,
        borderColor: COLOR_TOKENS.bruma200,
      }}
    >
      <div className={cn("p-5 sm:p-6", className)}>{children}</div>
      {caption ? (
        <p
          className="border-t px-4 py-3 font-canopy text-[11px] leading-relaxed"
          style={{
            borderColor: COLOR_TOKENS.bruma200,
            color: COLOR_TOKENS.bruma500,
          }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  )
}

function ColorExampleLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-canopy text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  )
}

const FAMILY_ARCHITECTURE = [
  { label: "Ceniza", hex: COLOR_TOKENS.ceniza600, sub: "Catálogo · rail · cards" },
  { label: "Bruma", hex: COLOR_TOKENS.bruma100, sub: "Ticket · tablas · workspace", text: COLOR_TOKENS.bruma900 },
  { label: "Savia", hex: COLOR_TOKENS.savia600, sub: "Acción · foco · totales" },
  { label: "Landing", hex: COLOR_TOKENS.landing950, sub: "Hero · CTA · aurora" },
] as const

export function ColorSystemHero() {
  return (
    <ColorWhiteCard>
      <p
        className="font-canopy text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ color: COLOR_TOKENS.bruma500 }}
      >
        Rootsy · Sistema de color
      </p>
      <p
        className="mt-3 font-canopy text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ color: COLOR_TOKENS.bruma900 }}
      >
        Ceniza, bruma, savia, landing
      </p>
      <p
        className="mt-2 max-w-xl font-canopy text-sm leading-relaxed"
        style={{ color: COLOR_TOKENS.bruma500 }}
      >
        Cuatro familias extraídas de pantallas reales — mostrador, ticket, acción y hero.
        Sin paletas decorativas paralelas.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FAMILY_ARCHITECTURE.map((family) => (
          <div
            key={family.label}
            className="overflow-hidden rounded-xl border"
            style={{ borderColor: COLOR_TOKENS.bruma200 }}
          >
            <div
              className="flex h-14 items-end p-2.5"
              style={{ backgroundColor: family.hex }}
            >
              <span
                className="font-canopy text-[11px] font-semibold"
                style={{ color: "text" in family ? family.text : COLOR_TOKENS.white }}
              >
                {family.label}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p
        className="mt-4 border-t pt-4 font-stream text-sm leading-relaxed"
        style={{
          borderColor: COLOR_TOKENS.bruma200,
          color: COLOR_TOKENS.bruma500,
        }}
      >
        El color no decora: orienta. Cada tono responde a una superficie que el usuario ya
        conoce del producto.
      </p>
    </ColorWhiteCard>
  )
}

export function ColorFamiliesRow() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {FAMILY_ARCHITECTURE.map((layer) => (
        <ColorWhiteCard key={layer.label} className="space-y-2 p-4">
          <div
            className="h-12 rounded-lg"
            style={{ backgroundColor: layer.hex }}
          />
          <p
            className="font-canopy text-sm font-semibold"
            style={{ color: COLOR_TOKENS.bruma900 }}
          >
            {layer.label}
          </p>
          <p className="font-canopy text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
            {layer.sub}
          </p>
        </ColorWhiteCard>
      ))}
    </div>
  )
}

export function ColorSemanticPreview() {
  const highlights = [
    { label: "Ticket", hex: COLOR_TOKENS.bruma100, text: COLOR_TOKENS.bruma900 },
    { label: "Acción", hex: COLOR_TOKENS.savia600, text: COLOR_TOKENS.white },
    { label: "Catálogo", hex: COLOR_TOKENS.ceniza600, text: ON_DARK_PREVIEW },
    { label: "Foco", hex: COLOR_TOKENS.ceniza500, text: COLOR_TOKENS.savia400, border: COLOR_TOKENS.savia400 },
  ] as const

  return (
    <ColorBrumaStage caption="Tokens con propósito — shell, ticket, acción y foco. Referencia completa en Detalles técnicos.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item) => (
          <ColorWhiteCard key={item.label} className="space-y-2 p-4">
            <span
              className="inline-flex rounded-lg px-3 py-1.5 font-canopy text-xs font-medium"
              style={{
                backgroundColor: item.hex,
                color: item.text,
                border: "border" in item ? `1px solid ${item.border}` : undefined,
              }}
            >
              {item.label}
            </span>
            <p className="font-canopy text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
              --color-{item.label.toLowerCase()}
            </p>
          </ColorWhiteCard>
        ))}
      </div>
    </ColorBrumaStage>
  )
}

const ON_DARK_PREVIEW = "#F8FAFC"

export function ThemePreviewCard({ theme }: { theme: ColorTheme }) {
  return (
    <ColorWhiteCard className="overflow-hidden p-0">
      <div className="p-4" style={{ backgroundColor: theme.shell }}>
        <div
          className="overflow-hidden rounded-xl border"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
          }}
        >
          <div
            className="flex items-center justify-between border-b px-3 py-2"
            style={{ borderColor: theme.border }}
          >
            <span
              className="font-canopy text-xs font-semibold"
              style={{ color: theme.textPrimary }}
            >
              {theme.label}
            </span>
            <span
              className="font-canopy text-[10px]"
              style={{ color: theme.textSecondary }}
            >
              {theme.subtitle}
            </span>
          </div>
          <div className="space-y-2 p-3">
            <div
              className="rounded-lg px-3 py-2 font-canopy text-xs"
              style={{
                backgroundColor: theme.elevated,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
              }}
            >
              Superficie elevada
            </div>
            <div className="flex gap-2">
              <span
                className="inline-flex h-8 flex-1 items-center justify-center rounded-lg font-canopy text-xs font-medium"
                style={{
                  backgroundColor: theme.action,
                  color: theme.actionText,
                }}
              >
                Acción
              </span>
              <span
                className="inline-flex h-8 items-center justify-center rounded-lg px-3 font-canopy text-xs"
                style={{
                  color: theme.accent,
                  border: `1px solid ${theme.accent}55`,
                }}
              >
                Foco
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        className="space-y-1 border-t px-4 py-3"
        style={{ borderColor: COLOR_TOKENS.bruma200 }}
      >
        <p
          className="font-canopy text-sm font-semibold"
          style={{ color: COLOR_TOKENS.bruma900 }}
        >
          {theme.label}
        </p>
        <p className="font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
          {theme.description}
        </p>
      </div>
    </ColorWhiteCard>
  )
}

export function ThemeGallery() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {ROOTSY_THEMES.map((theme) => (
        <ThemePreviewCard key={theme.id} theme={theme} />
      ))}
    </div>
  )
}

export function SemanticTokenTable({ tokens }: { tokens: SemanticToken[] }) {
  return (
    <div className="library-spec-card overflow-hidden rounded-2xl border">
      <table className="w-full text-left font-canopy text-sm">
        <thead>
          <tr
            className="border-b"
            style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.bruma50 }}
          >
            <th
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Token
            </th>
            <th
              className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide md:table-cell"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Uso
            </th>
            <th
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Muestra
            </th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr
              key={token.id}
              className="border-b last:border-b-0"
              style={{ borderColor: COLOR_TOKENS.bruma200 }}
            >
              <td className="px-4 py-3 align-top">
                <p className="font-medium" style={{ color: COLOR_TOKENS.bruma900 }}>
                  {token.label}
                </p>
                <code
                  className="mt-0.5 block font-code text-[11px]"
                  style={{ color: COLOR_TOKENS.bruma500 }}
                >
                  {token.token}
                </code>
              </td>
              <td
                className="hidden px-4 py-3 align-top md:table-cell"
                style={{ color: COLOR_TOKENS.bruma500 }}
              >
                {token.usage}
              </td>
              <td className="px-4 py-3 align-top">
                <span
                  className="inline-flex min-w-28 rounded-lg border px-2.5 py-1 font-canopy text-xs font-medium"
                  style={{
                    backgroundColor: token.hex,
                    color: token.textHex ?? COLOR_TOKENS.white,
                    borderColor: token.borderHex ?? "transparent",
                  }}
                >
                  {token.hex}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ProductRoleTable() {
  return (
    <div className="library-spec-card overflow-hidden rounded-2xl border">
      <table className="w-full text-left font-canopy text-sm">
        <thead>
          <tr
            className="border-b"
            style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.bruma50 }}
          >
            <th
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Rol
            </th>
            <th
              className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide md:table-cell"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Cuándo
            </th>
            <th
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Ejemplo
            </th>
          </tr>
        </thead>
        <tbody>
          {ROOTSY_COLOR_ROLES.map((role) => (
            <tr
              key={role.roleLabel}
              className="border-b last:border-b-0"
              style={{ borderColor: COLOR_TOKENS.bruma200 }}
            >
              <td
                className="px-4 py-3 align-top font-medium"
                style={{ color: COLOR_TOKENS.bruma900 }}
              >
                {role.roleLabel}
              </td>
              <td
                className="hidden px-4 py-3 align-top md:table-cell"
                style={{ color: COLOR_TOKENS.bruma500 }}
              >
                {role.description}
              </td>
              <td className="px-4 py-3 align-top">
                <span
                  className="inline-flex rounded-lg border px-2.5 py-1 font-canopy text-xs font-medium"
                  style={{
                    backgroundColor: role.bg,
                    color: role.text,
                    borderColor: role.border ?? "transparent",
                  }}
                >
                  {role.exampleLabel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ProductEmphasisGallery() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {ROOTSY_PRODUCT_EMPHASIS.map((family) => (
        <ColorWhiteCard key={family.id} className="space-y-3">
          <p
            className="font-canopy text-sm font-semibold"
            style={{ color: COLOR_TOKENS.bruma900 }}
          >
            {family.label}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {family.levels.map((level) => (
              <div key={level.id} className="space-y-1.5">
                <div
                  className="h-14 rounded-lg border"
                  style={{
                    backgroundColor: level.hex,
                    borderColor: COLOR_TOKENS.bruma200,
                  }}
                />
                <p
                  className="font-canopy text-[10px] leading-tight"
                  style={{ color: COLOR_TOKENS.bruma500 }}
                >
                  {level.label}
                </p>
              </div>
            ))}
          </div>
        </ColorWhiteCard>
      ))}
    </div>
  )
}

const HARMONY_LABELS: Record<ComplementaryPairing["harmony"], string> = {
  split: "Split",
  analogous: "Análogo",
  complementary: "Complementario",
  "neutral-action": "Neutro + acción",
}

export function PairingCard({ pairing }: { pairing: ComplementaryPairing }) {
  return (
    <ColorWhiteCard className="overflow-hidden p-0">
      <div className="flex h-20">
        <div className="flex-1" style={{ backgroundColor: pairing.primary.hex }} />
        <div className="flex-1" style={{ backgroundColor: pairing.secondary.hex }} />
        {pairing.accent ? (
          <div className="w-1/4" style={{ backgroundColor: pairing.accent.hex }} />
        ) : null}
      </div>
      <div className="space-y-2 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className="font-canopy text-sm font-semibold"
            style={{ color: COLOR_TOKENS.bruma900 }}
          >
            {pairing.title}
          </p>
          <span
            className="rounded-full px-2 py-0.5 font-canopy text-[10px] font-medium"
            style={{
              backgroundColor: COLOR_TOKENS.bruma100,
              color: COLOR_TOKENS.bruma500,
            }}
          >
            {HARMONY_LABELS[pairing.harmony]}
          </span>
        </div>
        <p className="font-canopy text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
          {pairing.description}
        </p>
        <p className="font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma900 }}>
          <span className="font-medium">Uso: </span>
          {pairing.usage}
        </p>
      </div>
    </ColorWhiteCard>
  )
}

export function ContrastTable({ pairs }: { pairs: ContrastPair[] }) {
  const levelStyles: Record<ContrastPair["level"], string> = {
    AAA: "bg-[#D1FAE5] text-[#065F46]",
    AA: "bg-[#EEF1F5] text-[#334155]",
    Fail: "bg-[#FEE2E2] text-[#991B1B]",
  }

  return (
    <div className="library-spec-card overflow-hidden rounded-2xl border">
      <table className="w-full text-left font-canopy text-sm">
        <thead>
          <tr
            className="border-b"
            style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.bruma50 }}
          >
            <th
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Par
            </th>
            <th
              className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide sm:table-cell"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Contexto
            </th>
            <th
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Ratio
            </th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => (
            <tr
              key={pair.id}
              className="border-b last:border-b-0"
              style={{ borderColor: COLOR_TOKENS.bruma200 }}
            >
              <td className="px-4 py-3 align-top">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-9 w-16 overflow-hidden rounded-md border"
                    style={{
                      backgroundColor: pair.background,
                      borderColor: COLOR_TOKENS.bruma200,
                    }}
                  >
                    <span
                      className="m-auto font-canopy text-[10px] font-bold"
                      style={{ color: pair.foreground }}
                    >
                      Aa
                    </span>
                  </div>
                  <div
                    className="font-code text-[11px]"
                    style={{ color: COLOR_TOKENS.bruma500 }}
                  >
                    <p>{pair.foreground}</p>
                    <p>{pair.background}</p>
                  </div>
                </div>
              </td>
              <td
                className="hidden px-4 py-3 align-top sm:table-cell"
                style={{ color: COLOR_TOKENS.bruma500 }}
              >
                {pair.context}
              </td>
              <td className="px-4 py-3 align-top">
                <p
                  className="font-ledger font-medium tabular-nums"
                  style={{ color: COLOR_TOKENS.bruma900 }}
                >
                  {pair.ratio}
                </p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2 py-0.5 font-canopy text-[10px] font-semibold ${levelStyles[pair.level]}`}
                >
                  {pair.level}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ThemeValuesTable() {
  return (
    <div className="library-spec-card overflow-hidden rounded-2xl border">
      <table className="w-full text-left font-canopy text-sm">
        <thead>
          <tr
            className="border-b"
            style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.bruma50 }}
          >
            <th
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Tema
            </th>
            <th
              className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide md:table-cell"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Shell
            </th>
            <th
              className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide md:table-cell"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Acción
            </th>
            <th
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wide"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Foco
            </th>
          </tr>
        </thead>
        <tbody>
          {ROOTSY_THEMES.map((theme) => (
            <tr
              key={theme.id}
              className="border-b last:border-b-0"
              style={{ borderColor: COLOR_TOKENS.bruma200 }}
            >
              <td
                className="px-4 py-3 font-medium"
                style={{ color: COLOR_TOKENS.bruma900 }}
              >
                {theme.label}
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <code className="font-code text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
                  {theme.shell}
                </code>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <span
                  className="inline-flex rounded-md px-2 py-0.5 font-canopy text-xs font-medium text-white"
                  style={{ backgroundColor: theme.action }}
                >
                  {theme.action}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className="font-ledger text-sm font-semibold tabular-nums"
                  style={{ color: theme.accent }}
                >
                  {theme.accent}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SurfaceStackDemo({
  themeId,
  layers,
}: {
  themeId: string
  layers: SurfaceLayer[]
}) {
  return (
    <ColorWhiteCard className="space-y-2">
      <ColorExampleLabel>{themeId}</ColorExampleLabel>
      <div className="space-y-1.5">
        {layers.map((layer) => (
          <div
            key={layer.level}
            className="flex items-center gap-3 rounded-xl border px-3 py-2"
            style={{
              marginLeft: `${layer.level * 12}px`,
              backgroundColor: layer.hex.length === 9 ? undefined : layer.hex,
              background: layer.hex.length === 9 ? layer.hex : undefined,
              borderColor: COLOR_TOKENS.bruma200,
            }}
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-ledger text-[10px] font-bold tabular-nums"
              style={{
                backgroundColor: `${COLOR_TOKENS.bruma900}18`,
                color: COLOR_TOKENS.bruma900,
              }}
            >
              {layer.level}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="font-canopy text-sm font-medium"
                style={{ color: COLOR_TOKENS.bruma900 }}
              >
                {layer.label}
              </p>
              <p
                className="truncate font-code text-[11px]"
                style={{ color: COLOR_TOKENS.bruma500 }}
              >
                {layer.token} · {layer.usage}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ColorWhiteCard>
  )
}

export function InteractionStatesGallery() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ROOTSY_INTERACTION_STATES.map((state) => (
        <ColorWhiteCard key={state.id} className="space-y-2 border-dashed">
          <p
            className="font-canopy text-[11px] font-medium uppercase tracking-wide"
            style={{ color: COLOR_TOKENS.bruma500 }}
          >
            {state.label}
            <span className="ml-1 normal-case opacity-70">· {state.context}</span>
          </p>
          <div
            className="h-11 rounded-lg px-3 font-canopy text-sm leading-[2.75rem]"
            style={{
              backgroundColor: state.background,
              border: `1px solid ${state.border}`,
              boxShadow: state.ring,
              color: state.context === "pos" ? ON_DARK_PREVIEW : COLOR_TOKENS.bruma900,
            }}
          >
            Campo de ejemplo
          </div>
        </ColorWhiteCard>
      ))}
    </div>
  )
}

export function PosSplitDemo() {
  return (
    <ColorBrumaStage caption="Split ceniza + bruma — regla de oro del mostrador. Savia solo en acciones.">
      <ColorWhiteCard className="overflow-hidden p-0">
        <div className="grid min-h-[200px] lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3 p-4" style={{ backgroundColor: COLOR_TOKENS.ceniza600 }}>
            <p
              className="font-canopy text-xs font-semibold uppercase tracking-wide"
              style={{ color: COLOR_TOKENS.ceniza300 }}
            >
              Ceniza · catálogo
            </p>
            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: COLOR_TOKENS.ceniza500,
                border: `1px solid ${COLOR_TOKENS.bruma700}`,
              }}
            >
              <p
                className="font-canopy text-sm font-medium"
                style={{ color: ON_DARK_PREVIEW }}
              >
                Cola 500 ml
              </p>
              <p
                className="mt-1 font-ledger text-xs font-bold tabular-nums"
                style={{ color: COLOR_TOKENS.ceniza300 }}
              >
                $ 1.250
              </p>
            </div>
            <span
              className="inline-flex rounded-lg px-3 py-1.5 font-canopy text-xs font-medium text-white"
              style={{ backgroundColor: COLOR_TOKENS.savia600 }}
            >
              Vender
            </span>
          </div>
          <div className="space-y-3 p-4" style={{ backgroundColor: COLOR_TOKENS.bruma100 }}>
            <p
              className="font-canopy text-xs font-semibold uppercase tracking-wide"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              Bruma · ticket
            </p>
            <p
              className="font-canopy text-sm font-medium"
              style={{ color: COLOR_TOKENS.bruma900 }}
            >
              Tu pedido
            </p>
            <div
              className="rounded-lg px-3 py-2 font-canopy text-xs"
              style={{
                backgroundColor: COLOR_TOKENS.bruma50,
                color: COLOR_TOKENS.bruma900,
              }}
            >
              1× Cola 500 ml
            </div>
            <p
              className="font-ledger text-xl font-bold tabular-nums"
              style={{ color: COLOR_TOKENS.bruma900 }}
            >
              $ 1.250
            </p>
          </div>
        </div>
      </ColorWhiteCard>
    </ColorBrumaStage>
  )
}

export function ColorGradientGallery({
  items,
}: {
  items: ReadonlyArray<{
    id: string
    title: string
    description: string
    from: string
    to: string
    via?: string
    angle?: number
  }>
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((gradient) => (
        <ColorWhiteCard key={gradient.id} className="overflow-hidden p-0">
          <div
            className="h-24"
            style={{
              background: gradient.via
                ? `linear-gradient(${gradient.angle ?? 135}deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`
                : `linear-gradient(${gradient.angle ?? 135}deg, ${gradient.from}, ${gradient.to})`,
            }}
          />
          <div className="space-y-1 px-4 py-3">
            <p
              className="font-canopy text-sm font-semibold"
              style={{ color: COLOR_TOKENS.bruma900 }}
            >
              {gradient.title}
            </p>
            <p className="font-canopy text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
              {gradient.description}
            </p>
          </div>
        </ColorWhiteCard>
      ))}
    </div>
  )
}

export function ProductSingleChartDemo() {
  return (
    <ColorWhiteCard>
      <p className="font-canopy text-sm font-medium" style={{ color: COLOR_TOKENS.bruma900 }}>
        Serie única · ventas
      </p>
      <div className="mt-4 flex h-32 items-end gap-2">
        {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md"
            style={{
              height: `${h}%`,
              backgroundColor: i === 6 ? COLOR_TOKENS.savia600 : COLOR_TOKENS.bruma200,
            }}
          />
        ))}
      </div>
      <p className="mt-3 font-canopy text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
        Savia 600 para el dato clave; bruma 200 para el resto.
      </p>
    </ColorWhiteCard>
  )
}

export function ProductCategoricalChartDemo() {
  return (
    <ColorWhiteCard>
      <p className="font-canopy text-sm font-medium" style={{ color: COLOR_TOKENS.bruma900 }}>
        Categórico · rubros
      </p>
      <div className="mt-4 space-y-2">
        {ROOTSY_CHART_SEQUENCE.map((series, i) => (
          <div key={series.id} className="flex items-center gap-3">
            <div
              className="size-3 shrink-0 rounded-full"
              style={{ backgroundColor: series.hex }}
            />
            <div
              className="h-2 flex-1 overflow-hidden rounded-full"
              style={{ backgroundColor: COLOR_TOKENS.bruma100 }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${90 - i * 14}%`,
                  backgroundColor: series.hex,
                }}
              />
            </div>
            <span
              className="w-16 text-right font-canopy text-xs"
              style={{ color: COLOR_TOKENS.bruma500 }}
            >
              {series.label}
            </span>
          </div>
        ))}
      </div>
    </ColorWhiteCard>
  )
}

export function ProductStatusChartDemo() {
  return (
    <ColorWhiteCard>
      <p className="font-canopy text-sm font-medium" style={{ color: COLOR_TOKENS.bruma900 }}>
        Estados
      </p>
      <div className="mt-4 flex h-8 overflow-hidden rounded-lg">
        {ROOTSY_CHART_STATUS.map((status, i) => (
          <div
            key={status.id}
            className="flex-1 border-r border-white/30 last:border-r-0"
            style={{
              backgroundColor: i % 2 === 0 ? status.hex : status.boldHex,
            }}
            title={status.label}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {ROOTSY_CHART_STATUS.map((status) => (
          <div
            key={status.id}
            className="flex items-center gap-1.5 font-canopy text-xs"
            style={{ color: COLOR_TOKENS.bruma500 }}
          >
            <div
              className="size-2.5 rounded-full"
              style={{ backgroundColor: status.boldHex }}
            />
            {status.label}
          </div>
        ))}
      </div>
    </ColorWhiteCard>
  )
}
