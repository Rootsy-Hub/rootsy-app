import {
  rootsyDateCalendarClassNames,
  rootsyDateCalendarCompactShellClass,
  rootsyDatePopoverContentClass,
} from "@/components/ui/rootsyDateCalendarStyles"
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
  rootsFormUiSegmentGroupDarkClass,
  rootsFormUiSegmentGroupInlineClass,
  rootsFormUiSegmentIndicatorClass,
  rootsFormUiSegmentOptionClass,
  rootsFormUiSegmentOptionDarkClass,
  rootsFormUiSegmentSelectedSurfaceClass,
  rootsFormUiSegmentSelectedSurfaceDarkClass,
  rootsFormUiSegmentSelectedSurfaceFilterLightClass,
  rootsFormUiSegmentSelectedSurfaceLightClass,
  rootsFormUiSelectTriggerClass,
  rootsFormUiSwitchBoxClass,
  rootsFormUiSwitchTrackClass,
  rootsFormUiTextFieldClass,
  rootsFormUiTextareaFieldClass,
} from "@/components/rootsy-form/rootsFormUiStyles"
import { rootsFormBrumaDividerClass } from "@/components/rootsy-form/rootsFormBrumaTokens"
import {
  isRootsFormToneDark,
  resolveRootsFormAtmosphere,
  type RootsFormTone,
} from "@/app/library/ui-components/rootsFormAtmosphere"
import { layoutsOperarFormDarkIconClass, layoutsOperarFormDarkPlaceholderClass } from "@/app/library/layouts/layoutsOperarStyles"
import { cn } from "@/lib/utils"

export const rootsFormControlSelectionClass = rootsFormUiSelectionClass
export const rootsFormFieldLabelTypographyClass = "font-canopy text-sm font-medium leading-5"

export const rootsFormFieldLabelClass = rootsFormUiLabelClass

export const rootsFormFieldStackClass = rootsFormUiFieldStackClass

/** Columna dentro de un formulario de modal (stack vertical con ritmo entre campos). */
export const rootsFormColumnClass = "flex w-full min-w-0 flex-col gap-4"

/** Grupo de checks relacionados — ritmo compacto dentro de un bloque de campos. */
export const rootsFormCheckboxGroupClass = "flex w-full min-w-0 flex-col gap-3"

/** Lista de opciones checkbox — 8px entre filas (Material compact). */
export const rootsFormCheckboxChoiceListClass = "flex w-full min-w-0 flex-col gap-2"

/** Fila checkbox en lista — 48px mínimo, gap 12px control↔texto, fila clickeable. */
export const rootsFormCheckboxChoiceRowClass = cn(
  "flex min-h-12 w-full min-w-0 cursor-pointer select-none gap-3 rounded-lg px-1",
)

/** Contenido auxiliar pegado a un control (hint, ayuda contextual). */
export const rootsFormFieldAuxiliaryStackClass = "flex w-full min-w-0 flex-col gap-2"

/** Grilla principal de upsert — dos columnas + separador central en desktop. */
export const rootsFormGridClass =
  "grid w-full min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-5"

/** Línea vertical entre columnas (solo visible en layout de dos columnas). */
export const rootsFormGridDividerClass = cn(
  "hidden min-h-full w-px shrink-0 lg:block",
  rootsFormBrumaDividerClass,
)

/** Fila de dos campos dentro de una columna (p. ej. SKU + código de barras). */
export const rootsFormTwoColRowClass =
  "grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2"

/** Agrupa campos auxiliares como un solo ítem en la columna (sin gap interno). */
export const rootsFormFieldGroupClass = "flex w-full min-w-0 flex-col"

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
  "rootsy-app-light",
  rootsFormPortalZClass,
  "w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) max-w-(--radix-select-trigger-width) overflow-x-hidden overflow-y-auto rounded-[12px] border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-blanco)] p-0 shadow-md",
)

/** Ítem del listado — hover bruma-50 · sin radio propio. */
export const rootsFormSelectItemClass = cn(
  rootsFormControlTypographyClass,
  "relative flex w-full cursor-default select-none items-center py-2.5 pl-3 pr-10 outline-none",
  "data-[highlighted]:bg-[var(--rootsy-bruma-50)] data-[highlighted]:text-[var(--rootsy-bruma-900)]",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
)

