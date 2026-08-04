import type { WorkspaceTableSkeletonColumn } from "@/components/data-workspace/WorkspaceTableSkeleton"

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
    return columns
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
  return columns
}

export function operationsPurchasesSkeletonColumns(): WorkspaceTableSkeletonColumn[] {
  return [
    { kind: "select" },
    { kind: "text", className: "min-w-[10rem]", lines: 2 },
    { kind: "text", className: "min-w-[14rem]", lines: 3 },
    { kind: "text", className: "min-w-[11rem]", lines: 2 },
    { kind: "money" },
    { kind: "money" },
    { kind: "money" },
  ]
}

export function operationsExpensesSkeletonColumns(): WorkspaceTableSkeletonColumn[] {
  return [
    { kind: "select" },
    { kind: "text", className: "min-w-[10rem]", lines: 2 },
    { kind: "text", className: "min-w-[14rem]", lines: 3 },
    { kind: "text", className: "min-w-[11rem]", lines: 2 },
    { kind: "money" },
    { kind: "money" },
    { kind: "money" },
  ]
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
    { kind: "text", className: "min-w-48", lines: 2 },
    { kind: "text", className: "w-44", lines: 1 },
    { kind: "text", className: "w-40", lines: 1 },
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
    { kind: "thumbnail", className: "w-24" },
    { kind: "text", className: "w-[14rem] min-w-0 max-w-[14rem]", lines: 3 },
    { kind: "text", className: "min-w-0 max-w-[12rem]" },
    { kind: "money" },
    { kind: "money" },
    { kind: "text", className: "w-[5.5rem] text-center" },
    { kind: "pill", className: "w-[6.5rem]" },
  ]
  if (options?.hasActionsColumn) {
    columns.push({ kind: "actions", className: "w-[6.5rem]", actionCount: 1 })
  }
  return columns
}

export function promotionsSkeletonColumns(options?: {
  hasActionsColumn?: boolean
}): WorkspaceTableSkeletonColumn[] {
  const columns: WorkspaceTableSkeletonColumn[] = [
    { kind: "select" },
    { kind: "thumbnail", className: "w-24" },
    { kind: "text", className: "w-[14rem] min-w-0 max-w-[14rem]", lines: 3 },
    { kind: "pill", className: "w-[7rem]" },
    { kind: "text", className: "min-w-[9rem]" },
    { kind: "text", className: "min-w-[10rem]" },
    { kind: "text", className: "w-[8rem]" },
    { kind: "pill", className: "w-[7.5rem]" },
  ]
  if (options?.hasActionsColumn) {
    columns.push({ kind: "actions", className: "w-[6.5rem]", actionCount: 1 })
  }
  return columns
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
