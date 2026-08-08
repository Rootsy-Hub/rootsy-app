"use client"

import {
  menuNatureShellClass,
} from "@/app/[siteId]/[popId]/menu/menuNatureStyles"
import "@/app/[siteId]/[popId]/menu/menuNaturePalette.css"
import {
  getLayoutsModuleBackdropLayerStyles,
  getLayoutsModuleContentRowFrameStyle,
  getLayoutsModuleDemoPopBackgroundUrl,
  getLayoutsModuleHeaderInnerStyle,
  getLayoutsModuleWireframeContentStyle,
  LAYOUTS_MODULE_BACKDROP_FALLBACK_SPEC_ROWS,
  LAYOUTS_MODULE_BACKDROP_SPEC_ROWS,
  LAYOUTS_MODULE_HEADER_SPEC_ROWS,
  type LayoutsModuleBackdropMode,
} from "@/app/[siteId]/[popId]/library/layouts/layoutsModuleHardcodedSpec"
import {
  layoutsModuleHeaderGlassClass,
  layoutsModuleHeaderPopNameClass,
  layoutsModuleHeaderUserNameClass,
} from "@/components/layouts-module/rootsLayoutsModuleProductStyles"
import { PopWorkspaceBackdrop } from "@/components/layouts/PopWorkspaceBackdrop"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { RootsIconButton } from "@/components/rootsy-button/RootsIconButton"
import { DataWorkspaceHeaderTitle } from "@/components/layouts/DataWorkspaceHeaderTitle"
import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import {
  dataWorkspaceHeaderDividerClass,
  dataWorkspaceHeaderPopRingClass,
  dataWorkspaceHeaderRoleLabelClass,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  ROOTSY_LAYOUTS_MODULE_CONTENT_TYPES,
  ROOTSY_LAYOUTS_MODULE_HEADER,
  ROOTSY_LAYOUTS_MODULE_MANIFESTO,
} from "@/app/[siteId]/[popId]/library/layouts/rootsyLayoutsModuleSystem"
import { COLOR_TOKENS } from "@/app/[siteId]/[popId]/library/color/rootsyColorSystem"
import { librarySectionHref } from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  FolderTree,
  ImageIcon,
  LayoutTemplate,
  Maximize2,
  Plus,
} from "lucide-react"
import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"

const MODULE_HEADER_DEMO = {
  title: "Clientes",
  popName: "Rootsy Market",
  popLogo:
    "https://api.dicebear.com/7.x/shapes/svg?seed=demo-pop&backgroundColor=e8f5ef",
  userName: "María González",
  userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria-gonzalez",
  roleLabel: "Administradora",
  pillLabel: "Listados",
} as const

const MODULE_POP_HEADER_VARIANT = "tables" satisfies DataWorkspaceHeaderVariant

