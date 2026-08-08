import {
  rootsyDateCalendarClassNames,
  rootsyDateCalendarCompactShellClass,
  rootsyDatePopoverContentClass,
} from "@/components/ui/rootsyDateCalendarStyles"
import {
  nightForestBorderClass,
  nightForestFocusRingClass,
  nightForestPanelHoverClass,
  nightForestSurfaceClass,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  rootsFormUiAffixClearButtonClass,
  rootsFormUiAffixInputClass,
  rootsFormUiAffixPrefixSunkenClass,
  rootsFormUiAffixShellClass,
  rootsFormUiCheckboxClass,
  rootsFormUiControlTypographyClass,
  rootsFormControlSelectionClass as rootsFormUiSelectionClass,
  rootsFormUiDateTriggerClass,
  rootsFormUiDiscountModeButtonClass,
  rootsFormUiDiscountModePrefixClass,
  rootsFormUiFieldErrorClass,
  rootsFormUiFieldHintClass,
  rootsFormUiFieldStackClass,
  rootsFormUiFieldSuccessClass,
  rootsFormUiFieldWarningClass,
  rootsFormUiImageUploadShellClass,
  rootsFormUiImageUploadShellEmptyClass,
  rootsFormUiImageUploadThumbClass,
  rootsFormUiInlineIconPrefixedSelectTriggerClass,
  rootsFormUiInlineIconPrefixClass,
  rootsFormUiInlineIconShellClass,
  rootsFormUiLabelClass,
  rootsFormUiPrefixedDateTriggerClass,
  rootsFormUiPrefixedSelectTriggerClass,
  rootsFormUiSegmentGroupClass,
  rootsFormUiSegmentIndicatorClass,
  rootsFormUiSegmentOptionClass,
  rootsFormUiSelectTriggerClass,
  rootsFormUiSwitchBoxClass,
  rootsFormUiSwitchTrackClass,
  rootsFormUiTextFieldClass,
  rootsFormUiTextareaFieldClass,
} from "@/components/rootsy-form/rootsFormUiStyles"
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

export const rootsFormControlSelectionClass = rootsFormUiSelectionClass
export const rootsFormFieldLabelTypographyClass = "font-canopy text-sm font-medium leading-5"

export const rootsFormFieldLabelClass = rootsFormUiLabelClass

export const rootsFormFieldStackClass = rootsFormUiFieldStackClass

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
export const rootsFormFieldHintClass = rootsFormUiFieldHintClass

/** Error de validación. */
export const rootsFormFieldErrorClass = rootsFormUiFieldErrorClass

/** Aviso no bloqueante. */
export const rootsFormFieldWarningClass = rootsFormUiFieldWarningClass

/** Confirmación puntual. */
export const rootsFormFieldSuccessClass = rootsFormUiFieldSuccessClass

export const rootsFormControlTypographyClass = rootsFormUiControlTypographyClass

/** Texto una línea — space.500 · radius.large · borde bruma. */
export const rootsFormTextFieldClass = rootsFormUiTextFieldClass

/** Multilínea — misma familia visual que texto. */
export const rootsFormTextareaFieldClass = rootsFormUiTextareaFieldClass

/** Shell compuesta — slot leading sunken. */
export const rootsFormAffixFieldShellClass = rootsFormUiAffixShellClass

export const rootsFormAffixPrefixWidthClass = "w-10"

export const rootsFormAffixPrefixClass = rootsFormUiAffixPrefixSunkenClass

export const rootsFormAffixInputClass = rootsFormUiAffixInputClass

/** Inline-icon — ícono sin casilla sunken (toolbar listados). */
export const rootsFormInlineIconShellClass = rootsFormUiInlineIconShellClass

export const rootsFormInlineIconPrefixClass = rootsFormUiInlineIconPrefixClass

export const rootsFormInlineIconPrefixedSelectTriggerClass =
  rootsFormUiInlineIconPrefixedSelectTriggerClass

/** Select sin prefijo. */
export const rootsFormSelectTriggerClass = rootsFormUiSelectTriggerClass

/** Select con prefijo sunken. */
export const rootsFormPrefixedSelectTriggerClass = rootsFormUiPrefixedSelectTriggerClass

/** Portales Radix (select, date) — sobre modal z-510 · bajo toast z-600. */
export const rootsFormPortalZClass = "z-[520]"

export const rootsFormSelectContentClass = cn(
  rootsFormPortalZClass,
  "w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) max-w-(--radix-select-trigger-width) rounded-[12px] border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-white)] shadow-md",
)

