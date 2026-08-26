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
const CACHE_TANSTACK_SESSION_REFETCH = "TanStack · sesión · refetch al montar"
const CACHE_TANSTACK_SESSION = "TanStack · sesión · staleTime ∞"
const CACHE_SQLITE_OPFS = "SQLite · OPFS · por pop"
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
                  "Turno de caja abierto por el usuario. En paralelo con categories, payment-context y comprobantes. El GET de articles no sale acá: espera categoryId de localStorage o la primera categoría del rail. Si no hay turno propio, session es null. No cae a cajas de otros. Tras un cobro rechazado por caja cerrada se invalida.",
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
                  "Rail de categorías de producto visibles en venta. En paralelo con payment-context, comprobantes y open-session. Si Vender ya tiene categoryId en localStorage, el GET de articles sale en paralelo; si no, articles espera este listado y usa la primera categoría.",
                cache: CACHE_TANSTACK_SESSION_REFETCH,
              },
            ],
          },
          {
            title: "En vivo",
            calls: [
              {
                endpoint: "WS domain:categories",
                detail:
                  "Parche del rail (nombre, orden, showInSale). Si el aviso no trae name y la categoría no está en cache, GET de categories. El reorder emite categories.updated, no un evento layout.",
                cache: CACHE_TANSTACK_SESSION_REFETCH,
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
                  "GET /v1/pops/:popId/articles?itemKinds=merchandise&soloActivos=true&categoryId=:id&page=1&pageSize=100",
                detail:
                  "Si esa categoría ya está en SQLite (OPFS), solo SELECT local: no hay GET. Si no está, GET con categoryId de localStorage o la primera del rail, hidrata y marca la categoría. Sin categoryId no hay GET. Fallback HTTP si SQLite no carga.",
                cache: CACHE_SQLITE_OPFS,
              },
            ],
          },
          {
            title: "Al scrollear",
            calls: [
              {
                endpoint: "SELECT articles WHERE category_id",
                detail:
                  "Siguiente página local (LIMIT 50 OFFSET) cuando el listado se acerca al fondo (~240px). No pega a la API.",
                cache: CACHE_SQLITE_OPFS,
              },
            ],
          },
          {
            title: "Al buscar",
            calls: [
              {
                endpoint: "SELECT articles WHERE name|barcode|sku LIKE",
                detail:
                  "Al tipear, espera 300 ms y busca en SQLite. Sin categoryId. No pega a la API.",
                cache: CACHE_SQLITE_OPFS,
              },
            ],
          },
          {
            title: "Al cambiar de categoría",
            calls: [
              {
                endpoint: "SELECT articles WHERE category_id",
                detail:
                  "Guarda el categoryId en localStorage y lee SQLite. GET a articles solo si esa categoría nunca se hidrató (o se invalidó el catálogo). Si ya está en OPFS, no hay red.",
                cache: CACHE_SQLITE_OPFS,
              },
            ],
          },
          {
            title: "En vivo",
            calls: [
              {
                endpoint: "WS domain:articles",
                detail:
                  "Parche en SQLite (upsert/delete) sin borrar la marca de hidratado. Si hay GET en curso, los avisos se encolan y se aplican al terminar. lastSeq vive en SQLite. Resync (gap/empty) borra marcas y vuelve a hidratar.",
                cache: CACHE_SQLITE_OPFS,
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
                  "Al entrar, en paralelo con categories, articles, comprobantes y open-session. El modal de Pago no vuelve a pegar: lee esta cache.",
                cache: CACHE_TANSTACK_SESSION,
              },
              {
                endpoint: "GET /v1/pops/:popId/sale/comprobantes",
                detail:
                  "Al entrar, en paralelo con categories, articles, payment-context y open-session. Trae opciones y datos fiscales del emisor. El modal de Comprobante no vuelve a pegar: lista y vista previa leen esta cache.",
                cache: CACHE_TANSTACK_SESSION,
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
