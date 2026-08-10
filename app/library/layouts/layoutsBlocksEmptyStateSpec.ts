/**
 * Spec empty states — grid (listado) · detalle (paneles flush).
 * @see components/data-workspace/dataWorkspaceListStyles.ts
 * @see components/data-workspace/DataWorkspaceDetailEmptyState.tsx
 */

export const LAYOUTS_BLOCKS_GRID_EMPTY_STATE_SPEC = {
  token: "layout.blocks.empty.grid",
  className: "dataWorkspaceBlocksEmptyStateClass",
  surface: "bg-white",
  border: "border dashed · bruma-300",
  radius: "rounded-xl",
  typography: "font-canopy text-sm · bruma-500",
  usage: "Listados cuentas/cajas sin ítems — mensaje centrado en el grid.",
} as const

export const LAYOUTS_BLOCKS_DETAIL_EMPTY_STATE_SPEC = {
  token: "layout.blocks.empty.detail",
  component: "DataWorkspaceDetailEmptyState",
  layout: "flex col · center · px-6 py-16",
  contentMaxWidth: "16rem",
  iconWrap: {
    token: "layout.blocks.empty.detail.icon",
    size: "size-12 (48px)",
    radius: "rounded-full",
    background: "bruma-50",
    iconColor: "bruma-500",
    iconSize: "size-5 · stroke 1.75",
  },
  title: {
    token: "font.body.medium",
    color: "bruma-900",
  },
  description: {
    token: "font.body.small",
    color: "bruma-500",
    optional: true,
  },
  usage:
    "Paneles de detalle flush — listas vacías (arqueos, liquidaciones, operaciones). Solo título salvo que haga falta contexto extra.",
} as const

export const LAYOUTS_BLOCKS_EMPTY_STATE_SPEC_ROWS = [
  {
    role: "Grid · superficie",
    token: LAYOUTS_BLOCKS_GRID_EMPTY_STATE_SPEC.token,
    value: LAYOUTS_BLOCKS_GRID_EMPTY_STATE_SPEC.surface,
    product: "dataWorkspaceBlocksEmptyStateClass",
  },
  {
    role: "Grid · borde",
    token: "color.border",
    value: "bruma-300 dashed",
    product: LAYOUTS_BLOCKS_GRID_EMPTY_STATE_SPEC.border,
  },
  {
    role: "Detalle · layout",
    token: LAYOUTS_BLOCKS_DETAIL_EMPTY_STATE_SPEC.token,
    value: LAYOUTS_BLOCKS_DETAIL_EMPTY_STATE_SPEC.layout,
    product: "dataWorkspaceDetailEmptyStateClass",
  },
  {
    role: "Detalle · icon tile",
    token: LAYOUTS_BLOCKS_DETAIL_EMPTY_STATE_SPEC.iconWrap.token,
    value: `${LAYOUTS_BLOCKS_DETAIL_EMPTY_STATE_SPEC.iconWrap.size} · ${LAYOUTS_BLOCKS_DETAIL_EMPTY_STATE_SPEC.iconWrap.background}`,
    product: "dataWorkspaceDetailEmptyStateIconWrapClass",
  },
  {
    role: "Detalle · título",
    token: LAYOUTS_BLOCKS_DETAIL_EMPTY_STATE_SPEC.title.token,
    value: LAYOUTS_BLOCKS_DETAIL_EMPTY_STATE_SPEC.title.color,
    product: "dataWorkspaceDetailEmptyStateTitleClass",
  },
  {
    role: "Detalle · descripción",
    token: LAYOUTS_BLOCKS_DETAIL_EMPTY_STATE_SPEC.description.token,
    value: LAYOUTS_BLOCKS_DETAIL_EMPTY_STATE_SPEC.description.color,
    product: "dataWorkspaceDetailEmptyStateDescriptionClass · opcional",
  },
] as const

export const LAYOUTS_BLOCKS_EMPTY_STATE_DEMO_COPY = {
  grid: "No hay cuentas configuradas.",
  detailLiquidaciones: {
    title: "Sin liquidaciones en el período",
  },
  detailArqueos: {
    title: "Sin arqueos en este período",
  },
  detailOperaciones: {
    title: "Sin operaciones en este arqueo",
  },
} as const
