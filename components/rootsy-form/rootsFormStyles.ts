import { cn } from "@/lib/utils"

export const rootsFormFieldStackClass =
  "flex w-full min-w-0 flex-col gap-2"

/** Columna dentro de un formulario de modal (stack vertical con ritmo entre campos). */
export const rootsFormColumnClass = "flex w-full min-w-0 flex-col gap-3.5"

/** Grilla principal de upsert — dos columnas + separador central en desktop. */
export const rootsFormGridClass =
  "grid w-full min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-5"

/** Línea vertical entre columnas (solo visible en layout de dos columnas). */
export const rootsFormGridDividerClass =
  "hidden min-h-full w-px shrink-0 bg-zinc-200 lg:block dark:bg-zinc-200"

/** Fila de dos campos dentro de una columna (p. ej. SKU + código de barras). */
export const rootsFormTwoColRowClass =
  "grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"

/** Mensaje debajo del control — ayuda neutral. */
export const rootsFormFieldHintClass =
  "block text-xs leading-snug text-zinc-500 dark:text-zinc-500"

/** Error de validación. */
export const rootsFormFieldErrorClass =
  "block text-xs leading-snug text-destructive"

/** Aviso no bloqueante. */
export const rootsFormFieldWarningClass =
  "block text-xs leading-snug text-amber-700 dark:text-amber-700"

/** Confirmación puntual. */
export const rootsFormFieldSuccessClass =
  "block text-xs leading-snug text-emerald-700 dark:text-emerald-700"

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

/** Date picker sin prefijo — misma shell que rootsFormTextFieldClass. */
export const rootsFormDateTriggerClass = cn(
  rootsFormControlBaseClass,
  "!w-full !bg-white hover:!bg-white dark:!bg-white dark:hover:!bg-white",
  "flex h-11 items-center px-3 text-left",
  "data-[state=closed]:focus:!border-zinc-200 data-[state=closed]:focus:!ring-0",
  "[&_[data-slot=date-value]]:min-w-0 [&_[data-slot=date-value]]:flex-1 [&_[data-slot=date-value]]:truncate",
  "[&_[data-slot=date-value][data-placeholder]]:text-zinc-400",
)

/** Date picker con prefijo — slot w-11 como montos y selects. */
export const rootsFormPrefixedDateTriggerClass = cn(
  rootsFormAffixFieldShellClass,
  rootsFormControlTypographyClass,
  "!bg-white hover:!bg-white dark:!bg-white dark:hover:!bg-white",
  "gap-0 p-0",
  "flex h-11 items-stretch text-left",
  "data-[state=closed]:focus:!border-zinc-200 data-[state=closed]:focus:!ring-0 data-[state=closed]:focus-within:!border-zinc-200 data-[state=closed]:focus-within:!ring-0",
  "[&_[data-slot=date-value]]:flex [&_[data-slot=date-value]]:min-w-0 [&_[data-slot=date-value]]:flex-1 [&_[data-slot=date-value]]:items-center [&_[data-slot=date-value]]:px-3 [&_[data-slot=date-value]]:truncate",
  "[&_[data-slot=date-value][data-placeholder]]:text-zinc-400",
)

export const rootsFormDatePopoverContentClass =
  "z-[120] w-auto !max-w-none rounded-lg border border-zinc-200 bg-white p-0 text-zinc-900 shadow-md dark:border-zinc-200 dark:bg-white dark:text-zinc-900"

/** Calendario compacto en popover portal (fuera de rootsy-app-light → colores explícitos). */
export const rootsFormDateCalendarShellClass = cn(
  "w-fit bg-transparent px-2.5 py-2 [--cell-size:2rem]",
  "[&_button[data-day]]:!text-zinc-800",
  "[&_button[data-day]:not([data-selected-single=true]):hover]:!bg-zinc-100 [&_button[data-day]:not([data-selected-single=true]):hover]:!text-zinc-900",
  "[&_button[data-day][data-selected-single=true]]:!bg-emerald-600 [&_button[data-day][data-selected-single=true]]:!text-white",
  "[&_button[data-day][data-selected-single=true]:hover]:!bg-emerald-700",
  "[&_button[data-day][data-selected-single=true]:hover]:!text-white",
  "[&_.rdp-outside_button[data-day]]:!text-zinc-400",
  "[&_.rdp-outside_button[data-day]:not([data-selected-single=true]):hover]:!bg-transparent [&_.rdp-outside_button[data-day]:not([data-selected-single=true]):hover]:!text-zinc-400",
)

