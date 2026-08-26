import {
  DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT,
  type WorkspaceTableSkeletonColumn,
} from "@/components/data-workspace/WorkspaceTableSkeleton"
import {
  articlesSkeletonColumns,
  auditSkeletonColumns,
  checksSkeletonColumns,
  clientsSkeletonColumns,
  currentAccountsSkeletonColumns,
  invoicesSkeletonColumns,
  layoutPreviewSkeletonColumns,
  manufacturingSkeletonColumns,
  operationsSalesSkeletonColumns,
  promotionsSkeletonColumns,
  purchaseOrdersSkeletonColumns,
  quotesSkeletonColumns,
  recipesSkeletonColumns,
  servicesSkeletonColumns,
  suppliersSkeletonColumns,
} from "@/components/data-workspace/workspaceTableSkeletonPresets"

export type PopTableListSkeletonHeaderCell =
  | { type: "select"; className?: string }
  | {
      type: "label"
      label: string
      align?: "left" | "right" | "center"
      className?: string
      srOnly?: boolean
    }

export type PopTableListFilterLayout = "dual" | "triple"

export type PopTableListSkeletonConfig = {
  columns: WorkspaceTableSkeletonColumn[]
  headers: PopTableListSkeletonHeaderCell[]
  filterLayout?: PopTableListFilterLayout
  tableMinWidth?: string
  rowCount?: number
}

const DEFAULT_ROW_COUNT = DATA_WORKSPACE_TABLE_SKELETON_ROW_COUNT

function clientsConfig(): PopTableListSkeletonConfig {
  return {
    filterLayout: "dual",
    tableMinWidth: "min-w-[72rem]",
    columns: clientsSkeletonColumns({ hasActionsColumn: true }),
    headers: [
      { type: "select" },
      { type: "label", label: "Nombre", className: "min-w-[10rem] px-3" },
      {
        type: "label",
        label: "E-mail",
        className: "w-[12rem] min-w-0 max-w-[12rem] px-3",
      },
      {
        type: "label",
        label: "Teléfono",
        className: "w-[9rem] min-w-0 max-w-[9rem] px-3",
      },
      { type: "label", label: "CUIT / DNI", className: "w-[7.5rem] px-3" },
      { type: "label", label: "IVA", className: "min-w-[8.5rem] px-3" },
      { type: "label", label: "Última compra", className: "w-[7.25rem] px-3" },
      {
        type: "label",
        label: "Ventas / Total",
        align: "right",
        className: "min-w-[8.5rem] px-3",
      },
      {
        type: "label",
        label: "Acciones",
        align: "right",
        className: "w-[7.25rem] px-3",
        srOnly: true,
      },
    ],
  }
}

function suppliersConfig(): PopTableListSkeletonConfig {
  return {
    filterLayout: "dual",
    tableMinWidth: "min-w-[64rem]",
    columns: suppliersSkeletonColumns({ hasActionsColumn: true }),
    headers: [
      { type: "select" },
      { type: "label", label: "Nombre", className: "min-w-[10rem] px-3" },
      {
        type: "label",
        label: "E-mail",
        className: "w-[12rem] min-w-0 max-w-[12rem] px-3",
      },
      {
        type: "label",
        label: "Teléfono",
        className: "w-[9rem] min-w-0 max-w-[9rem] px-3",
      },
      {
        type: "label",
        label: "CUIT / ID fiscal",
        className: "w-[7.5rem] px-3",
      },
      { type: "label", label: "IVA", className: "min-w-[8.5rem] px-3" },
      {
        type: "label",
        label: "Acciones",
        align: "right",
        className: "w-[7.25rem] px-3",
        srOnly: true,
      },
    ],
  }
}

function articlesConfig(): PopTableListSkeletonConfig {
  return {
    filterLayout: "dual",
    tableMinWidth: "min-w-[72rem]",
    columns: articlesSkeletonColumns({ hasActionsColumn: true }),
    headers: [
      { type: "select" },
      {
        type: "label",
        label: "Imagen",
        className: "w-14 px-3",
        srOnly: true,
      },
      {
        type: "label",
        label: "Artículo",
        className: "w-40 min-w-40 max-w-44 px-3",
      },
      { type: "label", label: "Detalle", className: "w-56 px-3" },
      { type: "label", label: "Categoría", className: "w-40 px-3" },
      {
        type: "label",
        label: "Venta",
        align: "right",
        className: "w-28 px-3",
      },
      { type: "label", label: "Costos", align: "right", className: "w-28 px-3" },
      {
        type: "label",
        label: "Stock",
        align: "right",
        className: "w-[5.5rem] px-3",
      },
      {
        type: "label",
        label: "Acciones",
        align: "right",
        className: "w-[7.25rem] px-3",
        srOnly: true,
      },
    ],
  }
}

