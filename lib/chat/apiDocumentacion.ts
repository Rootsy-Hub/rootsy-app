import {
  CHAT_ROOTSY_PLANNER_CATALOG_TEXT,
  CHAT_ROOTSY_POSTMAN_ROUTES,
  type ChatRootsyPostmanMethod,
} from "@/lib/chat/plannerCatalog.generated"
import {
  buildChatRootsyPlannerDomainCardsText,
  CHAT_ROOTSY_PLANNER_DOMAIN_RULE,
} from "@/lib/chat/plannerDomainCards"

export type ChatRootsyApiMethod = ChatRootsyPostmanMethod

export type ChatRootsyApiCost = "bajo" | "medio" | "alto" | "evitar"

export type ChatRootsyApiFilter = {
  name: string
  values?: string
  note?: string
}

export type ChatRootsyApiEndpoint = {
  id: string
  method: ChatRootsyApiMethod
  path: string
  solves: string
  returns: string
  filters: readonly ChatRootsyApiFilter[]
  cost: ChatRootsyApiCost
  useWhen: string
  doNot: string
}

export type ChatRootsyApiGroup = {
  id: string
  title: string
  intro: string
  endpoints: readonly ChatRootsyApiEndpoint[]
}

export type ChatRootsyApiAccount = {
  code: string
  name: string
  useWhen: string
}

const DATE = { name: "from", note: "YYYY-MM-DD. Inicio del período." }
const DATE_TO = { name: "to", note: "YYYY-MM-DD. Fin del período." }
const PAGE = { name: "page", values: "≥1", note: "Default 1." }
const PAGE_SIZE = {
  name: "pageSize",
  values: "hasta 50",
  note: "Tope 50. El runner recorta si viene más.",
}
const Q = { name: "q", note: "Búsqueda por nombre o código. Solo si hay un término." }

export const CHAT_ROOTSY_API_RULES = [
  "Solo method + path documentados. En el path dejá :popId; la app lo completa al pegar.",
  "GET: params en query. POST/PATCH: params de ruta en el path; el resto en body. DELETE: path; body solo si el endpoint lo pide.",
  "Los params de ruta (section, accountId, articleId) van en el path o en params, sin dos puntos.",
  "pageSize y limit máximo 50. page no tiene tope.",
  "Si el dato está en el JSON y no hay filtro (nombre de producto, etc.), pedí el endpoint igual. Rootsy lee la respuesta.",
  "Un listado paginado no incluye el gran total en la misma respuesta.",
  "statistics/services y statistics/manufacturing son placeholder vacío. Los recursos reales son /services, operations?view=services y /manufacturing.",
] as const

export const CHAT_ROOTSY_API_ACCOUNTS: readonly ChatRootsyApiAccount[] = [
  { code: "1.1.1.01", name: "Caja", useWhen: "Saldo contable de caja. No es si el turno está abierto." },
  { code: "1.1.1.02", name: "Bancos", useWhen: "Saldo contable de bancos." },
  { code: "1.1.1.03", name: "Tarjetas y plataformas a liquidar", useWhen: "Plata todavía no acreditada." },
  { code: "1.1.2.01", name: "Cuentas por Cobrar", useWhen: "Saldo contable a cobrar. El detalle por cliente es current-accounts." },
  { code: "1.1.3.01", name: "Mercaderías", useWhen: "Valor de mercadería. No recorrer stock ni capas FIFO." },
  { code: "1.1.3.02", name: "Productos Terminados", useWhen: "Valor de PT. Mismo criterio: saldo, no recálculo." },
  { code: "1.1.3.03", name: "Materias Primas", useWhen: "Valor de MP." },
  { code: "1.1.3.04", name: "Insumos", useWhen: "Valor de insumos." },
  { code: "2.1.1.01", name: "Proveedores", useWhen: "Saldo contable a pagar. El detalle por proveedor es current-accounts." },
  { code: "4.1.1.01", name: "Ventas — comercio", useWhen: "Ingresos de un canal. Para el total vendido preferí reports/totals." },
  { code: "5.1.1.01", name: "Costo de ventas", useWhen: "Costo del período. No reconstruirlo desde artículos." },
]

const STAT_FILTERS: readonly ChatRootsyApiFilter[] = [
  DATE,
  DATE_TO,
  { name: "prevFrom", note: "Inicio del período anterior para comparar. Si no viene, la API lo calcula." },
  { name: "prevTo", note: "Fin del período anterior." },
  { name: "channel", note: "Canal de venta, si el objetivo lo pide." },
  { name: "supplier", note: "Proveedor, si el objetivo lo pide." },
]

