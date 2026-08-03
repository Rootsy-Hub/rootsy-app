import { cn } from "@/lib/utils"

export const rootsFormFieldStackClass =
  "flex w-full min-w-0 flex-col gap-2"

/** Tipografía compartida — misma escala que Input shadcn (text-base, md:text-sm). */
export const rootsFormControlTypographyClass =
  "font-sans text-base leading-normal font-normal text-zinc-900 md:text-sm"

const rootsFormControlBaseClass =
  cn(
    "w-full min-w-0 rounded-lg border border-zinc-200 bg-white shadow-xs outline-none transition-[color,box-shadow,border-color] placeholder:text-zinc-400 hover:border-zinc-300 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25 dark:border-zinc-200 dark:bg-white dark:text-zinc-900 dark:placeholder:text-zinc-400 focus-visible:!border-emerald-700 focus-visible:!ring-2 focus-visible:!ring-emerald-700/45 focus-visible:ring-offset-0",
    rootsFormControlTypographyClass,
  )

/** Texto una línea — light form con radio más contenido y foco verde Roots. */
export const rootsFormTextFieldClass = `${rootsFormControlBaseClass} h-11 px-3`

/** Multilínea — misma familia visual que rootsFormTextFieldClass. */
export const rootsFormTextareaFieldClass = `${rootsFormControlBaseClass} min-h-[5.25rem] resize-y px-3 py-2.5 leading-relaxed`

/** Shell para montos, cantidades y números con prefijo a la izquierda. */
export const rootsFormAffixFieldShellClass =
  "flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xs transition-[color,box-shadow,border-color] hover:border-zinc-300 focus-within:!border-emerald-700 focus-within:!ring-2 focus-within:!ring-emerald-700/45 focus-within:ring-offset-0 dark:border-zinc-200 dark:bg-white"

/** Ancho fijo del slot de prefijo ($, uds., ícono). Mismo tamaño en todos los campos affix. */
export const rootsFormAffixPrefixWidthClass = "w-11"

export const rootsFormAffixPrefixClass =
  `${rootsFormAffixPrefixWidthClass} inline-flex shrink-0 items-center justify-center self-stretch overflow-hidden border-r border-zinc-200 bg-zinc-50 text-sm font-semibold leading-none tabular-nums text-zinc-600 dark:border-zinc-200 dark:bg-zinc-50 dark:text-zinc-600 [&_svg]:size-4`

export const rootsFormAffixInputClass =
  cn(
    rootsFormControlTypographyClass,
    "min-w-0 flex-1 bg-transparent px-3 font-numeric tabular-nums outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed dark:placeholder:text-zinc-400",
  )

/** Select sin prefijo — trigger Radix propio, sin estilos shadcn text-sm. */
export const rootsFormSelectTriggerClass = cn(
  rootsFormControlBaseClass,
  "!w-full !bg-white hover:!bg-white data-[state=open]:!bg-white dark:!bg-white dark:hover:!bg-white",
  "flex h-11 items-center justify-between gap-2 px-3",
  "data-[state=closed]:focus:!border-zinc-200 data-[state=closed]:focus:!ring-0",
  "[&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left",
  "[&_[data-slot=select-value][data-placeholder]]:text-zinc-400",
)

/** Select con prefijo — misma tipografía; fondo estable sin flash en hover. */
export const rootsFormPrefixedSelectTriggerClass = cn(
  rootsFormAffixFieldShellClass,
  rootsFormControlTypographyClass,
  "!bg-white hover:!bg-white data-[state=open]:!bg-white dark:!bg-white dark:hover:!bg-white",
  "gap-0 p-0",
  "flex h-11 items-stretch",
  "data-[state=closed]:focus:!border-zinc-200 data-[state=closed]:focus:!ring-0 data-[state=closed]:focus-within:!border-zinc-200 data-[state=closed]:focus-within:!ring-0",
  "[&_[data-slot=select-value]]:flex [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:items-center [&_[data-slot=select-value]]:px-3",
  "[&_[data-slot=select-value][data-placeholder]]:text-zinc-400",
)

export const rootsFormSelectContentClass =
  "z-[120] max-h-60 w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) max-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-md dark:border-zinc-200 dark:bg-white"

/** Ítem del listado — sin radio propio; el panel rounded-lg recorta el hover. */
export const rootsFormSelectItemClass = cn(
  rootsFormControlTypographyClass,
  "relative flex w-full cursor-default select-none items-center py-2.5 pl-3 pr-10 outline-none",
  "data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
)

