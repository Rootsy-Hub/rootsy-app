import {
  nightForestBorderClass,
  nightForestFocusRingClass,
  nightForestPanelHoverClass,
  nightForestSurfaceClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  rootsFormEarthActiveBgClass,
  rootsFormEarthBgSubtleClass,
  rootsFormEarthBorderClass,
  rootsFormEarthBorderHoverClass,
  rootsFormEarthDisabledClass,
  rootsFormEarthDividerClass,
  rootsFormEarthHighlightHoverClass,
  rootsFormEarthLabelMutedClass,
  rootsFormEarthPlaceholderClass,
  rootsFormEarthPrefixBgClass,
  rootsFormEarthPrefixBgMutedClass,
  rootsFormEarthPrefixBorderClass,
  rootsFormEarthPrefixBorderHoverClass,
  rootsFormEarthPrefixIconSvgClass,
  rootsFormEarthPrefixTextClass,
  rootsFormEarthPrefixTextMutedClass,
  rootsFormEarthSelectionClass,
  rootsFormEarthTextClass,
  rootsFormEarthTextSecondaryClass,
  rootsFormEarthTextTertiaryClass,
  rootsFormTextInputSurfaceClass,
} from "@/components/rootsy-form/rootsFormEarthTokens"
import { cn } from "@/lib/utils"

/** Tipografía de label — CheckoutSectionLabel, headers de tabla y total footer. */
export const rootsFormFieldLabelTypographyClass =
  "text-[10px] font-semibold uppercase tracking-[0.12em]"

export const rootsFormFieldLabelClass = cn(
  rootsFormFieldLabelTypographyClass,
  rootsFormEarthLabelMutedClass,
)

export const rootsFormFieldStackClass =
  "flex w-full min-w-0 flex-col gap-2"

/** Columna dentro de un formulario de modal (stack vertical con ritmo entre campos). */
export const rootsFormColumnClass = "flex w-full min-w-0 flex-col gap-4"

/** Grilla principal de upsert — dos columnas + separador central en desktop. */
export const rootsFormGridClass =
  "grid w-full min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-5"

/** Línea vertical entre columnas (solo visible en layout de dos columnas). */
export const rootsFormGridDividerClass = cn(
  "hidden min-h-full w-px shrink-0 lg:block",
  rootsFormEarthDividerClass,
)

/** Fila de dos campos dentro de una columna (p. ej. SKU + código de barras). */
export const rootsFormTwoColRowClass =
  "grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"

/** Mensaje debajo del control — ayuda neutral. */
export const rootsFormFieldHintClass = cn(
  "block text-xs leading-snug",
  rootsFormEarthTextSecondaryClass,
)

/** Error de validación. */
export const rootsFormFieldErrorClass =
  "block text-xs leading-snug text-destructive"

/** Aviso no bloqueante. */
export const rootsFormFieldWarningClass =
  "block text-xs leading-snug text-amber-700 dark:text-amber-700"

/** Confirmación puntual. */
export const rootsFormFieldSuccessClass =
  "block text-xs leading-snug text-[#16704a] dark:text-[#16704a]"

/** Tipografía compartida — misma escala que Input shadcn (text-base, md:text-sm). */
export const rootsFormControlTypographyClass = cn(
  "font-sans text-base leading-normal font-normal md:text-sm",
  rootsFormEarthTextClass,
)

/** Selección de texto en controles editables — tierra neutra, no canopy. */
export const rootsFormControlSelectionClass = rootsFormEarthSelectionClass

const rootsFormControlBaseClass = cn(
  "w-full min-w-0 rounded-lg border shadow-xs outline-none transition-[color,box-shadow,border-color]",
  rootsFormEarthBorderClass,
  rootsFormEarthBorderHoverClass,
  rootsFormEarthPlaceholderClass,
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25",
  "focus-visible:!border-[#16704a] focus-visible:!ring-2 focus-visible:!ring-[#16704a]/45 focus-visible:ring-offset-0",
  rootsFormControlTypographyClass,
  rootsFormControlSelectionClass,
)

/** Base compartida con superficie blanca — select, date y affix shells. */
const rootsFormControlSurfaceClass = cn(
  rootsFormControlBaseClass,
  "bg-white",
)