function catalogEntityConfig(options: {
  entityLabel: string
  columns: WorkspaceTableSkeletonColumn[]
  tableMinWidth?: string
}): PopTableListSkeletonConfig {
  return {
    filterLayout: "dual",
    tableMinWidth: options.tableMinWidth ?? "min-w-[64rem]",
    columns: options.columns,
    headers: [
      { type: "select" },
      {
        type: "label",
        label: "Imagen",
        className: "w-14 px-3",
        srOnly: true,
      },
      {
        type: "label",
        label: options.entityLabel,
        className: "w-56 min-w-56 max-w-64 px-3",
      },
      { type: "label", label: "Categoría", className: "w-40 px-3" },
      {
        type: "label",
        label: "Venta",
        align: "right",
        className: "w-32 px-3",
      },
      { type: "label", label: "Costo", align: "right", className: "w-32 px-3" },
      {
        type: "label",
        label: "Estado",
        className: "w-28 px-3 text-center",
        align: "center",
      },
      {
        type: "label",
        label: "Acciones",
        align: "right",
        className: "w-[7.25rem] px-3",
        srOnly: true,
      },
    ],
  }
}

function quotesLikeConfig(): PopTableListSkeletonConfig {
  return {
    filterLayout: "dual",
    tableMinWidth: "min-w-[48rem]",
    columns: quotesSkeletonColumns(),
    headers: [
      { type: "label", label: "N.º", className: "w-16 px-3" },
      { type: "label", label: "Cliente", className: "min-w-[12rem] px-3" },
      { type: "label", label: "Total", className: "px-3" },
      { type: "label", label: "Fecha", className: "min-w-[9rem] px-3" },
      {
        type: "label",
        label: "Acciones",
        align: "right",
        className: "w-[11rem] px-3",
      },
    ],
  }
}

