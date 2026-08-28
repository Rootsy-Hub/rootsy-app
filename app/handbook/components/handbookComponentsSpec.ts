/**
 * Criterio editorial de Componentes.
 * Los especímenes vivos viven en HandbookComponentsFinalSpecimens.
 * Solo entra lo que el producto reutiliza.
 */

export const HANDBOOK_COMPONENT_PAGE_IDS = [
  "navegacion",
  "acciones",
  "formularios",
  "datos",
  "feedback",
  "overlays",
] as const

export type HandbookComponentPageId = (typeof HANDBOOK_COMPONENT_PAGE_IDS)[number]

export function isHandbookComponentPageId(
  id: string,
): id is HandbookComponentPageId {
  return (HANDBOOK_COMPONENT_PAGE_IDS as readonly string[]).includes(id)
}

export const HANDBOOK_COMPONENT_PAGES: Record<
  HandbookComponentPageId,
  {
    title: string
    lead: string
    principles: ReadonlyArray<{ title: string; detail: string }>
  }
> = {
  navegacion: {
    title: "Navegación",
    lead: "El chrome dice dónde estás y a dónde podés ir. Acá está cada pieza que la app usa hoy — incluidas las paralelas y los bypass de shadcn — para poder unificar después.",
    principles: [
      {
        title: "Un header por módulo",
        detail: "ModuleWorkspaceHeader nombra el lugar, el POP y la persona. No hay un segundo chrome competiendo.",
      },
      {
        title: "El rail es la sección",
        detail: "SaleCatalogSidebarNav lista las categorías en operar. El menú del header cambia de vista sin salir.",
      },
      {
        title: "No hay migas",
        detail: "El título alcanza. Las tablas de módulo sí tienen pie de página (DataWorkspaceListPaginationFooter).",
      },
    ],
  },
  acciones: {
    title: "Acciones",
    lead: "Un botón dice qué va a pasar. La semántica es fija: primary decide, subtle acompaña, danger destruye, el ícono hace una sola cosa.",
    principles: [
      {
        title: "Una primaria por vista",
        detail: "RootsPrimaryButton es la decisión. El resto no pelea el peso.",
      },
      {
        title: "El ícono no es un atajo de copy",
        detail: "RootsIconButton lleva label accesible. El glifo no reemplaza a un botón de texto si la acción no es obvia.",
      },
      {
        title: "El menú agrupa lo secundario",
        detail: "Las acciones de fila y el ⋯ viven en RootsDropdownMenu. No se esparcen como botones sueltos.",
      },
    ],
  },
  formularios: {
    title: "Formularios",
    lead: "Cada campo es un RootsForm*Field: label, control, ayuda y error en el mismo stack. No se arman inputs sueltos.",
    principles: [
      {
        title: "El campo es el componente",
        detail: "Texto, select, fecha, monto y switch salen de rootsy-form. El primitivo shadcn queda adentro.",
      },
      {
        title: "La elección exclusiva es un segmento",
        detail: "No hay radios de producto. RootsFormSegmentField cubre dos o tres opciones que se ven todas.",
      },
      {
        title: "El error vive en el campo",
        detail: "error / warning / success en el Field. No se explica el fallo en un toast si el input lo puede decir.",
      },
    ],
  },
  datos: {
    title: "Datos",
    lead: "Las tablas, las losetas y los montos son el mismo idioma en cada módulo. El número es Inter tabular; el estado, un badge.",
    principles: [
      {
        title: "La tabla es el listado",
        detail: "ui/table + header y celdas de data-workspace. No se inventa un grid de divs para datos densos.",
      },
      {
        title: "La loseta es el bloque",
        detail: "Cards de entidad y KPIs usan la superficie de loseta. No hay un Card shadcn en producto.",
      },
      {
        title: "El stock se lee en la fila",
        detail: "El aviso y el peligro pintan la fila y el número. No se esconde en un ícono sin cifra.",
      },
    ],
  },
  feedback: {
    title: "Feedback",
    lead: "El producto habla cuando algo cambió, falta o hay que decidir. Toast, banner, modal y vacío son voces distintas — no se prestan el trabajo.",
    principles: [
      {
        title: "El toast confirma y se va",
        detail: "showRootsyToast para un éxito o un fallo corto. No explica un formulario.",
      },
      {
        title: "El banner se queda",
        detail: "RootsBanner en la vista: aviso, contexto, siguiente paso. El modal interrumpe; el banner no.",
      },
      {
        title: "El vacío nombra lo que falta",
        detail: "RootsyEmptyState habla en primera persona y ofrece un paso. Un spinner no es un vacío.",
      },
    ],
  },
  overlays: {
    title: "Overlays",
    lead: "Lo que se abre encima usa el mismo menú, el mismo diálogo y el mismo sheet. El toolbox de operar es la excepción: vive en el canvas, no en un portal.",
    principles: [
      {
        title: "Un menú, un dropdown",
        detail: "RootsDropdownMenu es el overlay de acciones. No se abre un Dialog para tres ítems.",
      },
      {
        title: "El diálogo es la tarea",
        detail: "RootsDialogContent es crear, editar y confirmar. El sheet es el panel lateral (chat, mobile).",
      },
      {
        title: "El toolbox no es un overlay",
        detail: "En vender y comprar la configuración de la venta está anclada al canvas. No flota.",
      },
    ],
  },
}

