"use client"

import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { FoundationSpecCard } from "@/app/library/libraryFoundationDocShared"
import type { OverlaySurfaceSpecRow } from "@/app/library/ui-components/modalsUiOverlaySpec"
import { MODAL_UI_PREVIEW_SHADOW_BLEED_PX } from "@/app/library/ui-components/modalsUiOverlaySpec"
import { cn } from "@/lib/utils"
import type { CSSProperties, ReactNode } from "react"

export function OverlaySurfaceSpecTable({
  title,
  description,
  rows,
  pairNote,
}: {
  title: string
  description?: string
  rows: OverlaySurfaceSpecRow[]
  pairNote?: string
}) {
  return (
    <FoundationSpecCard className="space-y-4">
      <div className="space-y-1">
        <h3 className="font-canopy text-sm font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="font-canopy text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border/70">
              {["Rol", "Token", "Valor", "Producto"].map((heading) => (
                <th
                  key={heading}
                  className="px-2 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground first:pl-0"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.role}-${row.token}`} className="border-b border-border/40 align-top">
                <td className="py-2.5 pr-3 font-canopy text-xs font-medium text-foreground">{row.role}</td>
                <td className="py-2.5 pr-3 font-mono text-[11px] text-muted-foreground">{row.token}</td>
                <td className="max-w-[14rem] py-2.5 pr-3 font-mono text-[10px] leading-relaxed break-all text-foreground">
                  {row.value}
                </td>
                <td className="py-2.5 font-canopy text-[11px] leading-relaxed text-muted-foreground">
                  {row.product ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pairNote ? (
        <p className="font-canopy text-xs leading-relaxed text-muted-foreground">{pairNote}</p>
      ) : null}
    </FoundationSpecCard>
  )
}

/** Simula viewport con scrim — el panel va centrado adentro. */
export function DialogPreviewViewport({
  scrimBackground,
  scrimBackdropFilter,
  minHeightPx,
  children,
  className,
}: {
  scrimBackground: string
  scrimBackdropFilter?: string
  minHeightPx: number
  children: ReactNode
  className?: string
}) {
  const scrimStyle: CSSProperties = {
    position: "relative",
    minHeight: minHeightPx,
    width: "100%",
    overflow: "visible",
    borderRadius: 0,
    backgroundColor: scrimBackground,
    backdropFilter: scrimBackdropFilter,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 32,
    paddingRight: 16,
    paddingLeft: 16,
    paddingBottom: MODAL_UI_PREVIEW_SHADOW_BLEED_PX,
    boxSizing: "border-box",
  }

  return (
    <div className={cn("w-full overflow-visible", className)}>
      <p
        className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em]"
        style={{ color: COLOR_TOKENS.bruma500 }}
      >
        Simulación viewport · scrim fixed inset-0
      </p>
      <div aria-hidden style={scrimStyle}>
        {children}
      </div>
    </div>
  )
}

export function DialogVariantSpecCell({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex min-w-[17rem] flex-1 flex-col gap-2 overflow-visible", className)}>
      {children}
      <span
        className="font-mono text-[10px] uppercase tracking-[0.08em]"
        style={{ color: COLOR_TOKENS.bruma500 }}
      >
        {label}
      </span>
    </div>
  )
}

export function DialogGallerySectionHeading({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="space-y-1">
      <h2 className="font-canopy text-base font-semibold" style={{ color: COLOR_TOKENS.bruma900 }}>
        {title}
      </h2>
      {description ? (
        <p className="font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function DialogGallerySpecBlock({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3
          className="font-mono text-[11px] font-medium uppercase tracking-[0.12em]"
          style={{ color: COLOR_TOKENS.bruma500 }}
        >
          {title}
        </h3>
        {hint ? (
          <p className="mt-1 font-canopy text-xs leading-relaxed" style={{ color: COLOR_TOKENS.bruma500 }}>
            {hint}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function DialogVariantRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start gap-5 overflow-visible">{children}</div>
}