const MODULE_SKELETON_CONFIG: Record<string, PopTableListSkeletonConfig> = {
  clients: clientsConfig(),
  suppliers: suppliersConfig(),
  articles: articlesConfig(),
  recipes: catalogEntityConfig({
    entityLabel: "Receta",
    columns: recipesSkeletonColumns({ hasActionsColumn: true }),
  }),
  promotions: {
    filterLayout: "dual",
    tableMinWidth: "min-w-[72rem]",
    columns: promotionsSkeletonColumns({ hasActionsColumn: true }),
    headers: [
      { type: "select" },
      {
        type: "label",
        label: "Imagen",
        className: "w-14 px-3",
        srOnly: true,
      },
      {
        type: "label",
        label: "Promoción",
        className: "w-56 min-w-56 max-w-64 px-3",
      },
      { type: "label", label: "Tipo", className: "w-28 px-3" },
      { type: "label", label: "Categoría", className: "w-40 px-3" },
      { type: "label", label: "Detalle", className: "w-56 px-3" },
      { type: "label", label: "Vigencia", className: "w-32 px-3" },
      { type: "label", label: "Estado", className: "w-32 px-3" },
      {
        type: "label",
        label: "Acciones",
        align: "right",
        className: "w-[7.25rem] px-3",
        srOnly: true,
      },
    ],
  },
  services: {
    filterLayout: "dual",
    tableMinWidth: "min-w-[56rem]",
    columns: servicesSkeletonColumns({ hasActionsColumn: true }),
    headers: [
      { type: "select" },
      {
        type: "label",
        label: "Servicio",
        className: "w-56 min-w-56 max-w-64 px-3",
      },
      { type: "label", label: "Categoría", className: "w-40 px-3" },
      {
        type: "label",
        label: "Precio",
        align: "right",
        className: "w-32 px-3",
      },
      { type: "label", label: "Período", className: "w-28 px-3" },
      {
        type: "label",
        label: "Estado",
        className: "w-32 px-3 text-center",
        align: "center",
      },
      {
        type: "label",
        label: "Acciones",
        align: "right",
        className: "w-[7.25rem] px-3",
        srOnly: true,
      },
    ],
  },
  operations: {
    filterLayout: "triple",
    tableMinWidth: "min-w-[72rem]",
    columns: operationsSalesSkeletonColumns({ ventasLayout: true }),
    headers: [
      { type: "select" },
      { type: "label", label: "Canal", className: "min-w-[10rem] px-3" },
      { type: "label", label: "Fecha", className: "min-w-[10rem] px-3" },
      { type: "label", label: "Detalle", className: "min-w-[14rem] px-3" },
      { type: "label", label: "Cliente", className: "min-w-[11rem] px-3" },
      {
        type: "label",
        label: "Subtotal",
        align: "right",
        className: "px-3",
      },
      { type: "label", label: "IVA", align: "right", className: "px-3" },
      { type: "label", label: "Total", align: "right", className: "px-3" },
      {
        type: "label",
        label: "Acciones",
        align: "right",
        className: "w-10 px-3",
        srOnly: true,
      },
    ],
  },
  invoices: {
    filterLayout: "dual",
    tableMinWidth: "min-w-[64rem]",
    columns: invoicesSkeletonColumns(),
    headers: [
      {
        type: "label",
        label: "Detalle",
        className: "w-12 px-3",
        srOnly: true,
      },
      { type: "label", label: "Tipo", className: "w-36 min-w-36 px-3" },
      { type: "label", label: "Fecha", className: "w-28 px-3" },
      { type: "label", label: "Pto. / Nº", className: "w-32 px-3" },
      { type: "label", label: "Receptor", className: "min-w-[10rem] px-3" },
      { type: "label", label: "Total", align: "right", className: "px-3" },
      { type: "label", label: "CAE", className: "w-28 px-3" },
      { type: "label", label: "Estado", className: "w-32 px-3" },
    ],
  },
  checks: {
    filterLayout: "dual",
    tableMinWidth: "min-w-[72rem]",
    columns: checksSkeletonColumns(),
    headers: [
      { type: "label", label: "Número", className: "w-28 px-3" },
      { type: "label", label: "Dirección", className: "w-28 px-3" },
      { type: "label", label: "Banco", className: "min-w-[9rem] px-3" },
      {
        type: "label",
        label: "Titular",
        className: "min-w-[10rem] px-3",
      },
      { type: "label", label: "Importe", align: "right", className: "px-3" },
      { type: "label", label: "Emisión", className: "w-28 px-3" },
      { type: "label", label: "Cobro", className: "w-28 px-3" },
      { type: "label", label: "Estado", className: "w-32 px-3" },
      {
        type: "label",
        label: "Acciones",
        align: "right",
        className: "w-10 px-3",
        srOnly: true,
      },
    ],
  },
  manufacturing: {
    filterLayout: "dual",
    tableMinWidth: "min-w-[44rem]",
    columns: manufacturingSkeletonColumns(),
    headers: [
      { type: "label", label: "Día", className: "w-28 px-3" },
      { type: "label", label: "Qué", className: "min-w-[12rem] px-3" },
      { type: "label", label: "Cuántas", className: "w-28 px-3" },
      { type: "label", label: "Vence", className: "w-28 px-3" },
      { type: "label", label: "Costo", align: "right", className: "w-28 px-3" },
      { type: "label", label: "Quién", className: "min-w-[8rem] px-3" },
    ],
  },
  audit: {
    filterLayout: "triple",
    tableMinWidth: "min-w-[56rem]",
    columns: auditSkeletonColumns(),
    headers: [
      { type: "label", label: "Cuándo", className: "w-32 px-3" },
      { type: "label", label: "Quién", className: "min-w-[9rem] px-3" },
      { type: "label", label: "Actividad", className: "min-w-[11rem] px-3" },
      { type: "label", label: "Registro", className: "min-w-[10rem] px-3" },
      { type: "label", label: "Cambio", className: "min-w-[14rem] px-3" },
    ],
  },
  quotes: quotesLikeConfig(),
  "purchase-orders": {
    ...quotesLikeConfig(),
    columns: purchaseOrdersSkeletonColumns(),
  },
  "current-accounts": {
    filterLayout: "dual",
    tableMinWidth: "min-w-4xl",
    columns: currentAccountsSkeletonColumns(),
    headers: [
      {
        type: "label",
        label: "Acciones",
        align: "center",
        className: "w-14 pl-3 pr-1",
        srOnly: true,
      },
      {
        type: "label",
        label: "Cliente",
        className: "min-w-[12rem] px-3",
      },
      {
        type: "label",
        label: "Límite",
        align: "right",
        className: "w-[8.5rem] px-3",
      },
      { type: "label", label: "Plazo", className: "w-[7.5rem] px-3" },
      { type: "label", label: "Abiertos", className: "w-28 px-3" },
      { type: "label", label: "Vencido", className: "w-32 px-3" },
      { type: "label", label: "Saldo", align: "right", className: "px-3" },
    ],
  },
}

function layoutPreviewConfig(): PopTableListSkeletonConfig {
  return {
    filterLayout: "dual",
    tableMinWidth: "min-w-[64rem]",
    columns: layoutPreviewSkeletonColumns(),
    headers: [
      { type: "select" },
      {
        type: "label",
        label: "Imagen",
        className: "w-14 px-3",
        srOnly: true,
      },
      { type: "label", label: "Nombre", className: "min-w-[12rem] px-3" },
      { type: "label", label: "Detalle", className: "min-w-[11rem] px-3" },
      { type: "label", label: "Importe", align: "right", className: "px-3" },
      {
        type: "label",
        label: "Estado",
        className: "w-20 px-3 text-center",
        align: "center",
      },
      { type: "label", label: "Tipo", className: "min-w-[7rem] px-3" },
      {
        type: "label",
        label: "Acciones",
        align: "right",
        className: "w-[7.25rem] px-3",
        srOnly: true,
      },
    ],
  }
}

export function isPopTableListModule(moduleKey: string): boolean {
  return moduleKey in MODULE_SKELETON_CONFIG
}

export function getPopTableListSkeletonConfig(
  moduleKey: string,
): PopTableListSkeletonConfig {
  const config = MODULE_SKELETON_CONFIG[moduleKey]
  if (!config) {
    return { ...layoutPreviewConfig(), rowCount: DEFAULT_ROW_COUNT }
  }
  return {
    ...config,
    rowCount: config.rowCount ?? DEFAULT_ROW_COUNT,
  }
}
