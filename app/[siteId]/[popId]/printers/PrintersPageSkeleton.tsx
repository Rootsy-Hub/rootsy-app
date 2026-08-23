import { dataWorkspaceBlocksSkeletonTone } from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

export function PrintersPageSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando impresoras</span>
      <div className={cn(dataWorkspaceBlocksSkeletonTone.bar, "h-4 w-40")} />
      <div className={cn(dataWorkspaceBlocksSkeletonTone.box, "h-64")} />
    </div>
  )
}
