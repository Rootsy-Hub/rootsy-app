export type ChatRootsyPlannerDomainCard = {
  id: string
  title: string
  what: string
  invariant: string
  list: string
  row: string
  write: string
}

export const CHAT_ROOTSY_PLANNER_COLLECTION_KEYS = [
  "members",
  "employees",
  "roles",
  "articles",
  "clients",
  "suppliers",
  "services",
  "recipes",
  "promotions",
  "categories",
  "parties",
  "accounts",
  "items",
  "rows",
  "results",
  "rankings",
  "checks",
  "invoices",
  "entries",
] as const

export const CHAT_ROOTSY_PLANNER_DOMAIN_RULE =
  "Un viaje = el paquete de ofertas de ahora, no el plan entero. GET de consulta → confirm (corre, sin elegir). GET de un cambio singular con varios parecidos → confirm_one (eligen uno). GET de un conjunto de cambio → confirm_many (eligen uno, varios o todos). Write ya atado → confirm (modal). En el siguiente viaje usá ids y valores de resultados. Endpoints distintos = ofertas distintas. No escribas contra la invariante."

export const CHAT_ROOTSY_PLANNER_DOMAIN_CARDS: readonly ChatRootsyPlannerDomainCard[] =
  [
    {
      id: "articulos",
      title: "Artículos",
      what: "Ficha del catálogo. No es venta, margen ni stock valorizado del período.",
      invariant:
        "Se identifica por id. GET de cambio singular con q ambiguo → confirm_one. GET de conjunto → confirm_many. Consulta o write ya atado → confirm. En el siguiente viaje usá el id de resultados. isActive=false no se vende; igual se puede PATCH.",
      list: "GET /articles?q=nombre&pageSize=20",
      row: "id, name, salePrice, iva, isActive, stockOnHand, categoryId",
      write:
        "PATCH /articles/:articleId body parcial {salePrice}|{name}|{iva}|{isActive}. POST crea ficha completa. DELETE pide confirmación en el chat; la app manda confirmationTyped. No lo pongas en el body.",
    },
    {
      id: "categorias",
      title: "Categorías de artículos",
      what: "Árbol de categorías del catálogo. No es ventas por rubro.",
      invariant: "Una categoría = id. GET singular ambiguo → confirm_one. GET conjunto → confirm_many. Write ya atado → confirm.",
      list: "GET /categories",
      row: "id, name, flags de visibilidad",
      write:
        "POST /categories. PATCH /categories/:categoryId. DELETE /categories/:categoryId. Layout: PATCH /categories/layout.",
    },
    {
      id: "listas",
      title: "Listas de precios",
      what: "Listas del local. El precio de un artículo vive en articles.listPrices.",
      invariant: "Una lista = id. El monto de un artículo se cambia en el artículo, no acá.",
      list: "GET /price-lists",
      row: "id, name",
      write: "POST /price-lists. PATCH /price-lists/:priceListId. DELETE /price-lists/:priceListId.",
    },
    {
      id: "clientes",
      title: "Clientes",
      what: "Ficha de cliente. Quién debe es current-accounts. Ranking es statistics/clients.",
      invariant: "Uno = id. GET singular ambiguo → confirm_one. GET conjunto → confirm_many. Write ya atado → confirm. isActive=false no opera; se puede PATCH.",
      list: "GET /clients?q=nombre&pageSize=20",
      row: "id, name, isActive, taxId, email, lastSaleAt",
      write:
        "PATCH /clients/:clientId body parcial {name}|{isActive}|{email}|{taxId}. POST crea. DELETE pide confirmación en el chat; la app manda confirmationTyped.",
    },
    {
      id: "proveedores",
      title: "Proveedores",
      what: "Ficha de proveedor. Deudas: current-accounts direction=payable.",
      invariant: "Uno = id. GET singular ambiguo → confirm_one. GET conjunto → confirm_many. Write ya atado → confirm.",
      list: "GET /suppliers/table?q=nombre o GET /suppliers?q= (autocomplete, tope 8)",
      row: "id, name, isActive, taxId",
      write:
        "PATCH /suppliers/:supplierId body parcial {name}|{isActive}. POST crea. DELETE pide confirmación en el chat; la app manda confirmationTyped.",
    },
    {
      id: "recetas",
      title: "Recetas",
      what: "Catálogo de recetas / platos. No es producción del período.",
      invariant: "Una receta = recipeId. GET singular ambiguo → confirm_one. GET conjunto → confirm_many. Write ya atado → confirm.",
      list: "GET /recipes?q=nombre",
      row: "id, name, salePrice, isActive, categoryId",
      write:
        "PATCH /recipes/:recipeId body parcial {salePrice}|{name}|{isActive}. POST crea. DELETE pide confirmación en el chat; la app manda confirmationTyped. Categorías: /recipe-categories.",
    },
    {
      id: "promociones",
      title: "Promociones",
      what: "Promos del catálogo. No calcula impacto en ventas.",
      invariant: "Una promo = promotionId. GET singular ambiguo → confirm_one. GET conjunto → confirm_many. Write ya atado → confirm.",
      list: "GET /promotions?q=nombre",
      row: "id, name, isActive, promotionType",
      write:
        "PATCH /promotions/:promotionId body parcial {isActive}|{name}. POST crea. DELETE pide confirmación en el chat; la app manda confirmationTyped.",
    },
    {
      id: "servicios",
      title: "Servicios",
      what: "Catálogo de servicios. statistics/services está vacío. Cargos: operations view=services.",
      invariant: "Uno = serviceId. GET singular ambiguo → confirm_one. GET conjunto → confirm_many. Write ya atado → confirm.",
      list: "GET /services?q=nombre",
      row: "id, name, isActive, categoryId",
      write:
        "PATCH /services/:serviceId body parcial {name}|{isActive}|{defaultPrice}. POST crea. DELETE pide confirmación en el chat; la app manda confirmationTyped. Categorías: /service-categories.",
    },
    {
      id: "rrhh",
      title: "RRHH",
      what: "Empleado = persona laboral (fichaje, sueldo). Miembro = acceso a Rootsy + rol. Rol = permiso del sistema.",
      invariant:
        "El rol de Rootsy solo existe si el miembro está activo (isActive=true). El inactivo no recibe PATCH de rol: se ignora o se reactiva. Si hay un solo miembro activo que matchea el nombre, ese es. GET singular ambiguo → confirm_one. GET conjunto → confirm_many. Write ya atado → confirm. employeeId no es memberUserId.",
      list: "GET /hr → members[], roles[], employees[]",
      row: "members: userId, firstName, lastName, roleId, roleDisplayName, isActive. roles: id, name, displayName. employees: id, firstName, lastName, userId, leftAt",
      write:
        "Cambiar rol (el botón de RRHH): PATCH /hr/members/:memberUserId/role body {roleId} del roles[].id. Desactivar/reactivar: POST .../deactivate|reactivate. Ficha laboral: PATCH /hr/employees/:employeeId. Invitar: POST /hr/invitations {email,roleId}.",
    },
    {
      id: "cajas",
      title: "Cajas",
      what: "Turnos y arqueos. No es “cuánto hay en caja” (eso es tesorería o 1.1.1.01).",
      invariant: "Una caja = cashRegisterId. Un turno abierto es una sesión.",
      list: "GET /cash-registers. Totales de arqueos: GET /cash-registers/period/totals?from&to",
      row: "id, name, isActive, sesión abierta si hay",
      write:
        "PATCH /cash-registers/:cashRegisterId {name}|{isActive}. Abrir: POST .../sessions. Cerrar: POST .../sessions/:id/close. Movimiento: POST .../movements.",
    },
    {
      id: "tesoreria",
      title: "Tesorería",
      what: "Dinero operativo (caja, banco, plataformas). Distinto de caja-turno y de Caja contable 1.1.1.01.",
      invariant: "Una cuenta = treasuryAccountId. isActive=false no opera.",
      list: "GET /treasury o GET /treasury/balances (saldos ahora). Período: /treasury/period/totals",
      row: "accountId, name, balance, isActive",
      write:
        "POST /treasury crea cuenta. PATCH /treasury/:treasuryAccountId. Activar: body {isActive}. Hijos, extractos y conciliaciones en /treasury/:id/...",
    },
    {
      id: "inventario",
      title: "Inventario",
      what: "Stock físico, ubicaciones, vencimientos, ajustes. No es el saldo de Mercaderías 1.1.3.01.",
      invariant: "Un artículo de stock se busca por articleId o q. Ajustar exige el artículo.",
      list: "GET /inventory/rows?q= — view opcional, default pantry. red|overstock|purchase|recommend filtran. Artículos: /inventory/articles?q=. Resumen: /inventory/summary. Saldo: /inventory/balance?articleId=",
      row: "articleId, name, quantity, location",
      write:
        "Ajuste: POST /inventory/adjustments. Transferencia: POST /inventory/transfers. Ubicación: POST /inventory/locations. Vencimiento: PATCH /inventory/layers/:layerId/expiry.",
    },
    {
      id: "operaciones",
      title: "Operaciones",
      what: "Comprobantes (ventas, compras, mesas, mostrador, servicios). El total del período es reports/totals.",
      invariant: "Un comprobante = saleId o purchaseId. include=full trae líneas y es caro. No sumar la página.",
      list: "GET /operations?view=sales|purchases|services&from&to. Uno: /operations/sales/:saleId o /purchases/:purchaseId",
      row: "id, fecha, total, estado, party",
      write: "No hay PATCH de una venta cerrada desde el planificador. Anular o cobrar va por el flujo de operaciones, no por ficha.",
    },
    {
      id: "gastos",
      title: "Gastos",
      what: "Comprobantes de gasto del mes. El total del período es reports/totals kind=expenses.",
      invariant: "Un gasto = expenseId. Categoría ≠ gasto.",
      list: "GET /expenses?month&year. Categorías: GET /expense-categories",
      row: "id, amount, category, fecha",
      write:
        "POST /expenses crea. Pago: POST /expenses/:expenseId/payments. Anular: POST .../void. Categorías: POST/PATCH /expense-categories.",
    },
    {
      id: "corrientes",
      title: "Cuentas corrientes",
      what: "Quién debe y a quién se le debe. El saldo contable está en 1.1.2.01 y 2.1.1.01.",
      invariant: "Una ficha = partyId + direction. La página no trae el gran total.",
      list: "GET /current-accounts?direction=receivable|payable&q=. Uno: /current-accounts/parties/:partyId",
      row: "partyId, name, balance, overdueAmount",
      write:
        "Cobrar/pagar: POST /current-accounts/settle. Nota de crédito: POST /current-accounts/apply. Alta de cuenta: PATCH /current-accounts/enrollment.",
    },
    {
      id: "cheques",
      title: "Cheques",
      what: "Cheques recibidos o emitidos. No reemplaza current-accounts.",
      invariant: "Un cheque = checkId. GET singular ambiguo → confirm_one. GET conjunto → confirm_many. Write ya atado → confirm.",
      list: "GET /checks?direction=received|issued&q=",
      row: "id, amount, dueDate, status, party",
      write:
        "POST /checks crea. Depositar/acreditar/rechazar/anular: POST /checks/:checkId/deposit|clear|reject|void.",
    },
    {
      id: "facturas",
      title: "Facturas ARCA",
      what: "Comprobantes fiscales paginados. El total facturado es reports/totals kind=issued-invoices|received-invoices.",
      invariant: "Una factura = id. No sumar la página.",
      list: "GET /invoices?q=&dateFrom&dateTo",
      row: "id, cbteTipo, status, total, fecha",
      write: "Los puntos de venta ARCA se abordan en la ficha Puntos ARCA. No hay PATCH de una factura emitida.",
    },
    {
      id: "ordenes",
      title: "Órdenes de compra",
      what: "Pedidos a proveedores, no compras ya registradas.",
      invariant: "Una OC = orderId.",
      list: "GET /purchase-orders?q=&dateFrom&dateTo",
      row: "id, supplier, status, total",
      write: "POST /purchase-orders crea. DELETE /purchase-orders/:orderId.",
    },
    {
      id: "presupuestos",
      title: "Presupuestos",
      what: "Cotizaciones. No son ventas ni cuentan para el total vendido.",
      invariant: "Uno = quoteId.",
      list: "GET /quotes?q=&dateFrom&dateTo",
      row: "id, client, status, total",
      write: "POST /quotes crea. DELETE /quotes/:quoteId.",
    },
    {
      id: "produccion",
      title: "Producción",
      what: "Corridas de fabricación. statistics/manufacturing está vacío.",
      invariant: "Una corrida = run id. Receta ≠ corrida.",
      list: "GET /manufacturing?from&to. Recetas de producción: GET /manufacturing/recipes?q=",
      row: "runs, recetas, totales del rango",
      write: "POST /manufacturing crea una corrida.",
    },
    {
      id: "totales",
      title: "Totales operativos",
      what: "Números ya agregados. No listar operations para sumar.",
      invariant: "Un kind por llamada. from/to si el pedido trae fechas.",
      list: "GET /reports/totals?kind=sales|purchases|expenses|issued-invoices|received-invoices. Saldo de cuenta: GET /reports/ledger/totals?accountCode=. Tesorería ahora: GET /treasury/balances.",
      row: "kind, count, total o accountCode, closingBalance",
      write: "Solo lectura.",
    },
    {
      id: "reportes",
      title: "Reportes contables",
      what: "Estados del plan: resultado, balance, flujo, IVA, diario, mayor. Un estado, no un saldo suelto.",
      invariant: "Para una cuenta usá ledger/totals, no el mayor completo.",
      list: "GET /reports/income-statement|balance-sheet|cash-flow|vat-position|trial-balance|journal|ledger",
      row: "según el estado (totales, filas, asientos)",
      write: "Solo lectura. Buscar cuenta: GET /reports/chart-of-accounts/search?q=",
    },
    {
      id: "estadisticas",
      title: "Estadísticas",
      what: "KPIs y rankings. No es el mayor ni reports/totals. services y manufacturing están vacíos.",
      invariant:
        "summary = KPI vs período anterior. details = series y rankings. products/details trae todos los SKUs vendidos. La API usa clave a:/r:/p:; el chat deja items[].id = uuid de ficha solo si era a:. r: y p: no se atan a /articles.",
      list: "GET /statistics/:section/summary|details?from&to. section=sales|profitability|products|purchases|inventory|clients|suppliers|finance",
      row: "comparison, rankings, productTrendByKey (value=ventas, profit, count)",
      write: "Solo lectura.",
    },
    {
      id: "ajustes",
      title: "Ajustes del local",
      what: "Nombre, fiscal e imágenes del POP. No son cifras.",
      invariant: "Un solo settings por POP.",
      list: "GET /settings",
      row: "negocio, fiscal, imágenes",
      write: "PATCH /settings/business|/fiscal|/images con el campo que cambia.",
    },
    {
      id: "impresoras",
      title: "Impresoras",
      what: "Impresoras del local.",
      invariant: "Una = printerId.",
      list: "GET /printers",
      row: "id, name, isActive",
      write: "POST /printers. PATCH /printers/:printerId {name}|{isActive}. DELETE /printers/:printerId.",
    },
    {
      id: "comandas",
      title: "Estaciones de comanda",
      what: "Estaciones de cocina / barra.",
      invariant: "Una = comandaStationId.",
      list: "GET /comanda-stations",
      row: "id, name, isActive",
      write:
        "POST /comanda-stations. PATCH /comanda-stations/:comandaStationId. DELETE /comanda-stations/:comandaStationId.",
    },
    {
      id: "arca",
      title: "Puntos ARCA",
      what: "Puntos de venta fiscales.",
      invariant: "Uno = salePointId.",
      list: "GET /arca-sale-points",
      row: "id, number, status",
      write:
        "POST /arca-sale-points. PATCH /arca-sale-points/:salePointId. CSR: POST .../:salePointId/csr.",
    },
    {
      id: "muelle",
      title: "Muelle / dock",
      what: "Configuración del muelle de recepción.",
      invariant: "Un dock por POP.",
      list: "GET /dock",
      row: "configuración del muelle",
      write: "POST /dock. PATCH /dock. DELETE /dock.",
    },
    {
      id: "catalogo-venta",
      title: "Catálogo de venta",
      what: "Cómo está armada la venta (secciones, promos). No es el total vendido.",
      invariant: "Solo lectura de estructura.",
      list: "GET /sale/catalog",
      row: "secciones, promos, listas",
      write: "Solo lectura. Los precios se cambian en artículos o listas.",
    },
  ]

export function buildChatRootsyPlannerDomainCardsText(): string {
  const cards = CHAT_ROOTSY_PLANNER_DOMAIN_CARDS.map((card) =>
    [
      `## ${card.title}`,
      `Qué: ${card.what}`,
      `Invariante: ${card.invariant}`,
      `Listar: ${card.list}`,
      `Fila: ${card.row}`,
      `Escribir: ${card.write}`,
    ].join("\n"),
  ).join("\n\n")

  return [
    "FICHAS DE DOMINIO",
    CHAT_ROOTSY_PLANNER_DOMAIN_RULE,
    "Las tablas de Supabase solo confirman que el dato existe. La invariante de la ficha manda.",
    "",
    cards,
  ].join("\n")
}
