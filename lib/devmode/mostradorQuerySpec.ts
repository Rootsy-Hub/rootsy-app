import type { QuerySpecPlace } from "@/lib/devmode/querySpec"
import {
  CACHE_NONE,
  CACHE_SQLITE_OPFS,
  CACHE_TANSTACK_24H,
  CACHE_TANSTACK_SESSION,
  CACHE_WS_DO,
} from "@/lib/devmode/querySpec"

/** Spec de consultas de Mostrador. Se completa a mano; el panel solo la muestra. */
export const MOSTRADOR_QUERY_SPEC: readonly QuerySpecPlace[] = [
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
                  "Turno de caja del usuario (toast si no hay o lleva más de un día). TanStack 24 h, sin refetch al reentrar. El socket resource:cajas:{userId} parchea esta cache.",
                cache: CACHE_TANSTACK_24H,
              },
              {
                endpoint: "WS resource:cajas:{userId}",
                detail:
                  "Listener al entrar a Mostrador. Apertura/cierre del turno propio. Cierre: setQueryData null, apaga Cobrar y muestra el toast. Apertura: parchea el GET y cierra el toast. Gap invalida open-session.",
                cache: CACHE_WS_DO,
              },
            ],
          },
        ],
      },
      {
        domain: "mostrador",
        moments: [
          {
            title: "Al entrar",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/mostrador/orders",
                detail:
                  "Hydrate one-shot a SQLite si no hay marca. Reentrar: SELECT local. Pedidos slim, sin ticket. El socket parchea SQLite + TanStack; el checkout vive en GET puntual al seleccionar.",
                cache: CACHE_SQLITE_OPFS,
              },
              {
                endpoint: "localStorage mostrador-workspace + sale-catalog-chrome",
                detail:
                  "Al recargar: pedido, tab Datos/Pedido, stage mobile, lista de precios y grilla/lista. Pedido solo si ese pedido sigue en el tablero; si no, tab Datos.",
                cache: CACHE_NONE,
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
                  "Hydrate one-shot si no hay marca en SQLite. Con marca: no pega. El grid lee SELECT local.",
                cache: CACHE_SQLITE_OPFS,
              },
            ],
          },
        ],
      },
      {
        domain: "categories",
        moments: [
          {
            title: "Al entrar",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/categories",
                detail:
                  "Hydrate del rail si no hay marca. Con marca: SELECT local.",
                cache: CACHE_SQLITE_OPFS,
              },
            ],
          },
        ],
      },
      {
        domain: "recipe-categories",
        moments: [
          {
            title: "Al entrar",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/recipe-categories",
                detail:
                  "Hydrate si no hay marca. El rail de recetas es SELECT local.",
                cache: CACHE_SQLITE_OPFS,
              },
            ],
          },
        ],
      },
      {
        domain: "recipes",
        moments: [
          {
            title: "Al entrar",
            calls: [
              {
                endpoint:
                  "GET /v1/pops/:popId/recipes?page=1&pageSize=100",
                detail:
                  "Hydrate si no hay marca, después de recipe-categories.",
                cache: CACHE_SQLITE_OPFS,
              },
            ],
          },
        ],
      },
      {
        domain: "promotions",
        moments: [
          {
            title: "Al entrar",
            calls: [
              {
                endpoint:
                  "GET /v1/pops/:popId/promotions?includeSlots=true&page=1&pageSize=100",
                detail:
                  "Hydrate de combos y deals si no hay marca.",
                cache: CACHE_SQLITE_OPFS,
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
        domain: "mostrador",
        moments: [
          {
            title: "Al crear un pedido",
            calls: [
              {
                endpoint: "POST /v1/pops/:popId/mostrador/orders",
                detail:
                  "El + del header abre el alta. El POST pega al confirmar el formulario. La respuesta entra a SQLite slim + TanStack; el WS replica a otros.",
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
        domain: "mostrador",
        moments: [
          {
            title: "En vivo",
            calls: [
              {
                endpoint: "WS domain:mostrador",
                detail:
                  "Listener solo en la pantalla Mostrador. Escribe SQLite slim y parchea TanStack (order_opened/updated/status_changed/order_closed). checkout_saved no llega acá. Gap borra la marca y rehidrata el tablero.",
                cache: CACHE_WS_DO,
              },
            ],
          },
        ],
      },
      {
        domain: "articles",
        moments: [
          {
            title: "Al abrir el catálogo",
            calls: [
              {
                endpoint: "SELECT articles|recipes|promotions",
                detail:
                  "Rail y grilla leen SQLite. Scroll y búsqueda son SELECT local.",
                cache: CACHE_SQLITE_OPFS,
              },
            ],
          },
          {
            title: "En vivo",
            calls: [
              {
                endpoint: "WS domain:articles · domain:categories · domain:promotions · domain:recipes",
                detail:
                  "Realtime de catálogo global (shell). Upsert/delete en SQLite también si Mostrador no está abierto.",
                cache: CACHE_SQLITE_OPFS,
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
            title: "Al abrir Pedido o Catálogo",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/sale/payment-context",
                detail:
                  "Al abrir Pedido o Catálogo. El modal de Pago lee esta cache. Caja abierta sale de GET /cash-registers/open-session. Catálogo: SQLite.",
                cache: CACHE_TANSTACK_SESSION,
              },
              {
                endpoint: "GET /v1/pops/:popId/sale/comprobantes",
                detail:
                  "Mismo momento. Opciones y datos fiscales del emisor.",
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
        domain: "mostrador",
        moments: [
          {
            title: "Al seleccionar un pedido",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/mostrador/orders/:orderId",
                detail:
                  "Ticket de ese pedido. TanStack ∞; no pega si ya está en cache (crear pedido, persist o volver al mismo pedido/tab). Un gap del tablero no invalida este detalle.",
                cache: CACHE_TANSTACK_SESSION,
              },
              {
                endpoint: "WS resource:order:{id}",
                detail:
                  "Solo con ese pedido seleccionado. Recibe checkout_saved y comandas sent/void/status_changed. Gap invalida únicamente ese detalle.",
                cache: CACHE_WS_DO,
              },
            ],
          },
          {
            title: "Al editar el pedido",
            calls: [
              {
                endpoint: "PATCH /v1/pops/:popId/mostrador/orders/:orderId",
                detail:
                  "Nombre, nota u otros campos del pedido.",
                cache: CACHE_NONE,
              },
              {
                endpoint:
                  "PATCH /v1/pops/:popId/mostrador/orders/:orderId/status",
                detail:
                  "Mover columna en el kanban.",
                cache: CACHE_NONE,
              },
              {
                endpoint:
                  "PATCH /v1/pops/:popId/mostrador/orders/:orderId/checkout",
                detail:
                  "Persist del ticket (debounce). Merge remoto por updatedAt + dirty, igual que Mesas.",
                cache: CACHE_NONE,
              },
              {
                endpoint:
                  "PATCH /v1/pops/:popId/mostrador/orders/:orderId/cancel",
                detail:
                  "Cancelar pedido.",
                cache: CACHE_NONE,
              },
              {
                endpoint:
                  "PATCH /v1/pops/:popId/mostrador/orders/:orderId/close",
                detail:
                  "Cerrar sin cobro (settle/release).",
                cache: CACHE_NONE,
              },
            ],
          },
        ],
      },
      {
        domain: "comandas",
        moments: [
          {
            title: "Al enviar o anular",
            calls: [
              {
                endpoint:
                  "GET /v1/pops/:popId/comandas/pending?sourceKind=counter&sourceId=",
                detail:
                  "Al abrir el modal de comandas. No al entrar a Mostrador.",
                cache: CACHE_NONE,
              },
              {
                endpoint: "POST /v1/pops/:popId/comandas/send",
                detail:
                  "Una pegada. Publish por WS si el payload cabe; si no, invalidate.",
                cache: CACHE_NONE,
              },
              {
                endpoint: "POST /v1/pops/:popId/comandas/void",
                detail:
                  "Anular línea enviada.",
                cache: CACHE_NONE,
              },
            ],
          },
        ],
      },
      {
        domain: "sale",
        moments: [
          {
            title: "Al cobrar",
            calls: [
              {
                endpoint: "POST /v1/pops/:popId/sales",
                detail:
                  "Server action completeSale. Canal type=counter + orderId. Si linkea el pedido, el API publica mostrador.order_closed.",
                cache: CACHE_NONE,
              },
            ],
          },
        ],
      },
    ],
  },
]
