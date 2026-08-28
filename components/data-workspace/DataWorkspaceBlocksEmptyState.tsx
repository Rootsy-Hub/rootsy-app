import { dataWorkspaceBlocksEmptyStateClass } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  title?: string
  description?: string
  children?: ReactNode
  className?: string
}

/** Empty de bloques — recuadro dashed. Las tablas usan DataWorkspaceTableEmptyMascot. */
export function DataWorkspaceBlocksEmptyState({
  title,
  description,
  children,
  className,
}: Props) {
  return (
    <div
      className={cn(dataWorkspaceBlocksEmptyStateClass, className)}
      role="status"
    >
      {title ? (
        <p className="text-base font-medium text-[var(--rootsy-bruma-900)]">
          {title}
        </p>
      ) : null}
      {description ? (
        <p className="mt-2 max-w-md text-sm text-[var(--rootsy-bruma-500)]">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  )
}