export type RootsFormSelectTone = RootsFormTone

export function rootsFormPlaceholderClassForTone(tone: RootsFormTone = "light") {
  if (tone === "dark") return layoutsOperarFormDarkPlaceholderClass
  switch (resolveRootsFormAtmosphere(tone)) {
    case "eter":
      return "placeholder:text-[var(--rootsy-eter-300)]"
    case "sombra":
      return "placeholder:text-[var(--rootsy-sombra-300)]"
    default:
      return "placeholder:text-[var(--rootsy-bruma-700)]"
  }
}

export function rootsFormControlSelectionClassForTone(tone: RootsFormTone = "light") {
  switch (resolveRootsFormAtmosphere(tone)) {
    case "eter":
      return "selection:bg-[var(--rootsy-eter-700)] selection:text-[var(--rootsy-eter-50)]"
    case "sombra":
      return "selection:bg-[var(--rootsy-sombra-700)] selection:text-[var(--rootsy-sombra-50)]"
    default:
      return rootsFormControlSelectionClass
  }
}

export function rootsFormMutedIconClassForTone(tone: RootsFormTone = "light") {
  if (tone === "dark") return layoutsOperarFormDarkIconClass
  switch (resolveRootsFormAtmosphere(tone)) {
    case "eter":
      return "text-[var(--rootsy-eter-300)]"
    case "sombra":
      return "text-[var(--rootsy-sombra-300)]"
    default:
      return "text-[var(--rootsy-bruma-700)]"
  }
}

/** Select compacto — operar dark (paridad catalog-toolbar-control). */
export const rootsFormSelectDarkTriggerClass = cn(
  "flex h-11 min-h-11 w-auto min-w-[4.25rem] items-center justify-between gap-2 rounded-lg border px-3 shadow-none outline-none transition-[color,box-shadow,border-color]",
  "font-sans text-sm font-medium leading-normal text-[#f4f8f6]",
  "border-[color-mix(in_srgb,var(--rootsy-sombra-border)_45%,transparent)]",
  "bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_55%,transparent)]",
  "hover:border-[color-mix(in_srgb,var(--rootsy-sombra-border)_65%,transparent)]",
  "data-[state=open]:border-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
  "data-[state=closed]:focus:!border-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)] data-[state=closed]:focus:!ring-0",
  "focus-visible:border-[color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)] focus-visible:outline-none",
  "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_22%,transparent)]",
  "focus-visible:ring-offset-0",
  "disabled:pointer-events-none disabled:opacity-40",
  "[&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left",
  "[&_[data-slot=select-value][data-placeholder]]:text-[color-mix(in_srgb,var(--rootsy-sombra-300)_55%,transparent)]",
)

export const rootsFormSelectDarkContentClass = cn(
  rootsFormPortalZClass,
  "overflow-x-hidden overflow-y-auto rounded-lg border p-0",
  "border-[color-mix(in_srgb,var(--rootsy-sombra-border)_45%,transparent)]",
  "bg-[var(--rootsy-sombra-950)]",
  "shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--rootsy-sombra-950)_65%,transparent)]",
  "w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) max-w-(--radix-select-trigger-width)",
)

export const rootsFormSelectDarkItemClass = cn(
  "relative flex w-full cursor-default select-none items-center py-2.5 pl-3 pr-10 text-sm text-[#f4f8f6] outline-none",
  "data-[highlighted]:bg-[color-mix(in_srgb,var(--rootsy-savia-400)_18%,var(--rootsy-sombra-950))] data-[highlighted]:text-[color-mix(in_srgb,var(--rootsy-savia-200)_92%,white)]",
  "data-[state=checked]:bg-[color-mix(in_srgb,var(--rootsy-savia-600)_24%,var(--rootsy-sombra-950))] data-[state=checked]:text-[#f4f8f6]",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
)

export const rootsFormSelectSombraContentClass = cn(
  rootsFormPortalZClass,
  "overflow-x-hidden overflow-y-auto rounded-[12px] border p-0",
  "border-[var(--rootsy-sombra-700)] bg-[var(--rootsy-sombra-800)]",
  "shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--rootsy-sombra-950)_70%,transparent)]",
  "w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) max-w-(--radix-select-trigger-width)",
)