/** Ítem del listado — hover bruma-50 · sin radio propio. */
export const rootsFormSelectItemClass = cn(
  rootsFormControlTypographyClass,
  "relative flex w-full cursor-default select-none items-center py-2.5 pl-3 pr-10 outline-none",
  "data-[highlighted]:bg-[var(--rootsy-bruma-50)] data-[highlighted]:text-[var(--rootsy-bruma-900)]",
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
  rootsFormPortalZClass,
  "overflow-x-hidden overflow-y-auto rounded-lg border p-0",
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
  prefixVariant: "sunken" | "inline" = "sunken",
) {
  if (prefixed) {
    if (tone === "light" && prefixVariant === "inline") {
      return rootsFormInlineIconPrefixedSelectTriggerClass
    }
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

/** Date picker sin prefijo. */
export const rootsFormDateTriggerClass = rootsFormUiDateTriggerClass

/** Date picker con prefijo sunken. */
export const rootsFormPrefixedDateTriggerClass = rootsFormUiPrefixedDateTriggerClass

export const rootsFormDatePopoverContentClass = cn(
  rootsFormPortalZClass,
  "w-auto !max-w-none rounded-[12px]",
  rootsyDatePopoverContentClass,
)

/** Calendario compacto en popover portal — paleta bruma/savia explícita. */
export const rootsFormDateCalendarShellClass = rootsyDateCalendarCompactShellClass

export const rootsFormDateCalendarClassNames = rootsyDateCalendarClassNames

export const rootsFormSwitchBoxClass = rootsFormUiSwitchBoxClass

export const rootsFormSwitchLabelClass = cn(
  rootsFormControlTypographyClass,
  "block font-normal text-[var(--rootsy-bruma-900)]",
)

export const rootsFormSwitchDescriptionClass = cn(
  "mt-0.5 block text-xs leading-snug text-[var(--rootsy-bruma-500)]",
)

export const rootsFormSwitchTrackClass = rootsFormUiSwitchTrackClass

export const rootsFormCheckboxClass = rootsFormUiCheckboxClass

/** Track del segment group — pill inset con gap, h-10 como inputs. */
export const rootsFormSegmentGroupClass = rootsFormUiSegmentGroupClass

export const rootsFormSegmentIndicatorClass = rootsFormUiSegmentIndicatorClass

export function rootsFormSegmentOptionClass(selected: boolean, disabled?: boolean) {
  return rootsFormUiSegmentOptionClass(selected, disabled)
}

/** Prefijo dual %/$ — seleccionado = slot affix bruma; no seleccionado = blanco muted. */
export const rootsFormDiscountModePrefixClass = rootsFormUiDiscountModePrefixClass

export function rootsFormDiscountModeButtonClass(
  selected: boolean,
  optionDisabled?: boolean,
) {
  return rootsFormUiDiscountModeButtonClass(selected, optionDisabled)
}

/** Botón borrar dentro de shells affix (descuento, búsqueda en form). */
export const rootsFormAffixClearButtonClass = rootsFormUiAffixClearButtonClass

/** Imagen en formularios — fila compacta con miniatura (≈ altura de input h-11). */
export const rootsFormImageUploadShellClass = rootsFormUiImageUploadShellClass

export const rootsFormImageUploadShellInteractiveClass = cn(
  rootsFormUiImageUploadShellClass,
  "cursor-pointer appearance-none text-left hover:border-[var(--rootsy-bruma-300)] hover:bg-[var(--rootsy-bruma-50)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
)

export const rootsFormImageUploadShellEmptyClass = rootsFormUiImageUploadShellEmptyClass

export const rootsFormImageUploadShellDragClass =
  "!border-[var(--rootsy-savia-400)] bg-[color-mix(in_srgb,var(--rootsy-savia-400)_8%,white)] ring-2 ring-[color-mix(in_srgb,var(--rootsy-savia-400)_20%,transparent)]"

export const rootsFormImageUploadThumbClass = rootsFormUiImageUploadThumbClass

export const rootsFormImageUploadThumbEmptyClass = cn(
  rootsFormImageUploadThumbClass,
  "border-dashed",
)

export const rootsFormImageUploadTitleClass = cn(
  "truncate text-sm font-medium leading-tight text-[var(--rootsy-bruma-900)]",
)

export const rootsFormImageUploadMetaClass = cn(
  "mt-0.5 truncate text-xs leading-snug text-[var(--rootsy-bruma-500)]",
)

export const rootsFormImageUploadActionClass = cn(
  "inline-flex size-8 shrink-0 items-center justify-center rounded-[8px] text-[var(--rootsy-bruma-500)] transition-[color,background-color] duration-150",
  "hover:bg-[var(--rootsy-bruma-50)] hover:text-[var(--rootsy-bruma-900)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
)

export const rootsFormImageUploadActionDestructiveClass = cn(
  rootsFormImageUploadActionClass,
  "hover:text-destructive",
)
