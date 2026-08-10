import {
  rootsButtonDestructiveClass,
  rootsButtonPrimaryClass,
} from "@/components/rootsy-button/rootsButtonStyles"
import { ROOTSY_LAYOUTS_OPERAR_ANATOMY } from "@/app/library/layouts/rootsyLayoutsOperarSystem"
import { cn } from "@/lib/utils"
import { importeBaseClass } from "@/lib/typography"

export const saleOpFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export const saleOpImporteBaseClass = importeBaseClass

export const saleOpImporteCartClass = cn(
  saleOpImporteBaseClass,
  "text-sm font-semibold text-slate-900",
)

export const saleOpImporteCartMutedClass = cn(
  saleOpImporteBaseClass,
  "text-[11px] text-slate-400",
)

export const cartListHeaderRowClass =
  "flex items-center justify-between gap-2 px-3 py-2"

/** Fondo del listado de ítems del ticket (más suave que blanco puro, distinto del aside #eef1f5). */
export const saleOpCartListSurfaceClass = "bg-[#f4f6f9]"

/** Separador horizontal sutil (1px) entre líneas del ticket — gris neutro, sin tinte. */
export const saleOpCartLineDividerColorClass = "border-[#dfe4ea]"
export const saleOpCartLineDividerBottomClass = cn(
  "border-b",
  saleOpCartLineDividerColorClass,
)
export const saleOpCartLineDividerTopClass = cn(
  "border-t",
  saleOpCartLineDividerColorClass,
)
export const saleOpCartLineDivideYClass = cn(
  "divide-y divide-[#dfe4ea]",
)

/** @deprecated Usar tokens de DataWorkspaceDetailEmptyState (layout.blocks.empty.detail). */
export {
  dataWorkspaceDetailEmptyStateClass as saleOpEmptyStateContainerClass,
  dataWorkspaceDetailEmptyStateContentClass as saleOpEmptyStateContentClass,
  dataWorkspaceDetailEmptyStateIconWrapClass as saleOpEmptyStateIconWrapClass,
  dataWorkspaceDetailEmptyStateTitleClass as saleOpEmptyStateTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"

/** Barra de acciones del ticket (Descartar / Vender). */
export const saleOpActionsBarShellClass = cn(
  "grid w-full shrink-0 grid-cols-2 divide-x divide-[#dfe4ea] bg-white",
)
export const saleOpActionBtnBaseClass = cn(
  "inline-flex h-[3.25rem] w-full items-center justify-center gap-2 border-0 px-3 text-[14px] font-semibold tracking-tight shadow-none transition-[background-color,color,box-shadow] duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0",
  "disabled:cursor-not-allowed",
)
export const saleOpActionDiscardClass = cn(
  saleOpActionBtnBaseClass,
  "bg-[#f4f6f9] text-rose-700 hover:bg-rose-50 hover:text-rose-800 active:bg-rose-100/80",
  "disabled:bg-[#f4f6f9] disabled:text-slate-500 disabled:hover:bg-[#f4f6f9] disabled:active:bg-[#f4f6f9]",
  "focus-visible:ring-rose-400/35",
)
export const saleOpActionConfirmClass = cn(
  saleOpActionBtnBaseClass,
  "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]",
  "disabled:bg-emerald-600/28 disabled:text-white/65 disabled:shadow-none disabled:hover:bg-emerald-600/28 disabled:active:bg-emerald-600/28",
  "focus-visible:ring-emerald-400/45",
)
export const saleOpActionIconWrapDiscardClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600"
export const saleOpActionIconWrapConfirmClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white"
export const saleOpActionIconWrapConfirmDisabledClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/55"

export const saleOpImporteTotalClass = cn(
  saleOpImporteBaseClass,
  "whitespace-nowrap text-[clamp(1.05rem,1.75vw,1.4375rem)] font-semibold text-white/90",
)

export const saleOpImporteTotalMutedClass = cn(
  saleOpImporteBaseClass,
  "text-[11px] line-through decoration-white/25 text-white/38",
)

export const saleOpImporteTotalDiscountClass = cn(
  saleOpImporteBaseClass,
  "text-[11px] font-medium text-emerald-300/95",
)

export const saleOpToolboxBarClass =
  "box-border border-t border-white/10 bg-[#0b100e]/92 backdrop-blur-xl"

export const saleOpFooterBandHeightClass = ROOTSY_LAYOUTS_OPERAR_ANATOMY.toolboxMinHeightClass

export const saleOpFooterBarPaddingClass = "p-3 sm:p-4"

export function saleOpToolboxSlotClass(configurado: boolean) {
  const a = ROOTSY_LAYOUTS_OPERAR_ANATOMY
  return cn(
    `group flex h-full min-h-[${a.toolboxSlotMinHeightPx}px] w-full items-center gap-2.5 rounded-xl border-0 px-2.5 py-2 text-left transition-[background-color,box-shadow] duration-150 sm:min-h-[${a.toolboxSlotMinHeightSmPx}px] sm:gap-3 sm:px-3`,
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b100e]",
    configurado
      ? "bg-emerald-500/[0.09] shadow-[inset_0_1px_0_rgba(167,243,208,0.08)] hover:bg-emerald-500/12"
      : "bg-white/[0.02] hover:bg-white/[0.05]",
  )
}

