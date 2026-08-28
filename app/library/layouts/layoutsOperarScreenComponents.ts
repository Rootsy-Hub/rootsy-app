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
    token: "layouts-operar-body · .rootsy-theme-pos · negro",
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
    component: "showRootsyMensajeToast",
    token: "caja abierta · top-right · persistente",
    source: "useSaleOpenCashSessionToasts",
  },
  {
    layer: "Grid",
    component: "Main split",
    token: "grid-cols-[1fr_400px] · rows catálogo+toolbox",
    source: "sale/page.tsx · main",
  },
  {
    layer: "Catálogo",
    component: "Sidebar filtros",
    token: "w-64 (256px) · library-sidebar · library-nav · collapsible",
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
    token: "auto-fill · card 200–240 · h-256",
    source: "sale/page.tsx · product card",
  },
  {
    layer: "Checkout",
    component: "LayoutsOperarSaleCheckoutFloor",
    token: "96px · negro→savia 975 · col-span-2",
    source: "LayoutsOperarSaleCheckoutFloor",
  },
  {
    layer: "Checkout",
    component: "Pasos 1 Cliente · 2 Comprobante · 3 Pago",
    token: "4 cols · tinta clara · savia 500 listo",
    source: "SaleOperationToolbox embedded",
  },
  {
    layer: "Ticket",
    component: "SaleOperationTicketOrderPanel",
    token: "papel blanca · desglose en ticket",
    source: "sale/page.tsx · aside carrito",
  },
  {
    layer: "Ticket",
    component: "SaleOperationCartList",
    token: "saleOpCartListSurfaceClass",
    source: "SaleOperationTicketOrderPanel",
  },
  {
    layer: "Checkout",
    component: "SaleOperationActionsBar",
    token: "Total + Descartar · Cobrar en el piso",
    source: "LayoutsOperarSaleCheckoutFloor",
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
