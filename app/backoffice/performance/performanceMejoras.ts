export type PerformanceMejora = {
  id: string
  title: string
  description: string
  impact: number
  complexity: number
  doneNote?: string
}

export type PerformanceMejoraGroup = {
  id: string
  title: string
  items: readonly PerformanceMejora[]
}

export const PERFORMANCE_MEJORA_GROUPS: readonly PerformanceMejoraGroup[] = [
  {
    id: "catalogos",
    title: "Catálogos",
    items: [
      {
        id: "catalog-sale-query",
        title: "Cache de sesión en Vender",
        description: "Sacar el useEffect. Si el catálogo no cambió, no pedirlo de nuevo.",
        impact: 1,
        complexity: 4,
        doneNote:
          "Vender carga el catálogo por React Query. Volver del menú no lo pide de nuevo; después de una venta sí se refresca.",
      },
      {
        id: "catalog-purchase-query",
        title: "Cache de sesión en Comprar",
        description: "Mismo patrón que Vender.",
        impact: 1,
        complexity: 4,
        doneNote:
          "Comprar carga el catálogo por React Query. Volver del menú no lo pide de nuevo; después de una compra sí se refresca.",
      },
      {
        id: "catalog-menu-defaults",
        title: "Mesas y Mostrador sin refetch al montar",
        description: "Ya usan Query. Apagar staleTime 0 y refetchOnMount always.",
        impact: 1,
        complexity: 2,
        doneNote:
          "useMenuCatalogLoader ahora usa cache de sesión. Volver a Mesas o Mostrador no pide el catálogo de nuevo.",
      },
      {
        id: "catalog-rev",
        title: "No pedir si catalogRev no cambió",
        description: "La revisión ya existe en el server. El cliente tiene que usarla.",
        impact: 1,
        complexity: 4,
        doneNote:
          "Vender, Comprar y Mesas miran catalogRev al entrar. Si no cambió, no piden el catálogo.",
      },
      {
        id: "catalog-invalidate",
        title: "Invalidar al cambiar stock o promos",
        description: "Si mutás el catálogo, recién ahí se pide de nuevo.",
        impact: 5,
        complexity: 3,
        doneNote:
          "Artículos, categorías, recetas, promos, venta y compra invalidan los catálogos de operar.",
      },
      {
        id: "catalog-menu-parallel",
        title: "getMenuCatalog en paralelo",
        description: "Hoy recetas, artículos, promos y caja van en cadena.",
        impact: 5,
        complexity: 3,
        doneNote:
          "Recetas, artículos, promos, POP y caja se piden juntos. Caja y tesorería también van en paralelo.",
      },
      {
        id: "catalog-paginate",
        title: "Catálogo por categoría o paginado",
        description: "El payload no puede crecer lineal con todo el stock.",
        impact: 8,
        complexity: 7,
        doneNote:
          "Vender, Comprar, Mesas y Mostrador piden el catálogo de a 48 ítems. El grid sigue igual: al llegar al final carga más. La búsqueda y el escaneo van al server.",
      },
      {
        id: "catalog-virtualize",
        title: "Virtualizar el grid de productos",
        description: "Cuando hay miles de ítems, el costo es de DOM, no solo de red.",
        impact: 8,
        complexity: 7,
        doneNote:
          "Vender, Comprar, Mesas y Mostrador solo montan las cards visibles. El grid y la lista se ven igual.",
      },
    ],
  },
  {
    id: "listados",
    title: "Listados",
    items: [
      {
        id: "list-defaults",
        title: "Defaults de Query con cache real",
        description: "Hoy staleTime 0 y gcTime 0 tiran todo. 30–60 s y 5–10 min alcanzan.",
        impact: 4,
        complexity: 2,
        doneNote:
          "Default: 30 s stale, 10 min en memoria, sin refetch al foco ni al remount. Sidecar sigue en 24 h.",
      },
      {
        id: "list-articles",
        title: "Cache de sesión en Artículos",
        description: "Copiar el patrón de clientes.",
        impact: 2,
        complexity: 2,
        doneNote:
          "La tabla va por React Query. Salir y volver no pide de nuevo.",
      },
      {
        id: "list-operations",
        title: "Cache de sesión en Operaciones",
        description: "Copiar el patrón de clientes.",
        impact: 2,
        complexity: 2,
        doneNote:
          "La tabla va por React Query. Salir y volver no pide de nuevo.",
      },
      {
        id: "list-invoices",
        title: "Cache de sesión en Facturas",
        description: "Copiar el patrón de clientes.",
        impact: 2,
        complexity: 2,
        doneNote:
          "La tabla va por React Query. Emitir invalida el listado.",
      },
      {
        id: "list-checks",
        title: "Cache de sesión en Cheques",
        description: "Copiar el patrón de clientes.",
        impact: 2,
        complexity: 2,
        doneNote:
          "La tabla va por React Query. Crear o cambiar estado invalida el listado.",
      },
      {
        id: "list-suppliers",
        title: "Cache de sesión en Proveedores",
        description: "Copiar el patrón de clientes.",
        impact: 2,
        complexity: 2,
        doneNote:
          "La tabla va por React Query. Crear, editar o borrar invalida el listado.",
      },
      {
        id: "list-recipes",
        title: "Cache de sesión en Recetas",
        description: "Copiar el patrón de clientes.",
        impact: 2,
        complexity: 2,
        doneNote:
          "La tabla va por React Query. Mutar receta invalida el listado y los catálogos de operar.",
      },
      {
        id: "list-promos",
        title: "Cache de sesión en Promos",
        description: "Copiar el patrón de clientes.",
        impact: 2,
        complexity: 2,
        doneNote:
          "La tabla va por React Query. Mutar promo invalida el listado y los catálogos de operar.",
      },
      {
        id: "list-services",
        title: "Cache de sesión en Servicios",
        description: "Copiar el patrón de clientes.",
        impact: 2,
        complexity: 2,
        doneNote:
          "La tabla va por React Query. Crear, editar o borrar invalida el listado.",
      },
      {
        id: "list-current-accounts",
        title: "Cache de sesión en Cuentas corrientes",
        description: "Copiar el patrón de clientes.",
        impact: 2,
        complexity: 2,
        doneNote:
          "Partidos y ficha van por React Query. Liquidar o imputar invalida ambos.",
      },
      {
        id: "list-quotes",
        title: "Cache de sesión en Presupuestos",
        description: "Copiar el patrón de clientes.",
        impact: 2,
        complexity: 2,
        doneNote:
          "La tabla va por React Query. Borrar invalida el listado.",
      },
      {
        id: "list-purchase-orders",
        title: "Cache de sesión en Órdenes de compra",
        description: "Copiar el patrón de clientes.",
        impact: 2,
        complexity: 2,
        doneNote:
          "La tabla va por React Query. Borrar invalida el listado.",
      },
      {
        id: "list-invalidate",
        title: "Invalidar al crear, editar o borrar",
        description: "Si no, el cache de sesión se pudre o se tira con un load() completo.",
        impact: 5,
        complexity: 3,
        doneNote:
          "Todos los listados de esta lista invalidan el root de Query al mutar.",
      },
    ],
  },
  {
    id: "sidecar",
    title: "Sidecar",
    items: [
      {
        id: "sidecar-batch-access",
        title: "Un solo access para todos los POPs en Home",
        description: "Hoy es 2 + N. Bien es 3 o menos, aunque tengas muchos POPs.",
        impact: 3,
        complexity: 5,
        doneNote:
          "Home pide perfil y un batch de access. El costo queda en 2, aunque tengas muchos POPs.",
      },
      {
        id: "sidecar-persist-paint",
        title: "Pintar Home sin esperar persistReady",
        description: "Chrome ya. Datos después. Corta la cascada de spinners.",
        impact: 6,
        complexity: 5,
        doneNote:
          "El persist se hidrata en el mismo tick. Home no espera persistReady para pedir ni para pintar el chrome.",
      },
      {
        id: "sidecar-revisions",
        title: "Invalidar access solo si cambió permissionsRev",
        description: "La revisión ya existe. Hoy el cliente casi no la usa.",
        impact: 9,
        complexity: 7,
        doneNote:
          "Al entrar a un POP se mira permissionsRev. Si no cambió, el access cacheado se queda.",
      },
      {
        id: "sidecar-server-prefetch",
        title: "Prefetch de sesión y access en el server",
        description: "El client hidrata. No descubre el sidecar después del spinner.",
        impact: 10,
        complexity: 9,
        doneNote:
          "Home prefetcha perfil y el batch de access en el layout. El persist no pisa esas keys.",
      },
    ],
  },
  {
    id: "actions",
    title: "Actions",
    items: [
      {
        id: "action-parallel",
        title: "Access y ¿activo? en paralelo",
        description: "Hoy validatePopAccess hace dos idas en serie.",
        impact: 6,
        complexity: 3,
        doneNote:
          "user_has_pop_access e is_pop_active van juntos. Una action ya no espera a la otra.",
      },
      {
        id: "action-helper",
        title: "requirePopAction en un paso",
        description: "Auth + access + permiso. Dejar de rearmar la torre en cada file.",
        impact: 7,
        complexity: 6,
        doneNote:
          "El helper existe. Presupuestos y órdenes ya no rearman la torre a mano.",
      },
      {
        id: "action-select-star",
        title: "Sacar select(*) de presupuestos y órdenes",
        description: "El detalle pide más de lo que la UI usa.",
        impact: 8,
        complexity: 2,
        doneNote:
          "El detalle de presupuestos y órdenes pide solo las columnas que mapea la UI.",
      },
      {
        id: "action-detail",
        title: "Un pedido de detalle, no 3 o 4 actions",
        description: "Abrir una fila no debería encadenar POSTs.",
        impact: 8,
        complexity: 6,
        doneNote:
          "Abrir un presupuesto u orden no pide el catálogo si las líneas ya están. El PDF reusa ese detalle.",
      },
    ],
  },
  {
    id: "pages",
    title: "Pages",
    items: [
      {
        id: "pages-menu-clock",
        title: "Reloj del menú cada minuto",
        description: "Hoy re-renderiza cada segundo con la pantalla idle.",
        impact: 8,
        complexity: 1,
        doneNote:
          "El reloj del menú actualiza cada 60 s. La hora se muestra en HH:mm.",
      },
      {
        id: "pages-auth-memo",
        title: "Memo del AuthContext",
        description: "El value se arma inline y re-renderiza todas las pages con withAuth.",
        impact: 7,
        complexity: 2,
        doneNote:
          "El value del AuthContext está memoizado. withAuth no se re-renderiza de más.",
      },
      {
        id: "pages-menu-parallax",
        title: "Menos trabajo idle en el parallax del menú",
        description: "mousemove permanente con la pantalla quieta.",
        impact: 8,
        complexity: 2,
        doneNote:
          "El parallax se actualiza como máximo un frame por movimiento y no trabaja con la pestaña oculta.",
      },
      {
        id: "pages-accounting-lazy",
        title: "Contabilidad y tesorería por pestaña",
        description: "No pedir libro + reportes juntos en la primera carga.",
        impact: 8,
        complexity: 5,
        doneNote:
          "La primera carga de Contabilidad pide el plan y el diario. Los reportes se piden al consultarlos.",
      },
      {
        id: "pages-dynamic-split",
        title: "Partir Vender y Contabilidad con dynamic()",
        description: "Reportes ya lo hace. Dialogs y wizards no tienen que ir en el chunk inicial.",
        impact: 8,
        complexity: 6,
        doneNote:
          "Vender y Comprar cargan diálogos de cobro, cliente y descuento con dynamic(). No van en el chunk inicial.",
      },
      {
        id: "pages-layout-auth",
        title: "Auth en el layout, no withAuth en cada page",
        description: "Una sola espera de sesión. No un spinner por ruta.",
        impact: 7,
        complexity: 6,
        doneNote:
          "La sesión llega del server. AuthGate vive en el layout. Las pages ya no envuelven withAuth.",
      },
      {
        id: "pages-rsc",
        title: "HTML con datos desde el server",
        description: "El salto grande: menos JS, menos cascada. Después de las demás.",
        impact: 10,
        complexity: 9,
        doneNote:
          "Home pinta saludo y POPs en el HTML. Los listados piden la tabla en el server y la hidratan: el primer documento ya trae filas.",
      },
    ],
  },
  {
    id: "limpieza",
    title: "Limpieza",
    items: [
      {
        id: "cleanup-dead-bootstrap",
        title: "Sacar bootstrap muerto",
        description:
          "getPopWorkspaceBootstrap, getWorkspaceHeaderForPop y usePopBackgroundImageUrl no se usan.",
        impact: 10,
        complexity: 2,
        doneNote:
          "Saqué las tres APIs. Quedó solo el tipo de bootstrap que arma el access cacheado.",
      },
    ],
  },
] as const

export function performanceMejoraIds(): string[] {
  return PERFORMANCE_MEJORA_GROUPS.flatMap((group) =>
    group.items.map((item) => item.id),
  )
}
