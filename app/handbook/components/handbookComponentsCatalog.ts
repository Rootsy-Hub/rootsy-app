/**
 * Inventario de lo que el producto usa hoy, agrupado por la categoría del handbook.
 * Un ítem = un export / módulo. El contenido de cada pantalla no entra.
 * usedIn nombra áreas de producto, no cada archivo.
 */

export const HANDBOOK_CATALOG_KINDS = [
  "libreria",
  "paralelo",
  "shadcn",
  "pieza",
] as const

export type HandbookCatalogKind = (typeof HANDBOOK_CATALOG_KINDS)[number]

export const HANDBOOK_CATALOG_KIND_LABEL: Record<HandbookCatalogKind, string> = {
  libreria: "Librería",
  paralelo: "Paralelo",
  shadcn: "shadcn directo",
  pieza: "Pieza",
}

export type HandbookCatalogEntry = {
  id: string
  /** Sección del nav. El mismo componente puede listarse en más de una. */
  sectionIds: readonly string[]
  name: string
  source: string
  kind: HandbookCatalogKind
  /** Variantes del mismo export (props / voces), no copys distintos. */
  variants?: readonly string[]
  usedIn: readonly string[]
  note?: string
}

export const HANDBOOK_COMPONENT_CATALOG: readonly HandbookCatalogEntry[] = [
  // —— Navegación · Header
  {
    id: "module-workspace-header",
    sectionIds: ["header"],
    name: "ModuleWorkspaceHeader",
    source: "components/layouts-module/ModuleWorkspaceHeader.tsx",
    kind: "libreria",
    variants: ["dark", "default"],
    usedIn: ["Chrome de cada módulo de datos y de operar (vía layout)"],
  },
  {
    id: "header-icon-button",
    sectionIds: ["header", "botones-de-icono"],
    name: "DataWorkspaceHeaderIconButton",
    source: "components/layouts/DataWorkspaceHeaderIconButton.tsx",
    kind: "pieza",
    variants: ["header claro → RootsIconButton", "header oscuro → EterIconButton"],
    usedIn: [
      "Listados de módulo (artículos, clientes, proveedores, facturas…)",
      "Menú más del header",
    ],
    note: "No es un botón nuevo: elige Eter o Roots según el chrome.",
  },
  {
    id: "header-user-menu",
    sectionIds: ["header", "menus"],
    name: "DataWorkspaceHeaderUserMenu",
    source: "components/layouts/DataWorkspaceHeaderUserMenu.tsx",
    kind: "pieza",
    usedIn: ["ModuleWorkspaceHeader", "Header del menú POP"],
  },
  {
    id: "header-more-menu",
    sectionIds: ["header", "menus"],
    name: "DataWorkspaceHeaderMoreMenu",
    source: "components/layouts/DataWorkspaceHeaderMoreMenu.tsx",
    kind: "pieza",
    variants: ["icons", "menu"],
    usedIn: ["ModuleWorkspaceHeader", "Mesas", "Chrome mobile de operar"],
  },
  {
    id: "ui-avatar",
    sectionIds: ["header"],
    name: "Avatar",
    source: "components/ui/avatar.tsx",
    kind: "shadcn",
    usedIn: ["Menú de usuario del header", "Backoffice (usuarios y POPs)"],
  },

  // —— Sidebar
  {
    id: "data-workspace-sidebar",
    sectionIds: ["sidebar"],
    name: "DataWorkspaceSidebar",
    source: "components/layouts/DataWorkspaceSidebar.tsx",
    kind: "libreria",
    variants: ["default", "dark"],
    usedIn: ["Layout de data-workspace (artículos, tesorería, etc.)"],
    note: "Operar no lo monta: el catálogo de venta/compra/servicio usa SaleCatalogSidebarNav.",
  },
  {
    id: "sale-catalog-sidebar-nav",
    sectionIds: ["sidebar"],
    name: "SaleCatalogSidebarNav",
    source: "components/sale-operation/SaleCatalogSidebarNav.tsx",
    kind: "paralelo",
    variants: ["default", "comfortable"],
    usedIn: ["Catálogo de venta", "Catálogo de compra", "Catálogo de servicios"],
    note: "Mismo trabajo que el sidebar de datos: rail de categorías. Otra implementación.",
  },

  // —— Menús
  {
    id: "menu-sidebar",
    sectionIds: ["menus"],
    name: "MenuSidebar",
    source: "components/MenuSidebar.tsx",
    kind: "libreria",
    usedIn: [
      "Handbook",
      "Librería",
      "Backoffice",
      "Estadísticas",
      "Ajustes",
      "Operar (venta, compra, mesas, mostrador, servicios)",
    ],
    note: "Menú de secciones en rail oscuro. El children es la nav de cada pantalla. No dispara GET/POST.",
  },
  {
    id: "section-menu",
    sectionIds: ["menus"],
    name: "DataWorkspaceSectionMenu",
    source: "components/layouts/DataWorkspaceSectionMenu.tsx",
    kind: "libreria",
    usedIn: ["Comandas (menú de estación)"],
    note: "Pensado para el header de módulo; hoy casi no se reutiliza.",
  },
  {
    id: "statistics-section-nav",
    sectionIds: ["menus", "sidebar"],
    name: "StatisticsSectionNav",
    source: "components/statistics/StatisticsSectionNav.tsx",
    kind: "paralelo",
    usedIn: ["Estadísticas"],
  },
  {
    id: "pop-settings-section-nav",
    sectionIds: ["menus", "sidebar"],
    name: "PopSettingsSectionNav",
    source: "components/settings/PopSettingsSectionNav.tsx",
    kind: "paralelo",
    usedIn: ["Ajustes del POP"],
  },
  {
    id: "menu-section-navigator",
    sectionIds: ["menus"],
    name: "MenuSectionNavigator",
    source: "app/[siteId]/[popId]/menu/MenuSectionNavigator.tsx",
    kind: "paralelo",
    variants: ["activo", "dormant"],
    usedIn: ["Menú POP (selector de reinado)"],
  },

  // —— Tabs
  {
    id: "form-segment",
    sectionIds: ["tabs", "radios"],
    name: "RootsFormSegmentField",
    source: "components/rootsy-form/RootsFormSegmentField.tsx",
    kind: "libreria",
    variants: ["inline", "grid"],
    usedIn: [
      "Hub de reportes",
      "Inventario, cuentas, RRHH y arqueo",
      "Formularios de módulo",
    ],
    note: "Filtro de categorías en línea. En formulario, 2–4 opciones en grilla. No hay RadioGroup de producto.",
  },
  {
    id: "ui-tabs",
    sectionIds: ["tabs"],
    name: "Tabs",
    source: "components/ui/tabs.tsx",
    kind: "shadcn",
    usedIn: ["Detalle de cuenta en tesorería"],
    note: "Único tab bar shadcn. El resto usa RootsFormSegmentField.",
  },

  // —— Paginación
  {
    id: "list-pagination-footer",
    sectionIds: ["paginacion"],
    name: "DataWorkspaceListPaginationFooter",
    source: "components/data-workspace/DataWorkspaceListPaginationFooter.tsx",
    kind: "libreria",
    variants: ["default", "dark", "earth", "tables", "floating"],
    usedIn: ["Pie de DataWorkspaceTableListLayout", "Backoffice · POPs"],
  },

  // —— Botones
  {
    id: "roots-buttons",
    sectionIds: ["botones"],
    name: "RootsSemanticButton",
    source: "components/rootsy-button/RootsSemanticButton.tsx",
    kind: "libreria",
    variants: [
      "RootsPrimaryButton",
      "RootsDefaultButton",
      "RootsSubtleButton",
      "RootsDangerButton",
      "RootsDangerSubtleButton",
      "RootsLinkButton",
      "RootsProgressButton",
    ],
    usedIn: [
      "Diálogos y pies de módulo",
      "Auth, invite, registro",
      "Operar, checkout, reportes",
    ],
    note: "Siete exports, una familia. El contenido del botón no importa: la voz sí.",
  },
  {
    id: "ui-button",
    sectionIds: ["botones"],
    name: "Button",
    source: "components/ui/button.tsx",
    kind: "shadcn",
    variants: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    usedIn: [
      "Algunos forms de artículo y cliente",
      "Backoffice",
      "Home · picker de POP",
      "Date picker (interno)",
      "Pie de paginación (interno)",
    ],
    note: "Bypass: producto que no pasó por Roots*Button.",
  },

  // —— Icon buttons
  {
    id: "roots-icon-button",
    sectionIds: ["botones-de-icono"],
    name: "RootsIconButton",
    source: "components/rootsy-button/RootsIconButton.tsx",
    kind: "libreria",
    variants: ["default", "edit", "destructive"],
    usedIn: [
      "Listados, cuentas corrientes, reportes",
      "Checkout y pickers",
      "Header claro",
    ],
  },
  {
    id: "eter-icon-button",
    sectionIds: ["botones-de-icono"],
    name: "EterIconButton",
    source: "components/eter/EterIconButton.tsx",
    kind: "paralelo",
    variants: ["subtle", "primary", "danger"],
    usedIn: [
      "Header oscuro (vía DataWorkspaceHeaderIconButton)",
      "Menú POP",
      "Panel de devtools de venta",
    ],
    note: "Misma ranura que RootsIconButton en chrome oscuro. No lo envuelve: es otra impl.",
  },
  {
    id: "table-icon-action",
    sectionIds: ["botones-de-icono"],
    name: "DataWorkspaceTableIconAction",
    source: "components/data-workspace/DataWorkspaceListTablePrimitives.tsx",
    kind: "pieza",
    variants: ["neutral", "edit", "destructive"],
    usedIn: [
      "Filas de listados de módulo",
      "Órdenes de compra",
      "Presupuestos",
    ],
    note: "Envuelve RootsIconButton para la fila.",
  },

  // —— Menús de acciones / dropdowns
  {
    id: "roots-dropdown-menu",
    sectionIds: ["menus-de-acciones", "dropdowns"],
    name: "RootsDropdownMenu",
    source: "components/rootsy-dropdown/RootsDropdownMenu.tsx",
    kind: "libreria",
    variants: ["ítem", "ítem destructive", "separador", "tema claro / oscuro"],
    usedIn: [
      "Menús del header",
      "Cajas, tesorería, cheques",
      "Backoffice",
      "Descarga de reportes",
    ],
  },
  {
    id: "ui-dropdown-menu",
    sectionIds: ["menus-de-acciones", "dropdowns"],
    name: "DropdownMenu",
    source: "components/ui/dropdown-menu.tsx",
    kind: "shadcn",
    usedIn: [
      "Opciones de fila en cuentas corrientes y operaciones",
      "Base de RootsDropdownMenu",
    ],
    note: "En filas de tabla se usa el primitivo, no el wrapper Roots.",
  },

  // —— Tooltips
  {
    id: "ui-tooltip",
    sectionIds: ["tooltips"],
    name: "Tooltip",
    source: "components/ui/tooltip.tsx",
    kind: "shadcn",
    usedIn: [
      "Mesas",
      "Card de persona",
      "Toolbar del catálogo",
      "Info de label en forms",
      "Icon button del header",
    ],
  },

  // —— Inputs
  {
    id: "form-text",
    sectionIds: ["inputs"],
    name: "RootsFormTextField",
    source: "components/rootsy-form/RootsFormTextField.tsx",
    kind: "libreria",
    usedIn: ["Alta/edición de entidades", "Auth", "Checkout", "Ajustes del POP"],
  },
  {
    id: "form-textarea",
    sectionIds: ["inputs"],
    name: "RootsFormTextareaField",
    source: "components/rootsy-form/RootsFormTextareaField.tsx",
    kind: "libreria",
    usedIn: ["Fichas de cliente/proveedor", "Cuentas corrientes", "Operar"],
  },
  {
    id: "form-search",
    sectionIds: ["inputs"],
    name: "RootsFormSearchField",
    source: "components/rootsy-form/RootsFormSearchField.tsx",
    kind: "libreria",
    usedIn: ["Búsquedas de módulo", "Picker de parte", "Estadísticas", "Mayor"],
  },
  {
    id: "form-money",
    sectionIds: ["inputs"],
    name: "RootsFormMoneyField",
    source: "components/rootsy-form/RootsFormMoneyField.tsx",
    kind: "libreria",
    usedIn: ["Precios, cobros, cuentas corrientes", "Servicios"],
  },
  {
    id: "form-quantity",
    sectionIds: ["inputs"],
    name: "RootsFormQuantityField",
    source: "components/rootsy-form/RootsFormQuantityField.tsx",
    kind: "libreria",
    usedIn: ["Artículos, manufactura, stock", "Datos de canal en operar"],
  },
  {
    id: "form-integer",
    sectionIds: ["inputs"],
    name: "RootsFormIntegerField",
    source: "components/rootsy-form/RootsFormIntegerField.tsx",
    kind: "libreria",
    usedIn: ["Mesas, impresoras, servicios", "Datos de canal"],
  },
  {
    id: "form-phone",
    sectionIds: ["inputs"],
    name: "RootsFormPhoneField",
    source: "components/rootsy-form/RootsFormPhoneField.tsx",
    kind: "libreria",
    usedIn: ["Ajustes del POP"],
  },
  {
    id: "form-tax",
    sectionIds: ["inputs"],
    name: "RootsFormTaxDocumentField",
    source: "components/rootsy-form/RootsFormTaxDocumentField.tsx",
    kind: "libreria",
    variants: ["cuit_only", "digits_only"],
    usedIn: ["Ajustes del POP"],
  },
  {
    id: "form-discount",
    sectionIds: ["inputs"],
    name: "RootsFormDiscountField",
    source: "components/rootsy-form/RootsFormDiscountField.tsx",
    kind: "libreria",
    variants: ["porcentaje", "fijo"],
    usedIn: ["Descuento de catálogo en artículos"],
  },
  {
    id: "form-image",
    sectionIds: ["inputs"],
    name: "RootsFormImageUploadField",
    source: "components/rootsy-form/RootsFormImageUploadField.tsx",
    kind: "libreria",
    usedIn: ["Ajustes del POP", "Chat", "Fiscal", "Artículos"],
  },
  {
    id: "ui-input",
    sectionIds: ["inputs"],
    name: "Input",
    source: "components/ui/input.tsx",
    kind: "shadcn",
    usedIn: [
      "Confirmar eliminación (nombre)",
      "Toolbar del catálogo de venta",
      "Líneas de carrito",
      "Método de pago",
    ],
    note: "Bypass: no es RootsForm*Field.",
  },
  {
    id: "ui-textarea",
    sectionIds: ["inputs"],
    name: "Textarea",
    source: "components/ui/textarea.tsx",
    kind: "shadcn",
    usedIn: ["Tesorería · detalle de cuenta", "Línea de compra"],
  },
  {
    id: "ui-label",
    sectionIds: ["inputs"],
    name: "Label",
    source: "components/ui/label.tsx",
    kind: "shadcn",
    usedIn: ["Campos extra de artículo", "Tesorería", "Método de pago"],
  },

  // —— Selects
  {
    id: "form-select",
    sectionIds: ["selects"],
    name: "RootsFormSelectField",
    source: "components/rootsy-form/RootsFormSelectField.tsx",
    kind: "libreria",
    usedIn: [
      "Formularios de módulo",
      "Filtros de toolbar",
      "Servicios y estadísticas",
    ],
  },
  {
    id: "ui-select",
    sectionIds: ["selects"],
    name: "Select",
    source: "components/ui/select.tsx",
    kind: "shadcn",
    usedIn: [
      "Campos extra de artículo y promociones",
      "Toolbar del catálogo",
      "Pie de paginación (interno)",
      "Base de RootsFormSelectField",
    ],
  },

  // —— Checkboxes
  {
    id: "form-checkbox",
    sectionIds: ["checkboxes"],
    name: "RootsFormCheckboxField",
    source: "components/rootsy-form/RootsFormCheckboxField.tsx",
    kind: "libreria",
    usedIn: ["Diálogos de filtros", "Datos de canal en operar"],
  },
  {
    id: "form-checkbox-row",
    sectionIds: ["checkboxes"],
    name: "RootsFormCheckboxChoiceRow",
    source: "components/rootsy-form/RootsFormCheckboxChoiceRow.tsx",
    kind: "libreria",
    usedIn: ["Cuentas corrientes", "Chat · canal"],
  },
  {
    id: "ui-checkbox",
    sectionIds: ["checkboxes"],
    name: "Checkbox",
    source: "components/ui/checkbox.tsx",
    kind: "shadcn",
    usedIn: [
      "Selección de filas en operaciones",
      "Header de tabla (interno)",
      "Base de RootsFormCheckbox",
    ],
  },

  // —— Radios → el segmento vive en Tabs (mismo export, también listado acá)

  // —— Switches
  {
    id: "form-switch",
    sectionIds: ["switches"],
    name: "RootsFormSwitchField",
    source: "components/rootsy-form/RootsFormSwitchField.tsx",
    kind: "libreria",
    usedIn: ["Fichas de artículo, cliente, proveedor y similares"],
  },

  // —— Date / time / period
  {
    id: "form-date",
    sectionIds: ["date-pickers"],
    name: "RootsFormDateField",
    source: "components/rootsy-form/RootsFormDateField.tsx",
    kind: "libreria",
    usedIn: ["Formularios de módulo", "Operar", "Servicios", "Compras"],
  },
  {
    id: "form-time",
    sectionIds: ["date-pickers"],
    name: "RootsFormTimeField",
    source: "components/rootsy-form/RootsFormTimeField.tsx",
    kind: "libreria",
    usedIn: ["Ajustes del POP"],
  },
  {
    id: "period-filter",
    sectionIds: ["date-pickers"],
    name: "DataWorkspacePeriodFilter",
    source: "components/data-workspace/DataWorkspacePeriodFilter.tsx",
    kind: "libreria",
    variants: ["panel", "compact", "layout"],
    usedIn: [
      "Listados con período (facturas, caja, operaciones…)",
      "Órdenes de compra y presupuestos",
      "Header de reportes",
    ],
  },
  {
    id: "ui-date-picker",
    sectionIds: ["date-pickers"],
    name: "DatePicker",
    source: "components/ui/date-picker.tsx",
    kind: "shadcn",
    usedIn: ["Tesorería · detalle de cuenta", "Picker de comprobante de compra"],
  },

  // —— Validación: estados del mismo Field, no otro componente
  {
    id: "form-field-states",
    sectionIds: ["validacion"],
    name: "RootsFormField",
    source: "components/rootsy-form/RootsFormField.tsx",
    kind: "libreria",
    variants: ["error", "warning", "success", "invalid"],
    usedIn: ["Todos los RootsForm*Field"],
    note: "No es un componente aparte: son estados del campo.",
  },

  // —— Tablas
  {
    id: "ui-table",
    sectionIds: ["tablas"],
    name: "Table",
    source: "components/ui/table.tsx",
    kind: "shadcn",
    usedIn: ["Listados de módulo", "Reportes", "Backoffice", "Presupuestos y OC"],
    note: "Primitivo. Encima van header, fila y celdas de data-workspace.",
  },
  {
    id: "workspace-table-header",
    sectionIds: ["tablas"],
    name: "WorkspaceTableHeader",
    source: "components/data-workspace/WorkspaceTableHeader.tsx",
    kind: "libreria",
    usedIn: ["Listados de módulo", "Reportes", "OC y presupuestos"],
  },
  {
    id: "workspace-table-row",
    sectionIds: ["tablas"],
    name: "WorkspaceTableBodyRow",
    source: "components/data-workspace/WorkspaceTableHeader.tsx",
    kind: "libreria",
    variants: ["idle", "signal warning", "signal danger", "inactive"],
    usedIn: ["Listados de módulo", "Reportes", "OC y presupuestos"],
  },
  {
    id: "workspace-table-sort",
    sectionIds: ["tablas"],
    name: "WorkspaceTableSortHead",
    source: "components/data-workspace/WorkspaceTableSortHead.tsx",
    kind: "libreria",
    usedIn: ["Listados de módulo (clientes, cuentas, proveedores…)"],
  },
  {
    id: "table-money",
    sectionIds: ["tablas", "metricas"],
    name: "DataWorkspaceTableMoney",
    source: "components/data-workspace/DataWorkspaceListTablePrimitives.tsx",
    kind: "libreria",
    variants: ["default", "muted"],
    usedIn: ["Cuentas corrientes", "Cheques"],
    note: "La mayoría de tablas aún formatean el monto a mano.",
  },

  // —— Cards
  {
    id: "sale-product-card",
    sectionIds: ["cards"],
    name: "SaleCatalogProductCard",
    source: "components/sale-operation/SaleCatalogProductCard.tsx",
    kind: "libreria",
    variants: ["grid", "lista"],
    usedIn: ["Catálogo de venta"],
  },
  {
    id: "purchase-product-card",
    sectionIds: ["cards"],
    name: "PurchaseCatalogProductCard",
    source: "components/purchase-operation/PurchaseCatalogProductCard.tsx",
    kind: "paralelo",
    variants: ["grid", "lista"],
    usedIn: ["Catálogo de compra"],
    note: "Misma loseta de operar que la card de venta. Otro módulo.",
  },
  {
    id: "service-card",
    sectionIds: ["cards"],
    name: "ServiceOperateServiceCard",
    source: "components/service-operation/ServiceOperateServiceCard.tsx",
    kind: "paralelo",
    variants: ["grid", "lista", "selected"],
    usedIn: ["Catálogo de servicios"],
  },
  {
    id: "checkout-option-card",
    sectionIds: ["cards"],
    name: "CheckoutOptionCard",
    source: "components/checkout/CheckoutOptionCard.tsx",
    kind: "libreria",
    variants: ["light", "dark", "selected"],
    usedIn: ["Checkout (comprobante, pago)", "Promos", "Método de pago"],
  },
  {
    id: "hr-person-card",
    sectionIds: ["cards"],
    name: "HrPersonCard",
    source: "app/[siteId]/[popId]/hr/HrPersonCard.tsx",
    kind: "paralelo",
    usedIn: ["Personas"],
    note: "Loseta de entidad, no un Card shadcn. Específica de HR.",
  },
  {
    id: "report-hub-card",
    sectionIds: ["cards"],
    name: "ReportHubCard",
    source: "components/reports/ReportHubCard.tsx",
    kind: "libreria",
    variants: ["link", "selected", "planned"],
    usedIn: ["Hub de reportes", "Inventario"],
  },

  // —— Listas
  {
    id: "sortable-list",
    sectionIds: ["listas"],
    name: "RootsSortableActionList",
    source: "components/rootsy-list/RootsSortableActionList.tsx",
    kind: "libreria",
    usedIn: ["Categorías de artículos y recetas", "Estaciones", "Atajos"],
  },
  {
    id: "filter-chip",
    sectionIds: ["listas"],
    name: "DataWorkspaceListFilterChip",
    source: "components/data-workspace/DataWorkspaceListFilterChip.tsx",
    kind: "libreria",
    usedIn: ["Filtros activos de listados", "OC y presupuestos"],
  },
  {
    id: "active-filters-bar",
    sectionIds: ["listas"],
    name: "DataWorkspaceListActiveFiltersBar",
    source: "components/data-workspace/DataWorkspaceListActiveFiltersBar.tsx",
    kind: "libreria",
    usedIn: ["Listados de módulo", "OC y presupuestos"],
  },

  // —— Badges
  {
    id: "nature-pill",
    sectionIds: ["badges"],
    name: "RootsNaturePill",
    source: "components/rootsy-pill/RootsNaturePill.tsx",
    kind: "libreria",
    variants: ["savia", "bruma", "warning", "danger"],
    usedIn: ["Listados y cuentas", "Facturas emitidas"],
  },
  {
    id: "table-status-badge",
    sectionIds: ["badges"],
    name: "WorkspaceTableStatusBadge",
    source: "components/data-workspace/DataWorkspaceListTablePrimitives.tsx",
    kind: "libreria",
    variants: ["activo", "pendiente", "inactivo", "info"],
    usedIn: ["Filas de listados", "Tipos de gasto"],
  },
  {
    id: "ui-badge",
    sectionIds: ["badges"],
    name: "Badge",
    source: "components/ui/badge.tsx",
    kind: "shadcn",
    usedIn: ["Overlay de oferta en la card de catálogo"],
  },

  // —— Métricas
  {
    id: "report-stat-value",
    sectionIds: ["metricas"],
    name: "ReportStatValue",
    source: "components/reports/ReportStatValue.tsx",
    kind: "libreria",
    variants: ["dato", "loading"],
    usedIn: ["Reportes", "KPIs de estadísticas"],
  },

  // —— Gráficos
  {
    id: "chart-container",
    sectionIds: ["graficos"],
    name: "ChartContainer",
    source: "components/ui/chart.tsx",
    kind: "shadcn",
    usedIn: [
      "Estadísticas · evolución",
      "Estadísticas · ranking",
      "Estadísticas · distribución de costos",
    ],
    note: "Un primitivo. Los tres gráficos de estadísticas no son tres componentes de catálogo.",
  },

  // —— Stock: variantes de fila, no otro módulo
  {
    id: "stock-row-signal",
    sectionIds: ["estados-de-stock"],
    name: "WorkspaceTableBodyRow · signal",
    source: "components/data-workspace/WorkspaceTableHeader.tsx",
    kind: "pieza",
    variants: ["ok", "warning", "danger"],
    usedIn: ["Filas de artículos y stock"],
    note: "No hay un BadgeDeStock: es la fila + la cifra.",
  },

  // —— Toasts
  {
    id: "show-rootsy-toast",
    sectionIds: ["toasts"],
    name: "showRootsyToast",
    source: "components/rootsy-toast/showRootsyToast.ts",
    kind: "libreria",
    variants: ["success", "danger"],
    usedIn: [
      "Ajustes",
      "Catálogo de venta y compra",
      "Gate de módulo",
      "Export de reportes",
    ],
  },
  {
    id: "show-mensaje-toast",
    sectionIds: ["toasts"],
    name: "showRootsyMensajeToast",
    source: "components/rootsy-mensaje/showRootsyMensajeToast.ts",
    kind: "paralelo",
    usedIn: ["Aviso de caja al abrir una venta"],
    note: "Misma ranura que showRootsyToast: confirmación breve. Otra voz (mascota).",
  },

  // —— Banners / alertas = RootsBanner
  {
    id: "roots-banner",
    sectionIds: ["banners", "alertas"],
    name: "RootsBanner",
    source: "components/rootsy-banner/RootsBanner.tsx",
    kind: "libreria",
    variants: ["info", "success", "warning", "danger"],
    usedIn: [
      "Vistas de módulo y ajustes",
      "Auth, invite, registro, login",
      "Operar",
    ],
    note: "Alertas del handbook = este mismo banner con warning/danger. No hay un Alert shadcn en producto.",
  },

  // —— Modals / dialogs
  {
    id: "roots-dialog-content",
    sectionIds: ["modals", "dialogs"],
    name: "RootsDialogContent",
    source: "components/rootsy-dialog/RootsDialogContent.tsx",
    kind: "libreria",
    usedIn: [
      "Alta/edición/filtros de módulo",
      "Operar, checkout, servicios",
      "OC, presupuestos, pagos",
    ],
  },
  {
    id: "ui-dialog",
    sectionIds: ["dialogs"],
    name: "Dialog",
    source: "components/ui/dialog.tsx",
    kind: "shadcn",
    usedIn: [
      "Base de RootsDialogContent",
      "Algunos diálogos de operar y home que lo importan directo",
    ],
  },
  {
    id: "image-lightbox",
    sectionIds: ["dialogs"],
    name: "RootsImageLightbox",
    source: "components/rootsy-lightbox/RootsImageLightbox.tsx",
    kind: "libreria",
    usedIn: [
      "Avatar y fotos",
      "Preview de artículo",
      "Logo del POP",
      "Thumb de tabla",
    ],
  },

  // —— Confirmaciones
  {
    id: "roots-confirm-dialog",
    sectionIds: ["confirmaciones"],
    name: "RootsConfirmDialog",
    source: "components/rootsy-dialog/RootsConfirmDialog.tsx",
    kind: "libreria",
    variants: ["default", "destructive"],
    usedIn: ["Confirmaciones de módulo (salir, borrar, desvincular…)"],
  },
  {
    id: "roots-alert-dialog",
    sectionIds: ["confirmaciones"],
    name: "RootsAlertDialogContent",
    source: "components/rootsy-dialog/RootsAlertDialog.tsx",
    kind: "libreria",
    usedIn: [
      "Venta, chat, checkout",
      "Servicios",
      "Base de RootsConfirmDialog",
    ],
    note: "Cuando el flujo arma el alert a mano, no pasa por RootsConfirmDialog.",
  },
  {
    id: "ui-alert-dialog",
    sectionIds: ["confirmaciones"],
    name: "AlertDialog",
    source: "components/ui/alert-dialog.tsx",
    kind: "shadcn",
    usedIn: [
      "Base de RootsAlertDialog",
      "Deletes de artículo/estación/categoría y backoffice que lo importan directo",
    ],
  },

  // —— Errores
  {
    id: "dialog-error-banner",
    sectionIds: ["errores"],
    name: "RootsDialogErrorBanner",
    source: "components/rootsy-dialog/RootsDialogForm.tsx",
    kind: "libreria",
    usedIn: ["Casi todos los diálogos de módulo", "Operar, pagos, aprobación"],
  },

  // —— Carga
  {
    id: "roots-spinner",
    sectionIds: ["estados-de-carga"],
    name: "RootsSpinner",
    source: "components/rootsy-spinner/RootsSpinner.tsx",
    kind: "libreria",
    usedIn: ["Módulos, reportes, checkout, home, auth"],
  },
  {
    id: "dialog-loading",
    sectionIds: ["estados-de-carga"],
    name: "RootsDialogLoadingState",
    source: "components/rootsy-dialog/RootsDialogForm.tsx",
    kind: "libreria",
    usedIn: ["Cuerpo de diálogos mientras carga el recurso"],
  },
  {
    id: "table-skeleton",
    sectionIds: ["estados-de-carga", "tablas"],
    name: "WorkspaceTableSkeletonRows",
    source: "components/data-workspace/WorkspaceTableSkeleton.tsx",
    kind: "libreria",
    usedIn: ["Listados de módulo", "OC y presupuestos"],
  },
  {
    id: "thinking-halo",
    sectionIds: ["estados-de-carga"],
    name: "RootsyThinkingHalo",
    source: "components/rootsy-thinking/RootsyThinkingHalo.tsx",
    kind: "libreria",
    variants: ["con puntos (chat)", "sin puntos (tabla)"],
    usedIn: ["Chat de Rootsy", "Piso de tabla en data-workspace"],
  },
  {
    id: "ui-spinner",
    sectionIds: ["estados-de-carga"],
    name: "Spinner",
    source: "components/ui/spinner.tsx",
    kind: "shadcn",
    usedIn: [
      "Algunos deletes",
      "Backoffice y gates de auth",
      "Alta de POP",
      "Mercado Pago",
    ],
    note: "Hoy reexporta RootsSpinner. Sigue habiendo imports a ui/spinner.",
  },

  // —— Empty
  {
    id: "rootsy-empty",
    sectionIds: ["empty-states"],
    name: "RootsyEmptyState",
    source: "components/rootsy-empty-state",
    kind: "libreria",
    usedIn: ["Base de OperarTicketEmptyState y SaleCatalogEmptyMascot"],
    note: "Casi no se monta suelto. El vacío de detalle usa otro componente.",
  },
  {
    id: "detail-empty",
    sectionIds: ["empty-states"],
    name: "DataWorkspaceDetailEmptyState",
    source: "components/data-workspace/DataWorkspaceDetailEmptyState.tsx",
    kind: "paralelo",
    usedIn: [
      "Vacíos de detalle y reportes (el más usado)",
      "Paneles de operar",
      "Estadísticas",
    ],
  },
  {
    id: "table-empty-mascot",
    sectionIds: ["empty-states"],
    name: "DataWorkspaceTableEmptyMascot",
    source: "components/data-workspace/DataWorkspaceListTablePrimitives.tsx",
    kind: "paralelo",
    usedIn: ["Listados vacíos de módulo", "OC y presupuestos"],
    note: "Mascota fixed al pie de la tabla. No es RootsyEmptyState.",
  },
  {
    id: "ticket-empty",
    sectionIds: ["empty-states"],
    name: "OperarTicketEmptyState",
    source: "components/layouts-module/OperarTicketEmptyState.tsx",
    kind: "pieza",
    variants: ["order", "purchase", "service"],
    usedIn: ["Ticket vacío de venta, compra y servicio"],
    note: "Envuelve RootsyEmptyState.",
  },
  {
    id: "catalog-empty",
    sectionIds: ["empty-states"],
    name: "SaleCatalogEmptyMascot",
    source: "components/sale-operation/SaleCatalogEmptyMascot.tsx",
    kind: "pieza",
    usedIn: ["Catálogo vacío de venta y compra"],
    note: "Envuelve RootsyEmptyState.",
  },

  // —— Popover / sheet
  {
    id: "ui-popover",
    sectionIds: ["popovers"],
    name: "Popover",
    source: "components/ui/popover.tsx",
    kind: "shadcn",
    usedIn: [
      "Calendario de RootsFormDateField y período",
      "Emoji del chat",
      "Multi-select de addons",
      "Toolbar de período en gastos y estadísticas",
    ],
  },
  {
    id: "ui-sheet",
    sectionIds: ["drawers"],
    name: "Sheet",
    source: "components/ui/sheet.tsx",
    kind: "shadcn",
    usedIn: [
      "Chat e inspector de facturas",
      "Sugerencias de Rootsy en el menú",
      "Cuenta en home",
      "Legales de auth",
      "Ticket mobile de operar",
    ],
  },

  // —— Toolboxes
  {
    id: "sale-toolbox",
    sectionIds: ["toolboxes"],
    name: "SaleOperationToolbox",
    source: "components/sale-operation/SaleOperationToolbox.tsx",
    kind: "libreria",
    usedIn: ["Vender", "Mostrador", "Cobrar servicios"],
  },
  {
    id: "purchase-toolbox",
    sectionIds: ["toolboxes"],
    name: "PurchaseOperationToolbox",
    source: "components/purchase-operation/PurchaseOperationToolbox.tsx",
    kind: "paralelo",
    usedIn: ["Comprar"],
    note: "Misma banda de operar. Slots de proveedor en vez de cliente.",
  },
  {
    id: "service-toolbox",
    sectionIds: ["toolboxes"],
    name: "ServiceOperateStepToolbox",
    source: "components/service-operation/ServiceOperateStepToolbox.tsx",
    kind: "paralelo",
    usedIn: [],
    note: "Definido. Nadie lo monta todavía.",
  },
  {
    id: "mobile-toolbox",
    sectionIds: ["toolboxes"],
    name: "OperarMobileToolboxIcons",
    source: "components/layouts-module/OperarMobileToolbox.tsx",
    kind: "pieza",
    usedIn: ["Ticket mobile de venta, compra, mostrador y servicio"],
  },
]

export function catalogEntriesForSection(
  sectionId: string,
): HandbookCatalogEntry[] {
  return HANDBOOK_COMPONENT_CATALOG.filter((entry) =>
    entry.sectionIds.includes(sectionId),
  )
}
