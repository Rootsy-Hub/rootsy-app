export type LayoutsTablesScreenComponentRow = {
  layer: string
  component: string
  token: string
  source: string
}

/** Inventario de piezas visibles en el draft de listado · tablas. */
export const LAYOUTS_TABLES_SCREEN_COMPONENTS: LayoutsTablesScreenComponentRow[] = [
  {
    layer: "Header",
    component: "Shell operativo",
    token: "DataWorkspaceLayout",
    source: "components/layouts/DataWorkspaceLayout.tsx",
  },
  {
    layer: "Página",
    component: "Listado tabla · shell completo",
    token: "DataWorkspaceTableListPage",
    source: "components/data-workspace/DataWorkspaceTableListLayout.tsx",
  },
  {
    layer: "Header",
    component: "Botón chrome · volver",
    token: "dataWorkspaceHeaderChromeButtonClass",
    source: "dataWorkspaceHeaderStyles.ts",
  },
  {
    layer: "Header",
    component: "Botón chrome · pantalla completa",
    token: "dataWorkspaceHeaderChromeButtonClass",
    source: "dataWorkspaceHeaderStyles.ts",
  },
  {
    layer: "Header",
    component: "Separador vertical",
    token: "dataWorkspaceHeaderDividerClass",
    source: "dataWorkspaceHeaderStyles.ts",
  },
  {
    layer: "Header",
    component: "Logo POP",
    token: "dataWorkspaceHeaderPopRingClass",
    source: "dataWorkspaceHeaderStyles.ts",
  },
  {
    layer: "Header",
    component: "Título central",
    token: "DataWorkspaceHeaderTitle",
    source: "components/layouts/DataWorkspaceHeaderTitle.tsx",
  },
  {
    layer: "Header",
    component: "Acción primaria (Nuevo)",
    token: "rootsIconButtonClass · tone=dark · size=default",
    source: "DataWorkspaceHeaderIconButton.tsx",
  },
  {
    layer: "Header",
    component: "Acción secundaria",
    token: "rootsIconButtonClass · tone=dark · size=default",
    source: "DataWorkspaceHeaderIconButton.tsx",
  },
  {
    layer: "Header",
    component: "Etiqueta de rol",
    token: "dataWorkspaceHeaderRoleLabelClass",
    source: "dataWorkspaceHeaderStyles.ts",
  },
  {
    layer: "Header",
    component: "Avatar / menú usuario",
    token: "DataWorkspaceHeaderUserMenu",
    source: "components/layouts/DataWorkspaceHeaderUserMenu.tsx",
  },
  {
    layer: "Toolbar",
    component: "Shell de filtros flush",
    token: "DataWorkspaceTableListFiltersBar",
    source: "components/data-workspace/DataWorkspaceTableListLayout.tsx",
  },
  {
    layer: "Toolbar",
    component: "Scope tierra orgánica",
    token: "DataWorkspaceTableListNatureShell",
    source: "components/data-workspace/DataWorkspaceTableListLayout.tsx",
  },
  {
    layer: "Tabla",
    component: "Shell listado flush",
    token: "DataWorkspaceTableListShell",
    source: "components/data-workspace/DataWorkspaceTableListLayout.tsx",
  },
  {
    layer: "Toolbar",
    component: "Panel período",
    token: "lightToolbarPanelClass · lightToolbarControlClass",
    source: "dataWorkspaceListStyles.ts",
  },
  {
    layer: "Toolbar",
    component: "Panel filtros modales",
    token: "lightToolbarPanelClass",
    source: "dataWorkspaceListStyles.ts",
  },
  {
    layer: "Toolbar",
    component: "Campo búsqueda",
    token: "lightToolbarInputClass",
    source: "dataWorkspaceListStyles.ts",
  },
  {
    layer: "Tabla",
    component: "Scope Nature",
    token: "workspaceTableNatureScopeClass",
    source: "rootsyNaturePalette.css · --wt-*",
  },
  {
    layer: "Tabla",
    component: "Header de columnas",
    token: "WorkspaceTableHeader · tone=nature",
    source: "WorkspaceTableHeader.tsx",
  },
  {
    layer: "Tabla",
    component: "Filas alternadas",
    token: "workspaceTableNatureBodyRowClassNames",
    source: "dataWorkspaceListStyles.ts",
  },
  {
    layer: "Tabla",
    component: "Checkbox de selección",
    token: "workspaceTableNatureCheckboxClass",
    source: "dataWorkspaceListStyles.ts",
  },
  {
    layer: "Tabla",
    component: "Badge de estado",
    token: "workspaceTableNatureStatusBadgeClass",
    source: "dataWorkspaceListStyles.ts",
  },
  {
    layer: "Tabla",
    component: "Link de referencia",
    token: "workspaceTableNatureLinkClass",
    source: "dataWorkspaceListStyles.ts",
  },
  {
    layer: "Tabla",
    component: "Columna monto",
    token: "workspaceTableNatureMoneyClass",
    source: "dataWorkspaceListStyles.ts",
  },
  {
    layer: "Footer",
    component: "Select paginación · trigger tierra",
    token: "earthTableFooterSelectTriggerClass",
    source: "dataWorkspaceListStyles.ts",
  },
  {
    layer: "Footer",
    component: "Select paginación · dropdown light",
    token: "RootsFormSelectContent · tone=light",
    source: "rootsFormStyles.ts",
  },
  {
    layer: "Footer",
    component: "Paginación tierra oscura",
    token: "DataWorkspaceTableListPaginationFooter · variant=earth",
    source: "DataWorkspaceTableListLayout.tsx",
  },
]
