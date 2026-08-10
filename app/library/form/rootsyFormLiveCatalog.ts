/**
 * Catálogo de variantes vivas — Formulario (Componentes).
 * Referenciá un código al pedir reutilizar un control en producto.
 * Ej.: «usá form.select.inline-icon en la toolbar de operaciones».
 */

export type RootsFormLiveVariant = {
  code: string
  label: string
  component: string
  description?: string
}

export type RootsFormLiveFamily = {
  id: string
  title: string
  description: string
  variants: RootsFormLiveVariant[]
}

export const ROOTSY_FORM_LIVE_FAMILIES: RootsFormLiveFamily[] = [
  {
    id: "field-stack",
    title: "Anatomía de campo",
    description: "Stack label → control → assist · space.100.",
    variants: [
      {
        code: "form.field-stack.hint",
        label: "Con hint",
        component: "RootsFormTextField",
        description: "Label + control + hint neutral debajo.",
      },
      {
        code: "form.field-stack.error",
        label: "Con error",
        component: "RootsFormTextField",
        description: "Estado invalid · mensaje status-danger.",
      },
    ],
  },
  {
    id: "text",
    title: "Input de texto",
    description: "Una línea · multilínea · compuestos con leading.",
    variants: [
      {
        code: "form.text.default",
        label: "Default",
        component: "RootsFormTextField",
      },
      {
        code: "form.textarea.default",
        label: "Multilínea",
        component: "RootsFormTextareaField",
      },
      {
        code: "form.text.phone",
        label: "Teléfono",
        component: "RootsFormPhoneField",
        description: "Leading +54 · formato AR.",
      },
      {
        code: "form.text.money",
        label: "Monto · $",
        component: "RootsFormMoneyField",
        description: "Shell compuesta · leading $ · tabular-nums.",
      },
      {
        code: "form.text.quantity",
        label: "Cantidad · uds.",
        component: "RootsFormQuantityField",
        description: "Shell compuesta · leading uds.",
      },
    ],
  },
  {
    id: "checkbox",
    title: "Checkbox",
    description: "Booleano en línea · label a la derecha.",
    variants: [
      {
        code: "form.checkbox.default",
        label: "Default",
        component: "RootsFormCheckboxField",
      },
    ],
  },
  {
    id: "switch",
    title: "Switch",
    description: "Toggle on/off · thumb space.200.",
    variants: [
      {
        code: "form.switch.default",
        label: "Default",
        component: "RootsFormSwitchField",
      },
    ],
  },
  {
    id: "select",
    title: "Select",
    description: "Lista desplegable · chevron · shells inline-icon y leading-sunken.",
    variants: [
      {
        code: "form.select.default",
        label: "Default",
        component: "RootsFormSelectField",
      },
      {
        code: "form.select.inline-icon",
        label: "Ícono inline",
        component: "RootsFormSelectField",
        description: "prefixVariant inline · toolbar y filtros.",
      },
      {
        code: "form.select.leading-sunken",
        label: "Leading sunken",
        component: "RootsFormSelectField",
        description: "Casilla bruma-50 · divisor vertical.",
      },
      {
        code: "form.select.long-list",
        label: "Lista larga",
        component: "RootsFormSelectField",
        description: "Más de 4 opciones · hint debajo.",
      },
      {
        code: "form.select.disabled",
        label: "Disabled",
        component: "RootsFormSelectField",
        description: "Sin interacción · opacidad reducida · placeholder visible.",
      },
      {
        code: "form.select.readonly",
        label: "Readonly",
        component: "RootsFormSelectField",
        description: "Valor visible · fondo sunken · no editable (p. ej. tipo de cuenta).",
      },
    ],
  },
  {
    id: "date",
    title: "Fecha",
    description: "Trigger space.500 · popover calendario · formato español.",
    variants: [
      {
        code: "form.date.default",
        label: "Default",
        component: "RootsFormDateField",
      },
      {
        code: "form.date.leading",
        label: "Leading calendario",
        component: "RootsFormDateField",
        description: "Ícono CalendarRange en slot leading.",
      },
    ],
  },
  {
    id: "period-filter",
    title: "Filtro de período",
    description: "Presets · rango custom en popover · formato dd/mm/yy compacto.",
    variants: [
      {
        code: "form.period-filter.default",
        label: "Default",
        component: "RootsFormPeriodFilterField",
      },
      {
        code: "form.period-filter.compact",
        label: "Compact",
        component: "RootsFormPeriodFilterField",
      },
      {
        code: "form.period-filter.custom-range",
        label: "Rango personalizado",
        component: "RootsFormPeriodFilterField",
      },
    ],
  },
  {
    id: "image-upload",
    title: "Imagen",
    description: "Carga inline · thumb space.500 · empty dashed · filled con preview.",
    variants: [
      {
        code: "form.image-upload.empty",
        label: "Vacío",
        component: "RootsFormImageUploadField",
      },
      {
        code: "form.image-upload.filled",
        label: "Con preview",
        component: "RootsFormImageUploadField",
      },
    ],
  },
  {
    id: "discount",
    title: "Descuento",
    description: "Modo % / $ con toggle en leading.",
    variants: [
      {
        code: "form.discount.default",
        label: "Default",
        component: "RootsFormDiscountField",
      },
    ],
  },
  {
    id: "segment",
    title: "Segment",
    description: "Grupo de opciones mutuamente excluyentes.",
    variants: [
      {
        code: "form.segment.two-options",
        label: "2 opciones",
        component: "RootsFormSegmentField",
      },
      {
        code: "form.segment.three-options",
        label: "3 opciones",
        component: "RootsFormSegmentField",
        description: "Con hint debajo del grupo.",
      },
    ],
  },
  {
    id: "toolbar-context",
    title: "En contexto · toolbar listado",
    description: "Barra de filtros embebida en layout.toolbar · 92px.",
    variants: [
      {
        code: "form.context.toolbar-list.flush",
        label: "Flush · inline-icon",
        component: "RootsFormToolbarListFilters",
        description: "Período + filtros + búsqueda · labels visibles.",
      },
    ],
  },
]

export const ROOTSY_FORM_LIVE_VARIANT_CODES = ROOTSY_FORM_LIVE_FAMILIES.flatMap((family) =>
  family.variants.map((variant) => variant.code),
)

export function getRootsFormLiveVariant(code: string): RootsFormLiveVariant | undefined {
  for (const family of ROOTSY_FORM_LIVE_FAMILIES) {
    const match = family.variants.find((variant) => variant.code === code)
    if (match) return match
  }
  return undefined
}
