import {
  dataWorkspaceDetailEmptyStateClass,
  dataWorkspaceDetailEmptyStateContentClass,
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceDetailEmptyStateIconWrapClass,
  dataWorkspaceDetailEmptyStateTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type Props = {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function DataWorkspaceDetailEmptyState({
  icon: Icon,
  title,
  description,
  className,
}: Props) {
  return (
    <div className={cn(dataWorkspaceDetailEmptyStateClass, className)} role="status">
      <div className={dataWorkspaceDetailEmptyStateContentClass}>
        <div className={dataWorkspaceDetailEmptyStateIconWrapClass} aria-hidden>
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <p className={dataWorkspaceDetailEmptyStateTitleClass}>{title}</p>
        {description ? (
          <p className={dataWorkspaceDetailEmptyStateDescriptionClass}>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
