import {
  dataWorkspaceBlocksSkeletonBreathTone,
  dataWorkspaceEntityCardLosetaSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { reportHubGridClass } from "@/components/reports/ReportHubCard"
import { cn } from "@/lib/utils"

export function InventoryHomeSkeleton() {
  const bar = dataWorkspaceBlocksSkeletonBreathTone.bar
  const box = dataWorkspaceBlocksSkeletonBreathTone.box
  return (
    <div className="space-y-10" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando inventario</span>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-36 p-5")}
          >
            <div className={cn(bar, "h-3 w-24")} />
            <div className={cn(bar, "mt-6 h-8 w-36")} />
            <div className={cn(bar, "mt-3 h-3 w-28")} />
          </div>
        ))}
      </div>
      <div className={reportHubGridClass}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={cn(box, "h-32 rounded-[1.375rem]")} />
        ))}
      </div>
    </div>
  )
}
