"use client"

import {
  dataWorkspaceDetailEmptyStateDescriptionClass,
  dataWorkspaceEntityCardIsotypeClass,
  dataWorkspaceEntityCardLosetaClass,
  dataWorkspaceEntityCardTitleClass,
  dataWorkspaceIntegrationChipSelectedClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

type SharedProps = {
  title: string
  description: string
  icon: LucideIcon
  selected?: boolean
}

type LinkProps = SharedProps & {
  href: string
  onSelect?: never
}

type SelectProps = SharedProps & {
  href?: never
  onSelect: () => void
}

type Props = LinkProps | SelectProps

function ReportHubCardShell({
  title,
  description,
  icon: Icon,
  selected = false,
  className,
  ...rest
}: SharedProps & {
  className?: string
} & (
  | { type: "button"; onClick: () => void }
  | { type: "link"; href: string }
)) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            dataWorkspaceEntityCardIsotypeClass,
            "size-9 transition-colors group-hover:bg-[var(--rootsy-bruma-50)] sm:size-10",
          )}
          aria-hidden
        >
          <Icon className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
        </span>
        <ArrowRight
          className="size-3.5 shrink-0 text-[var(--rootsy-bruma-500)] transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--rootsy-bruma-700)] sm:size-4"
          aria-hidden
        />
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
    dataWorkspaceEntityCardLosetaClass,
    "flex min-h-0 w-full flex-col p-3 text-left outline-none sm:p-4",
    selected && dataWorkspaceIntegrationChipSelectedClass,
    "focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--rootsy-savia-600)_35%,transparent)] focus-visible:ring-offset-2",
    className,
  )

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
  if ("onSelect" in props && props.onSelect) {
    return (
      <ReportHubCardShell
        title={props.title}
        description={props.description}
        icon={props.icon}
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
      selected={props.selected}
      type="link"
      href={props.href}
    />
  )
}

/** Grilla densa para hub de reportes — más columnas que el grid entidad estándar. */
export const reportHubGridClass =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
