"use client"

import { ExpensePeriodToolbar } from "@/app/[siteId]/[popId]/expenses/ExpensePeriodToolbar"
import { ExpenseSummaryDashboard } from "@/app/[siteId]/[popId]/expenses/ExpenseSummaryDashboard"
import {
  dataWorkspaceBlocksSkeletonBreathTone,
  dataWorkspaceEntityCardLosetaSurfaceClass,
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

export function ExpensePageSkeleton() {
  return (
    <div
      className="space-y-8"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <ExpenseSummaryDashboard totalDue={0} totalPaid={0} />
        </div>
        <ExpensePeriodToolbar
          year={new Date().getFullYear()}
          month1={new Date().getMonth() + 1}
          onChange={() => undefined}
        />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        {[0, 1].map((col) => (
          <div key={col} className="space-y-3">
            <Bone className={cn("h-3.5 w-32", sk.bar)} delay={col + 3} />
            <article
              className={cn(
                dataWorkspaceEntityCardLosetaSurfaceClass,
                "h-auto px-5 py-4",
              )}
            >
              <Bone className={cn("h-4 w-40", sk.bar)} delay={col + 3} />
              <Bone className={cn("mt-3 h-2.5 w-24", sk.pill)} delay={col + 3} />
            </article>
            <article
              className={cn(
                dataWorkspaceEntityCardLosetaSurfaceClass,
                "h-auto px-5 py-4",
              )}
            >
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