export function saleOpToolboxIconWrap(configurado: boolean) {
  return cn(
    "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
    configurado
      ? "bg-emerald-500/20 text-emerald-200"
      : "bg-white/[0.06] text-foreground/45 group-hover:bg-white/10 group-hover:text-foreground/75",
  )
}

export const saleOpDialogLight = "rootsy-app-light text-foreground"
export const saleOpDialogSurface =
  "gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-0 shadow-2xl ring-1 ring-black/[0.04]"
export const saleOpDialogMaxViewport =
  "max-h-[calc(100vh-100px)] flex flex-col overflow-hidden"
export const saleOpDialogContentMd = cn(
  saleOpDialogSurface,
  saleOpDialogMaxViewport,
  "sm:max-w-md",
  saleOpDialogLight,
)
export const saleOpDialogContentLg = cn(
  saleOpDialogSurface,
  saleOpDialogMaxViewport,
  "sm:max-w-2xl",
  saleOpDialogLight,
)
export const saleOpDialogContentXl = cn(
  saleOpDialogSurface,
  saleOpDialogMaxViewport,
  "sm:max-w-4xl",
  saleOpDialogLight,
)
/** Ancho visual papel térmico 80 mm (~302 px a 96 dpi). */
export const saleComprobanteTicketPaperWidthClass = "max-w-[302px]"

/** Selector de comprobante + vista previa ticket (2 columnas iguales). */
export const saleOpDialogContentComprobante = cn(
  saleOpDialogSurface,
  saleOpDialogMaxViewport,
  "sm:max-w-2xl",
  saleOpDialogLight,
)
export const saleOpDialogHeader =
  "space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
export const saleOpDialogBody = "px-6 py-4"
export const saleOpDialogFooter =
  "flex flex-col-reverse gap-2 border-t border-border/50 bg-muted/15 px-6 py-3.5 sm:flex-row sm:justify-between"
export const saleOpDialogPrimaryBtn = rootsButtonPrimaryClass
export const saleOpDialogDestructiveBtn = rootsButtonDestructiveClass
export const saleOpDialogSecondaryBtn = "h-10 rounded-lg"

/** @deprecated Usar variant="ghost-neutral" + saleOpDialogSecondaryBtn */
export const saleOpDialogGhostBtn = saleOpDialogSecondaryBtn
import { rootsAlertDialogSurfaceClass } from "@/components/rootsy-dialog/rootsDialogProductStyles"

/** @deprecated Alias — preferir RootsAlertDialogContent. */
export const saleOpAlertDialogContent = rootsAlertDialogSurfaceClass

