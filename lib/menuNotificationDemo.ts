import type { MenuDockItemId } from "@/lib/menuCatalog"

export type MenuNotificationDemoItem = {
  id: string
  moduleId: MenuDockItemId
  title: string
  detail: string
  timeLabel: string
}

/**
 * Batches de ejemplo para screenshot del menú.
 * Quitar o vaciar cuando existan notificaciones reales.
 */
export const MENU_NOTIFICATION_DEMO_ITEMS: readonly MenuNotificationDemoItem[] =
  [
    {
      id: "demo-comandas-1",
      moduleId: "comandas",
      title: "3 comandas listas",
      detail: "Cocina espera retiro en mostrador",
      timeLabel: "hace 2 min",
    },
    {
      id: "demo-mesas-1",
      moduleId: "mesas",
      title: "Mesa 7 sin atención",
      detail: "Lleva 46 minutos ocupada",
      timeLabel: "hace 8 min",
    },
    {
      id: "demo-inventory-1",
      moduleId: "inventory",
      title: "Stock bajo",
      detail: "Harina 000 · 4 unidades",
      timeLabel: "hace 12 min",
    },
    {
      id: "demo-inventory-2",
      moduleId: "inventory",
      title: "Stock crítico",
      detail: "Aceite girasol · 1 bidón",
      timeLabel: "hace 18 min",
    },
    {
      id: "demo-invoices-1",
      moduleId: "invoices",
      title: "Factura pendiente",
      detail: "FC-A 0003-000148 venció ayer",
      timeLabel: "hace 1 h",
    },
    {
      id: "demo-purchase-orders-1",
      moduleId: "purchase-orders",
      title: "2 órdenes por recibir",
      detail: "Proveedor Norte · entrega hoy",
      timeLabel: "hace 2 h",
    },
    {
      id: "demo-chat-1",
      moduleId: "chat",
      title: "Mensaje de cocina",
      detail: "Falta mozzarella para pizzas",
      timeLabel: "hace 3 h",
    },
    {
      id: "demo-hr-1",
      moduleId: "hr",
      title: "Franco pendiente",
      detail: "Lucía pidió el sábado",
      timeLabel: "ayer",
    },
  ]

const COUNTS: Partial<Record<MenuDockItemId, number>> = {
  comandas: 3,
  mesas: 2,
  inventory: 4,
  invoices: 1,
  "purchase-orders": 2,
  chat: 3,
  hr: 1,
  alerts: 5,
}

export function getMenuNotificationDemoCount(
  id: string | null | undefined,
): number {
  if (!id) return 0
  return COUNTS[id as MenuDockItemId] ?? 0
}

export function getMenuNotificationDemoTotal(): number {
  return MENU_NOTIFICATION_DEMO_ITEMS.length
}