export const CHAT_ROOTSY_API_GROUPS: readonly ChatRootsyApiGroup[] = [
  {
    id: "totales",
    title: "Totales y saldos",
    intro:
      "Números ya agregados del POP: totales operativos (ventas, compras, gastos, facturas), saldos del mayor, tesorería operativa y arqueos cerrados. No son rankings ni comprobantes sueltos.",
    endpoints: [
      {
        id: "reports_totals",
        method: "GET",
        path: "/v1/pops/:popId/reports/totals",
        solves: "Cuánto se vendió, compró o gastó en un período, con cantidad de comprobantes.",
        returns: "kind, count, total. Solo columnas de importe.",
        filters: [
          {
            name: "kind",
            values: "sales|purchases|expenses|issued-invoices|received-invoices",
            note: "Obligatorio. Un kind por llamada.",
          },
          DATE,
          DATE_TO,
        ],
        cost: "bajo",
        useWhen: "“cuánto se vendió / compró / gastó” en un recorte de fechas.",
        doNot: "No listar operations ni invoices para sumar. No usar statistics si solo hace falta el total.",
      },
      {
        id: "ledger_totals",
        method: "GET",
        path: "/v1/pops/:popId/reports/ledger/totals",
        solves: "Saldo de una cuenta del plan, con debe/haber del período.",
        returns: "accountCode, accountName, closingBalance, totalDebit, totalCredit, nature.",
        filters: [
          { name: "accountCode", note: "Obligatorio. Ej. 1.1.3.01 Mercaderías." },
          DATE,
          DATE_TO,
        ],
        cost: "bajo",
        useWhen:
          "Valor de un rubro: mercadería, caja, bancos, proveedores, IVA. También diferencia de saldo entre períodos (dos llamadas o from/to).",
        doNot:
          "No recorrer inventory/ledger (capas FIFO), inventory/rows ni articles para valorizar. No pedir el mayor completo.",
      },
      {
        id: "reports_summaries",
        method: "GET",
        path: "/v1/pops/:popId/reports/summaries",
        solves: "Totales por rubro contable: activo, pasivo, ingresos, costos, gastos.",
        returns: "label, total por rubro.",
        filters: [DATE, DATE_TO],
        cost: "medio",
        useWhen: "Una mirada de conjunto del plan, sin bajar a cada cuenta.",
        doNot: "No reemplaza el saldo de una cuenta puntual. Para una sola cuenta usá ledger/totals.",
      },
      {
        id: "treasury_balances",
        method: "GET",
        path: "/v1/pops/:popId/treasury/balances",
        solves: "Saldos operativos actuales de tesorería (caja, banco, plataformas) y pendientes.",
        returns: "accountId, name, balance, pendientes por cuenta.",
        filters: [],
        cost: "bajo",
        useWhen: "“cuánto hay en caja/banco/tesorería ahora”.",
        doNot:
          "No es el estado de resultados. No uses cash-registers para el dinero: eso solo dice si el turno está abierto. El saldo contable de Caja es 1.1.1.01.",
      },
      {
        id: "treasury_period_totals",
        method: "GET",
        path: "/v1/pops/:popId/treasury/period/totals",
        solves: "Cierre, entradas y salidas de tesorería en un período.",
        returns: "closingBalance, periodIn, periodOut por cuenta madre. Sin pendientes.",
        filters: [DATE, DATE_TO],
        cost: "bajo",
        useWhen: "Movimiento de tesorería del mes o de un rango, no el detalle del extracto.",
        doNot: "No pedir treasury/:id/movements para obtener el total. No confundir con income-statement.",
      },
      {
        id: "cash_period_totals",
        method: "GET",
        path: "/v1/pops/:popId/cash-registers/period/totals",
        solves: "Totales de arqueos cerrados: cobrado, diferencia, cantidad de cierres.",
        returns: "totales del período de cajas.",
        filters: [DATE, DATE_TO],
        cost: "bajo",
        useWhen: "Resultado de arqueos cerrados en un rango.",
        doNot: "No es el saldo de tesorería ni el de la cuenta Caja.",
      },
    ],
  },
  {
    id: "estadisticas",
    title: "Estadísticas",
    intro:
      "Capa analítica por sección. Summary = KPIs vs el período anterior. Details = series, rankings y mapas de esa sección. No es el mayor ni reports/totals. Secciones: sales (ventas del período), profitability (resultado operativo estadístico; no es income-statement), products (productos vendidos en el período; details trae todos los SKUs, ver abajo), purchases (compras), inventory (stock físico valorizado; no es 1.1.3.01), clients, suppliers, finance (flujo de tesorería estadístico; no es cash-flow contable), services y manufacturing (vacíos).",
    endpoints: [
      {
        id: "statistics_summary",
        method: "GET",
        path: "/v1/pops/:popId/statistics/:section/summary",
        solves: "KPIs de una sección, contra el período anterior.",
        returns: "comparison (value, previousValue, delta), title. Cambia según la sección.",
        filters: [
          {
            name: "section",
            values:
              "sales|profitability|products|purchases|inventory|clients|suppliers|finance|services|manufacturing",
            note: "services y manufacturing son placeholder vacío.",
          },
          ...STAT_FILTERS,
        ],
        cost: "medio",
        useWhen:
          "“cómo viene el mes vs el anterior”, rentabilidad operativa, resumen de productos/compras/clientes/proveedores/finanzas.",
        doNot:
          "inventory no es el valor contable de mercadería (eso es 1.1.3.01). finance no es el estado de resultados. services y manufacturing están vacíos: servicios van a operations view=services; producción va a GET /manufacturing. No uses details si el summary alcanza.",
      },
      {
        id: "statistics_details",
        method: "GET",
        path: "/v1/pops/:popId/statistics/:section/details",
        solves: "Evolución, rankings y gráficos de la sección.",
        returns:
          "El shape cambia por sección. En products no hay q ni articleId. rankings = top 10 por ganancia {rank, id, label, value=profit, secondaryValue=cantidad}. productSalesRankings = top 10 por participación {rank, id, label, value=%, secondaryValue=ventas}. productTrendOptions = TODOS los productos vendidos del período {key, label}. productTrendByKey[key] = serie diaria {label, value=ventas, count=unidades, profit}; costo = value-profit; margen = profit/value. Otras secciones: evolution, rankings, segments, heatmaps.",
        filters: [
          {
            name: "section",
            values: "mismas que summary",
            note: "products/details tiene ventas, costo, ganancia y margen por SKU del período.",
          },
          ...STAT_FILTERS,
        ],
        cost: "alto",
        useWhen:
          "Más vendidos, margen de esos productos, evolución diaria/semanal, ranking de clientes o proveedores. Pasá from/to si el pedido trae fechas.",
        doNot:
          "No listar articles ni operations para armar un ranking. No uses this_month si el pedido es un rango (5 al 8 de agosto).",
      },
    ],
  },
  {
    id: "reportes",
    title: "Reportes contables",
    intro: "Estados del plan de cuentas: resultado, sumas y saldos, balance, flujo, IVA, diario y mayor. Un estado completo, no un saldo suelto.",
    endpoints: [
      {
        id: "income_statement",
        method: "GET",
        path: "/v1/pops/:popId/reports/income-statement",
        solves: "Estado de resultados: ingresos, costos, gastos, resultado neto.",
        returns: "totalIngresos, totalCostos, totalGastos, resultadoNeto, secciones.",
        filters: [DATE, DATE_TO],
        cost: "medio",
        useWhen: "“ganó o perdió el negocio”, resultado del mes/período.",
        doNot: "No sumar sales + expenses a mano. No mezclar con statistics/profitability (es otra mirada).",
      },
      {
        id: "trial_balance",
        method: "GET",
        path: "/v1/pops/:popId/reports/trial-balance",
        solves: "Sumas y saldos de todas las cuentas.",
        returns: "filas por cuenta + totales.",
        filters: [DATE, DATE_TO],
        cost: "alto",
        useWhen: "Hace falta el plan completo con saldos.",
        doNot: "Para una cuenta, ledger/totals. Para rubros, summaries.",
      },
      {
        id: "balance_sheet",
        method: "GET",
        path: "/v1/pops/:popId/reports/balance-sheet",
        solves: "Balance general a una fecha.",
        returns: "activo, pasivo, patrimonio, totales.",
        filters: [{ name: "asOf", note: "YYYY-MM-DD. Fecha de corte." }],
        cost: "alto",
        useWhen: "Situación patrimonial a una fecha.",
        doNot: "Para un solo rubro (mercadería, caja) usá ledger/totals.",
      },
      {
        id: "cash_flow",
        method: "GET",
        path: "/v1/pops/:popId/reports/cash-flow",
        solves: "Flujo de caja contable (cuentas 1.1.1.*).",
        returns: "entradas y salidas de efectivo del período.",
        filters: [DATE, DATE_TO],
        cost: "alto",
        useWhen: "Flujo contable de efectivo. Distinto de tesorería operativa.",
        doNot: "Para “cuánto hay ahora” usá treasury/balances. Para movimiento operativo, treasury/period/totals.",
      },
      {
        id: "vat_position",
        method: "GET",
        path: "/v1/pops/:popId/reports/vat-position",
        solves: "Posición IVA (crédito 1.1.2.* vs débito 2.1.2.*).",
        returns: "saldos IVA del período.",
        filters: [DATE, DATE_TO],
        cost: "medio",
        useWhen: "Posición de IVA del período.",
        doNot: "No reconstruir IVA desde invoices.",
      },
      {
        id: "journal_totals",
        method: "GET",
        path: "/v1/pops/:popId/reports/journal/totals",
        solves: "Debe/haber del libro diario, sin las filas.",
        returns: "totales de débito y crédito del período.",
        filters: [DATE, DATE_TO],
        cost: "bajo",
        useWhen: "Control de que el diario cierra. No para explicar el negocio.",
        doNot: "No pedir /journal si solo hace falta el total.",
      },
      {
        id: "journal",
        method: "GET",
        path: "/v1/pops/:popId/reports/journal",
        solves: "Libro diario paginado.",
        returns: "asientos del período.",
        filters: [DATE, DATE_TO, PAGE, PAGE_SIZE],
        cost: "alto",
        useWhen: "Hay que ver asientos concretos.",
        doNot: "Totales en /journal/totals. Líneas de un asiento: /journal/:entryId/lines.",
      },
      {
        id: "ledger",
        method: "GET",
        path: "/v1/pops/:popId/reports/ledger",
        solves: "Mayor paginado de una cuenta.",
        returns: "movimientos con runningBalance.",
        filters: [
          { name: "accountCode", note: "Obligatorio." },
          DATE,
          DATE_TO,
          PAGE,
          PAGE_SIZE,
        ],
        cost: "alto",
        useWhen: "Detalle de movimientos de una cuenta ya identificada.",
        doNot: "El saldo va en /ledger/totals. No uses esto para el valor de mercadería.",
      },
      {
        id: "chart_search",
        method: "GET",
        path: "/v1/pops/:popId/reports/chart-of-accounts/search",
        solves: "Autocomplete de cuentas del plan.",
        returns: "code, name de coincidencias.",
        filters: [{ name: "q", note: "Texto a buscar." }],
        cost: "bajo",
        useWhen: "No sabés el código y necesitás ubicar la cuenta.",
        doNot: "Si el código ya está en el plan útil (1.1.3.01, etc.), no busques.",
      },
      {
        id: "chart_of_accounts",
        method: "GET",
        path: "/v1/pops/:popId/reports/chart-of-accounts",
        solves: "Plan de cuentas con saldo a una fecha.",
        returns: "todas las cuentas + saldo.",
        filters: [{ name: "asOf", note: "YYYY-MM-DD." }],
        cost: "alto",
        useWhen: "Hace falta el plan entero.",
        doNot: "Para una cuenta, ledger/totals o search.",
      },
    ],
  },
  {
    id: "tesoreria",
    title: "Tesorería",
    intro: "Dinero operativo: cuentas, extractos, pendientes POS/tarjeta. Distinto de caja (turno) y de Caja contable (1.1.1.01).",
    endpoints: [
      {
        id: "treasury_list",
        method: "GET",
        path: "/v1/pops/:popId/treasury",
        solves: "Cuentas madre, sin saldos.",
        returns: "id, name, tipo. Sin balance.",
        filters: [],
        cost: "bajo",
        useWhen: "Solo para saber qué cuentas existen, si no hay saldos.",
        doNot: "Para saldos usá /treasury/balances.",
      },
      {
        id: "treasury_period",
        method: "GET",
        path: "/v1/pops/:popId/treasury/period",
        solves: "Filas de tesorería del período + pendientes POS/tarjeta.",
        returns: "madres, pendientes, popInfo.",
        filters: [DATE, DATE_TO],
        cost: "medio",
        useWhen: "Reporte del período con pendientes. Si solo hace falta el total, /period/totals.",
        doNot: "No lo uses para el estado de resultados.",
      },
      {
        id: "treasury_get",
        method: "GET",
        path: "/v1/pops/:popId/treasury/:accountId",
        solves: "Página de una cuenta: hijas, funding. Sin movimientos.",
        returns: "cuenta, hijos, medios.",
        filters: [],
        cost: "medio",
        useWhen: "Ya tenés el accountId y necesitás el detalle de esa cuenta.",
        doNot: "Movimientos van en /:accountId/movements. KPIs en /:accountId/totals.",
      },
      {
        id: "treasury_account_totals",
        method: "GET",
        path: "/v1/pops/:popId/treasury/:accountId/totals",
        solves: "KPIs de una cuenta: saldo, período, hijos.",
        returns: "saldo, periodIn, periodOut.",
        filters: [DATE, DATE_TO],
        cost: "bajo",
        useWhen: "Totales de una cuenta ya identificada.",
        doNot: "No pidas el extracto para obtener el saldo.",
      },
      {
        id: "treasury_movements",
        method: "GET",
        path: "/v1/pops/:popId/treasury/:accountId/movements",
        solves: "Extracto de una cuenta en el período.",
        returns: "movimientos del extracto.",
        filters: [
          DATE,
          DATE_TO,
          { name: "related", note: "Ids de cuentas hijas, si hay que filtrar." },
        ],
        cost: "alto",
        useWhen: "Hay que ver movimientos concretos de una cuenta conocida.",
        doNot: "Para el total del período usá /totals.",
      },
      {
        id: "treasury_pending",
        method: "GET",
        path: "/v1/pops/:popId/treasury/:accountId/children/:childId/pending",
        solves: "Saldo pendiente POS o tarjeta a una fecha.",
        returns: "pendiente a asOf.",
        filters: [
          { name: "asOf", note: "YYYY-MM-DD." },
          { name: "role", values: "pos|card_payable" },
        ],
        cost: "medio",
        useWhen: "Cuánto falta acreditar o liquidar en una hija concreta.",
        doNot: "Requiere accountId y childId ya conocidos.",
      },
    ],
  },
  {
    id: "cajas",
    title: "Cajas",
    intro: "Turnos y arqueos. No es “cuánto hay en caja”.",
    endpoints: [
      {
        id: "cash_registers",
        method: "GET",
        path: "/v1/pops/:popId/cash-registers",
        solves: "Listado de cajas y si el turno está abierto. Sin cobros.",
        returns: "id, name, isOpen, meta del turno.",
        filters: [],
        cost: "bajo",
        useWhen: "“¿está abierta la caja?”.",
        doNot: "El dinero está en treasury/balances o en 1.1.1.01.",
      },
      {
        id: "cash_open_totals",
        method: "GET",
        path: "/v1/pops/:popId/cash-registers/open-totals",
        solves: "Teórico y cobros de turnos abiertos.",
        returns: "totales de turnos abiertos.",
        filters: [],
        cost: "medio",
        useWhen: "Cuánto lleva cobrado el turno abierto.",
        doNot: "No es el saldo de tesorería.",
      },
      {
        id: "cash_period",
        method: "GET",
        path: "/v1/pops/:popId/cash-registers/period",
        solves: "Filas de arqueos cerrados del período.",
        returns: "arqueos + popInfo.",
        filters: [DATE, DATE_TO],
        cost: "medio",
        useWhen: "Listar cierres. El total va en /period/totals.",
        doNot: "No sumar filas si solo hace falta el total.",
      },
      {
        id: "cash_register_get",
        method: "GET",
        path: "/v1/pops/:popId/cash-registers/:registerId",
        solves: "Sesiones y movimientos de una caja, sin cobros por turno.",
        returns: "sesiones, movimientos.",
        filters: [],
        cost: "alto",
        useWhen: "Detalle de una caja conocida.",
        doNot: "KPIs de cobros: /:registerId/totals. Arqueo: /sessions/:sessionId/arqueo.",
      },
    ],
  },
  {
    id: "corrientes",
    title: "Cuentas corrientes",
    intro:
      "Saldos por parte (cliente o proveedor): balance, vencido, aging. El listado pagina filas y no incluye un gran total. El saldo contable de CxC es 1.1.2.01 y el de Proveedores es 2.1.1.01.",
    endpoints: [
      {
        id: "current_accounts",
        method: "GET",
        path: "/v1/pops/:popId/current-accounts",
        solves: "Partes con saldo: clientes a cobrar o proveedores a pagar.",
        returns: "id, name, balance, overdueAmount, openCount, aging. Paginado.",
        filters: [
          { name: "direction", values: "receivable|payable", note: "Obligatorio para no mezclar." },
          { name: "aging", values: "all|current|d1_30|d31_60|d61_plus" },
          { name: "sort", values: "party_name|credit_limit|term_days|open_count|overdue|balance" },
          { name: "ord", values: "asc|desc" },
          Q,
          PAGE,
          PAGE_SIZE,
        ],
        cost: "medio",
        useWhen: "Deudas a proveedores, quién nos debe, vencidos. sort=overdue para lo más urgente.",
        doNot:
          "No hay gran total en la respuesta. El saldo contable de Proveedores es 2.1.1.01 y el de CxC es 1.1.2.01. No listar purchases ni clients para armar deudas.",
      },
      {
        id: "current_account_party",
        method: "GET",
        path: "/v1/pops/:popId/current-accounts/parties/:partyId",
        solves: "Extracto y comprobantes abiertos de una parte.",
        returns: "partyName, balance, openDocuments, overdueAmount, ledger.",
        filters: [{ name: "direction", values: "receivable|payable" }],
        cost: "alto",
        useWhen: "Ya conocés el partyId (vino del listado) y hace falta el detalle.",
        doNot: "No lo uses como primer paso para “pagos a proveedores”.",
      },
    ],
  },
  {
    id: "inventario",
    title: "Inventario",
    intro:
      "Stock físico: cantidades, alertas, depósitos, vencimientos y capas FIFO. El saldo contable de Mercaderías es 1.1.3.01, no un recálculo de estas filas.",
    endpoints: [
      {
        id: "inventory_summary",
        method: "GET",
        path: "/v1/pops/:popId/inventory/summary",
        solves: "Conteos, alertas, depósitos slim y vencimientos. Sin filas de artículos.",
        returns: "articleCount, articlesWithStock, redCount, belowMinCount. Puede incluir un inventoryValue leído del mayor, pero recorre artículos.",
        filters: [],
        cost: "alto",
        useWhen: "Alertas de stock, cuántos artículos tienen falta o vencen.",
        doNot: "Para el valor de mercadería usá ledger/totals accountCode=1.1.3.01. Es más barato y es la fuente oficial.",
      },
      {
        id: "inventory_rows",
        method: "GET",
        path: "/v1/pops/:popId/inventory/rows",
        solves: "Filas de stock paginadas, por vista.",
        returns: "articleId, quantity, attention. Máx. 50.",
        filters: [
          { name: "view", values: "pantry|red|overstock|purchase|recommend", note: "Obligatorio." },
          { name: "attention", values: "negative|empty|below_min", note: "Solo tiene sentido con view=red." },
          Q,
          PAGE,
          PAGE_SIZE,
        ],
        cost: "alto",
        useWhen: "Qué artículos están en falta, sobre stock o para comprar.",
        doNot: "No existe GET /inventory. No uses esto para valorizar. No listar articles.",
      },
      {
        id: "inventory_balance",
        method: "GET",
        path: "/v1/pops/:popId/inventory/balance",
        solves: "Stock on-hand de un artículo, opcionalmente por depósito.",
        returns: "cantidad en mano.",
        filters: [
          { name: "articleId", note: "Obligatorio." },
          { name: "locationId", note: "Opcional." },
        ],
        cost: "bajo",
        useWhen: "Cuánto hay de un artículo ya identificado.",
        doNot: "No sirve para el valor total del inventario.",
      },
      {
        id: "inventory_locations",
        method: "GET",
        path: "/v1/pops/:popId/inventory/locations",
        solves: "Depósitos con stock y valor.",
        returns: "depósitos, cantidades, valor.",
        filters: [],
        cost: "medio",
        useWhen: "Stock por depósito.",
        doNot: "No es el saldo oficial de Mercaderías.",
      },
      {
        id: "inventory_expiry",
        method: "GET",
        path: "/v1/pops/:popId/inventory/expiry",
        solves: "Capas con remaining > 0, filtrables por alerta de vencimiento.",
        returns: "articleId, expiryDate, quantity. Paginado.",
        filters: [
          { name: "filter", values: "alert|dated|none" },
          Q,
          PAGE,
          PAGE_SIZE,
        ],
        cost: "alto",
        useWhen: "Qué vence pronto.",
        doNot: "No uses kind=layers del ledger para un total.",
      },
      {
        id: "inventory_movements",
        method: "GET",
        path: "/v1/pops/:popId/inventory/movements",
        solves: "Movimientos de stock paginados.",
        returns: "movimientos, hasMore. Máx. 50.",
        filters: [PAGE, PAGE_SIZE],
        cost: "alto",
        useWhen: "Historial de movimientos.",
        doNot: "No para stock actual ni para valor.",
      },
      {
        id: "inventory_ledger",
        method: "GET",
        path: "/v1/pops/:popId/inventory/ledger",
        solves: "Capas FIFO o imputaciones, paginado.",
        returns: "layers o allocations. Máx. 50.",
        filters: [
          { name: "kind", values: "layers|allocations" },
          PAGE,
          PAGE_SIZE,
        ],
        cost: "evitar",
        useWhen: "Solo si el objetivo es una capa o lote concreto.",
        doNot: "Nunca para el valor de mercadería, ni para stock total, ni para un ranking.",
      },
      {
        id: "inventory_articles",
        method: "GET",
        path: "/v1/pops/:popId/inventory/articles",
        solves: "Buscar un artículo por nombre, SKU o barcode, para operar stock.",
        returns: "coincidencias cortas.",
        filters: [{ name: "q", note: "Obligatorio para que sirva." }],
        cost: "bajo",
        useWhen: "Ubicar el articleId de un nombre.",
        doNot: "No es el catálogo completo. Para el catálogo, articles con q.",
      },
    ],
  },
  {
    id: "operaciones",
    title: "Operaciones",
    intro: "Comprobantes individuales (ventas, compras, gastos, mesas, mostrador, servicios). Paginado. slim = cabecera; full = líneas. El total vendido/comprado/gastado del período vive en reports/totals.",
    endpoints: [
      {
        id: "operations",
        method: "GET",
        path: "/v1/pops/:popId/operations",
        solves: "Listado paginado de ventas, compras, gastos, mesas, mostrador o servicios.",
        returns: "filas slim (sin line_items) o full.",
        filters: [
          {
            name: "view",
            values: "sales|sales-report|tables|counter|purchases|expenses|services",
          },
          { name: "dateFrom", note: "YYYY-MM-DD." },
          { name: "dateTo", note: "YYYY-MM-DD." },
          Q,
          { name: "saleStatus", values: "completed|…", note: "Solo ventas." },
          { name: "fiscalOnly", values: "1" },
          { name: "include", values: "slim|full", note: "slim es el default y es más barato. full trae líneas." },
          { name: "sort", note: "Depende de la vista. En ventas, sold_at." },
          { name: "ord", values: "asc|desc" },
          PAGE,
          PAGE_SIZE,
        ],
        cost: "alto",
        useWhen: "Ver comprobantes. include=slim. pageSize chico.",
        doNot: "Nunca para “cuánto se vendió”. Eso es reports/totals. full es carísimo.",
      },
      {
        id: "operation_sale",
        method: "GET",
        path: "/v1/pops/:popId/operations/sales/:saleId",
        solves: "Una venta con contexto.",
        returns: "venta completa.",
        filters: [],
        cost: "medio",
        useWhen: "Ya tenés el saleId.",
        doNot: "No recorre ventas para un total.",
      },
      {
        id: "operation_purchase",
        method: "GET",
        path: "/v1/pops/:popId/operations/purchases/:purchaseId",
        solves: "Una compra con líneas.",
        returns: "compra + line_items.",
        filters: [],
        cost: "medio",
        useWhen: "Ya tenés el purchaseId.",
        doNot: "El total comprado es reports/totals kind=purchases.",
      },
    ],
  },
  {
    id: "gastos",
    title: "Gastos",
    intro: "Gastos del mes calendario (comprobantes + categorías). El total del período es reports/totals kind=expenses.",
    endpoints: [
      {
        id: "expenses_month",
        method: "GET",
        path: "/v1/pops/:popId/expenses",
        solves: "Gastos de un mes + categorías + progreso.",
        returns: "gastos, categorías, ledger de cuentas ‘otro’.",
        filters: [
          { name: "year", note: "Año. Ej. 2026." },
          { name: "month", note: "Mes 1-12." },
        ],
        cost: "medio",
        useWhen: "Desglose de gastos del mes.",
        doNot: "Para el total usá reports/totals. No listar expense-categories si no hace falta el árbol.",
      },
      {
        id: "expense_categories",
        method: "GET",
        path: "/v1/pops/:popId/expense-categories",
        solves: "Árbol de categorías de gasto.",
        returns: "categorías. Sin deleted_at por default.",
        filters: [
          { name: "kind", values: "variable|…" },
          { name: "includeDeleted", values: "true" },
        ],
        cost: "bajo",
        useWhen: "Qué categorías existen.",
        doNot: "No sirve para el total gastado.",
      },
    ],
  },
  {
    id: "catalogo",
    title: "Catálogo y fichas",
    intro: "Maestros del POP: artículos, categorías, listas, clientes, proveedores, recetas, promociones, servicios y catálogo de venta. Ficha, stock on-hand y precios actuales. No son ventas ni margen del período.",
    endpoints: [
      {
        id: "articles",
        method: "GET",
        path: "/v1/pops/:popId/articles",
        solves: "Listado de artículos con stockOnHand, costs y listPrices por fila.",
        returns: "filas paginadas.",
        filters: [
          PAGE,
          PAGE_SIZE,
          Q,
          { name: "soloActivos", values: "true" },
          { name: "soloInactivos", values: "true" },
          { name: "conDescuento", values: "true" },
          { name: "sinDescuento", values: "true" },
          { name: "conStock", values: "true" },
          { name: "sinStock", values: "true" },
          { name: "stockNegativo", values: "true" },
          { name: "ventaSinStock", values: "true" },
          { name: "categoryId" },
          { name: "itemKinds", values: "merchandise|…" },
          { name: "sort", values: "name|…" },
          { name: "ord", values: "asc|desc" },
        ],
        cost: "alto",
        useWhen: "Buscar o listar artículos del catálogo.",
        doNot: "No para más vendidos, margen, valor de stock ni totales. Cada fila trae costos: no lo uses como inventario valorizado.",
      },
      {
        id: "article_get",
        method: "GET",
        path: "/v1/pops/:popId/articles/:articleId",
        solves: "Un artículo: stock, costos, listas.",
        returns: "mismo shape que una fila del listado.",
        filters: [],
        cost: "bajo",
        useWhen: "Ficha de un artículo conocido.",
        doNot: "No es el margen oficial de estadísticas.",
      },
      {
        id: "categories",
        method: "GET",
        path: "/v1/pops/:popId/categories",
        solves: "Categorías de artículos.",
        returns: "id, name, flags de visibilidad.",
        filters: [
          { name: "itemKind", values: "merchandise|…" },
          { name: "showInSale", values: "true" },
          { name: "showInMenu", values: "true" },
          { name: "visible", values: "true" },
        ],
        cost: "bajo",
        useWhen: "Árbol de categorías.",
        doNot: "No para ventas por categoría: eso es statistics/products.",
      },
      {
        id: "price_lists",
        method: "GET",
        path: "/v1/pops/:popId/price-lists",
        solves: "Listas de precios.",
        returns: "id, name.",
        filters: [],
        cost: "bajo",
        useWhen: "Qué listas hay.",
        doNot: "Los precios de un artículo vienen en articles.",
      },
      {
        id: "clients",
        method: "GET",
        path: "/v1/pops/:popId/clients",
        solves: "Fichas de clientes. Incluye lastSaleAt, completedSalesCount, totalSpentArs.",
        returns: "listado paginado.",
        filters: [PAGE, PAGE_SIZE, Q, { name: "soloActivos", values: "true" }, { name: "withEmail", values: "true" }, { name: "withTaxId", values: "true" }, { name: "sort" }, { name: "ord", values: "asc|desc" }],
        cost: "medio",
        useWhen: "Buscar un cliente o su ficha.",
        doNot: "Quién nos debe es current-accounts direction=receivable. Ranking de clientes es statistics/clients.",
      },
      {
        id: "suppliers_table",
        method: "GET",
        path: "/v1/pops/:popId/suppliers/table",
        solves: "Listado de proveedores de la página.",
        returns: "filas paginadas.",
        filters: [PAGE, PAGE_SIZE, Q, { name: "soloActivos", values: "true" }, { name: "withEmail", values: "true" }, { name: "withTaxId", values: "true" }, { name: "sort" }, { name: "ord", values: "asc|desc" }],
        cost: "medio",
        useWhen: "Fichas de proveedores.",
        doNot: "Deudas: current-accounts direction=payable. Autocomplete corto: GET /suppliers?q=",
      },
      {
        id: "suppliers_search",
        method: "GET",
        path: "/v1/pops/:popId/suppliers",
        solves: "Autocomplete de proveedores activos (id, name). Tope 8.",
        returns: "pocas coincidencias.",
        filters: [{ name: "q", note: "Nombre o CUIT." }],
        cost: "bajo",
        useWhen: "Ubicar un supplierId.",
        doNot: "No es el listado de deudas.",
      },
      {
        id: "recipes",
        method: "GET",
        path: "/v1/pops/:popId/recipes",
        solves: "Listado de recetas.",
        returns: "filas paginadas.",
        filters: [PAGE, PAGE_SIZE, Q, { name: "soloActivos", values: "true" }, { name: "categoryId" }, { name: "sort" }, { name: "ord" }],
        cost: "medio",
        useWhen: "Catálogo de recetas.",
        doNot: "Estadísticas de fabricación no existen todavía.",
      },
      {
        id: "promotions",
        method: "GET",
        path: "/v1/pops/:popId/promotions",
        solves: "Listado de promociones.",
        returns: "filas paginadas.",
        filters: [
          PAGE,
          PAGE_SIZE,
          Q,
          { name: "soloActivos", values: "true" },
          { name: "promotionType" },
          { name: "sort" },
          { name: "ord", values: "asc|desc" },
        ],
        cost: "medio",
        useWhen: "Qué promociones hay.",
        doNot: "No calcula el impacto en ventas.",
      },
      {
        id: "sale_catalog",
        method: "GET",
        path: "/v1/pops/:popId/sale/catalog",
        solves: "Catálogo del punto de venta: secciones, promos y listas.",
        returns: "estructura para vender, no cifras del período.",
        filters: [],
        cost: "alto",
        useWhen: "Cómo está armada la venta (secciones, promos).",
        doNot: "No es el total vendido ni el ranking. Eso es reports/totals o statistics/products.",
      },
      {
        id: "services",
        method: "GET",
        path: "/v1/pops/:popId/services",
        solves: "Listado de servicios.",
        returns: "filas paginadas.",
        filters: [
          PAGE,
          PAGE_SIZE,
          Q,
          { name: "soloActivos", values: "true" },
          { name: "categoryId" },
          { name: "sort", values: "name" },
          { name: "ord", values: "asc|desc" },
        ],
        cost: "medio",
        useWhen: "Catálogo de servicios.",
        doNot: "statistics/services está vacío. Cargos vencidos: operations view=services.",
      },
    ],
  },
  {
    id: "produccion",
    title: "Producción",
    intro:
      "Workspace de fabricación: corridas, recetas y totales del período. statistics/manufacturing es un placeholder vacío.",
    endpoints: [
      {
        id: "manufacturing",
        method: "GET",
        path: "/v1/pops/:popId/manufacturing",
        solves: "Workspace de producción del período: corridas, recetas y totales producidos.",
        returns: "runs, recetas, totales del rango.",
        filters: [DATE, DATE_TO],
        cost: "medio",
        useWhen: "Qué se fabricó, costos de una corrida, producción del período.",
        doNot: "No pidas statistics/manufacturing. No reconstruyas producción desde inventory/ledger.",
      },
    ],
  },
  {
    id: "otros",
    title: "Cheques, facturas, órdenes y otros",
    intro: "Listados operativos. Totales de facturas: reports/totals kind=issued-invoices|received-invoices.",
    endpoints: [
      {
        id: "checks",
        method: "GET",
        path: "/v1/pops/:popId/checks",
        solves: "Cheques recibidos o emitidos.",
        returns: "filas paginadas: dueDate, amount, status.",
        filters: [
          PAGE,
          PAGE_SIZE,
          Q,
          { name: "direction", values: "received|issued" },
          { name: "status", values: "in_portfolio|…" },
          { name: "sort", values: "due_date|…" },
          { name: "ord", values: "asc|desc" },
        ],
        cost: "medio",
        useWhen: "Cheques a depositar o emitidos a vencer.",
        doNot: "No reemplaza current-accounts para “qué se le debe a proveedores”.",
      },
      {
        id: "invoices",
        method: "GET",
        path: "/v1/pops/:popId/invoices",
        solves: "Comprobantes ARCA paginados.",
        returns: "invoices_arca.",
        filters: [
          PAGE,
          PAGE_SIZE,
          Q,
          { name: "status", values: "authorized|…" },
          { name: "cbteTipo", note: "Tipo AFIP. recibo_x filtra Recibo X." },
          { name: "dateFrom" },
          { name: "dateTo" },
          { name: "sort", values: "cbte_fch" },
          { name: "ord", values: "asc|desc" },
        ],
        cost: "alto",
        useWhen: "Ver facturas. El total facturado es reports/totals.",
        doNot: "No sumar la página.",
      },
      {
        id: "purchase_orders",
        method: "GET",
        path: "/v1/pops/:popId/purchase-orders",
        solves: "Órdenes de compra (sin cancelled).",
        returns: "filas paginadas.",
        filters: [PAGE, PAGE_SIZE, Q, { name: "dateFrom" }, { name: "dateTo" }],
        cost: "medio",
        useWhen: "Pedidos a proveedores, no compras ya registradas.",
        doNot: "Compras hechas: reports/totals kind=purchases o operations view=purchases.",
      },
      {
        id: "quotes",
        method: "GET",
        path: "/v1/pops/:popId/quotes",
        solves: "Presupuestos (sin cancelled).",
        returns: "filas paginadas.",
        filters: [PAGE, PAGE_SIZE, Q, { name: "dateFrom" }, { name: "dateTo" }],
        cost: "medio",
        useWhen: "Presupuestos. No son ventas.",
        doNot: "No cuentan para el total vendido.",
      },
      {
        id: "hr_hub",
        method: "GET",
        path: "/v1/pops/:popId/hr",
        solves: "Hub de personas, roles e invitaciones.",
        returns: "empleados, miembros, roles.",
        filters: [{ name: "inviteBaseUrl", note: "Solo para armar invitaciones. No lo pidas para una pregunta de negocio." }],
        cost: "medio",
        useWhen: "Quién trabaja en el POP.",
        doNot: "No es sueldos pagados. Eso, si existe, es un gasto o un asiento.",
      },
      {
        id: "settings",
        method: "GET",
        path: "/v1/pops/:popId/settings",
        solves: "Ajustes del POP: negocio, fiscal, imágenes.",
        returns: "formulario de settings.",
        filters: [],
        cost: "bajo",
        useWhen: "Datos del negocio (nombre, fiscal).",
        doNot: "No para cifras.",
      },
    ],
  },
]

