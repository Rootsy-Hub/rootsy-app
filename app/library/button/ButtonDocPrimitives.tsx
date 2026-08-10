"use client"

import {
  BUTTON_GUIDELINES,
  BUTTON_RELATED_LINKS,
  BUTTON_VARIANT_MATRIX_COLUMNS,
  ROOTSY_BUTTON_APPEARANCES,
  ROOTSY_BUTTON_COLOR_TOKENS,
  ROOTSY_BUTTON_SEMANTIC,
  ROOTSY_BUTTON_SIZES,
  ROOTSY_BUTTON_STATES,
  type ButtonVariantState,
} from "@/app/library/button/rootsyButtonSystem"
import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import {
  FoundationBrumaStage,
  FoundationExampleLabel,
  FoundationSpecCard,
} from "@/app/library/libraryFoundationDocShared"
import {
  LibraryDoDontPair,
  LibraryRelatedLinks,
} from "@/app/library/libraryDocPrimitives"
import {
  RootsDangerButton,
  RootsDefaultButton,
  RootsIconButton,
  RootsPrimaryButton,
  RootsProgressButton,
  RootsSubtleButton,
  rootsButtonClassForVariant,
  rootsButtonCompactSizeClass,
  rootsButtonVariant,
  type RootsIconButtonSize,
  type RootsIconButtonSurface,
  type RootsIconButtonTone,
} from "@/components/rootsy-button"
import { rootsIconButtonNightDemoSurfaceClass } from "@/components/rootsy-button/rootsIconButtonNightStyles"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bold,
  Eye,
  Home,
  Italic,
  Pencil,
  Plus,
  Save,
  Trash2,
  Underline,
} from "lucide-react"
import { useState, type ReactNode } from "react"

export {
  LibraryDocLead as ButtonDocLead,
  LibraryDocSection as ButtonDocSection,
  LibraryPrinciplesGrid as ButtonPrinciplesGrid,
} from "@/app/library/libraryDocPrimitives"

const APPEARANCE_LABELS: Record<string, string> = {
  primary: "Guardar",
  default: "Exportar",
  subtle: "Cancelar",
  danger: "Eliminar",
  link: "Ver detalle",
}

const APPEARANCE_ICON_LABELS: Record<string, string> = {
  primary: "Guardar cambios",
  default: "Nuevo artículo",
  subtle: "Descartar",
  danger: "Eliminar definitivamente",
  link: "Más información",
}

type SemanticKey = "primary" | "secondary" | "tertiary" | "destructive" | "link"

function semanticForAppearance(appearance: string): SemanticKey {
  switch (appearance) {
    case "primary":
      return "primary"
    case "subtle":
      return "tertiary"
    case "danger":
      return "destructive"
    case "link":
      return "link"
    default:
      return "secondary"
  }
}

function MatrixButton({
  appearance,
  state,
  label,
}: {
  appearance: string
  state: ButtonVariantState
  label: string
}) {
  const semantic = semanticForAppearance(appearance)
  const variant = rootsButtonVariant[semantic]
  const className = rootsButtonClassForVariant(semantic)
  const disabled = state === "disabled"
  const loading = state === "loading"
  const withIcon = state === "icon"

  if (appearance === "link") {
    if (loading) {
      return (
        <RootsProgressButton
          type="button"
          variant={variant as "link"}
          className={className}
          loading
          loadingLabel="Cargando…"
        >
          {label}
        </RootsProgressButton>
      )
    }
    return (
      <Button type="button" variant={variant as "link"} className={className} disabled={disabled}>
        {withIcon ? (
          <>
            <ArrowRight className="size-4" aria-hidden />
            {label}
          </>
        ) : (
          label
        )}
      </Button>
    )
  }

  if (loading) {
    return (
      <RootsProgressButton
        type="button"
        variant={variant as "default"}
        className={className}
        loading
        loadingLabel="Guardando…"
      >
        {label}
      </RootsProgressButton>
    )
  }

  const Icon = appearance === "danger" ? Trash2 : appearance === "primary" ? Save : Plus

  const shared = {
    type: "button" as const,
    disabled,
    children: withIcon ? (
      <>
        <Icon className="size-4" aria-hidden />
        {APPEARANCE_ICON_LABELS[appearance] ?? label}
      </>
    ) : (
      label
    ),
  }

  switch (semantic) {
    case "primary":
      return <RootsPrimaryButton {...shared} />
    case "tertiary":
      return <RootsSubtleButton {...shared} />
    case "destructive":
      return <RootsDangerButton {...shared} />
    default:
      return <RootsDefaultButton {...shared} />
  }
}

