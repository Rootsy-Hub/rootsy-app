"use client"

import { HR_PEOPLE_FILTERS } from "@/app/[siteId]/[popId]/hr/hrPeopleFilter"
import {
  hrPeopleFilterFieldClass,
  hrPeopleFilterGroupClass,
  hrPeopleFilterShellClass,
  hrPeoplePaneClass,
  hrRolesBodyGridClass,
  hrRolesOperativeSpanClass,
  hrPersonCardFooterClass,
  hrRolesPaneClass,
  hrSplitGridClass,
} from "@/app/[siteId]/[popId]/hr/hrWorkspaceLayout"
import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import { RootsDefaultButton } from "@/components/rootsy-button"
import { Plus } from "lucide-react"
import { RootsFormSegmentField } from "@/components/rootsy-form"
import {
  dataWorkspaceBlocksSkeletonBreathTone,
  dataWorkspaceBlocksSplitFrameClass,
  dataWorkspaceEntityCardActionFooterClass,
  dataWorkspaceEntityCardHeaderClass,
  dataWorkspaceEntityCardLosetaGridClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardSaldoSectionClass,
  dataWorkspaceEntityCardsGridClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"

const sk = dataWorkspaceBlocksSkeletonBreathTone
const NAME_WIDTHS = ["w-36", "w-28", "w-32", "w-24"] as const
const SALARY_WIDTHS = ["w-28", "w-24", "w-32", "w-20"] as const
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
  const nameWidth = NAME_WIDTHS[delay % NAME_WIDTHS.length]
  const salaryWidth = SALARY_WIDTHS[delay % SALARY_WIDTHS.length]

  return (
    <article className={dataWorkspaceEntityCardLosetaSurfaceClass}>
      <div className={dataWorkspaceEntityCardLosetaGridClass}>
        <div className={cn(dataWorkspaceEntityCardHeaderClass, "pr-4")}>
          <div className="flex min-w-0 items-start gap-3">
            <Bone
              className={cn("size-11 shrink-0 rounded-xl", sk.box)}
              delay={delay}
            />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Bone className={cn("h-2.5 w-20", sk.pill)} delay={delay} />
              <Bone className={cn("h-5", sk.bar, nameWidth)} delay={delay} />
              <Bone className={cn("h-3 w-32", sk.barSm)} delay={delay} />
            </div>
            <Bone
              className={cn("-mr-1 size-8 shrink-0 rounded-lg", sk.box)}
              delay={delay}
            />
          </div>
        </div>
        <div className={dataWorkspaceEntityCardSaldoSectionClass}>
          <Bone className={cn("h-2.5 w-14", sk.pill)} delay={delay} />
          <Bone
            className={cn("mt-1.5 h-8", sk.bar, salaryWidth)}
            delay={delay}
          />
        </div>
        <div className={cn(dataWorkspaceEntityCardActionFooterClass, hrPersonCardFooterClass)}>
          <div>
            <Bone className={cn("h-2.5 w-12", sk.pill)} delay={delay} />
            <Bone className={cn("mt-1 h-6 w-24", sk.bar)} delay={delay} />
          </div>
          <Bone
            className={cn("h-8 w-18 shrink-0 rounded-lg", sk.box)}
            delay={delay}
          />
        </div>
      </div>
    </article>
  )
}

function RolesListCard() {
  return (
    <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto")}>
        <ul className="divide-y divide-rootsy-bruma-200">
        {Array.from({ length: 4 }, (_, index) => (
          <li
            key={index}
            className="flex items-start justify-between gap-2 px-4 py-3"
          >
            <div className="min-w-0 space-y-1.5">
              <Bone
                className={cn(
                  "h-3.5",
                  index % 2 === 0 ? "w-28" : "w-24",
                  sk.bar,
                )}
                delay={index}
              />
              <Bone className={cn("h-3 w-32", sk.barSm)} delay={index} />
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <Bone className={cn("size-8 rounded-lg", sk.box)} delay={index} />
              <Bone className={cn("size-8 rounded-lg", sk.box)} delay={index} />
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}

function RoleSnapshotCard({ delay }: { delay: number }) {
  return (
    <article className={cn(dataWorkspaceEntityCardLosetaSurfaceClass, "h-auto")}>
      <div className="px-4 pt-4">
        <Bone className={cn("h-3.5 w-28", sk.bar)} delay={delay} />
      </div>
      <ul className="space-y-3 px-4 py-3">
        {Array.from({ length: 2 }, (_, index) => (
          <li key={index} className="flex min-w-0 items-center gap-2.5">
            <Bone
              className={cn("size-8 shrink-0 rounded-full", sk.box)}
              delay={delay + index}
            />
            <div className="min-w-0 space-y-1.5">
              <Bone
                className={cn("h-3.5 w-28", sk.bar)}
                delay={delay + index}
              />
              <Bone
                className={cn("h-2.5 w-20", sk.pill)}
                delay={delay + index}
              />
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}

export function HrPageSkeleton() {
  return (
    <div
      className={dataWorkspaceBlocksSplitFrameClass}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className={hrSplitGridClass}>
        <section className={hrPeoplePaneClass}>
          <DataWorkspaceBlocksSection>
            <div className={hrPeopleFilterShellClass}>
            <RootsFormSegmentField
              label="Ver personas"
              aria-label="Filtrar personas"
              layout="inline"
              className={hrPeopleFilterFieldClass}
              groupClassName={hrPeopleFilterGroupClass}
              value="negocio"
              onValueChange={() => undefined}
              options={HR_PEOPLE_FILTERS}
              disabled
            />
            </div>
            <div className={dataWorkspaceEntityCardsGridClass}>
              <PersonCard delay={1} />
              <PersonCard delay={2} />
              <PersonCard delay={3} />
              <PersonCard delay={4} />
            </div>
          </DataWorkspaceBlocksSection>
        </section>
        <aside className={hrRolesPaneClass}>
          <DataWorkspaceBlocksSection
            title="Roles en Rootsy"
            description="Qué puede hacer."
            action={
              <RootsDefaultButton
                type="button"
                size="compact"
                withIcon
                disabled
              >
                <Plus className="size-3.5" aria-hidden />
                Nuevo rol
              </RootsDefaultButton>
            }
          >
            <div className={hrRolesBodyGridClass}>
              <div className={hrRolesOperativeSpanClass}>
              <RolesListCard />
              </div>
              <RoleSnapshotCard delay={1} />
              <RoleSnapshotCard delay={2} />
            </div>
          </DataWorkspaceBlocksSection>
        </aside>
      </div>
      <span className="sr-only">Preparando el equipo del local</span>
    </div>
  )
}

export function HrPageSkeletonScreen() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <HrPageSkeleton />
    </div>
  )
}