export const rootsFormDateCalendarClassNames = {
  root: "w-fit",
  months: "relative flex flex-col",
  month: "flex w-fit flex-col gap-1.5",
  month_caption: "flex h-7 w-full items-center justify-center px-8",
  caption_label: "select-none text-xs font-medium text-zinc-900",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous:
    "inline-flex size-7 items-center justify-center rounded-md bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
  button_next:
    "inline-flex size-7 items-center justify-center rounded-md bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
  weekdays: "flex",
  weekday:
    "flex size-(--cell-size) items-center justify-center text-[0.6875rem] font-normal text-zinc-500",
  week: "mt-0.5 flex w-full",
  day: "aspect-square size-(--cell-size) p-0 text-center",
  outside: "opacity-60 aria-selected:opacity-60",
  disabled: "text-zinc-300 opacity-50",
}

/** Caja clickable del switch — misma shell que inputs; sin ring en toda la caja. */
export const rootsFormSwitchBoxClass = cn(
  "flex w-full min-w-0 cursor-pointer select-none items-center rounded-lg border border-zinc-200 bg-white px-3 py-2.5 shadow-xs transition-[background-color,border-color,box-shadow] hover:border-zinc-300 active:bg-zinc-50/70",
  "dark:border-zinc-200 dark:bg-white",
)

export const rootsFormSwitchLabelClass = cn(
  rootsFormControlTypographyClass,
  "block font-semibold",
)

export const rootsFormSwitchDescriptionClass =
  "mt-0.5 block text-xs leading-snug text-zinc-500 dark:text-zinc-500"

/** Track del toggle — proporción 44×24, thumb 20px, deslizamiento preciso. */
export const rootsFormSwitchTrackClass = cn(
  "inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 outline-none transition-colors duration-200 ease-out",
  "data-[state=unchecked]:bg-zinc-200 data-[state=checked]:bg-emerald-600",
  "focus-visible:ring-2 focus-visible:ring-emerald-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "dark:data-[state=unchecked]:bg-zinc-200 dark:data-[state=checked]:bg-emerald-600",
)

/** Track del segment group — pill sobre fondo zinc, alineado al light form. */
export const rootsFormSegmentGroupClass =
  "grid w-full gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 shadow-xs dark:border-zinc-200 dark:bg-zinc-50"

export function rootsFormSegmentOptionClass(selected: boolean, disabled?: boolean) {
  return cn(
    rootsFormControlTypographyClass,
    "inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-3 font-medium transition-[color,background-color,box-shadow] duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/45 focus-visible:ring-offset-0",
    disabled && "pointer-events-none opacity-50",
    selected
      ? "bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-200"
      : "text-zinc-500 hover:text-zinc-900",
  )
}

/** Descuento — radio 0.55rem en shell, track y pill (valor validado a mano). */
export const rootsFormDiscountFieldShellClass = cn(
  "flex h-11 w-full min-w-0 items-center gap-2 rounded-[0.55rem] border border-zinc-200 bg-white p-1 shadow-xs transition-[color,box-shadow,border-color] hover:border-zinc-300 focus-within:!border-emerald-700 focus-within:!ring-2 focus-within:!ring-emerald-700/45 focus-within:ring-offset-0 dark:border-zinc-200 dark:bg-white",
)

export const rootsFormDiscountSegmentTrackClass =
  "grid shrink-0 grid-cols-2 gap-1 rounded-[0.55rem] bg-zinc-100 p-1 dark:bg-zinc-100"

export const rootsFormDiscountSegmentCellClass =
  "relative flex items-center justify-center"

export const rootsFormDiscountSegmentPillClass =
  "pointer-events-none absolute inset-0 rounded-[0.55rem] bg-white shadow-xs"

export function rootsFormDiscountSegmentButtonClass(
  selected: boolean,
  optionDisabled?: boolean,
) {
  return cn(
    rootsFormControlTypographyClass,
    "relative z-10 inline-flex h-7 min-w-[2.25rem] items-center justify-center bg-transparent px-2 text-xs font-semibold leading-none tabular-nums transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/45 focus-visible:ring-offset-0",
    optionDisabled && "pointer-events-none opacity-45",
    selected ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800",
  )
}

export const rootsFormDiscountInputClass = cn(
  rootsFormControlTypographyClass,
  "min-w-0 flex-1 bg-transparent px-0.5 text-right font-numeric tabular-nums outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed dark:placeholder:text-zinc-400",
)

/** Unidad activa (% o $) — anclaje visual del valor. */
export const rootsFormDiscountSuffixClass =
  "w-5 shrink-0 pr-0.5 text-right text-sm font-semibold leading-none tabular-nums text-zinc-400 dark:text-zinc-400"

