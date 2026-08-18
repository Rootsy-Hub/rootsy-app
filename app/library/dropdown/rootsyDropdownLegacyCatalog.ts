/**
 * Catálogo legacy de dropdown — documentación Layout (Radix + clases workspace).
 * Mantener para LayoutDropdownLibrarySection; specs nuevas en rootsyDropdownSystem.
 */

export type DropdownSurfaceToken = {
  id: string
  name: string
  contentClass: string
  itemClass: string
  labelClass?: string
  separatorClass?: string
  destructiveItemClass?: string
  usage: string
  source: string
}

export const ROOTSY_DROPDOWN_LEGACY_MANIFESTO =
  "Un dropdown agrupa acciones secundarias sin ocupar la barra principal. Los triggers solo usan componentes de la librería: RootsIconButton para menús solo-icono y DataWorkspaceSectionMenu en header nocturno. Para filtros con valor visible usá RootsFormSelectField (sección Select), no dropdown."

export const ROOTSY_DROPDOWN_LEGACY_PRINCIPLES = [
  {
    title: "Superficie según contexto",
    detail:
      "Headers bosque nocturno usan dataWorkspaceNightHeader*; tarjetas light usan dataWorkspaceLightDropdown*; acciones de fila usan lightToolbarDropdown* en el panel.",
  },
  {
    title: "Triggers de librería",
    detail:
      "RootsIconButton (tone action, compact) para ⋮ de fila; DataWorkspaceSectionMenu en header dark. Selección con label visible → RootsFormSelectField.",
  },
  {
    title: "Agrupar con labels y separadores",
    detail:
      "DropdownMenuLabel en uppercase 10px; DropdownMenuSeparator entre secciones (Nuevo / Vista, acciones / destructivas).",
  },
  {
    title: "Destructive aislado",
    detail:
      "variant=\"destructive\" o token logout/destructive al final, después de un separador — nunca mezclado con acciones frecuentes.",
  },
] as const

export const ROOTSY_DROPDOWN_SURFACES: DropdownSurfaceToken[] = [
  {
    id: "light-header",
    name: "Header / tarjeta clara",
    contentClass: "dataWorkspaceLightDropdownContentClass",
    itemClass: "dataWorkspaceLightDropdownItemClass",
    labelClass: undefined,
    separatorClass: "dataWorkspaceLightDropdownSeparatorClass",
    destructiveItemClass: "dataWorkspaceLightDropdownLogoutItemClass",
    usage: "Menús de cuenta, caja registradora, tarjetas treasury en shell claro.",
    source: "components/layouts/dataWorkspaceHeaderStyles.ts",
  },
  {
    id: "night-header",
    name: "Header bosque nocturno",
    contentClass: "dataWorkspaceNightHeaderDropdownContentClass",
    itemClass: "dataWorkspaceNightHeaderDropdownItemClass",
    labelClass: "dataWorkspaceNightHeaderDropdownLabelClass",
    separatorClass: "dataWorkspaceNightHeaderDropdownSeparatorClass",
    usage: "Selector de vista/sección en header dark (DataWorkspaceSectionMenu).",
    source: "components/layouts/dataWorkspaceHeaderStyles.ts",
  },
  {
    id: "row-actions",
    name: "Acciones de fila",
    contentClass: "lightToolbarDropdownContentClass (+ w-44)",
    itemClass: "lightToolbarDropdownItemClass",
    usage: "Menú ⋮ en tablas layout — Duplicar, Editar, Eliminar.",
    source: "components/data-workspace · menú ⋮ de fila",
  },
]

export const ROOTSY_DROPDOWN_ELEVATION = {
  level: "overlay",
  semanticToken: "elevation.popover.select",
  light: {
    surface: "bg-white (elevation.surface.overlay)",
    border: "border-[var(--rootsy-bruma-200)]",
    radius: "rounded-[16px] · radius.xlarge",
    itemRadius: "rounded-[4px] · space.050",
    shadow: "shadow-[0_22px_70px_-18px_rgba(0,0,0,0.28)]",
    zIndex: "z-50",
  },
  dark: {
    surface: "bg-[#121816] (elevation.surface.overlay dark)",
    border: "border-black/[0.04]",
    radius: "rounded-[16px] · radius.xlarge",
    itemRadius: "rounded-[4px] · space.050",
    shadow: "shadow-[0_24px_80px_-16px_oklch(0_0_0/0.65)]",
    zIndex: "z-50",
    note: "rootsDropdownContentDarkClass.",
  },
} as const

export const ROOTSY_DROPDOWN_GUIDELINES = [
  {
    do: "Usar align=\"end\" en menús de fila y header nocturno.",
    dont: "Inventar triggers outline con ícono + texto + chevron — no están en la librería.",
  },
  {
    do: "RootsIconButton con label accesible en triggers solo-icono.",
    dont: "Usar DropdownMenu para selección única con valor visible — usá Select.",
  },
  {
    do: "Separadores y labels para agrupar acciones (cuenta, vista, destructivas).",
    dont: "Mezclar tokens light y dark en el mismo menú — rompe contraste y hover.",
  },
] as const

export const ROOTSY_DROPDOWN_RELATED_LINKS = [
  {
    sectionId: "elevation",
    label: "Elevación",
    hint: "Nivel overlay · rootsyElevationOverlay*.",
  },
  {
    sectionId: "select",
    label: "Select",
    hint: "Filtros toolbar con valor visible y check de opción activa.",
  },
  {
    sectionId: "buttons",
    label: "Botones",
    hint: "RootsIconButton y botones semánticos para triggers.",
  },
  {
    sectionId: "modals",
    label: "Modales",
    hint: "Confirmación antes de acciones destructive del menú.",
  },
  {
    sectionId: "layouts-tables",
    label: "Tablas layout",
    hint: "Menú ⋮ en filas compactas h-11.",
  },
  {
    sectionId: "motion",
    label: "Motion",
    hint: "Entrada slide-in-zero en dropdowns de header.",
  },
] as const
