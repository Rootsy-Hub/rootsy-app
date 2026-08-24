"use client"

import {
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksSkeletonBreathTone,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardLosetaGridClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardSaldoSectionClass,
  dataWorkspaceEntityCardSettlementFooterClass,
  dataWorkspaceEntityCardsGridClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

const sk = dataWorkspaceBlocksSkeletonBreathTone

function delayStyle(index: number) {
  return { animationDelay: `${index * 160}ms` }
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

function PersonCard({ delay }: { delay: number }) {
  return (
    <article className={dataWorkspaceEntityCardLosetaSurfaceClass}>
      <div className={dataWorkspaceEntityCardLosetaGridClass}>
        <div className={cn(dataWorkspaceEntityCardHeaderClass, "pr-4")}>
          <div className="flex min-w-0 items-start gap-3">
            <Bone className={cn("size-11 shrink-0 rounded-xl", sk.box)} delay={delay} />
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className={cn("h-2.5 w-20", sk.pill)} delay={delay} />
              <Bone className={cn("h-5 w-36", sk.bar)} delay={delay} />
            </div>
          </div>
        </div>
        <div className={dataWorkspaceEntityCardSaldoSectionClass}>
          <Bone className={cn("h-2.5 w-14", sk.pill)} delay={delay} />
          <Bone className={cn("mt-1.5 h-8 w-28", sk.bar)} delay={delay} />
        </div>
        <div className={dataWorkspaceEntityCardSettlementFooterClass}>
          <div>
            <Bone className={cn("h-2.5 w-12", sk.pill)} delay={delay} />
            <Bone className={cn("mt-1 h-6 w-20", sk.bar)} delay={delay} />
          </div>
          <Bone className={cn("h-8 w-16 self-center rounded-lg", sk.box)} delay={delay} />
        </div>
      </div>
    </article>
  )
}

export function HrPageSkeleton() {
  return (
    <div
      className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="order-2 space-y-4 lg:order-1 lg:col-span-3">
        <div className="space-y-2">
          <Bone className={cn("h-3.5 w-28", sk.bar)} />
          <Bone className={cn("h-2.5 w-40 max-w-full", sk.pill)} />
        </div>
        <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto")}>
          <div className="space-y-3 px-4 py-4">
            <Bone className={cn("h-8 w-24 rounded-lg", sk.box)} />
            <Bone className={cn("h-4 w-32", sk.bar)} delay={1} />
            <Bone className={cn("h-4 w-24", sk.bar)} delay={2} />
          </div>
        </article>
        <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto")}>
          <div className="space-y-3 px-4 py-4">
            <Bone className={cn("h-3.5 w-20", sk.bar)} />
            <Bone className={cn("h-8 w-full", sk.box)} delay={1} />
            <Bone className={cn("h-8 w-full", sk.box)} delay={2} />
          </div>
        </article>
      </div>
      <div className="order-1 space-y-4 lg:order-2 lg:col-span-9">
        <Bone className={cn("h-9 w-full max-w-md rounded-lg", sk.box)} />
        <div className={dataWorkspaceEntityCardsGridClass}>
          <PersonCard delay={1} />
          <PersonCard delay={2} />
          <PersonCard delay={3} />
        </div>
      </div>
      <span className="sr-only">Preparando el equipo del local</span>
    </div>
  )
}

export function HrPageSkeletonScreen() {
  return (
    <div className={dataWorkspaceBlocksPageContentClass}>
      <HrPageSkeleton />
    </div>
  )
}
