import type { WorkspaceTableSkeletonColumn } from "@/components/data-workspace/WorkspaceTableSkeleton"

function withOperationsActionsColumn(
  columns: WorkspaceTableSkeletonColumn[],
): WorkspaceTableSkeletonColumn[] {
  return [...columns, { kind: "actions", className: "w-10", actionCount: 1 }]
}

export function operationsSalesSkeletonColumns(options?: {
  showTableColumn?: boolean
  showOrderColumn?: boolean
  ventasLayout?: boolean
}): WorkspaceTableSkeletonColumn[] {
  if (options?.ventasLayout) {
    const columns: WorkspaceTableSkeletonColumn[] = [
      { kind: "select" },
      { kind: "text", className: "min-w-[10rem]", lines: 2 },
    ]
    if (options?.showTableColumn) {
      columns.push({ kind: "text", className: "min-w-[10rem]", lines: 2 })
    }
    columns.push(
      {
        kind: "text",
        className: "min-w-[14rem]",
        lines:
          options?.showTableColumn || options?.showOrderColumn ? 3 : 2,
      },
      { kind: "text", className: "min-w-[11rem]", lines: 2 },
      { kind: "money" },
      { kind: "money" },
      { kind: "money" },
    )
    return withOperationsActionsColumn(columns)
  }

  const columns: WorkspaceTableSkeletonColumn[] = [
    { kind: "select" },
    { kind: "text", className: "min-w-[10rem]" },
  ]
  if (options?.showTableColumn) {
    columns.push({ kind: "text", className: "w-[6rem]" })
  }
  if (options?.showOrderColumn) {
    columns.push({ kind: "text", className: "w-[6rem]" })
  }
  columns.push(
    { kind: "pill", className: "w-[6.5rem]" },
    { kind: "text", className: "min-w-[12rem]" },
    { kind: "money" },
    { kind: "money" },
  )
  return withOperationsActionsColumn(columns)
}

export function operationsPurchasesSkeletonColumns(): WorkspaceTableSkeletonColumn[] {
  return withOperationsActionsColumn([
    { kind: "select" },
    { kind: "text", className: "min-w-[10rem]", lines: 2 },
    { kind: "text", className: "min-w-[14rem]", lines: 3 },
    { kind: "text", className: "min-w-[11rem]", lines: 2 },
    { kind: "money" },
    { kind: "money" },
    { kind: "money" },
  ])
}

export function operationsExpensesSkeletonColumns(): WorkspaceTableSkeletonColumn[] {
  return withOperationsActionsColumn([
    { kind: "select" },
    { kind: "text", className: "min-w-[10rem]", lines: 2 },
    { kind: "text", className: "min-w-[14rem]", lines: 3 },
    { kind: "text", className: "min-w-[11rem]", lines: 2 },
    { kind: "money" },
    { kind: "money" },
    { kind: "money" },
  ])
}

export function clientsSkeletonColumns(options?: {
  hasActionsColumn?: boolean
}): WorkspaceTableSkeletonColumn[] {
  const columns: WorkspaceTableSkeletonColumn[] = [
    { kind: "select" },
    { kind: "text", className: "min-w-[10rem]", lines: 2 },
    { kind: "text", className: "w-[12rem] min-w-0 max-w-[12rem]" },
    { kind: "text", className: "min-w-[8.5rem] max-w-[9rem]" },
    { kind: "text", className: "w-[7.5rem]" },
    { kind: "pill", className: "min-w-[8.5rem]" },
    { kind: "text", className: "w-[7.25rem]" },
    { kind: "moneyStack", className: "min-w-[8.5rem]" },
  ]
  if (options?.hasActionsColumn) {
    columns.push({ kind: "actions", className: "w-[7.25rem]" })
  }
  return columns
}

export function quotesSkeletonColumns(): WorkspaceTableSkeletonColumn[] {
  return [
    { kind: "text", className: "w-16" },
    { kind: "text", className: "min-w-[12rem]", lines: 2 },
    { kind: "money" },
    { kind: "text", className: "min-w-[9rem]" },
    { kind: "actions", className: "w-[11rem]", actionCount: 5 },
  ]
}

