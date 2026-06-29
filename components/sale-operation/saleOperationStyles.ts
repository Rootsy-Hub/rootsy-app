import { cn } from "@/lib/utils"

export const saleOpFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

export const saleOpImporteBaseClass = "font-mono tabular-nums tracking-tight"

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
export const saleOpDialogHeader =
  "space-y-1.5 border-b border-border/50 bg-muted/25 px-6 pb-4 pt-5 text-left"
export const saleOpDialogBody = "px-6 py-4"
export const saleOpDialogFooter =
  "border-t border-border/50 bg-muted/15 px-6 py-3.5 sm:justify-between"
export const saleOpDialogPrimaryBtn =
  "h-10 bg-emerald-600 font-semibold text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700"
export const saleOpDialogGhostBtn = "h-10 text-muted-foreground hover:text-foreground"
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
