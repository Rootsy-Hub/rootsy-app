"use client"

import {
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceEntityCardIsotypeClass,
  dataWorkspaceEntityCardLosetaClass,
  dataWorkspaceEntityCardLosetaSurfaceClass,
  dataWorkspaceEntityCardTitleClass,
  dataWorkspaceIntegrationChipSelectedClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import "./reportHubCard.css"

type SharedProps = {
  title: string
  description: string
  icon: LucideIcon
  categoryActive?: boolean
  selected?: boolean
  planned?: boolean
}

type LinkProps = SharedProps & {
  href: string
  onSelect?: never
  planned?: false
}

type SelectProps = SharedProps & {
  href?: never
  onSelect: () => void
  planned?: false
}

type PlannedProps = SharedProps & {
  href?: never
  onSelect?: never
  planned: true
}

type Props = LinkProps | SelectProps | PlannedProps

function ReportHubCardShell({
  title,
  description,
  icon: Icon,
  categoryActive = true,
  selected = false,
  planned = false,
  className,
  ...rest
}: SharedProps & {
  className?: string
} & (
  | { type: "button"; onClick: () => void }
  | { type: "link"; href: string }
  | { type: "planned" }
)) {
  const isInteractive = categoryActive && !planned

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            dataWorkspaceEntityCardIsotypeClass,
            "size-9 sm:size-10",
          )}
          aria-hidden
        >
          <Icon className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
        </span>
        {planned ? (
          <span className="shrink-0 rounded-full border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--rootsy-bruma-500)]">
            Próximamente
          </span>
        ) : (
          <span className={cn("report-hub-card__arrow", !isInteractive && "opacity-70")}>
            <ArrowRight
              className="report-hub-card__arrow-icon size-3.5 sm:size-4"
              strokeWidth={1.75}
              aria-hidden
            />
          </span>
        )}
      </div>

      <div className="mt-2.5 min-w-0 sm:mt-3">
        <h3
          className={cn(
            dataWorkspaceEntityCardTitleClass,
            "line-clamp-2 leading-snug",
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            dataWorkspaceDetailEmptyStateDescriptionClass,
            "mt-1 line-clamp-2 leading-snug",
          )}
        >
          {description}
        </p>
      </div>
    </>
  )

  const surfaceClass = cn(
    isInteractive ? dataWorkspaceEntityCardLosetaClass : dataWorkspaceEntityCardLosetaSurfaceClass,
    "flex min-h-0 w-full flex-col p-3 text-left outline-none sm:p-4",
    selected && isInteractive && dataWorkspaceIntegrationChipSelectedClass,
    !isInteractive && "cursor-not-allowed",
    !categoryActive && !planned && "opacity-[0.48] saturate-[0.82]",
    planned && !categoryActive && "opacity-55",
    planned && categoryActive && "opacity-80",
    isInteractive &&
      "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)] focus-visible:ring-offset-2",
    className,
  )

  if (!isInteractive) {
    return (
      <div className={surfaceClass} aria-disabled="true">
        {body}
      </div>
    )
  }

  if (rest.type === "button") {
    return (
      <button type="button" onClick={rest.onClick} className={surfaceClass}>
        {body}
      </button>
    )
  }

  return (
    <Link href={rest.href} className={surfaceClass}>
      {body}
    </Link>
  )
}

export function ReportHubCard(props: Props) {
  if (props.planned) {
    return (
      <ReportHubCardShell
        title={props.title}
        description={props.description}
        icon={props.icon}
        categoryActive={props.categoryActive}
        selected={props.selected}
        planned
        type="planned"
      />
    )
  }

  if ("onSelect" in props && props.onSelect) {
    return (
      <ReportHubCardShell
        title={props.title}
        description={props.description}
        icon={props.icon}
        categoryActive={props.categoryActive}
        selected={props.selected}
        type="button"
        onClick={props.onSelect}
      />
    )
  }

  return (
    <ReportHubCardShell
      title={props.title}
      description={props.description}
      icon={props.icon}
      categoryActive={props.categoryActive}
      selected={props.selected}
      type="link"
      href={props.href}
    />
  )
}

/** Grilla única del hub — hasta 5 columnas. */
export const reportHubGridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