function SpecMono({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px]" style={{ color: COLOR_TOKENS.bruma500 }}>
      {children}
    </span>
  )
}

export function ButtonManifestoHero() {
  return (
    <FoundationSpecCard className="space-y-4">
      <FoundationExampleLabel>Componente</FoundationExampleLabel>
      <p
        className="font-canopy text-xl font-bold tracking-tight"
        style={{ color: COLOR_TOKENS.bruma900 }}
      >
        Botones
      </p>
      <p className="font-canopy text-sm leading-relaxed" style={{ color: COLOR_TOKENS.bruma700 }}>
        Primary · default · subtle · danger · link — savia acciona, bruma neutraliza, sombra en
        chrome oscuro.
      </p>
    </FoundationSpecCard>
  )
}

/** Swatches de color por appearance — familia sombra · bruma · savia. */
export function ButtonColorTokensGallery() {
  return (
    <FoundationBrumaStage caption="Tokens de color nuevos — savia 600 en primary, bruma en neutros, funcional en danger.">
      <div className="grid gap-4 lg:grid-cols-2">
        {ROOTSY_BUTTON_COLOR_TOKENS.map((group) => (
          <FoundationSpecCard key={group.appearance} className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-canopy text-sm font-semibold" style={{ color: COLOR_TOKENS.bruma900 }}>
                  {group.appearance}
                </p>
                <p className="font-canopy text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
                  {group.role}
                </p>
              </div>
              <ButtonAppearancePreviewChip appearance={group.appearance} />
            </div>
            <ul className="space-y-2">
              {group.tokens.map((token) => (
                <li key={token.label} className="flex items-center gap-3">
                  {token.hex !== "—" ? (
                    <span
                      className="size-6 shrink-0 rounded-md border"
                      style={{
                        backgroundColor: token.hex,
                        borderColor: COLOR_TOKENS.bruma200,
                      }}
                      aria-hidden
                    />
                  ) : (
                    <span
                      className="size-6 shrink-0 rounded-md border border-dashed"
                      style={{ borderColor: COLOR_TOKENS.bruma200 }}
                      aria-hidden
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-canopy text-xs font-medium" style={{ color: COLOR_TOKENS.bruma900 }}>
                      {token.label}
                    </p>
                    <p className="font-mono text-[10px]" style={{ color: COLOR_TOKENS.bruma500 }}>
                      {token.token}
                      {token.hex !== "—" ? ` · ${token.hex}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </FoundationSpecCard>
        ))}
      </div>
    </FoundationBrumaStage>
  )
}

function ButtonAppearancePreviewChip({ appearance }: { appearance: string }) {
  const styles: Record<string, { bg: string; color: string; border?: string }> = {
    primary: { bg: COLOR_TOKENS.savia600, color: COLOR_TOKENS.white },
    default: {
      bg: COLOR_TOKENS.white,
      color: COLOR_TOKENS.bruma900,
      border: COLOR_TOKENS.bruma200,
    },
    subtle: { bg: "transparent", color: COLOR_TOKENS.bruma700, border: COLOR_TOKENS.bruma200 },
    danger: { bg: "#DC2626", color: COLOR_TOKENS.white },
    link: { bg: "transparent", color: COLOR_TOKENS.savia600 },
  }
  const style = styles[appearance] ?? styles.default

  return (
    <span
      className="inline-flex h-8 shrink-0 items-center rounded-lg px-3 font-canopy text-xs font-semibold"
      style={{
        backgroundColor: style.bg,
        color: style.color,
        border: style.border ? `1px solid ${style.border}` : undefined,
      }}
    >
      {appearance}
    </span>
  )
}

/** Matriz principal — variantes × estados, estilo design system profesional. */
export function ButtonVariantMatrix() {
  return (
    <FoundationBrumaStage caption="Cada fila es un appearance · columnas = estados interactivos. Hover y pressed se ven al interactuar.">
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: COLOR_TOKENS.bruma200 }}>
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr
              className="border-b"
              style={{
                borderColor: COLOR_TOKENS.bruma200,
                backgroundColor: COLOR_TOKENS.bruma50,
              }}
            >
              <th
                className="px-4 py-3 font-canopy text-xs font-semibold uppercase tracking-wide"
                style={{ color: COLOR_TOKENS.bruma500 }}
              >
                Appearance
              </th>
              {BUTTON_VARIANT_MATRIX_COLUMNS.map((col) => (
                <th
                  key={col.id}
                  className="px-4 py-3 font-canopy text-xs font-semibold"
                  style={{ color: COLOR_TOKENS.bruma700 }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROOTSY_BUTTON_APPEARANCES.map((row) => (
              <tr
                key={row.id}
                className="border-b last:border-b-0"
                style={{ borderColor: COLOR_TOKENS.bruma200 }}
              >
                <td className="px-4 py-4 align-top">
                  <p
                    className="font-canopy text-sm font-semibold"
                    style={{ color: COLOR_TOKENS.bruma900 }}
                  >
                    {row.appearance}
                  </p>
                  <p className="mt-0.5 font-canopy text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
                    {row.natureName}
                  </p>
                  <p className="mt-2">
                    <SpecMono>variant={row.rootsyVariant}</SpecMono>
                  </p>
                </td>
                {BUTTON_VARIANT_MATRIX_COLUMNS.map((col) => (
                  <td key={col.id} className="px-4 py-4 align-middle">
                    <MatrixButton
                      appearance={row.appearance}
                      state={col.id}
                      label={APPEARANCE_LABELS[row.appearance] ?? row.appearance}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FoundationBrumaStage>
  )
}

export function ButtonAppearancesSpecTable() {
  return (
    <FoundationSpecCard className="overflow-x-auto p-0 sm:p-0">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr
            className="border-b"
            style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.bruma50 }}
          >
            <th className="px-5 py-3 font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
              Appearance
            </th>
            <th className="px-5 py-3 font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
              Token / variant
            </th>
            <th className="px-5 py-3 font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
              Uso
            </th>
            <th className="px-5 py-3 font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
              Regla
            </th>
          </tr>
        </thead>
        <tbody>
          {ROOTSY_BUTTON_APPEARANCES.map((row) => (
            <tr
              key={row.id}
              className="border-b last:border-b-0"
              style={{ borderColor: COLOR_TOKENS.bruma200 }}
            >
              <td className="px-5 py-3 font-canopy font-medium" style={{ color: COLOR_TOKENS.bruma900 }}>
                {row.appearance}
                <span className="ml-2 font-normal" style={{ color: COLOR_TOKENS.bruma500 }}>
                  · {row.natureName}
                </span>
              </td>
              <td className="px-5 py-3">
                <SpecMono>button.{row.appearance}</SpecMono>
                <br />
                <SpecMono>variant={row.rootsyVariant}</SpecMono>
              </td>
              <td className="px-5 py-3 font-canopy text-sm" style={{ color: COLOR_TOKENS.bruma700 }}>
                {row.usage}
              </td>
              <td className="px-5 py-3 font-canopy text-sm" style={{ color: COLOR_TOKENS.bruma500 }}>
                {row.atlassianRule}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </FoundationSpecCard>
  )
}

const SIZE_ROWS = [
  { id: "compact", label: "Compact", className: rootsButtonCompactSizeClass, size: "sm" as const },
  { id: "default", label: "Default", className: undefined, size: "default" as const },
  { id: "large", label: "Large", className: undefined, size: "lg" as const },
] as const

export function ButtonSizesMatrix() {
  return (
    <FoundationBrumaStage caption="Default en formularios y modales · compact en tablas · large solo en CTAs puntuales.">
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: COLOR_TOKENS.bruma200 }}>
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.bruma50 }}
            >
              <th className="px-4 py-3 text-left font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma500 }}>
                Tamaño
              </th>
              <th className="px-4 py-3 text-left font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
                Primary
              </th>
              <th className="px-4 py-3 text-left font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
                Default
              </th>
              <th className="px-4 py-3 text-left font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
                Subtle
              </th>
            </tr>
          </thead>
          <tbody>
            {SIZE_ROWS.map((row) => (
              <tr
                key={row.id}
                className="border-b last:border-b-0"
                style={{ borderColor: COLOR_TOKENS.bruma200 }}
              >
                <td className="px-4 py-4 align-middle">
                  <p className="font-canopy text-sm font-medium" style={{ color: COLOR_TOKENS.bruma900 }}>
                    {row.label}
                  </p>
                  <SpecMono>
                    {row.id === "compact" ? "h-8" : row.id === "large" ? "h-12" : "h-10"}
                  </SpecMono>
                </td>
                <td className="px-4 py-4 align-middle">
                  <RootsPrimaryButton
                    size={row.size === "default" ? undefined : row.size}
                    className={cn(
                      row.id === "large" && rootsButtonClassForVariant("primary", undefined, "large"),
                      row.className,
                    )}
                  >
                    Guardar
                  </RootsPrimaryButton>
                </td>
                <td className="px-4 py-4 align-middle">
                  <RootsDefaultButton size={row.size === "default" ? undefined : row.size} className={row.className}>
                    Exportar
                  </RootsDefaultButton>
                </td>
                <td className="px-4 py-4 align-middle">
                  <RootsSubtleButton size={row.size === "default" ? undefined : row.size} className={row.className}>
                    Cancelar
                  </RootsSubtleButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FoundationBrumaStage>
  )
}

const ICON_BUTTON_DOC_SIZES: RootsIconButtonSize[] = ["compact", "default", "large"]

const ICON_BUTTON_SIZE_LABELS: Record<RootsIconButtonSize, string> = {
  compact: "32px",
  default: "40px",
  large: "48px",
}

type IconButtonDocTone = Exclude<RootsIconButtonTone, "action">

function IconButtonDocSizeRow({
  tone,
  surface = "light",
  icon,
  label,
  darkPanel = false,
}: {
  tone: IconButtonDocTone
  surface?: RootsIconButtonSurface
  icon: ReactNode
  label: string
  darkPanel?: boolean
}) {
  return (
    <div className="flex flex-wrap items-end gap-5">
      {ICON_BUTTON_DOC_SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <RootsIconButton tone={tone} surface={surface} size={size} label={label}>
            {icon}
          </RootsIconButton>
          <SpecMono>{size} · {ICON_BUTTON_SIZE_LABELS[size]}</SpecMono>
        </div>
      ))}
    </div>
  )
}

function IconButtonDocToneSection({
  title,
  hint,
  darkPanel = false,
  children,
}: {
  title: string
  hint?: string
  darkPanel?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "space-y-3 border-t pt-5 first:border-t-0 first:pt-0",
        darkPanel ? "border-[color-mix(in_srgb,var(--rootsy-sombra-600)_80%,transparent)]" : "",
      )}
      style={darkPanel ? undefined : { borderColor: COLOR_TOKENS.bruma200 }}
    >
      <div>
        <p
          className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]"
          style={{ color: darkPanel ? COLOR_TOKENS.sombra500 : COLOR_TOKENS.bruma500 }}
        >
          {title}
        </p>
        {hint ? (
          <p
            className="mt-1 font-canopy text-xs leading-relaxed"
            style={{ color: darkPanel ? COLOR_TOKENS.sombra300 : COLOR_TOKENS.bruma500 }}
          >
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export function ButtonIconButtonsGallery() {
  return (
    <div className="space-y-4">
      <FoundationSpecCard className="space-y-5">
        <div>
          <p className="font-canopy text-sm font-semibold" style={{ color: COLOR_TOKENS.bruma900 }}>
            IconButton · superficie clara
          </p>
          <p className="mt-1 font-canopy text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
            Workspace, detalle de cuentas y menú sobre bruma.
          </p>
        </div>
        <IconButtonDocToneSection title="tone=light" hint="Outline neutro — toolbar y acciones secundarias.">
          <IconButtonDocSizeRow tone="light" icon={<Plus aria-hidden />} label="Agregar" />
        </IconButtonDocToneSection>
        <IconButtonDocToneSection
          title="tone=secondary · surface=light"
          hint="Chrome con borde — menú Home, header workspace."
        >
          <IconButtonDocSizeRow tone="secondary" surface="light" icon={<Home aria-hidden />} label="Inicio" />
        </IconButtonDocToneSection>
        <IconButtonDocToneSection
          title="tone=ghost · surface=light"
          hint="Sin borde — volver, campana y ajustes."
        >
          <IconButtonDocSizeRow tone="ghost" surface="light" icon={<ArrowLeft aria-hidden />} label="Volver" />
        </IconButtonDocToneSection>
      </FoundationSpecCard>

      <div className="overflow-hidden rounded-2xl border" style={{ borderColor: COLOR_TOKENS.bruma200 }}>
        <div className={cn(rootsIconButtonNightDemoSurfaceClass, "space-y-5 p-5")}>
          <div>
            <p className="font-canopy text-sm font-semibold text-zinc-100">IconButton · superficie oscura</p>
            <p className="mt-1 font-canopy text-xs" style={{ color: COLOR_TOKENS.sombra500 }}>
              Gama sombra — cristal sobre night, hairline frío.
            </p>
          </div>
          <IconButtonDocToneSection darkPanel title="tone=dark" hint="Chrome con borde — header nocturno.">
            <IconButtonDocSizeRow darkPanel tone="dark" icon={<ArrowLeft aria-hidden />} label="Volver" />
          </IconButtonDocToneSection>
          <IconButtonDocToneSection darkPanel title="tone=secondary · surface=dark">
            <IconButtonDocSizeRow darkPanel tone="secondary" surface="dark" icon={<Home aria-hidden />} label="Inicio" />
          </IconButtonDocToneSection>
          <IconButtonDocToneSection darkPanel title="tone=ghost · surface=dark">
            <IconButtonDocSizeRow darkPanel tone="ghost" surface="dark" icon={<Bell aria-hidden />} label="Notificaciones" />
          </IconButtonDocToneSection>
        </div>
      </div>

      <FoundationSpecCard className="space-y-4">
        <div>
          <p className="font-canopy text-sm font-semibold" style={{ color: COLOR_TOKENS.bruma900 }}>
            IconButton · action
          </p>
          <p className="mt-1 font-canopy text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
            Acciones de fila en tablas — compact · neutral / edit / destructive.
          </p>
        </div>
        <div
          className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border px-3 py-2"
          style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.white }}
        >
          <RootsIconButton tone="action" intent="neutral" size="compact" label="Ver detalle">
            <Eye aria-hidden />
          </RootsIconButton>
          <RootsIconButton tone="action" intent="edit" size="compact" label="Editar">
            <Pencil aria-hidden />
          </RootsIconButton>
          <RootsIconButton tone="action" intent="destructive" size="compact" label="Eliminar">
            <Trash2 aria-hidden />
          </RootsIconButton>
        </div>
      </FoundationSpecCard>
    </div>
  )
}

export function ButtonIconsDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FoundationSpecCard className="space-y-3">
        <FoundationExampleLabel>iconBefore · gap-2 · size-4</FoundationExampleLabel>
        <div className="flex flex-wrap gap-2">
          <RootsPrimaryButton>
            <Save className="size-4" aria-hidden />
            Guardar cambios
          </RootsPrimaryButton>
          <RootsDefaultButton>
            <Plus className="size-4" aria-hidden />
            Nuevo artículo
          </RootsDefaultButton>
        </div>
      </FoundationSpecCard>
      <FoundationSpecCard className="space-y-3">
        <FoundationExampleLabel>iconAfter · trailing</FoundationExampleLabel>
        <div className="flex flex-wrap gap-2">
          <RootsPrimaryButton>
            Continuar
            <ArrowRight className="size-4" aria-hidden />
          </RootsPrimaryButton>
          <RootsDangerButton>
            <Trash2 className="size-4" aria-hidden />
            Eliminar definitivamente
          </RootsDangerButton>
        </div>
      </FoundationSpecCard>
    </div>
  )
}

export function ButtonStatesDemo() {
  const [progressBusy, setProgressBusy] = useState(false)
  const [toggleBold, setToggleBold] = useState(false)

  return (
    <div className="space-y-4">
      <FoundationBrumaStage caption="Loading con RootsProgressButton — spinner sin layout shift.">
        <div className="flex flex-wrap gap-2">
          <RootsProgressButton
            type="button"
            variant={rootsButtonVariant.primary}
            className={rootsButtonClassForVariant("primary")}
            loading
            loadingLabel="Guardando…"
          >
            Guardar
          </RootsProgressButton>
          <RootsProgressButton
            type="button"
            variant="outline"
            className={rootsButtonClassForVariant("secondary")}
            loading
            loadingLabel="Creando…"
          >
            Crear
          </RootsProgressButton>
          <RootsProgressButton
            type="button"
            variant={rootsButtonVariant.primary}
            className={cn(rootsButtonClassForVariant("primary"), "min-w-[9.5rem]")}
            loading={progressBusy}
            loadingLabel="Guardando…"
            icon={Save}
            onClick={() => {
              setProgressBusy(true)
              window.setTimeout(() => setProgressBusy(false), 1800)
            }}
          >
            Guardar
          </RootsProgressButton>
        </div>
      </FoundationBrumaStage>

      <FoundationSpecCard className="space-y-3">
        <FoundationExampleLabel>Selected · aria-pressed en toggle</FoundationExampleLabel>
        <ButtonGroup>
          <Button
            type="button"
            size="icon-sm"
            variant={toggleBold ? "default" : "outline"}
            aria-pressed={toggleBold}
            aria-label="Negrita"
            className={toggleBold ? rootsButtonClassForVariant("primary", "size-8") : undefined}
            onClick={() => setToggleBold((v) => !v)}
          >
            <Bold className="size-4" aria-hidden />
          </Button>
          <Button type="button" size="icon-sm" variant="outline" aria-label="Cursiva">
            <Italic className="size-4" aria-hidden />
          </Button>
          <Button type="button" size="icon-sm" variant="outline" aria-label="Subrayado">
            <Underline className="size-4" aria-hidden />
          </Button>
        </ButtonGroup>
      </FoundationSpecCard>

      <FoundationSpecCard className="overflow-x-auto p-0 sm:p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.bruma50 }}>
              <th className="px-5 py-3 font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
                Estado
              </th>
              <th className="px-5 py-3 font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
                Comportamiento
              </th>
            </tr>
          </thead>
          <tbody>
            {ROOTSY_BUTTON_STATES.map((row) => (
              <tr key={row.state} className="border-b last:border-b-0" style={{ borderColor: COLOR_TOKENS.bruma200 }}>
                <td className="px-5 py-3 font-canopy font-medium" style={{ color: COLOR_TOKENS.bruma900 }}>
                  {row.state}
                </td>
                <td className="px-5 py-3 font-canopy text-sm" style={{ color: COLOR_TOKENS.bruma700 }}>
                  {row.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </FoundationSpecCard>
    </div>
  )
}

export function ButtonPatternsDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FoundationSpecCard className="space-y-3">
        <FoundationExampleLabel>Button group</FoundationExampleLabel>
        <p className="font-canopy text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
          Una variación por grupo — no mezclar appearances.
        </p>
        <ButtonGroup>
          <Button type="button" variant="outline" size="sm">
            Izquierda
          </Button>
          <Button type="button" variant="outline" size="sm">
            Centro
          </Button>
          <Button type="button" variant="outline" size="sm">
            Derecha
          </Button>
        </ButtonGroup>
      </FoundationSpecCard>

      <FoundationBrumaStage caption="Subtle a la izquierda · primary a la derecha — patrón de footer de modal.">
        <div
          className="overflow-hidden rounded-xl border"
          style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.white }}
        >
          <div
            className="border-b px-4 py-3"
            style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.bruma50 }}
          >
            <p className="font-canopy text-sm font-semibold" style={{ color: COLOR_TOKENS.bruma900 }}>
              Editar artículo
            </p>
            <p className="font-canopy text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
              Footer de modal · jerarquía clara
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 px-4 py-3 sm:flex-row sm:justify-between">
            <RootsSubtleButton type="button">Cancelar</RootsSubtleButton>
            <RootsPrimaryButton type="button">Guardar cambios</RootsPrimaryButton>
          </div>
        </div>
      </FoundationBrumaStage>
    </div>
  )
}

export function ButtonSizesSpecTable() {
  return (
    <FoundationSpecCard className="overflow-x-auto p-0 sm:p-0">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.bruma50 }}>
            <th className="px-5 py-3 font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
              Token
            </th>
            <th className="px-5 py-3 font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
              Tailwind
            </th>
            <th className="px-5 py-3 font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
              Uso
            </th>
          </tr>
        </thead>
        <tbody>
          {ROOTSY_BUTTON_SIZES.slice(0, 6).map((row) => (
            <tr key={row.id} className="border-b last:border-b-0" style={{ borderColor: COLOR_TOKENS.bruma200 }}>
              <td className="px-5 py-3">
                <SpecMono>{row.token}</SpecMono>
              </td>
              <td className="px-5 py-3">
                <SpecMono>{row.tailwind}</SpecMono>
              </td>
              <td className="px-5 py-3 font-canopy text-sm" style={{ color: COLOR_TOKENS.bruma700 }}>
                {row.usage}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </FoundationSpecCard>
  )
}

export function ButtonSemanticTable() {
  return (
    <FoundationSpecCard className="overflow-x-auto p-0 sm:p-0">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: COLOR_TOKENS.bruma200, backgroundColor: COLOR_TOKENS.bruma50 }}>
            <th className="px-5 py-3 font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
              Appearance
            </th>
            <th className="px-5 py-3 font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
              Contexto
            </th>
            <th className="px-5 py-3 font-canopy text-xs font-semibold" style={{ color: COLOR_TOKENS.bruma700 }}>
              Componente
            </th>
          </tr>
        </thead>
        <tbody>
          {ROOTSY_BUTTON_SEMANTIC.map((row) => (
            <tr
              key={`${row.appearance}-${row.context}`}
              className="border-b last:border-b-0"
              style={{ borderColor: COLOR_TOKENS.bruma200 }}
            >
              <td className="px-5 py-3 font-canopy font-medium" style={{ color: COLOR_TOKENS.savia600 }}>
                {row.appearance}
              </td>
              <td className="px-5 py-3 font-canopy text-sm" style={{ color: COLOR_TOKENS.bruma700 }}>
                {row.context}
              </td>
              <td className="px-5 py-3">
                <SpecMono>{row.component}</SpecMono>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </FoundationSpecCard>
  )
}

export function ButtonGuidelinesGrid() {
  const pairs = BUTTON_GUIDELINES.do.map((doText, index) => ({
    doText,
    dontText: BUTTON_GUIDELINES.dont[index] ?? "",
  }))

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {pairs.slice(0, 4).map((pair, index) => (
        <LibraryDoDontPair key={index} doText={pair.doText} dontText={pair.dontText} />
      ))}
    </div>
  )
}

export function ButtonRelatedLinks() {
  return <LibraryRelatedLinks links={BUTTON_RELATED_LINKS} />
}

/** @deprecated Usar ButtonVariantMatrix */
export const ButtonAppearancesGallery = ButtonVariantMatrix
/** @deprecated Usar ButtonAppearancesSpecTable */
export const ButtonAppearancesTable = ButtonAppearancesSpecTable
/** @deprecated Usar ButtonSizesMatrix */
export const ButtonSizesDemo = ButtonSizesMatrix
/** @deprecated Usar ButtonPatternsDemo */
export const ButtonGroupDemo = ButtonPatternsDemo
/** @deprecated Usar ButtonPatternsDemo */
export const ButtonModalFooterDemo = ButtonPatternsDemo