export const CHAT_ROOTSY_API_GAPS = [
  "current-accounts pagina filas: no hay un gran total a cobrar/pagar en esa respuesta. El saldo contable está en 1.1.2.01 y 2.1.1.01.",
  "statistics/services está vacío. El recurso de servicios es GET /services o operations?view=services.",
  "statistics/manufacturing está vacío. El recurso de producción es GET /manufacturing?from=&to=.",
  "Caja son tres cosas distintas: turno abierto (cash-registers), dinero operativo (treasury/balances), caja contable (1.1.1.01).",
  "statistics/inventory es stock físico × costo. No es el saldo de Mercaderías (1.1.3.01).",
] as const

export function getChatRootsyApiEndpoint(
  id: string,
): ChatRootsyApiEndpoint | undefined {
  const needle = id.trim()
  if (!needle) return undefined
  for (const group of CHAT_ROOTSY_API_GROUPS) {
    const found = group.endpoints.find((row) => row.id === needle)
    if (found) return found
  }
  return undefined
}

export function listChatRootsyApiEndpoints(): ChatRootsyApiEndpoint[] {
  return CHAT_ROOTSY_API_GROUPS.flatMap((group) => [...group.endpoints])
}

export function normalizeChatRootsyApiMethod(
  raw: unknown,
): ChatRootsyApiMethod | null {
  if (typeof raw !== "string") return null
  const method = raw.trim().toUpperCase()
  if (
    method === "GET" ||
    method === "POST" ||
    method === "PATCH" ||
    method === "PUT" ||
    method === "DELETE"
  ) {
    return method
  }
  return null
}

