export type LayoutsTablesScreenComponentRow = {
  layer: string
  component: string
  token: string
  source: string
}

/** Inventario de piezas visibles en el draft de listado · tablas (fundamentos nuevos). */
export const LAYOUTS_TABLES_SCREEN_COMPONENTS: LayoutsTablesScreenComponentRow[] = [
  {
    layer: "Shell",
    component: "Contenedor página",
    token: "layout.tables.shell",
    source: "rootsyLayoutsTablesSystem · elevation + border + shadow.overlay",
  },
  {
    layer: "Header",
    component: "Chrome sombra",
    token: "layout.header · sombra-950→800",
    source: "rootsyLayoutsTablesSystem · ROOTSY_LAYOUTS_TABLES_CHROME",
  },
  {
    layer: "Header",
    component: "Botón chrome · volver / fullscreen",
    token: "dropdown.trigger.icon-button · pos ghost",
    source: "buttonsUiHardcodedSpec · getLayoutsTablesChromeIconButtonStyle",
  },
  {
    layer: "Header",
    component: "Separador vertical",
    token: "sombra-600",
    source: "ROOTSY_LAYOUTS_TABLES_ANATOMY.headerDividerColor",
  },
  {
    layer: "Header",
    component: "Logo POP",
    token: "radius.medium · popRingBorder",
    source: "ROOTSY_LAYOUTS_TABLES_CHROME",
  },
  {
    layer: "Header",
    component: "Nombre POP",
    token: "body semibold · textOnDark",
    source: "layoutsTablesHardcodedSpec · getLayoutsTablesPopNameStyle",
  },
  {
    layer: "Header",
    component: "Título central",
    token: "font.heading.small · textOnDark",
    source: "layoutsTablesHardcodedSpec",
  },
  {
    layer: "Header",
    component: "Acción primaria (Nuevo)",
    token: "savia-600 · icon-button",
    source: "getLayoutsTablesChromeIconButtonStyle(primary)",
  },
  {
    layer: "Header",
    component: "Acción secundaria",
    token: "icon-button · pos outlined",
    source: "buttonsUiHardcodedSpec",
  },
  {
    layer: "Header",
    component: "Nombre usuario",
    token: "body semibold · textOnDark",
    source: "layoutsTablesHardcodedSpec · getLayoutsTablesUserNameStyle",
  },
  {
    layer: "Header",
    component: "Etiqueta de rol",
    token: "body.small medium · sombra-400",
    source: "layoutsTablesHardcodedSpec",
  },
  {
    layer: "Header",
    component: "Avatar usuario",
    token: "icon-button · pos ghost · status-success dot",
    source: "layoutsTablesHardcodedSpec",
  },
  {
    layer: "Toolbar",
    component: "Barra filtros",
    token: "layout.toolbar · 92px",
    source: "rootsyLayoutsTablesSystem · FormUiToolbarListFilters",
  },
  {
    layer: "Toolbar",
    component: "Campo select · período",
    token: "form.control.shell.inline-icon",
    source: "formsUiHardcodedComponents · FormUiSelectInlineIconControl",
  },
  {
    layer: "Toolbar",
    component: "Campo select · filtros",
    token: "form.control.shell.inline-icon",
    source: "formsUiHardcodedComponents · FormUiSelectInlineIconControl",
  },
  {
    layer: "Toolbar",
    component: "Campo búsqueda",
    token: "form.control.shell.inline-icon",
    source: "formsUiHardcodedComponents · FormUiInlineIconControl",
  },
  {
    layer: "Tabla",
    component: "Canvas cuerpo",
    token: "elevation.surface · bruma-100",
    source: "ROOTSY_LAYOUTS_TABLES_BODY.canvasBackground",
  },
  {
    layer: "Tabla",
    component: "Header columnas",
    token: "table.head · space.500 · bruma-50",
    source: "ROOTSY_LAYOUTS_TABLES_ANATOMY.tableHeadHeightPx",
  },
  {
    layer: "Tabla",
    component: "Filas alternadas",
    token: "bruma-50 / white · space.600+100",
    source: "ROOTSY_LAYOUTS_TABLES_BODY",
  },
  {
    layer: "Tabla",
    component: "Checkbox selección",
    token: "form.checkbox · space.200",
    source: "layoutsTablesHardcodedSpec",
  },
  {
    layer: "Tabla",
    component: "Badge estado",
    token: "status-success · status-warning · status-danger",
    source: "ROOTSY_LAYOUTS_TABLES_STATUS",
  },
  {
    layer: "Tabla",
    component: "Link referencia",
    token: "savia-600 · body.small",
    source: "ROOTSY_LAYOUTS_TABLES_BODY.linkColor",
  },
  {
    layer: "Tabla",
    component: "Columna monto",
    token: "body · tabular-nums · bruma-900",
    source: "layoutsTablesHardcodedSpec",
  },
  {
    layer: "Footer",
    component: "Chrome paginación",
    token: "layout.footer · sombra-950→800",
    source: "ROOTSY_LAYOUTS_TABLES_CHROME.footerBackground",
  },
  {
    layer: "Footer",
    component: "Conteo resultados",
    token: "body.small · sombra-400 / textOnDark",
    source: "getLayoutsTablesFooterTextStyle",
  },
  {
    layer: "Footer",
    component: "Select por página",
    token: "form.control · dark sunken",
    source: "getLayoutsTablesFooterSelectStyle",
  },
  {
    layer: "Footer",
    component: "Nav páginas",
    token: "icon-button · pos ghost · space.400",
    source: "getLayoutsTablesFooterNavButtonStyle",
  },
]

export function getLayoutsTablesScreenComponentsByLayer(
  ...layers: string[]
): LayoutsTablesScreenComponentRow[] {
  const allowed = new Set(layers)
  return LAYOUTS_TABLES_SCREEN_COMPONENTS.filter((row) => allowed.has(row.layer))
}

export const LAYOUTS_TABLES_HEADER_COMPONENTS = getLayoutsTablesScreenComponentsByLayer("Header")
export const LAYOUTS_TABLES_BODY_COMPONENTS = getLayoutsTablesScreenComponentsByLayer(
  "Toolbar",
  "Tabla",
)
export const LAYOUTS_TABLES_FOOTER_COMPONENTS = getLayoutsTablesScreenComponentsByLayer("Footer")