/** Texto una línea — fondo blanco fijo (no transparente sobre tierra del modal). */
export const rootsFormTextFieldClass = cn(
  rootsFormControlBaseClass,
  rootsFormTextInputSurfaceClass,
  "h-11 px-3",
)

/** Multilínea — misma familia visual que rootsFormTextFieldClass. */
export const rootsFormTextareaFieldClass = cn(
  rootsFormControlBaseClass,
  rootsFormTextInputSurfaceClass,
  "min-h-[5.25rem] resize-y px-3 py-2.5 leading-relaxed",
)

/** Shell para montos, cantidades y números con prefijo a la izquierda. */
export const rootsFormAffixFieldShellClass = cn(
  "group flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-lg border bg-white shadow-xs transition-[color,box-shadow,border-color]",
  rootsFormEarthBorderClass,
  rootsFormEarthBorderHoverClass,
  "focus-within:!border-[#16704a] focus-within:!ring-2 focus-within:!ring-[#16704a]/45 focus-within:ring-offset-0",
)

/** Ancho fijo del slot de prefijo ($, uds., ícono). Mismo tamaño en todos los campos affix. */
export const rootsFormAffixPrefixWidthClass = "w-11"

export const rootsFormAffixPrefixClass = cn(
  rootsFormAffixPrefixWidthClass,
  "inline-flex shrink-0 items-center justify-center self-stretch overflow-hidden border-r text-sm font-semibold leading-none tabular-nums transition-[border-color]",
  rootsFormEarthPrefixBorderClass,
  rootsFormEarthPrefixBorderHoverClass,
  rootsFormEarthPrefixBgClass,
  rootsFormEarthPrefixTextClass,
  "[&_svg]:size-4 [&_svg]:shrink-0",
  rootsFormEarthPrefixIconSvgClass,
)

export const rootsFormAffixInputClass = cn(
  rootsFormControlTypographyClass,
  rootsFormControlSelectionClass,
  "min-w-0 flex-1 bg-transparent px-3 font-numeric tabular-nums outline-none disabled:cursor-not-allowed",
  rootsFormEarthPlaceholderClass,
)

/** Select sin prefijo — trigger Radix propio, sin estilos shadcn text-sm. */
export const rootsFormSelectTriggerClass = cn(
  rootsFormControlSurfaceClass,
  "!w-full !bg-white hover:!bg-white data-[state=open]:!bg-white",
  "flex h-11 items-center justify-between gap-2 px-3",
  "data-[state=closed]:focus:!border-[#e7e5e4] data-[state=closed]:focus:!ring-0",
  "[&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left",
  "[&_[data-slot=select-value][data-placeholder]]:text-[#a8a29e]",
)

/** Select con prefijo — misma tipografía; fondo estable sin flash en hover. */
export const rootsFormPrefixedSelectTriggerClass = cn(
  rootsFormAffixFieldShellClass,
  rootsFormControlTypographyClass,
  "!bg-white hover:!bg-white data-[state=open]:!bg-white",
  "gap-0 p-0",
  "flex h-11 items-stretch",
  "data-[state=closed]:focus:!border-[#e7e5e4] data-[state=closed]:focus:!ring-0",
  "data-[state=closed]:focus-within:!border-[#e7e5e4] data-[state=closed]:focus-within:!ring-0",
  "[&_[data-slot=select-value]]:flex [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:items-center [&_[data-slot=select-value]]:px-3",
  "[&_[data-slot=select-value][data-placeholder]]:text-[#a8a29e]",
)

export const rootsFormSelectContentClass = cn(
  "z-[120] max-h-60 w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) max-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border bg-white shadow-md",
  rootsFormEarthBorderClass,
)

/** Ítem del listado — sin radio propio; el panel rounded-lg recorta el hover. */
export const rootsFormSelectItemClass = cn(
  rootsFormControlTypographyClass,
  "relative flex w-full cursor-default select-none items-center py-2.5 pl-3 pr-10 outline-none",
  "data-[highlighted]:text-[#292524] data-[highlighted]:bg-[#f5f5f0]",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
)

export type RootsFormSelectTone = "light" | "dark"