export function chatRootsyPostmanRouteId(
  method: ChatRootsyApiMethod,
  path: string,
): string {
  const rest = path
    .replace(/^\/v1\/pops\/:popId\/?/, "")
    .replaceAll("/", "_")
    .replaceAll(":", "")
  const verb = method.toLowerCase()
  if (verb === "get") return rest || "pop"
  return `${verb}_${rest || "pop"}`
}

function matchPathTemplate(
  pathname: string,
  template: string,
): Record<string, string> | null {
  const got = pathname.split("/").filter(Boolean)
  const tmpl = template.split("/").filter(Boolean)
  if (tmpl.length !== got.length) return null
  const pathParams: Record<string, string> = {}
  for (let index = 0; index < tmpl.length; index += 1) {
    const part = tmpl[index]
    const value = got[index]
    if (!part || !value) return null
    if (part.startsWith(":")) {
      if (part === ":popId") continue
      pathParams[part.slice(1)] = decodeURIComponent(value)
      continue
    }
    if (part !== value) return null
  }
  return pathParams
}

export function matchChatRootsyApiPath(
  rawPath: string,
  methodRaw?: unknown,
): { endpoint: ChatRootsyApiEndpoint; pathParams: Record<string, string> } | null {
  const trimmed = rawPath.trim()
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return null
  const pathname = trimmed.split("?")[0]?.replace(/\/+$/, "") ?? ""
  if (!pathname.startsWith("/v1/pops/")) return null
  const method = normalizeChatRootsyApiMethod(methodRaw) ?? "GET"

  if (method === "GET") {
    for (const endpoint of listChatRootsyApiEndpoints()) {
      const pathParams = matchPathTemplate(pathname, endpoint.path)
      if (pathParams) return { endpoint, pathParams }
    }
  }

  for (const route of CHAT_ROOTSY_POSTMAN_ROUTES) {
    if (route.method !== method) continue
    const pathParams = matchPathTemplate(pathname, route.path)
    if (!pathParams) continue
    return {
      endpoint: {
        id: chatRootsyPostmanRouteId(method, route.path),
        method,
        path: route.path,
        solves: `${method} ${route.path}`,
        returns: "",
        filters: [],
        cost: "medio",
        useWhen: "",
        doNot: "",
      },
      pathParams,
    }
  }
  return null
}

