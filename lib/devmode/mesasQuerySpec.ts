import type { QuerySpecPlace } from "@/lib/devmode/querySpec"
import {
  CACHE_NONE,
  CACHE_SQLITE_OPFS,
  CACHE_TANSTACK_24H,
  CACHE_TANSTACK_SESSION,
  CACHE_WS_DO,
} from "@/lib/devmode/querySpec"

/** Spec de consultas de Mesas. Se completa a mano; el panel solo la muestra. */
export const MESAS_QUERY_SPEC: readonly QuerySpecPlace[] = [
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
                  "Turno de caja del usuario (toast si no hay o lleva más de un día). TanStack 24 h, sin refetch al reentrar. El socket resource:cajas:{userId} parchea esta cache; un cobro rechazado también la invalida.",
                cache: CACHE_TANSTACK_24H,
              },
              {
                endpoint: "WS resource:cajas:{userId}",
                detail:
                  "Listener al entrar a Mesas. Apertura/cierre del turno propio. Cierre: setQueryData null, apaga Cobrar y muestra el toast. Apertura: parchea el GET y cierra el toast. Gap invalida open-session.",
                cache: CACHE_WS_DO,
              },
            ],
          },
        ],
      },
      {
        domain: "mesas",
        moments: [
          {
            title: "Al entrar",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/mesas/layout",
                detail:
                  "Hydrate one-shot a SQLite si no hay marca. Reentrar: SELECT local. Página y piso leen la misma cache; el ticket no entra acá.",
                cache: CACHE_SQLITE_OPFS,
              },
              {
                endpoint: "GET /v1/pops/:popId/mesas/sessions",
                detail:
                  "Sesiones abiertas slim, sin ticket. Primera visita o cache vacío. El socket parchea SQLite + TanStack; el checkout vive en GET puntual al seleccionar.",
                cache: CACHE_SQLITE_OPFS,
              },
              {
                endpoint: "GET /v1/pops/:popId/mesas/reservations",
                detail:
                  "Reservas slim. Primera visita o cache vacío; después SELECT local. Llegan detrás del piso: no bloquean el skeleton ni el header.",
                cache: CACHE_SQLITE_OPFS,
              },
              {
                endpoint: "GET /v1/pops/:popId/mesas/reservation-settings",
                detail:
                  "Buffer, gracia y cierre del día. Primera visita o cache vacío; después SELECT local. No bloquean el skeleton del piso.",
                cache: CACHE_SQLITE_OPFS,
              },
              {
                endpoint: "GET /v1/pops/:popId/mesas/waiters",
                detail:
                  "Mozos para abrir/editar sesión. TanStack de sesión; no hay evento realtime de waiters. El picker espera la lista: no muestra «Sin mozos» mientras carga.",
                cache: CACHE_TANSTACK_SESSION,
              },
              {
                endpoint: "localStorage mesas-workspace + sale-catalog-chrome",
                detail:
                  "Al recargar: mesa, salón, tab Mesa/Agenda/Pedido, stage mobile, lista de precios y grilla/lista. Pedido solo si esa mesa sigue con sesión; si no, tab Mesa.",
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
                  "GET /v1/pops/:popId/articles?itemKinds=merchandise&includeStock=true&page=1&pageSize=100",
                detail:
                  "Hydrate one-shot si no hay marca en SQLite. Pagina todo merchandise. Si ya está hidratado, no pega. El grid de Mesas lee SELECT local.",
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
                  "Hydrate del rail (merchandise + recetas) si no hay marca. Sin marca: un GET sin filtros. Con marca: solo SELECT local.",
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
                  "Hydrate de categorías de receta (show_in_menu) si no hay marca. Con marca: SELECT local.",
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
                  "Hydrate de recetas si no hay marca, después de recipe-categories. Pagina todo. El tablero filtra en SQLite.",
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
                  "Hydrate de combos y quantity deals si no hay marca. El ticket usa el split local.",
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
        domain: "mesas",
        moments: [
          {
            title: "Al editar salones, mesas o decors",
            calls: [
              {
                endpoint:
                  "POST|PATCH|DELETE /v1/pops/:popId/mesas/salons|tables|decors",
                detail:
                  "Diálogos del ⋯. También reorder. Los diálogos aún pegan GET /mesas/layout al abrir (no leen la cache TanStack).",
                cache: CACHE_NONE,
              },
              {
                endpoint: "PATCH /v1/pops/:popId/mesas/layout/positions",
                detail:
                  "Al soltar una mesa o decor en modo edición. Después se invalida layout.",
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
        domain: "mesas",
        moments: [
          {
            title: "En vivo",
            calls: [
              {
                endpoint: "WS domain:mesas",
                detail:
                  "Listener solo en la pantalla Mesas. Escribe SQLite slim y parchea TanStack (ocupación, floor_status, layout, reservas, settings). checkout_saved no llega acá. Gap borra la marca y rehidrata el piso.",
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
                  "Rail y grilla leen SQLite (TanStack ∞). No hay GET /menu-catalog al sentar una mesa vacía. Scroll y búsqueda son SELECT local.",
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
                  "Realtime de catálogo global (shell). Upsert/delete en SQLite también si Mesas no está abierto.",
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
            title: "Al haber ítems o al cobrar",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/sale/payment-context",
                detail:
                  "Al haber ítems o al cobrar. El modal de Pago lee esta cache. Caja abierta sale de GET /cash-registers/open-session.",
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
        domain: "mesas",
        moments: [
          {
            title: "Al seleccionar mesa ocupada",
            calls: [
              {
                endpoint: "GET /v1/pops/:popId/mesas/sessions/:sessionId",
                detail:
                  "Ticket de esa sesión. TanStack ∞; no pega si ya está en cache (abrir mesa, persist o volver a la misma mesa/tab). Mesa libre: ni GET ni canal. Un gap del piso no invalida este detalle.",
                cache: CACHE_TANSTACK_SESSION,
              },
              {
                endpoint: "WS resource:session:{id}",
                detail:
                  "Solo con esa sesión seleccionada. Recibe checkout_saved y comandas sent/void/status_changed. Gap invalida únicamente ese detalle.",
                cache: CACHE_WS_DO,
              },
            ],
          },
          {
            title: "Al abrir o editar la sesión",
            calls: [
              {
                endpoint: "POST /v1/pops/:popId/mesas/sessions",
                detail:
                  "Abrir mesa. La respuesta llena el detalle; el WS replica ocupación a otros.",
                cache: CACHE_NONE,
              },
              {
                endpoint: "PATCH /v1/pops/:popId/mesas/sessions/:sessionId",
                detail:
                  "Mozo, cubiertos, nota, mesas unidas.",
                cache: CACHE_NONE,
              },
              {
                endpoint:
                  "PATCH /v1/pops/:popId/mesas/sessions/:sessionId/floor-status",
                detail:
                  "Libre / abierta / cobrando en el piso.",
                cache: CACHE_NONE,
              },
              {
                endpoint:
                  "PATCH /v1/pops/:popId/mesas/sessions/:sessionId/checkout",
                detail:
                  "Persist del ticket (debounce). Merge remoto por updatedAt; si el ticket local está dirty no pisa líneas, solo comandaStatus.",
                cache: CACHE_NONE,
              },
              {
                endpoint:
                  "PATCH /v1/pops/:popId/mesas/sessions/:sessionId/close-checkout",
                detail:
                  "Cerrar mesa sin cobro (settle/release).",
                cache: CACHE_NONE,
              },
            ],
          },
          {
            title: "Reservas",
            calls: [
              {
                endpoint:
                  "POST|PATCH /v1/pops/:popId/mesas/reservations/:id?",
                detail:
                  "Alta/edición desde la agenda. Cancel y status (no-show, seated) son PATCH dedicados. Settings: PATCH /reservation-settings.",
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
                  "GET /v1/pops/:popId/comandas/pending?sourceKind=table&sourceId=",
                detail:
                  "Al abrir el modal de comandas. No al entrar a Mesas.",
                cache: CACHE_NONE,
              },
              {
                endpoint: "POST /v1/pops/:popId/comandas/send",
                detail:
                  "Una pegada. El API publica tickets por WS si caben; si no, invalidate.",
                cache: CACHE_NONE,
              },
              {
                endpoint: "POST /v1/pops/:popId/comandas/void",
                detail:
                  "Anular línea enviada. Misma regla de publish/invalidate.",
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
                  "Server action completeSale. Canal type=table + sessionId. Puede cerrar la sesión. Publica mesas.session_closed si cierra.",
                cache: CACHE_NONE,
              },
            ],
          },
        ],
      },
    ],
  },
]