/** Select compacto — bosque nocturno (footer paginación, toolbar oscuro). */
export const rootsFormSelectDarkTriggerClass = cn(
  "flex h-11 min-h-11 w-auto min-w-[4.25rem] items-center justify-between gap-2 rounded-lg border px-3 shadow-none outline-none transition-[color,box-shadow,border-color]",
  "font-sans text-sm font-medium leading-normal text-[#d6d3d1]",
  nightForestBorderClass,
  "bg-[#141c19]",
  nightForestPanelHoverClass,
  "hover:text-[#fffbeb]",
  "data-[state=open]:border-[#33443d]",
  "data-[state=closed]:focus:!border-[#263530] data-[state=closed]:focus:!ring-0",
  "focus-visible:border-[#33443d] focus-visible:outline-none",
  nightForestFocusRingClass,
  "focus-visible:ring-offset-0",
  "disabled:pointer-events-none disabled:opacity-40",
  "[&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left",
  "[&_[data-slot=select-value][data-placeholder]]:text-[#78716c]",
)

export const rootsFormSelectDarkContentClass = cn(
  "z-[120] max-h-60 overflow-hidden rounded-lg border p-0",
  nightForestBorderClass,
  "bg-[#0c1210]",
  nightForestSurfaceClass,
  "shadow-[0_18px_40px_-18px_rgba(0,0,0,0.78)]",
  "w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) max-w-(--radix-select-trigger-width)",
)

export const rootsFormSelectDarkItemClass = cn(
  "relative flex w-full cursor-default select-none items-center py-2.5 pl-3 pr-10 text-sm text-[#d6d3d1] outline-none",
  "data-[highlighted]:bg-emerald-500/12 data-[highlighted]:text-emerald-100",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
)

export function rootsFormSelectTriggerClassForTone(
  tone: RootsFormSelectTone = "light",
  prefixed = false,
) {
  if (prefixed) {
    return rootsFormPrefixedSelectTriggerClass
  }
  return tone === "dark" ? rootsFormSelectDarkTriggerClass : rootsFormSelectTriggerClass
}

export function rootsFormSelectContentClassForTone(tone: RootsFormSelectTone = "light") {
  return tone === "dark" ? rootsFormSelectDarkContentClass : rootsFormSelectContentClass
}

export function rootsFormSelectItemClassForTone(tone: RootsFormSelectTone = "light") {
  return tone === "dark" ? rootsFormSelectDarkItemClass : rootsFormSelectItemClass
}

/** Date picker sin prefijo — misma shell que rootsFormTextFieldClass. */
export const rootsFormDateTriggerClass = cn(
  rootsFormControlSurfaceClass,
  "!w-full !bg-white hover:!bg-white",
  "flex h-11 items-center px-3 text-left",
  "data-[state=closed]:focus:!border-[#e7e5e4] data-[state=closed]:focus:!ring-0",
  "[&_[data-slot=date-value]]:min-w-0 [&_[data-slot=date-value]]:flex-1 [&_[data-slot=date-value]]:truncate",
  "[&_[data-slot=date-value][data-placeholder]]:text-[#a8a29e]",
)

/** Date picker con prefijo — slot w-11 como montos y selects. */
export const rootsFormPrefixedDateTriggerClass = cn(
  rootsFormAffixFieldShellClass,
  rootsFormControlTypographyClass,
  "!bg-white hover:!bg-white",
  "gap-0 p-0",
  "flex h-11 items-stretch text-left",
  "data-[state=closed]:focus:!border-[#e7e5e4] data-[state=closed]:focus:!ring-0",
  "data-[state=closed]:focus-within:!border-[#e7e5e4] data-[state=closed]:focus-within:!ring-0",
  "[&_[data-slot=date-value]]:flex [&_[data-slot=date-value]]:min-w-0 [&_[data-slot=date-value]]:flex-1 [&_[data-slot=date-value]]:items-center [&_[data-slot=date-value]]:px-3 [&_[data-slot=date-value]]:truncate",
  "[&_[data-slot=date-value][data-placeholder]]:text-[#a8a29e]",
)

export const rootsFormDatePopoverContentClass = cn(
  "z-[120] w-auto !max-w-none rounded-lg border bg-white p-0 shadow-md",
  rootsFormEarthBorderClass,
  rootsFormEarthTextClass,
)