function ModulePopWorkspaceHeaderDemo() {
  const headerVariant = MODULE_POP_HEADER_VARIANT

  return (
    <header className={cn("relative z-20 shrink-0", layoutsModuleHeaderGlassClass)}>
      <div
        className={cn("relative z-10 grid h-17 items-center gap-4 px-4", "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]")}
        style={getLayoutsModuleHeaderInnerStyle()}
      >
        <div className="flex min-w-0 items-center gap-2">
          <RootsIconButton theme="pos" emphasis="ghost" label="Volver al menú" tabIndex={-1}>
            <ArrowLeft aria-hidden />
          </RootsIconButton>
          <RootsIconButton theme="pos" emphasis="ghost" label="Pantalla completa" tabIndex={-1}>
            <Maximize2 aria-hidden />
          </RootsIconButton>
          <div
            className={cn("h-6 w-px", dataWorkspaceHeaderDividerClass(headerVariant))}
            aria-hidden
          />
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={cn(
                "size-8 overflow-hidden rounded-lg ring-1",
                dataWorkspaceHeaderPopRingClass(headerVariant),
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={MODULE_HEADER_DEMO.popLogo}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <span className={layoutsModuleHeaderPopNameClass}>
              {MODULE_HEADER_DEMO.popName}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <DataWorkspaceHeaderTitle
            title={MODULE_HEADER_DEMO.title}
            headerVariant={headerVariant}
          />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <div className="pointer-events-none flex items-center gap-1.5" aria-hidden>
            <DataWorkspaceHeaderIconButton
              label="Nuevo"
              headerVariant={headerVariant}
              primary
              tabIndex={-1}
            >
              <Plus aria-hidden />
            </DataWorkspaceHeaderIconButton>
            <DataWorkspaceHeaderIconButton
              label="Categorías"
              headerVariant={headerVariant}
              tabIndex={-1}
            >
              <FolderTree aria-hidden />
            </DataWorkspaceHeaderIconButton>
          </div>
          <div
            className={cn("h-6 w-px", dataWorkspaceHeaderDividerClass(headerVariant))}
            aria-hidden
          />
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 flex-col leading-tight sm:flex">
              <span className={layoutsModuleHeaderUserNameClass}>
                {MODULE_HEADER_DEMO.userName}
              </span>
              <span
                className={cn(
                  "truncate text-[10px] font-semibold uppercase tracking-wider",
                  dataWorkspaceHeaderRoleLabelClass(headerVariant, true),
                )}
              >
                {MODULE_HEADER_DEMO.roleLabel}
              </span>
            </div>
            <DataWorkspaceHeaderUserMenu
              userName={MODULE_HEADER_DEMO.userName}
              userAvatarSrc={MODULE_HEADER_DEMO.userAvatar}
              isOnline
              headerVariant={headerVariant}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

function SpecTable({ rows }: { rows: readonly { token: string; value: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/70">
      <table className="w-full min-w-[420px] text-left text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.token} className="border-b border-border/40 last:border-0">
              <td className="px-3 py-2 font-mono text-[11px] text-primary">{row.token}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function WireframeBadge({
  label,
  className,
  dark = false,
}: {
  label: string
  className?: string
  dark?: boolean
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-20 rounded-md px-1.5 py-0.5 font-mono text-[10px] ring-1",
        dark
          ? "bg-black/45 text-white/90 ring-white/15"
          : "bg-white/90 text-[var(--rootsy-bruma-500)] ring-[var(--rootsy-bruma-200)]",
        className,
      )}
    >
      {label}
    </span>
  )
}

function DemoFrame({
  children,
  className,
  style,
  height = "14rem",
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  height?: string
}) {
  return (
    <div
      className={cn(
        "relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border/70 shadow-sm",
        className,
      )}
      style={{ height, ...style }}
    >
      {children}
    </div>
  )
}

export function LayoutsModuleDocSubsection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      {children}
    </div>
  )
}

/** Scope Nature del menú — sin esto `--background` y el scrim no coinciden con menu/page. */
function MenuBackdropScope({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        menuNatureShellClass,
        "absolute inset-0 overflow-hidden bg-background",
        className,
      )}
    >
      {children}
    </div>
  )
}

function BackdropLayers({ mode }: { mode: LayoutsModuleBackdropMode }) {
  const photoUrl = getLayoutsModuleDemoPopBackgroundUrl()

  if (mode === "fallback") {
    const layers = getLayoutsModuleBackdropLayerStyles(mode)
    return (
      <div style={layers.shell}>
        {layers.brumaMist ? <div style={layers.brumaMist} /> : null}
        <div style={layers.ambient} />
        <div style={layers.vignette} />
      </div>
    )
  }

  if (mode === "photo-only") {
    return (
      <MenuBackdropScope>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-[0.40]"
        />
      </MenuBackdropScope>
    )
  }

  return (
    <MenuBackdropScope>
      <PopWorkspaceBackdrop backgroundImageUrl={photoUrl} />
    </MenuBackdropScope>
  )
}

function ModuleHeaderBackdropFrame({
  header,
  height = "12rem",
}: {
  header: ReactNode
  height?: string
}) {
  const photoUrl = getLayoutsModuleDemoPopBackgroundUrl()

  return (
    <DemoFrame height={height}>
      <MenuBackdropScope>
        <PopWorkspaceBackdrop backgroundImageUrl={photoUrl} />
        <div className="relative z-10 flex h-full min-h-0 flex-col">
          {header}
          <div className="flex min-h-0 flex-1 items-end p-3">
            <span className="font-mono text-[10px] text-white/70">
              fondo visible bajo el cristal
            </span>
          </div>
        </div>
      </MenuBackdropScope>
    </DemoFrame>
  )
}

function ModuleHeaderWireframe({
  annotate = "full",
}: {
  /** full = altura + borde · height = solo altura · none = limpio */
  annotate?: "full" | "height" | "none"
}) {
  const heightPx = ROOTSY_LAYOUTS_MODULE_HEADER.heightPx

  return (
    <header className={cn("relative z-20 shrink-0", layoutsModuleHeaderGlassClass)}>
      <div
        className={cn("relative z-10", ROOTSY_LAYOUTS_MODULE_HEADER.innerGridClass)}
        style={getLayoutsModuleHeaderInnerStyle()}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="size-8 shrink-0 rounded-lg bg-foreground/10 ring-1 ring-foreground/15" />
          <div className="h-3 w-16 rounded bg-foreground/10" />
        </div>
        <div className="h-3 w-24 rounded bg-foreground/15" />
        <div className="flex shrink-0 items-center justify-end gap-2">
          <div className="size-8 rounded-lg bg-foreground/10" />
        </div>
      </div>

      {annotate !== "none" ? (
        <WireframeBadge
          label={`layout.module.header · ${heightPx}px · h-17`}
          className="right-2 top-1.5"
          dark
        />
      ) : null}
      {annotate === "full" ? (
        <WireframeBadge
          label="border-b · sombra-border/80"
          className="bottom-1.5 left-2"
          dark
        />
      ) : null}
    </header>
  )
}

/** Shell módulo con slot de contenido — fondo POP + header glass + row bruma. */
export function LayoutsModuleShellWithContent({
  children,
  height = "24rem",
  headerAnnotate = "none",
  contentLabel,
}: {
  children: ReactNode
  height?: string
  headerAnnotate?: "full" | "height" | "none"
  contentLabel?: string
}) {
  const photoUrl = getLayoutsModuleDemoPopBackgroundUrl()

  return (
    <DemoFrame height={height}>
      <MenuBackdropScope>
        <PopWorkspaceBackdrop backgroundImageUrl={photoUrl} />
        <div className="relative z-10 flex h-full min-h-0 flex-col">
          <ModuleHeaderWireframe annotate={headerAnnotate} />
          <div
            style={getLayoutsModuleWireframeContentStyle()}
            className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            {contentLabel ? (
              <WireframeBadge label={contentLabel} className="right-2 top-1.5" />
            ) : null}
            {children}
          </div>
        </div>
      </MenuBackdropScope>
    </DemoFrame>
  )
}

/** Vista previa — shell completo del módulo. */
export function LayoutsModuleShellPreviewDemo() {
  const photoUrl = getLayoutsModuleDemoPopBackgroundUrl()

  return (
    <DemoFrame height="22rem">
      <MenuBackdropScope>
        <PopWorkspaceBackdrop backgroundImageUrl={photoUrl} />
        <div className="relative z-10 flex h-full min-h-0 flex-col">
          <ModuleHeaderWireframe annotate="height" />
          <div style={getLayoutsModuleWireframeContentStyle()} className="relative min-h-0 flex-1">
            <WireframeBadge label="layout.module.content · bruma-50" className="right-2 top-2" />
            <div className="flex h-full items-center justify-center">
              <span className="font-mono text-[11px] text-[var(--rootsy-bruma-500)]">contenido</span>
            </div>
          </div>
        </div>
      </MenuBackdropScope>
    </DemoFrame>
  )
}

/** 1.1.a — solo imagen POP (wireframe menú). */
export function LayoutsModuleBackdropPhotoOnlyDemo() {
  return (
    <DemoFrame height="12rem">
      <BackdropLayers mode="photo-only" />
      <WireframeBadge label="pop.backgroundImage · cover · 40%" className="bottom-3 left-3" dark />
    </DemoFrame>
  )
}

/** 1.1.b — imagen + capas superiores (scrim · ambient · vignette). */
export function LayoutsModuleBackdropPhotoLayersDemo() {
  return (
    <DemoFrame height="12rem">
      <BackdropLayers mode="photo-layers" />
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5">
        {["scrim background/32", "ambient canopy/5%", "vignette night/50%"].map((label) => (
          <span
            key={label}
            className="rounded-md bg-black/45 px-1.5 py-0.5 font-mono text-[10px] text-white/90 ring-1 ring-white/15"
          >
            {label}
          </span>
        ))}
      </div>
    </DemoFrame>
  )
}

export function LayoutsModuleBackdropPhotoSpecs() {
  return <SpecTable rows={LAYOUTS_MODULE_BACKDROP_SPEC_ROWS} />
}

/** 1.2.a — fallback sin imagen (sombra · bruma · savia). */
export function LayoutsModuleBackdropFallbackDemo() {
  return (
    <DemoFrame height="12rem">
      <BackdropLayers mode="fallback" />
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5">
        {["sombra gradient", "bruma mist", "savia ambient", "vignette"].map((label) => (
          <span
            key={label}
            className="rounded-md bg-black/45 px-1.5 py-0.5 font-mono text-[10px] text-white/90 ring-1 ring-white/15"
          >
            {label}
          </span>
        ))}
      </div>
    </DemoFrame>
  )
}

export function LayoutsModuleBackdropFallbackSpecs() {
  return <SpecTable rows={LAYOUTS_MODULE_BACKDROP_FALLBACK_SPEC_ROWS} />
}

/** 2.1 — header glass sobre fondo POP (se ve la capa 1). */
export function LayoutsModuleHeaderGlassDemo() {
  return (
    <ModuleHeaderBackdropFrame header={<ModuleHeaderWireframe annotate="full" />} />
  )
}

/** 2.2 — componente reutilizable (ModuleWorkspaceHeader). */
export function LayoutsModuleHeaderComponentDemo() {
  return <ModuleHeaderBackdropFrame header={<ModulePopWorkspaceHeaderDemo />} />
}

export function LayoutsModuleHeaderSpecs() {
  return <SpecTable rows={LAYOUTS_MODULE_HEADER_SPEC_ROWS} />
}

/** 3.1 — body wireframe bruma. */
export function LayoutsModuleBodyWireframeDemo() {
  return (
    <DemoFrame height="11rem">
      <div style={getLayoutsModuleWireframeContentStyle()} className="relative h-full">
        <WireframeBadge label="layout.module.content · bruma-50" className="right-2 top-2" />
        <div className="flex h-full items-center justify-center gap-6 px-6">
          <div className="h-full flex-1 rounded-lg border border-dashed border-[var(--rootsy-bruma-300)] bg-white/60" />
          <div className="h-full flex-1 rounded-lg border border-dashed border-[var(--rootsy-bruma-300)] bg-white/40" />
        </div>
      </div>
    </DemoFrame>
  )
}

/** Marco del row de contenido — envuelve demos de tablas/bloques/operaciones. */
export function LayoutsModuleContentRowFrame({
  children,
  className,
  label = "layout.module.content",
}: {
  children: ReactNode
  className?: string
  label?: string
}) {
  return (
    <div
      className={cn(
        "relative mx-auto flex max-w-4xl flex-col overflow-hidden rounded-xl border border-[var(--rootsy-bruma-200)]",
        className,
      )}
      style={{ ...getLayoutsModuleContentRowFrameStyle(), minHeight: "16rem" }}
    >
      <WireframeBadge label={label} className="right-2 top-1.5" />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}

/** 3.2 · Tipos de contenido. */
export function LayoutsModuleContentTypesGrid({
  siteId,
  popId,
}: {
  siteId: string
  popId: string
}) {
  const types = Object.entries(ROOTSY_LAYOUTS_MODULE_CONTENT_TYPES) as [
    keyof typeof ROOTSY_LAYOUTS_MODULE_CONTENT_TYPES,
    (typeof ROOTSY_LAYOUTS_MODULE_CONTENT_TYPES)[keyof typeof ROOTSY_LAYOUTS_MODULE_CONTENT_TYPES],
  ][]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {types.map(([id, meta]) => (
        <Link
          key={id}
          href={librarySectionHref(siteId, popId, meta.librarySectionId)}
          className="group flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">{meta.label}</span>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
          </div>
          <p className="text-xs text-muted-foreground">{meta.summary}</p>
        </Link>
      ))}
    </div>
  )
}

export function LayoutsModuleOverviewStrip() {
  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1">
        <ImageIcon className="size-3" aria-hidden />
        fondo
      </span>
      <span aria-hidden>→</span>
      <span className="rounded-md bg-muted px-2 py-1">header glass</span>
      <span aria-hidden>→</span>
      <span className="rounded-md bg-muted px-2 py-1">content bruma</span>
      <span aria-hidden>→</span>
      <span className="rounded-md bg-primary/10 px-2 py-1 text-primary">tipo</span>
    </div>
  )
}

export function LayoutsHubIntro() {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: COLOR_TOKENS.white,
        borderColor: COLOR_TOKENS.bruma200,
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: COLOR_TOKENS.savia100, color: COLOR_TOKENS.savia600 }}
        >
          <LayoutTemplate className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 space-y-3 text-sm">
          <p style={{ color: COLOR_TOKENS.bruma900 }}>{ROOTSY_LAYOUTS_MODULE_MANIFESTO}</p>
          <ul className="space-y-1 font-mono text-[11px]" style={{ color: COLOR_TOKENS.bruma500 }}>
            <li>— páginas custom (landing · home · menú) → layout propio · fuera de scope</li>
            <li>— módulos POP → fondo + header + contenido</li>
            <li>— contenido → tablas · bloques · operaciones</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
