export type SaleQuerySpecCall = {
  endpoint: string
  detail: string
  cache: string
}

export type SaleQuerySpecMoment = {
  title: string
  calls: SaleQuerySpecCall[]
}

export type SaleQuerySpecDomain = {
  domain: string
  moments: SaleQuerySpecMoment[]
}

export type SaleQuerySpecPlace = {
  place: string
  domains: SaleQuerySpecDomain[]
}

const CACHE_TANSTACK_24H = "TanStack · 24 h"
const CACHE_TANSTACK_24H_REFETCH_MOUNT = "TanStack · 24 h · refetch al montar"
const CACHE_TANSTACK_INDEXEDDB = "TanStack · IndexedDB · infinito"
const CACHE_NONE = "No"

/** Spec de consultas de Vender. Se completa a mano; el panel solo la muestra. */
export const SALE_QUERY_SPEC: readonly SaleQuerySpecPlace[] = [
  {
    place: "Página",
    domains: [
      {
        domain: "cash-registers",
        moments: [
          {
            title: "Al entrar",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/cash-registers/open-session",
                detail:
                  "Turno de caja abierto por el usuario. En paralelo con categories, articles (si hay categoryId), payment-context y comprobantes. Si no hay turno propio, session es null. No cae a cajas de otros. Tras un cobro rechazado por caja cerrada se invalida.",
                cache: CACHE_TANSTACK_24H_REFETCH_MOUNT,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    place: "Header",
    domains: [
      {
        domain: "quotes",
        moments: [
          {
            title: "Al crear un presupuesto",
            calls: [
              {
                endpoint: "POST /v1/pops/:popId/quotes",
                detail:
                  "Botón Crear presupuesto del header. Una pegada al confirmar el diálogo.",
                cache: CACHE_NONE,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    place: "Tablero",
    domains: [
      {
        domain: "categories",
        moments: [
          {
            title: "Al entrar",
            calls: [
              {
                endpoint:
                  "GET /v1/pops/:popId/categories?itemKind=merchandise&showInSale=true",
                detail:
                  "Rail de categorías de producto visibles en venta. En paralelo con articles (si hay categoryId en localStorage), payment-context, comprobantes y open-session. Queda en IndexedDB: F5 y pestaña nueva reusan el resultado hasta invalidar.",
                cache: CACHE_TANSTACK_INDEXEDDB,
              },
            ],
          },
        ],
      },
      {
        domain: "articles",
        moments: [
          {
            title: "Al entrar",
            calls: [
              {
                endpoint:
                  "GET /v1/pops/:popId/articles?itemKinds=merchandise&soloActivos=true&conStock=true&categoryId=:id&page=1&pageSize=50",
                detail:
                  "Si localStorage tiene la última categoría, va en paralelo con categories. Si no, espera categories, guarda la primera en localStorage y recién ahí pega. IndexedDB por categoryId: volver a esa categoría no pega.",
                cache: CACHE_TANSTACK_INDEXEDDB,
              },
            ],
          },
          {
            title: "Al scrollear",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/articles",
                detail:
                  "Siguiente page cuando el listado se acerca al fondo (~240px). Mismos filtros: producto, activo, con stock, categoryId. Se repite hasta totalCount. Las páginas quedan en IndexedDB con la categoría.",
                cache: CACHE_TANSTACK_INDEXEDDB,
              },
            ],
          },
          {
            title: "Al buscar",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/articles?q=",
                detail:
                  "Al tipear, espera 300 ms y pega con q. Producto, activo, con stock. Sin categoryId. Siempre va a red.",
                cache: CACHE_NONE,
              },
            ],
          },
          {
            title: "Al cambiar de categoría",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/articles",
                detail:
                  "Guarda el categoryId en localStorage. Si esa categoría ya está en IndexedDB, no pega; si no, page 1 y se persiste.",
                cache: CACHE_TANSTACK_INDEXEDDB,
              },
            ],
          },
        ],
      },
      {
        domain: "sale",
        moments: [
          {
            title: "Al entrar",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/sale/catalog",
                detail:
                  "Sigue corriendo por promos, caps y sesión de caja embebida. Ya no alimenta el rail ni el grid.",
                cache: CACHE_TANSTACK_24H,
              },
            ],
          },
          {
            title: "Al escanear",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/sale/catalog/scan",
                detail:
                  "Enter en el input. Si el código ya está en lo visible, cero red. Si no, una pegada por Enter.",
                cache: CACHE_NONE,
              },
            ],
          },
        ],
      },
      {
        domain: "price-lists",
        moments: [
          {
            title: "Al abrir listas",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/price-lists",
                detail:
                  "Selector de listas en el tablero. Lazy: no al entrar. Primera vez que se abre. Cambiar de lista no vuelve a pegar lists ni articles; el precio se resuelve en cliente.",
                cache: CACHE_TANSTACK_24H,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    place: "Toolbox",
    domains: [
      {
        domain: "sale",
        moments: [
          {
            title: "Al entrar",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/sale/payment-context",
                detail:
                  "En paralelo con categories, articles, comprobantes y open-session. Alimenta el slot de pago.",
                cache: CACHE_TANSTACK_24H,
              },
              {
                endpoint: "GET /v1/pops/:popId/sale/comprobantes",
                detail:
                  "En paralelo con categories, articles, payment-context y open-session. Trae las opciones del picker; no espera un click.",
                cache: CACHE_TANSTACK_24H,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    place: "Resumen",
    domains: [
      {
        domain: "sale",
        moments: [
          {
            title: "Al armar el carrito",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/sale/catalog/articles",
                detail:
                  "Cuando el pedido tiene ids que no están en cache. Carrito vacío o artículo recién escaneado: no pega.",
                cache: CACHE_TANSTACK_24H,
              },
            ],
          },
        ],
      },
      {
        domain: "quotes",
        moments: [
          {
            title: "Al restaurar un presupuesto",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/quotes/:quoteId",
                detail:
                  "Si la URL trae quoteId. Cascada: espera a que termine catalog y recién ahí pega. Arma el pedido del resumen.",
                cache: CACHE_NONE,
              },
            ],
          },
        ],
      },
    ],
  },
]
