import type { ExpenseCategoryKind } from "@/app/[siteId]/[popId]/expenses/actions"

export type ExpenseWorldCopy = {
  kind: ExpenseCategoryKind
  title: string
  lookout: string
  path: string
  emptyTitle: string
  emptyBody: string
  createLabel: string
  createTitle: string
  createHint: (monthLabel: string) => string
  categoryHint: string
  itemWord: { one: string; many: string }
  anchor: string
  readOnly: boolean
}

export const EXPENSE_WORLDS: Record<ExpenseCategoryKind, ExpenseWorldCopy> = {
  fijo: {
    kind: "fijo",
    title: "Gastos fijos",
    lookout: "Lo que ya conocés",
    path: "Se repiten mes a mes. Alquiler, servicios — el camino conocido.",
    emptyTitle: "Todavía no hay categorías fijas",
    emptyBody:
      "Las categorías envuelven las promesas. Creá una desde Categorías.",
    createLabel: "Cargar promesa",
    createTitle: "Nueva promesa fija",
    createHint: (monthLabel) =>
      `Una promesa de pago en ${monthLabel}, entre lo que ya sabés que vuelve.`,
    categoryHint: "Lo que ya sabés que vuelve.",
    itemWord: { one: "promesa", many: "promesas" },
    anchor: "gastos-fijos",
    readOnly: false,
  },
  variable: {
    kind: "variable",
    title: "Gastos variables",
    lookout: "Lo que cambia",
    path: "Aparecen mes a mes. Compras, extras, urgencias — nadie sabe de antemano cuánto va a ser.",
    emptyTitle: "Todavía no hay categorías variables",
    emptyBody:
      "Las categorías envuelven las promesas. Creá una desde Categorías.",
    createLabel: "Cargar promesa",
    createTitle: "Nueva promesa variable",
    createHint: (monthLabel) =>
      `Una promesa de pago en ${monthLabel}, entre lo que aparece este mes.`,
    categoryHint: "Compras, extras, urgencias.",
    itemWord: { one: "promesa", many: "promesas" },
    anchor: "gastos-variables",
    readOnly: false,
  },
  otro: {
    kind: "otro",
    title: "Otros gastos",
    lookout: "Lo que anota otro módulo",
    path: "Sueldos, honorarios, mermas, intereses — se registran en otra parte. Acá solo se miran.",
    emptyTitle: "No hay cuentas de este tipo",
    emptyBody: "Estas cuentas vienen con el plan del punto de venta.",
    createLabel: "Cargar promesa",
    createTitle: "Nueva promesa",
    createHint: () => "Esta cuenta la registra otro módulo.",
    categoryHint: "Solo se mira.",
    itemWord: { one: "movimiento", many: "movimientos" },
    anchor: "gastos-otros",
    readOnly: true,
  },
}

export const EXPENSE_WORLD_ORDER: ExpenseCategoryKind[] = ["fijo", "variable"]

export type ExpenseOperableKind = "fijo" | "variable"

export function isExpenseOperableKind(
  value: unknown,
): value is ExpenseOperableKind {
  return value === "fijo" || value === "variable"
}