export const rootsFormSelectSombraItemClass = cn(
  "relative flex w-full cursor-default select-none items-center py-2.5 pl-3 pr-10 text-sm text-[var(--rootsy-sombra-50)] outline-none",
  "data-[highlighted]:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_16%,var(--rootsy-sombra-800))] data-[highlighted]:text-[var(--rootsy-sombra-50)]",
  "data-[state=checked]:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_22%,var(--rootsy-sombra-800))] data-[state=checked]:text-[var(--rootsy-savia-500)]",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
)

export const rootsFormSelectEterContentClass = cn(
  rootsFormPortalZClass,
  "overflow-x-hidden overflow-y-auto rounded-[12px] border p-0",
  "border-[var(--rootsy-eter-700)] bg-[var(--rootsy-eter-800)]",
  "shadow-[0_18px_40px_-18px_color-mix(in_srgb,var(--rootsy-eter-950)_70%,transparent)]",
  "w-(--radix-select-trigger-width) min-w-(--radix-select-trigger-width) max-w-(--radix-select-trigger-width)",
)

export const rootsFormSelectEterItemClass = cn(
  "relative flex w-full cursor-default select-none items-center py-2.5 pl-3 pr-10 text-sm text-[var(--rootsy-eter-50)] outline-none",
  "data-[highlighted]:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_16%,var(--rootsy-eter-800))] data-[highlighted]:text-[var(--rootsy-eter-50)]",
  "data-[state=checked]:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_22%,var(--rootsy-eter-800))] data-[state=checked]:text-[var(--rootsy-savia-500)]",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
)

/** Listado dentro de dropdown redondeado — sin padding interno; el hover lo recorta el shell. */
export const rootsFormDropdownListClass = "p-0"

export function rootsFormDropdownHighlightItemClassForTone(
  tone: RootsFormSelectTone = "light",
  state: "default" | "highlighted" | "selected" = "default",
) {
  if (tone === "eter") {
    return cn(
      state === "selected"
        ? "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_22%,var(--rootsy-eter-800))] text-[var(--rootsy-savia-500)]"
        : state === "highlighted"
          ? "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_16%,var(--rootsy-eter-800))] text-[var(--rootsy-eter-50)]"
          : "text-[var(--rootsy-eter-50)]",
    )
  }
  if (tone === "sombra") {
    return cn(
      state === "selected"
        ? "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_22%,var(--rootsy-sombra-800))] text-[var(--rootsy-savia-500)]"
        : state === "highlighted"
          ? "bg-[color-mix(in_srgb,var(--rootsy-savia-500)_16%,var(--rootsy-sombra-800))] text-[var(--rootsy-sombra-50)]"
          : "text-[var(--rootsy-sombra-50)]",
    )
  }
  if (tone === "dark") {
    return cn(
      state === "selected"
        ? "bg-[color-mix(in_srgb,var(--rootsy-savia-600)_24%,var(--rootsy-sombra-950))] text-[#f4f8f6]"
        : state === "highlighted"
          ? "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_18%,var(--rootsy-sombra-950))] text-[color-mix(in_srgb,var(--rootsy-savia-200)_92%,white)]"
          : "text-[#f4f8f6]",
    )
  }

  return cn(
    state === "selected"
      ? "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_8%,white)] text-[var(--rootsy-bruma-900)]"
      : state === "highlighted"
        ? "bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-bruma-900)]"
        : "text-[var(--rootsy-bruma-900)]",
  )
}

export function rootsFormSelectTriggerClassForTone(
  tone: RootsFormSelectTone = "light",
  prefixed = false,
  prefixVariant: "sunken" | "inline" = "sunken",
) {
  if (prefixed) {
    if (!isRootsFormToneDark(tone) && prefixVariant === "inline") {
      return rootsFormInlineIconPrefixedSelectTriggerClass
    }
    return rootsFormPrefixedSelectTriggerClass
  }
  return tone === "dark" ? rootsFormSelectDarkTriggerClass : rootsFormSelectTriggerClass
}

export function rootsFormSelectContentClassForTone(tone: RootsFormSelectTone = "light") {
  if (tone === "dark") return rootsFormSelectDarkContentClass
  if (tone === "eter") return rootsFormSelectEterContentClass
  if (tone === "sombra") return rootsFormSelectSombraContentClass
  return rootsFormSelectContentClass
}

