export type LayoutsOperarScreenComponentRow = {
  layer: string
  component: string
  token: string
  source: string
}

export const LAYOUTS_OPERAR_SCREEN_COMPONENTS: LayoutsOperarScreenComponentRow[] = [
  {
    layer: "Shell",
    component: "DataWorkspaceOperationsLayout",
    token: "layout.module · contentFlush",
    source: "sale/page.tsx",
  },
  {
    layer: "Shell",
    component: "OperationsModuleBody",
    token: "layouts-operar-body · .rootsy-theme-pos · sombra-950",
    source: "DataWorkspaceOperationsLayout",
  },
  {
    layer: "Shell",
    component: "OperationsModuleBackdrop",
    token: "gradiente + grid decorativo",
    source: "DataWorkspaceOperationsLayout",
  },
  {
    layer: "Shell",
    component: "OpenCashSessionBanner",
    token: "variant dark · condicional",
    source: "sale/page.tsx",
  },
  {
    layer: "Grid",
    component: "Main split",
    token: "grid-cols-[1fr_380px] · rows catálogo+toolbox",
    source: "sale/page.tsx · main",
  },
  {
    layer: "Catálogo",
    component: "Sidebar filtros",
    token: "w-280 · sombra-700 · collapsible",
    source: "sale/page.tsx · data-workspace-sidebar",
  },
  {
    layer: "Catálogo",
    component: "Toolbar canvas",
    token: "grid/list toggle · búsqueda · contador",
    source: "sale/page.tsx",
  },
  {
    layer: "Catálogo",
    component: "Grilla productos",
    token: "grid-cols-3 · card h-318",
    source: "sale/page.tsx · product card",
  },
  {
    layer: "Toolbox",
    component: "Barra configuración",
    token: "saleOpToolboxBarClass · 4 slots",
    source: "saleOperationStyles · SaleOperationToolbox",
  },
  {
    layer: "Toolbox",
    component: "Slots Cliente / Comprobante / Pago / Descuento",
    token: "saleOpToolboxSlotClass(configurado)",
    source: "sale/page.tsx · row-start-2",
  },
  {
    layer: "Ticket",
    component: "SaleOperationTicketOrderPanel",
    token: "bg bruma-100 · row-span-2",
    source: "sale/page.tsx · aside carrito",
  },
  {
    layer: "Ticket",
    component: "SaleOperationCartList",
    token: "saleOpCartListSurfaceClass",
    source: "SaleOperationTicketOrderPanel",
  },
  {
    layer: "Ticket",
    component: "SaleOperationActionsBar",
    token: "Descartar · Vender",
    source: "SaleOperationTicketOrderPanel",
  },
  {
    layer: "Ticket",
    component: "SaleOperationTotalBar",
    token: "saleOpImporteTotalClass",
    source: "SaleOperationTicketOrderPanel",
  },
]

export function getLayoutsOperarScreenComponentsByLayer(
  ...layers: string[]
): LayoutsOperarScreenComponentRow[] {
  if (layers.length === 0) return LAYOUTS_OPERAR_SCREEN_COMPONENTS
  const set = new Set(layers)
  return LAYOUTS_OPERAR_SCREEN_COMPONENTS.filter((row) => set.has(row.layer))
}