export const HANDBOOK_COMPONENT_SECTIONS: Record<
  HandbookComponentPageId,
  ReadonlyArray<{
    id: string
    title: string
    description: string
    token: string
    doText: string
    dontText: string
    status: "live" | "absent"
    absentNote?: string
  }>
> = {
  navegacion: [
    {
      id: "header",
      title: "Header",
      description:
        "Chrome de módulo. Nombra el POP, el título y la persona. Es el mismo en artículos, ventas y tesorería.",
      token: "ModuleWorkspaceHeader",
      doText: "Un header por módulo, con el título de la vista.",
      dontText: "No apiles un segundo título grande debajo del chrome.",
      status: "live",
    },
    {
      id: "sidebar",
      title: "Sidebar",
      description:
        "OperarSectionRail: el rail de Vender es la fuente. Estadísticas y Ajustes lo reutilizan. Las vistas del workspace viven en el menú del header.",
      token: "SaleCatalogSidebarNav",
      doText: "El rail de operar lista categorías o secciones. El activo es la pastilla savia.",
      dontText: "No dupliques esas vistas como tabs debajo del header.",
      status: "live",
    },
    {
      id: "menus",
      title: "Menús",
      description:
        "Lista de secciones del lugar: Volver, eyebrow y grupos de páginas. Oscuro, a la izquierda.",
      token: "MenuSidebar",
      doText: "Un menú de secciones por contexto. El activo se lee solo.",
      dontText: "No uses el rail de vistas de módulo como menú de librería.",
      status: "live",
    },
    {
      id: "tabs",
      title: "Tabs",
      description:
        "El filtro de categorías es RootsFormSegmentField en línea. Tesorería todavía usa el Tabs de shadcn una vez.",
      token: "RootsFormSegmentField",
      doText: "layout inline para filtrar vistas. Grid para 2–4 opciones de formulario.",
      dontText: "No instales un tab bar genérico ni copies el Tabs de shadcn en un módulo nuevo.",
      status: "live",
    },
    {
      id: "breadcrumbs",
      title: "Breadcrumbs",
      description: "El header ya dice dónde estás. No hay migas en producto.",
      token: "—",
      doText: "El título del módulo alcanza.",
      dontText: "No armes un path Inicio / Módulo / Vista.",
      status: "absent",
      absentNote: "No hay breadcrumbs en el producto. El header cubre el contexto.",
    },
    {
      id: "paginacion",
      title: "Paginación",
      description:
        "El pie de los listados de módulo pagina y cambia el tamaño de página. No hay migas; sí hay páginas.",
      token: "DataWorkspaceListPaginationFooter",
      doText: "Un pie por tabla de módulo, el mismo en todos los listados.",
      dontText: "No armes otro paginador por pantalla.",
      status: "live",
    },
  ],
  acciones: [
    {
      id: "botones",
      title: "Botones",
      description:
        "Cinco voces. Primary decide, default acompaña, subtle se recuesta, danger destruye, link es textual.",
      token: "RootsPrimaryButton · RootsSubtleButton · RootsDangerButton",
      doText: "Una primaria por vista. Subtle para cancelar. Danger solo para destruir.",
      dontText: "No pongas dos primary en el mismo pie, ni un danger para ‘guardar’.",
      status: "live",
    },
    {
      id: "botones-de-icono",
      title: "Botones de icono",
      description:
        "Una acción obvia: editar, borrar, más. El label es obligatorio aunque no se vea.",
      token: "RootsIconButton",
      doText: "Ícono + label accesible. En filas, el ⋯ agrupa lo secundario.",
      dontText: "No uses un icon button para una acción que necesita palabras.",
      status: "live",
    },
    {
      id: "menus-de-acciones",
      title: "Menús de acciones",
      description:
        "El ⋯ y las acciones de fila. El panel sigue la atmósfera: bruma, sombra o éter.",
      token: "RootsDropdownMenu",
      doText: "Agrupá editar, duplicar y eliminar en un menú de fila.",
      dontText: "No alinees cinco icon buttons por fila.",
      status: "live",
    },
    {
      id: "tooltips",
      title: "Tooltips",
      description:
        "Nombre corto al pasar el cursor. En icon buttons y controles densos del POS.",
      token: "Tooltip",
      doText: "Un tooltip nombra lo que el ícono no dice. Corto.",
      dontText: "No metas una instrucción de tres renglones en un tooltip.",
      status: "live",
    },
  ],
  formularios: [
    {
      id: "inputs",
      title: "Inputs",
      description:
        "Texto, búsqueda, monto y cantidad. El label va arriba; el hint, abajo.",
      token: "RootsFormTextField · RootsFormMoneyField · RootsFormSearchField",
      doText: "Un RootsForm*Field por dato. El prefijo $ entra en el monto, no en el label.",
      dontText: "No uses el Input de shadcn suelto en un formulario de producto.",
      status: "live",
    },
    {
      id: "selects",
      title: "Selects",
      description: "Lista de opciones con label. El valor se lee en el trigger.",
      token: "RootsFormSelectField",
      doText: "Select para muchas opciones. Segmento si se ven todas (2–3).",
      dontText: "No hagas un select nativo del browser en un form Rootsy.",
      status: "live",
    },
    {
      id: "checkboxes",
      title: "Checkboxes",
      description: "Sí/no con label y, si hace falta, una línea de ayuda.",
      token: "RootsFormCheckboxField",
      doText: "Checkbox para independientes. El label se clickea entero.",
      dontText: "No uses un switch para un consentimiento legal.",
      status: "live",
    },
    {
      id: "radios",
      title: "Radios",
      description:
        "No hay radios de producto. La elección exclusiva visible es un segmento.",
      token: "RootsFormSegmentField",
      doText: "Segmento para 2–3 opciones que se ven todas.",
      dontText: "No armes un radio-group shadcn en un formulario nuevo.",
      status: "live",
    },
    {
      id: "switches",
      title: "Switches",
      description: "Un encendido inmediato: activo, visible, aplica a venta.",
      token: "RootsFormSwitchField",
      doText: "Switch cuando el cambio es inmediato y reversible.",
      dontText: "No uses un switch para elegir entre tres modos.",
      status: "live",
    },
    {
      id: "date-pickers",
      title: "Date pickers",
      description: "Fecha con calendario en popover. El valor se guarda en ISO.",
      token: "RootsFormDateField",
      doText: "Una fecha, un field. El calendario abre en popover.",
      dontText: "No pidas la fecha en tres selects de día/mes/año.",
      status: "live",
    },
    {
      id: "validacion",
      title: "Validación",
      description:
        "El mensaje cuelga del campo: error, warning o éxito. El control se marca inválido.",
      token: "RootsFormField error · warning · success",
      doText: "El error nombra qué corregir, debajo del control.",
      dontText: "No mandes el fallo de un input a un toast.",
      status: "live",
    },
  ],
  datos: [
    {
      id: "tablas",
      title: "Tablas",
      description:
        "Listados de módulo: header sortable, celdas de nombre e importe, acciones de fila.",
      token: "Table · WorkspaceTableHeader · DataWorkspaceTableMoney",
      doText: "Una tabla para datos densos. El monto va a la derecha, en Inter.",
      dontText: "No conviertas un listado de artículos en cards si la densidad importa.",
      status: "live",
    },
    {
      id: "cards",
      title: "Cards",
      description:
        "Loseta de entidad o KPI. Misma superficie elevada; el contenido cambia.",
      token: "dataWorkspaceEntityCardLosetaSurfaceClass",
      doText: "Loseta para un bloque que se elige o se recorre. Título, dato, meta.",
      dontText: "No uses el Card de shadcn: no está en producto.",
      status: "live",
    },
    {
      id: "listas",
      title: "Listas",
      description:
        "Ítems ordenables con acciones de fila: categorías, atajos, el menú del POP.",
      token: "RootsSortableActionList",
      doText: "Lista ordenable cuando el orden lo define el usuario.",
      dontText: "No pongas una tabla donde el gesto es arrastrar.",
      status: "live",
    },
    {
      id: "badges",
      title: "Badges",
      description:
        "Cápsula de estado o tipo. Savia, bruma, aviso, peligro — no un color suelto.",
      token: "RootsNaturePill",
      doText: "Un pill por estado u oferta. Tint 50/200/700 en luz filtrada; hoja + vivo 500 en sombra y éter.",
      dontText: "No armes una cápsula suelta ni uses el Badge de shadcn.",
      status: "live",
    },
    {
      id: "metricas",
      title: "Métricas",
      description:
        "El número hero y la etiqueta chica. Inter tabular; la etiqueta no compite.",
      token: "rootsy-text-metric",
      doText: "El monto en metric. La etiqueta debajo en meta.",
      dontText: "No pongas el total en Nunito ni en un heading.",
      status: "live",
    },
    {
      id: "graficos",
      title: "Gráficos",
      description:
        "Estadísticas: ChartContainer + Recharts. Ejes en Inter tabular; savia para la serie.",
      token: "ChartContainer",
      doText: "Un gráfico por pregunta. El eje y el tooltip usan tokens.",
      dontText: "No metas un gráfico decorativo en un listado operativo.",
      status: "live",
    },
    {
      id: "estados-de-stock",
      title: "Estados de stock",
      description:
        "La fila avisa: ok, bajo, sin stock. El número cambia de tinta; la fila, de borde.",
      token: "workspaceTableNatureStock* · signal warning/danger",
      doText: "El stock se lee en la cifra y en la fila. Sin stock = peligro.",
      dontText: "No escondas el faltante en un ícono sin número.",
      status: "live",
    },
  ],
  feedback: [
    {
      id: "toasts",
      title: "Toasts",
      description:
        "Confirmación breve. Éxito o error que no necesita quedarse en la vista.",
      token: "showRootsyToast",
      doText: "Un toast al guardar o al fallar una acción corta.",
      dontText: "No uses un toast para explicar un campo inválido.",
      status: "live",
    },
    {
      id: "alertas",
      title: "Alertas",
      description:
        "Aviso que se queda en la vista: warning y danger. Es el mismo banner, otro intent.",
      token: "RootsBanner intent warning · danger",
      doText: "Alerta en contexto, con el siguiente paso si lo hay.",
      dontText: "No abras un modal para un aviso que no pide decisión.",
      status: "live",
    },
    {
      id: "banners",
      title: "Banners",
      description:
        "Contexto persistente: info, success, neutro. Puede tener acción y cierre.",
      token: "RootsBanner",
      doText: "Banner para lo que hay que ver mientras estás en la vista.",
      dontText: "No apiles tres banners. Uno, el más urgente.",
      status: "live",
    },
    {
      id: "modals",
      title: "Modals",
      description:
        "Tarea que interrumpe: crear, editar, un formulario corto. Header, cuerpo, pie.",
      token: "RootsDialogContent",
      doText: "Un diálogo por tarea. Título, cuerpo, cancelar y confirmar.",
      dontText: "No metas un flujo de cinco pasos en un modal.",
      status: "live",
    },
    {
      id: "confirmaciones",
      title: "Confirmaciones",
      description:
        "¿Seguro? Destruir, salir sin guardar, un paso irreversible.",
      token: "RootsConfirmDialog",
      doText: "Confirmación destructiva con danger en el confirmar.",
      dontText: "No pidas confirmar un ‘guardar’ rutinario.",
      status: "live",
    },
    {
      id: "errores",
      title: "Errores",
      description:
        "El fallo de un diálogo se queda en el diálogo. El de un campo, en el campo.",
      token: "RootsDialogErrorBanner",
      doText: "Banner de error arriba del pie, dentro del modal.",
      dontText: "No mandes el error del submit a un toast si el modal sigue abierto.",
      status: "live",
    },
    {
      id: "estados-de-carga",
      title: "Estados de carga",
      description:
        "El producto espera con RootsSpinner. En un modal, el cuerpo entero gira.",
      token: "RootsSpinner · RootsDialogLoadingState",
      doText: "Spinner en el lugar que carga. El botón puede ir a progress.",
      dontText: "No bloquees toda la app con un overlay si solo carga una tabla.",
      status: "live",
    },
    {
      id: "empty-states",
      title: "Empty states",
      description:
        "No hay ítems. Rootsy nombra lo que falta y, si cabe, el siguiente paso.",
      token: "RootsyEmptyState",
      doText: "Vacío con voz y un paso. No un ‘no hay datos’ genérico.",
      dontText: "No dejes la tabla en blanco sin mascota ni copy.",
      status: "live",
    },
  ],
  overlays: [
    {
      id: "dropdowns",
      title: "Dropdowns",
      description:
        "Panel de acciones anclado al trigger. Claro en bruma; oscuro en chrome de sombra.",
      token: "RootsDropdownMenu",
      doText: "Dropdown para acciones. El ítem destructivo va al final.",
      dontText: "No uses un select de formulario para un menú de acciones.",
      status: "live",
    },
    {
      id: "popovers",
      title: "Popovers",
      description:
        "Contenido anclado que no es un menú: el calendario del date field es el caso típico.",
      token: "Popover",
      doText: "Popover para un control (fecha, color) que necesita superficie.",
      dontText: "No metas un formulario largo en un popover.",
      status: "live",
    },
    {
      id: "drawers",
      title: "Drawers",
      description:
        "Panel lateral. Chat, inspectores y mobile. El primitivo es Sheet.",
      token: "Sheet",
      doText: "Sheet cuando la tarea acompaña la vista, no la reemplaza.",
      dontText: "No uses un sheet para una confirmación de dos botones.",
      status: "live",
    },
    {
      id: "dialogs",
      title: "Dialogs",
      description:
        "La misma pieza que el modal de feedback: RootsDialog sobre Dialog. Acá, como overlay.",
      token: "RootsDialogContent",
      doText: "Dialog para una tarea. El velo cubre el resto.",
      dontText: "No abras un dialog para mostrar un tooltip largo.",
      status: "live",
    },
    {
      id: "toolboxes",
      title: "Toolboxes",
      description:
        "Banda de operar: cliente, comprobante, pago, descuento. Anclada al canvas de venta y compra.",
      token: "SaleOperationToolbox",
      doText: "La configuración de la venta vive en el toolbox, no en un modal previo.",
      dontText: "No conviertas esos slots en un formulario de cuatro selects al costado.",
      status: "live",
    },
  ],
}