export const CHAT_ROOTSY_PLANNER_PROMPT_HEADER = `Sos el planificador de consultas de ROOTSY.
Recibís una necesidad y devolvé las llamadas de la API documentada (GET, POST, PATCH, DELETE). No conversás, no ejecutás y no inventás paths ni params.

La documentación describe qué es cada dominio y qué trae cada endpoint. Elegí vos. Si dos recursos se solapan, quedate con el más directo.

Armá el endpoint completo: method + path de la lista. En el path dejá :popId. Los params de ruta pueden ir interpolados en el path.
GET: params van en query.
POST/PATCH: params de ruta en el path; el resto en body.
DELETE: path; body solo si el endpoint lo pide.
Las tablas de Supabase confirman que el dato existe. La invariante de la ficha de dominio manda. No pidas SQL.
today viene en la entrada: si el período no trae año, usá ese.

Podés usar hasta 4 pasos para resolver el mismo data_request. Un paso = una respuesta tuya. La app ejecuta, pide permiso y, si pediste confirm_one, te devuelve solo el ítem elegido en resultados.

${CHAT_ROOTSY_PLANNER_DOMAIN_RULE}
impossible solo si ningún endpoint documentado sirve. Que no haya id en el primer paso no es impossibilidad: primero listá.
Si hay que cambiar varios ítems ya identificados (el pedido nombra varios, o viene acciones_sesion), GET con confirm — no confirm_one — y después el write de cada uno.
Si viene acciones_sesion y el pedido las deshace o las continúa, usá TODOS esos ítems. No te quedes con uno.
La app pega POST, PATCH y DELETE de las fichas.

Cada query lleva action: una frase corta para pedirle permiso a la persona, sin paths ni métodos. En un PATCH la app muestra ahora → después si el valor anterior está en resultados.
confirm: "confirm" para permitir la acción, "confirm_one" si el siguiente paso necesita que elijan un resultado.

Entrada:
{"today":"YYYY-MM-DD","message":"...","data_request":{"objective":"..."},"paso":1,"pasos_max":4,"resultados":[],"acciones_sesion":[]}

Salida, solo uno:
{"status":"ok","queries":[{"method":"GET","path":"/v1/pops/:popId/articles","params":{"q":"Agua mineral","pageSize":20},"action":"Buscar artículos que coincidan con Agua mineral","confirm":"confirm_one"}]}
{"status":"ok","queries":[{"method":"PATCH","path":"/v1/pops/:popId/articles/:articleId","params":{"articleId":"uuid"},"body":{"salePrice":3750},"action":"Actualizar el precio de Agua mineral 500 a $3750","confirm":"confirm"}]}
{"status":"done"}
{"status":"needs_clarification","question":"..."}
{"status":"impossible","reason":"..."}`

export function buildChatRootsyApiDocumentationPrompt(): string {
  const accounts = CHAT_ROOTSY_API_ACCOUNTS.map(
    (account) => `${account.code} ${account.name} — ${account.useWhen}`,
  ).join("\n")

  return [
    "REGLAS",
    ...CHAT_ROOTSY_API_RULES.map((rule, index) => `${index + 1}. ${rule}`),
    "",
    "CUENTAS DEL PLAN (Argentina v3)",
    accounts,
    "",
    "LÍMITES DEL DATO. Son hechos del recurso, no un pedido de impossible.",
    ...CHAT_ROOTSY_API_GAPS.map((gap) => `- ${gap}`),
    "",
    buildChatRootsyPlannerDomainCardsText(),
    "",
    CHAT_ROOTSY_PLANNER_CATALOG_TEXT.trim(),
  ].join("\n")
}

export function buildChatRootsyPlannerPrompt(): string {
  return `${CHAT_ROOTSY_PLANNER_PROMPT_HEADER}\n\n${buildChatRootsyApiDocumentationPrompt()}`
}