export function saleOpDialogOptionClass(seleccionado: boolean, disabled = false) {
  return cn(
    "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
    disabled &&
      (seleccionado ? "cursor-default" : "pointer-events-none opacity-45"),
    seleccionado
      ? "border-primary/40 bg-primary/10 ring-1 ring-primary/15"
      : "border-border/70 bg-muted/20 hover:bg-muted/35",
  )
}

export const saleOpChannelPanelScroll =
  "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-3.5"

export const saleOpChannelPanelSection =
  "rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm"

export const saleOpChannelPanelHeaderTitle =
  "text-base font-semibold tracking-tight text-foreground"

export const saleOpChannelPanelHeaderMeta = "text-xs text-muted-foreground"

export const saleOpChannelDataLabel =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"

export const saleOpChannelDataValue = "text-sm text-foreground"

export const saleOpChannelStatusBadge = cn(
  "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
  "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_12%,var(--rootsy-bruma-100))]",
  "text-[var(--rootsy-savia-800)]",
  "ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-500)_28%,transparent)]",
)

export const saleOpChannelFormField =
  "rounded-xl border border-border/70 bg-muted/15 shadow-none ring-0 outline-none transition-colors hover:border-border focus-visible:border-primary/45 focus-visible:ring-2 focus-visible:ring-primary/20 placeholder:text-muted-foreground/70"

/** Campos en modales `rootsy-app-light` (select con prefijo, date picker field, inputs). */
export const saleOpLightFormSurface =
  "border-zinc-200 bg-white text-zinc-900 shadow-xs dark:border-zinc-200 dark:bg-white dark:text-zinc-900"

/** Bloque informativo en modales light — borde único, sin sombras ni rings apilados. */
export const saleOpLightInsetPanel =
  "rounded-xl border border-zinc-200/80 bg-zinc-50/55 text-zinc-900 dark:border-zinc-200/80 dark:bg-zinc-50/55 dark:text-zinc-900"

/** Zona de subida en modales light — punteado suave, mismo lenguaje que los campos. */
export const saleOpLightUploadZone = cn(
  "rounded-xl border border-dashed border-zinc-200/90 bg-zinc-50/35 transition-colors",
  "hover:border-zinc-300 hover:bg-zinc-50/65",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/15",
)

export const saleOpLightFormPrefix = "border-zinc-200 bg-zinc-50"

export const saleOpLightFormInput = cn(
  saleOpLightFormSurface,
  "h-11 w-full rounded-xl px-3 text-base shadow-none ring-0 outline-none transition-colors",
  "placeholder:text-zinc-400 dark:placeholder:text-zinc-400",
  "focus-visible:border-emerald-600/50 focus-visible:ring-2 focus-visible:ring-emerald-600/20",
)

export const saleOpLightSelectContent = cn(
  "z-[120] max-h-60",
  saleOpLightFormSurface,
)

export const saleOpLightSelectItem =
  "focus:bg-zinc-100 focus:text-zinc-900 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900 dark:focus:bg-zinc-100 dark:focus:text-zinc-900 dark:data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:text-zinc-900"

export const saleOpChannelSegmentGroup =
  "grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/15 p-1"

export function saleOpChannelSegmentOption(selected: boolean) {
  return cn(
    "inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    selected
      ? "bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
  )
}

export function saleOpChannelSelectableRow(selected: boolean) {
  return cn(
    "flex cursor-pointer items-center gap-3 rounded-[12px] border px-3 py-2.5 transition-[border-color,background-color,box-shadow] duration-150",
    "focus-within:border-[var(--rootsy-savia-400)] focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
    selected
      ? cn(
          "border-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
          "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_10%,var(--rootsy-white))]",
          "ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_18%,transparent)]",
        )
      : cn(
          "border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)]",
          "hover:border-[var(--rootsy-bruma-300)] hover:bg-[var(--rootsy-bruma-50)]",
        ),
  )
}
