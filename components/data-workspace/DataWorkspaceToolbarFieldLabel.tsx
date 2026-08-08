import { toolbarBlockLabelClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import type { ReactNode } from "react"

export function DataWorkspaceToolbarFieldLabel({
  htmlFor,
  id,
  label,
  meta,
}: {
  htmlFor?: string
  id?: string
  label: string
  meta?: ReactNode
}) {
  return (
    <div className="mb-2 flex min-w-0 items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} id={id} className={toolbarBlockLabelClass}>
        {label}
      </label>
      {meta ? (
        <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
          {meta}
        </span>
      ) : null}
    </div>
  )
}