/** Calendario compacto en popover portal (fuera de rootsy-app-light → colores explícitos tierra). */
export const rootsFormDateCalendarShellClass = cn(
  "w-fit bg-transparent px-2.5 py-2 [--cell-size:2rem]",
  "[&_button[data-day]]:!text-[#44403c]",
  "[&_button[data-day]:not([data-selected-single=true]):hover]:!bg-[#f5f5f0] [&_button[data-day]:not([data-selected-single=true]):hover]:!text-[#292524]",
  "[&_button[data-day][data-selected-single=true]]:!bg-[#1e8f5a] [&_button[data-day][data-selected-single=true]]:!text-white",
  "[&_button[data-day][data-selected-single=true]:hover]:!bg-[#16704a]",
  "[&_button[data-day][data-selected-single=true]:hover]:!text-white",
  "[&_.rdp-outside_button[data-day]]:!text-[#a8a29e]",
  "[&_.rdp-outside_button[data-day]:not([data-selected-single=true]):hover]:!bg-transparent [&_.rdp-outside_button[data-day]:not([data-selected-single=true]):hover]:!text-[#a8a29e]",
)

export const rootsFormDateCalendarClassNames = {
  root: "w-fit",
  months: "relative flex flex-col",
  month: "flex w-fit flex-col gap-1.5",
  month_caption: "flex h-7 w-full items-center justify-center px-8",
  caption_label: cn("select-none text-xs font-medium", rootsFormEarthTextClass),
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous: cn(
    "inline-flex size-7 items-center justify-center rounded-md bg-transparent",
    rootsFormEarthTextTertiaryClass,
    rootsFormEarthHighlightHoverClass,
    "hover:text-[#292524]",
  ),
  button_next: cn(
    "inline-flex size-7 items-center justify-center rounded-md bg-transparent",
    rootsFormEarthTextTertiaryClass,
    rootsFormEarthHighlightHoverClass,
    "hover:text-[#292524]",
  ),
  weekdays: "flex",
  weekday: cn(
    "flex size-(--cell-size) items-center justify-center text-[0.6875rem] font-normal",
    rootsFormEarthTextSecondaryClass,
  ),
  week: "mt-0.5 flex w-full",
  day: "aspect-square size-(--cell-size) p-0 text-center",
  outside: "opacity-60 aria-selected:opacity-60",
  disabled: cn(rootsFormEarthDisabledClass, "opacity-50"),
}

/** Caja clickable del switch — misma shell que inputs; sin ring en toda la caja. */
export const rootsFormSwitchBoxClass = cn(
  "flex w-full min-w-0 cursor-pointer select-none items-center rounded-lg border bg-white px-3 py-2.5 shadow-xs transition-[background-color,border-color,box-shadow]",
  rootsFormEarthBorderClass,
  rootsFormEarthBorderHoverClass,
  rootsFormEarthActiveBgClass,
)

export const rootsFormSwitchLabelClass = cn(
  rootsFormControlTypographyClass,
  "block font-semibold",
)

export const rootsFormSwitchDescriptionClass = cn(
  "mt-0.5 block text-xs leading-snug",
  rootsFormEarthTextSecondaryClass,
)

/** Track del toggle — proporción 44×24, thumb 20px, deslizamiento preciso. */
export const rootsFormSwitchTrackClass = cn(
  "inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 outline-none transition-colors duration-200 ease-out",
  "data-[state=unchecked]:bg-[#e7e5e4] data-[state=checked]:bg-[#1e8f5a]",
  "focus-visible:ring-2 focus-visible:ring-[#16704a]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
  "disabled:cursor-not-allowed disabled:opacity-50",
)

/** Checkbox — borde tierra, marca canopy al marcar (formularios y filtros). */
export const rootsFormCheckboxClass = cn(
  "size-4 shrink-0 rounded-[4px] border shadow-none [&_[data-slot=checkbox-indicator]_svg]:size-3.5",
  rootsFormEarthBorderClass,
  "bg-white",
  "data-[state=checked]:border-[color:var(--nature-canopy-600)] data-[state=checked]:bg-[color:var(--nature-canopy-600)] data-[state=checked]:text-white",
  "focus-visible:ring-2 focus-visible:ring-[#16704a]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
  "disabled:cursor-not-allowed disabled:opacity-50",
)

/** Track del segment group — pill inset con gap, h-11 como inputs. */
export const rootsFormSegmentGroupClass = cn(
  "relative grid h-11 w-full gap-1 rounded-lg border p-1 shadow-xs",
  rootsFormEarthBorderClass,
  rootsFormEarthBgSubtleClass,
)