export function rootsFormSelectItemClassForTone(tone: RootsFormSelectTone = "light") {
  if (tone === "dark") return rootsFormSelectDarkItemClass
  if (tone === "eter") return rootsFormSelectEterItemClass
  if (tone === "sombra") return rootsFormSelectSombraItemClass
  return rootsFormSelectItemClass
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

export function rootsFormSegmentGroupClassForTone(
  tone: RootsFormSelectTone = "light",
  layout: "grid" | "inline" = "grid",
) {
  if (isRootsFormToneDark(tone)) return rootsFormUiSegmentGroupDarkClass
  if (layout === "inline") return rootsFormUiSegmentGroupInlineClass
  return rootsFormUiSegmentGroupClass
}

export function rootsFormSegmentSelectedSurfaceClassForTone(
  tone: RootsFormSelectTone = "light",
  layout: "grid" | "inline" = "grid",
) {
  if (isRootsFormToneDark(tone)) return rootsFormUiSegmentSelectedSurfaceDarkClass
  if (layout === "inline") return rootsFormUiSegmentSelectedSurfaceFilterLightClass
  return rootsFormUiSegmentSelectedSurfaceLightClass
}

export const rootsFormSegmentSelectedSurfaceClass =
  rootsFormUiSegmentSelectedSurfaceLightClass

export function rootsFormSegmentIndicatorClassForTone(
  tone: RootsFormSelectTone = "light",
) {
  return cn(
    "pointer-events-none absolute transition-transform duration-200 ease-out",
    rootsFormSegmentSelectedSurfaceClassForTone(tone),
  )
}

export const rootsFormSegmentIndicatorClass = rootsFormUiSegmentIndicatorClass

export function rootsFormSegmentOptionClass(
  selected: boolean,
  disabled?: boolean,
) {
  return rootsFormUiSegmentOptionClass(selected, disabled)
}

export function rootsFormSegmentOptionClassForTone(
  selected: boolean,
  disabled?: boolean,
  tone: RootsFormSelectTone = "light",
) {
  return isRootsFormToneDark(tone)
    ? rootsFormUiSegmentOptionDarkClass(selected, disabled)
    : rootsFormUiSegmentOptionClass(selected, disabled)
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

export function rootsFormAffixClearButtonClassForTone(
  tone: RootsFormSelectTone = "light",
) {
  if (tone === "eter") {
    return cn(
      "flex size-8 items-center justify-center rounded-md transition-[color,background-color] duration-150",
      "text-[var(--rootsy-eter-300)]",
      "hover:bg-[var(--rootsy-eter-900)] hover:text-[var(--rootsy-eter-50)]",
      "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-500)_28%,transparent)]",
    )
  }
  if (tone === "sombra") {
    return cn(
      "flex size-8 items-center justify-center rounded-md transition-[color,background-color] duration-150",
      "text-[var(--rootsy-sombra-300)]",
      "hover:bg-[var(--rootsy-sombra-900)] hover:text-[var(--rootsy-sombra-50)]",
      "focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-500)_28%,transparent)]",
    )
  }
  if (tone === "dark") {
    return cn(
      "flex size-8 items-center justify-center rounded-md transition-[color,background-color] duration-150",
      "text-[color-mix(in_srgb,var(--rootsy-sombra-300)_70%,transparent)]",
      "hover:bg-[color-mix(in_srgb,var(--rootsy-sombra-950)_72%,transparent)] hover:text-[#f4f8f6]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-400)_22%,transparent)]",
    )
  }
  return rootsFormAffixClearButtonClass
}

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
  "truncate text-sm font-medium leading-tight text-[var(--rootsy-bruma-950)]",
)

export const rootsFormImageUploadMetaClass = cn(
  "mt-0.5 truncate text-xs leading-snug text-[var(--rootsy-bruma-700)]",
)

export const rootsFormImageUploadActionClass = cn(
  "inline-flex size-8 shrink-0 items-center justify-center rounded-[8px] text-[var(--rootsy-bruma-500)] transition-[color,background-color] duration-150",
  "hover:bg-[var(--rootsy-bruma-50)] hover:text-[var(--rootsy-bruma-900)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_srgb,var(--rootsy-savia-400)_45%,transparent)]",
)

export const rootsFormImageUploadActionDestructiveClass = cn(
  rootsFormImageUploadActionClass,
  "hover:text-destructive",
)
