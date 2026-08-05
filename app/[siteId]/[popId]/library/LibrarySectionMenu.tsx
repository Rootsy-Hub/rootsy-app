"use client"

import {
  LIBRARY_NAV_GROUPS,
  librarySectionHref,
  type LibraryNavItem,
} from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import {
  dataWorkspaceHeaderDropdownContentClassForVariant,
  dataWorkspaceHeaderDropdownLabelClassForVariant,
  dataWorkspaceHeaderDropdownSeparatorClassForVariant,
  dataWorkspaceSectionMenuTriggerClass,
  isNightForestHeader,
  type DataWorkspaceHeaderVariant,
} from "@/components/layouts/dataWorkspaceHeaderStyles"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownLabel,
  RootsDropdownMenu,
  RootsDropdownSeparator,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import { cn } from "@/lib/utils"
import { BookOpen, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

function flattenLibraryNavItems(
  items: readonly LibraryNavItem[],
  groupLabel: string,
) {
  return items.flatMap((item) => {
    if (item.children?.length) {
      return [
        {
          id: item.id,
          label: item.label,
          groupLabel,
          depth: 0 as const,
        },
        ...item.children.map((child) => ({
          id: child.id,
          label: child.label,
          groupLabel: `${groupLabel} · ${item.label}`,
          depth: 1 as const,
        })),
      ]
    }
    return [
      {
        id: item.id,
        label: item.label,
        groupLabel,
        depth: 0 as const,
      },
    ]
  })
}

export function getLibrarySectionLabel(sectionId: string): string {
  for (const group of LIBRARY_NAV_GROUPS) {
    for (const item of group.items) {
      if (item.id === sectionId) return item.label
      const child = item.children?.find((entry) => entry.id === sectionId)
      if (child) return child.label
    }
  }
  return "Sección"
}

type Props = {
  siteId: string
  popId: string
  sectionId: string
  headerVariant?: DataWorkspaceHeaderVariant
}

export function LibrarySectionMenu({
  siteId,
  popId,
  sectionId,
  headerVariant = "dark",
}: Props) {
  const router = useRouter()
  const activeLabel = getLibrarySectionLabel(sectionId)
  const theme = isNightForestHeader(headerVariant) ? "dark" : "light"

  const dropdownContentClass = dataWorkspaceHeaderDropdownContentClassForVariant(headerVariant)
  const dropdownLabelClass = dataWorkspaceHeaderDropdownLabelClassForVariant(headerVariant)
  const dropdownSeparatorClass = dataWorkspaceHeaderDropdownSeparatorClassForVariant(headerVariant)

  const groupedItems = useMemo(
    () =>
      LIBRARY_NAV_GROUPS.map((group) => ({
        group,
        items: flattenLibraryNavItems(group.items, group.label),
      })),
    [],
  )

  return (
    <RootsDropdownMenu>
      <RootsDropdownTrigger asChild>
        <button
          type="button"
          className={dataWorkspaceSectionMenuTriggerClass(headerVariant)}
          aria-label={`Sección actual: ${activeLabel}`}
          aria-current="page"
        >
          <BookOpen className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0 truncate">{activeLabel}</span>
          <ChevronDown
            className="size-4 shrink-0 opacity-70 transition-transform group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </button>
      </RootsDropdownTrigger>
      <RootsDropdownContent
        theme={theme}
        align="end"
        className={cn(dropdownContentClass, "max-h-[min(70vh,28rem)] w-64 overflow-y-auto")}
      >
        {groupedItems.map(({ group, items }, groupIndex) => (
          <div key={group.id}>
            {groupIndex > 0 ? (
              <RootsDropdownSeparator theme={theme} className={dropdownSeparatorClass} />
            ) : null}
            <RootsDropdownLabel theme={theme} className={dropdownLabelClass}>
              {group.label}
            </RootsDropdownLabel>
            {items.map((item) => {
              const selected = item.id === sectionId
              return (
                <RootsDropdownItem
                  key={item.id}
                  theme={theme}
                  selected={selected}
                  className={cn("gap-2", item.depth === 1 && "pl-6")}
                  onSelect={() =>
                    router.push(librarySectionHref(siteId, popId, item.id))
                  }
                >
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </RootsDropdownItem>
              )
            })}
          </div>
        ))}
      </RootsDropdownContent>
    </RootsDropdownMenu>
  )
}
