"use client"

import {
  dataWorkspaceBlocksSkeletonBreathTone,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardsGridClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

const sk = dataWorkspaceBlocksSkeletonBreathTone

function delayStyle(index: number) {
  return { animationDelay: `${index * 140}ms` }
}

function Bone({
  className,
  delay = 0,
}: {
  className?: string
  delay?: number
}) {
  return <div className={className} style={delayStyle(delay)} />
}

function KpiLoseta({ delay }: { delay: number }) {
  return (
    <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto px-5 py-4")}>
      <Bone className={cn("h-2.5 w-24", sk.pill)} delay={delay} />
      <Bone className={cn("mt-3 h-8 w-36", sk.bar)} delay={delay} />
      <Bone className={cn("mt-2 h-2.5 w-28", sk.pill)} delay={delay} />
    </article>
  )
}

export function ExpensePageSkeleton() {
  return (
    <div
      className="space-y-8"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Bone className={cn("h-3.5 w-28", sk.bar)} />
          <Bone className={cn("h-2.5 w-64 max-w-full", sk.pill)} />
        </div>
        <div className={dataWorkspaceEntityCardsGridClass}>
          <KpiLoseta delay={1} />
          <KpiLoseta delay={2} />
          <KpiLoseta delay={3} />
        </div>
        <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto px-5 py-4")}>
          <Bone className={cn("h-3 w-36", sk.bar)} delay={2} />
          <Bone className={cn("mt-3 h-2 w-full", sk.pill)} delay={2} />
        </article>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {[0, 1].map((col) => (
          <div key={col} className="space-y-3">
            <Bone className={cn("h-3.5 w-32", sk.bar)} delay={col + 3} />
            <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto px-5 py-4")}>
              <Bone className={cn("h-4 w-40", sk.bar)} delay={col + 3} />
              <Bone className={cn("mt-3 h-2.5 w-24", sk.pill)} delay={col + 3} />
            </article>
            <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto px-5 py-4")}>
              <Bone className={cn("h-4 w-48", sk.bar)} delay={col + 4} />
              <Bone className={cn("mt-3 h-2.5 w-20", sk.pill)} delay={col + 4} />
            </article>
          </div>
        ))}
      </div>
      <span className="sr-only">Preparando los gastos del mes</span>
    </div>
  )
}
