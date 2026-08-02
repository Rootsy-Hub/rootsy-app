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

export const saleOpFooterBandHeightClass =
  "min-h-[calc(4.5rem+1rem)] sm:min-h-[calc(4.75rem+1.25rem)]"

export const saleOpFooterBarPaddingClass = "p-2 sm:p-2.5"

export function saleOpToolboxSlotClass(configurado: boolean) {
  return cn(
    "group flex h-full min-h-[4.5rem] w-full items-center gap-2.5 rounded-xl border-0 px-2.5 py-2 text-left transition-[background-color,box-shadow] duration-150 sm:min-h-[4.75rem] sm:gap-3 sm:px-3",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b100e]",
    configurado
      ? "bg-emerald-500/[0.09] shadow-[inset_0_1px_0_rgba(167,243,208,0.08)] hover:bg-emerald-500/12"
      : "bg-white/[0.02] hover:bg-white/[0.05]",
  )
}

export function saleOpToolboxIconWrap(configurado: boolean) {
  return cn(
    "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 sm:size-10",
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
export const saleOpDialogHeader =
  "space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
export const saleOpDialogBody = "px-6 py-4"
export const saleOpDialogFooter =
  "flex flex-col-reverse gap-2 border-t border-border/50 bg-muted/15 px-6 py-3.5 sm:flex-row sm:justify-between"
export const saleOpDialogPrimaryBtn =
  "h-10 bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700"
export const saleOpDialogDestructiveBtn =
  "h-10 bg-rose-600 font-semibold text-white shadow-sm hover:bg-rose-500 active:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
export const saleOpDialogSecondaryBtn = "h-10 rounded-lg"

/** @deprecated Usar variant="ghost-neutral" + saleOpDialogSecondaryBtn */
export const saleOpDialogGhostBtn = saleOpDialogSecondaryBtn
export const saleOpAlertDialogContent = cn(
  saleOpDialogLight,
  "rounded-2xl border border-border/60 bg-card shadow-2xl sm:max-w-md",
)

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

export const saleOpChannelStatusBadge =
  "rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground"

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

export const saleOpChannelHint =
  "flex items-center gap-2 rounded-xl border border-border/50 bg-muted/10 px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground"

export const saleOpChannelErrorBanner =
  "rounded-xl border border-destructive/25 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"

export const saleOpChannelWarningBanner =
  "rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-amber-900"

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
    "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
    selected
      ? "border-primary/40 bg-primary/10 ring-1 ring-primary/15"
      : "border-border/70 bg-muted/15 hover:bg-muted/30",
  )
}