export const rootsFormSegmentIndicatorClass =
  "pointer-events-none absolute rounded-md bg-white transition-transform duration-200 ease-out"

export function rootsFormSegmentOptionClass(selected: boolean, disabled?: boolean) {
  return cn(
    rootsFormControlTypographyClass,
    "relative z-[1] inline-flex h-full min-w-0 items-center justify-center gap-2 rounded-md px-3 font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16704a]/45 focus-visible:ring-offset-0",
    disabled && "pointer-events-none opacity-50",
    selected
      ? rootsFormEarthTextClass
      : "text-[#a8a29e] hover:text-[#78716c]",
  )
}

/** Prefijo dual %/$ — seleccionado = slot affix tierra; no seleccionado = un tono más claro. */
export const rootsFormDiscountModePrefixClass = cn(
  "flex w-[4.75rem] shrink-0 self-stretch overflow-hidden border-r bg-white transition-[border-color]",
  rootsFormEarthPrefixBorderClass,
  rootsFormEarthPrefixBorderHoverClass,
  "[&>button:first-child]:border-r [&>button:first-child]:border-[#e7e5e4] [&>button:first-child]:transition-[border-color] group-hover:[&>button:first-child]:border-[#d6d3d1]",
)

export function rootsFormDiscountModeButtonClass(
  selected: boolean,
  optionDisabled?: boolean,
) {
  return cn(
    "relative inline-flex flex-1 items-center justify-center self-stretch text-sm font-semibold leading-none tabular-nums transition-[color,background-color,border-color] duration-150",
    "focus-visible:outline-none focus-visible:ring-0",
    optionDisabled && "opacity-45",
    selected
      ? cn("font-semibold", rootsFormEarthPrefixBgClass, rootsFormEarthPrefixTextClass)
      : cn(
          rootsFormEarthPrefixBgMutedClass,
          rootsFormEarthPrefixTextMutedClass,
          "hover:text-[#78716c]",
        ),
  )
}

/** Botón borrar dentro de shells affix (descuento, búsqueda en form). */
export const rootsFormAffixClearButtonClass = cn(
  "absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md transition-[color,background-color] duration-150",
  rootsFormEarthTextSecondaryClass,
  rootsFormEarthHighlightHoverClass,
  "hover:text-[#292524] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16704a]/45",
)

/** Imagen en formularios — fila compacta con miniatura (≈ altura de input h-11). */
export const rootsFormImageUploadShellClass = cn(
  "flex w-full min-w-0 items-center gap-3 rounded-lg border bg-white px-2 py-2 shadow-xs transition-[border-color,box-shadow,background-color] duration-150",
  rootsFormEarthBorderClass,
)

export const rootsFormImageUploadShellInteractiveClass = cn(
  rootsFormImageUploadShellClass,
  rootsFormEarthBorderHoverClass,
  "cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16704a]/45 focus-visible:ring-offset-0",
)

export const rootsFormImageUploadShellEmptyClass = cn(
  rootsFormImageUploadShellInteractiveClass,
  "border-dashed hover:bg-[#fafaf7]",
)

export const rootsFormImageUploadShellDragClass =
  "!border-[#16704a] bg-[#16704a]/[0.04] ring-2 ring-[#16704a]/20"

export const rootsFormImageUploadThumbClass = cn(
  "relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border",
  rootsFormEarthPrefixBorderClass,
  rootsFormEarthPrefixBgClass,
)

export const rootsFormImageUploadThumbEmptyClass = cn(
  rootsFormImageUploadThumbClass,
  "border-dashed",
)

export const rootsFormImageUploadTitleClass = cn(
  "truncate text-sm font-medium leading-tight",
  rootsFormEarthTextClass,
)

export const rootsFormImageUploadMetaClass = cn(
  "mt-0.5 truncate text-xs leading-snug",
  rootsFormEarthTextSecondaryClass,
)

export const rootsFormImageUploadActionClass = cn(
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-[color,background-color] duration-150",
  rootsFormEarthTextSecondaryClass,
  rootsFormEarthHighlightHoverClass,
  "hover:text-[#292524] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16704a]/45",
)

export const rootsFormImageUploadActionDestructiveClass = cn(
  rootsFormImageUploadActionClass,
  "hover:text-destructive",
)