export function suppliersSkeletonColumns(options?: {
  hasActionsColumn?: boolean
}): WorkspaceTableSkeletonColumn[] {
  const columns: WorkspaceTableSkeletonColumn[] = [
    { kind: "select" },
    { kind: "text", className: "min-w-[10rem]", lines: 2 },
    { kind: "text", className: "w-[12rem] min-w-0 max-w-[12rem]" },
    { kind: "text", className: "w-[9rem] min-w-0 max-w-[9rem]" },
    { kind: "text", className: "w-[7.5rem]" },
    { kind: "pill", className: "min-w-[8.5rem]" },
  ]
  if (options?.hasActionsColumn) {
    columns.push({ kind: "actions", className: "w-[7.25rem]" })
  }
  return columns
}

export function articlesSkeletonColumns(options?: {
  hasActionsColumn?: boolean
}): WorkspaceTableSkeletonColumn[] {
  const columns: WorkspaceTableSkeletonColumn[] = [
    { kind: "select" },
    { kind: "thumbnail", className: "w-14" },
    { kind: "text", className: "w-40 min-w-40 max-w-44", lines: 2 },
    { kind: "text", className: "w-56", lines: 2 },
    { kind: "text", className: "w-40", lines: 1 },
    { kind: "money" },
    { kind: "money" },
    { kind: "text", className: "w-[5.5rem] text-right", lines: 1 },
  ]
  if (options?.hasActionsColumn) {
    columns.push({ kind: "actions", className: "w-[7.25rem]" })
  }
  return columns
}

export function recipesSkeletonColumns(options?: {
  hasActionsColumn?: boolean
}): WorkspaceTableSkeletonColumn[] {
  const columns: WorkspaceTableSkeletonColumn[] = [
    { kind: "select" },
    { kind: "thumbnail", className: "w-14" },
    { kind: "text", className: "w-56 min-w-56 max-w-64", lines: 2 },
    { kind: "text", className: "w-40" },
    { kind: "money", className: "w-32" },
    { kind: "money", className: "w-32" },
    { kind: "text", className: "w-28 text-center" },
    { kind: "pill", className: "w-32" },
  ]
  if (options?.hasActionsColumn) {
    columns.push({ kind: "actions", className: "w-[7.25rem]", actionCount: 2 })
  }
  return columns
}

export function promotionsSkeletonColumns(options?: {
  hasActionsColumn?: boolean
}): WorkspaceTableSkeletonColumn[] {
  const columns: WorkspaceTableSkeletonColumn[] = [
    { kind: "select" },
    { kind: "thumbnail", className: "w-14" },
    { kind: "text", className: "w-56 min-w-56 max-w-64", lines: 2 },
    { kind: "pill", className: "w-28" },
    { kind: "text", className: "w-40" },
    { kind: "text", className: "w-56", lines: 2 },
    { kind: "text", className: "w-32" },
    { kind: "pill", className: "w-32" },
  ]
  if (options?.hasActionsColumn) {
    columns.push({ kind: "actions", className: "w-[7.25rem]", actionCount: 2 })
  }
  return columns
}

export function servicesSkeletonColumns(options?: {
  hasActionsColumn?: boolean
}): WorkspaceTableSkeletonColumn[] {
  const columns: WorkspaceTableSkeletonColumn[] = [
    { kind: "select" },
    { kind: "text", className: "w-56 min-w-56 max-w-64", lines: 2 },
    { kind: "text", className: "w-40" },
    { kind: "money", className: "w-32" },
    { kind: "pill", className: "w-28" },
    { kind: "text", className: "w-32 text-center" },
    { kind: "pill", className: "w-32" },
  ]
  if (options?.hasActionsColumn) {
    columns.push({ kind: "actions", className: "w-[7.25rem]", actionCount: 2 })
  }
  return columns
}

export function invoicesSkeletonColumns(): WorkspaceTableSkeletonColumn[] {
  return [
    { kind: "actions", className: "w-12", actionCount: 1 },
    { kind: "text", className: "w-36 min-w-36", lines: 2 },
    { kind: "text", className: "w-28" },
    { kind: "text", className: "w-32" },
    { kind: "text", className: "min-w-[10rem]" },
    { kind: "money" },
    { kind: "text", className: "w-28" },
    { kind: "pill", className: "w-32" },
  ]
}

export function layoutPreviewSkeletonColumns(): WorkspaceTableSkeletonColumn[] {
  return [
    { kind: "select" },
    { kind: "thumbnail", className: "w-14" },
    { kind: "text", className: "min-w-[12rem]", lines: 2 },
    { kind: "text", className: "min-w-[11rem]", lines: 2 },
    { kind: "money" },
    { kind: "text", className: "w-20 text-center" },
    { kind: "pill", className: "min-w-[7rem]" },
    { kind: "actions", className: "w-[7.25rem]", actionCount: 3 },
  ]
}
