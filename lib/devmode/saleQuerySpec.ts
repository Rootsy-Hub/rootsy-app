export type {
  QuerySpecCall as SaleQuerySpecCall,
  QuerySpecDomain as SaleQuerySpecDomain,
  QuerySpecMoment as SaleQuerySpecMoment,
  QuerySpecPlace as SaleQuerySpecPlace,
} from "@/lib/devmode/querySpec"
import type { QuerySpecPlace } from "@/lib/devmode/querySpec"
import {
  CACHE_NONE,
  CACHE_SQLITE_OPFS,
  CACHE_TANSTACK_24H,
  CACHE_TANSTACK_24H_REFETCH_MOUNT,
  CACHE_TANSTACK_SESSION,
  CACHE_WS_DO,
} from "@/lib/devmode/querySpec"

/** Spec de consultas de Vender. Se completa a mano; el panel solo la muestra. */
export const SALE_QUERY_SPEC: readonly QuerySpecPlace[] = [
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
                  "Turno de caja abierto por el usuario. En paralelo con categories, articles, payment-context y comprobantes. El GET de articles pagina todo merchandise al entrar, sin esperar categoryId. Si no hay turno propio, session es null. No cae a cajas de otros. El socket resource:cajas:{userId} parchea esta cache; un cobro rechazado también la invalida.",
                cache: CACHE_TANSTACK_24H_REFETCH_MOUNT,
              },
              {
                endpoint: "WS resource:cajas:{userId}",
                detail:
                  "Listener al entrar a Vender. Apertura/cierre del turno propio (aunque lo cierre un supervisor). Cierre: setQueryData null, apaga Cobrar y muestra el toast. Apertura: parchea el GET y cierra el toast. Gap invalida open-session.",
                cache: CACHE_WS_DO,
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
                endpoint: "GET /v1/pops/:popId/categories",
                detail:
                  "Si las categorías ya están en SQLite (OPFS), solo SELECT local del rail (merchandise + show_in_sale). Si no hay marca de hidratación, un GET sin filtros (todas las categorías). Fallback HTTP: GET sin filtros y el rail filtra en cliente.",
                cache: CACHE_SQLITE_OPFS,
              },
            ],
          },
          {
            title: "En vivo",
            calls: [
              {
                endpoint: "WS domain:categories",
                detail:
                  "Upsert/delete en SQLite y re-SELECT del rail, también si Vender no está abierto. Rename actualiza category_name en artículos locales. Gap borra la marca y un GET.",
                cache: CACHE_SQLITE_OPFS,
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
                  "GET /v1/pops/:popId/articles?itemKinds=merchandise&includeStock=false&page=1&pageSize=100",
                detail:
                  "Al entrar, si no hay marca global de hidratación: pagina todo merchandise sin soloActivos ni categoryId. includeStock=false: no consulta inventory. Persiste activos e inactivos. El tablero filtra en SELECT local (activo + vendible + categoría). Fallback HTTP: el mismo GET y filtra en cliente.",
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
                  "Guarda el categoryId en localStorage y lee SQLite. No hay GET: el dump de mercadería ya está en OPFS (o se está hidratando al entrar).",
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
                  "Parche en SQLite (upsert/delete) sin borrar la marca de hidratado. lastSeq solo se persiste cuando el parche ya está en OPFS, o tras rehidratar si el write falla. Si hay GET en curso, los avisos se encolan y el seq no avanza hasta aplicarlos. Resync (gap) borra marcas y vuelve a hidratar.",
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
                endpoint: "SELECT articles WHERE barcode|sku|name",
                detail:
                  "Enter en el input. Busca en SQLite del pop (barcode/sku exacto o nombre único). Sin GET. Si no está, toast y no agrega.",
                cache: CACHE_SQLITE_OPFS,
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
                endpoint: "SELECT/REPLACE sale_cart_lines",
                detail:
                  "El ticket es un SELECT de líneas persistidas en SQLite. Agregar copia snapshot desde articles locales. Un UPDATE del artículo no reescribe la línea abierta.",
                cache: CACHE_SQLITE_OPFS,
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
