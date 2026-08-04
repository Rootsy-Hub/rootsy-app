"use client"

import { LayoutFinalComponentsModal } from "@/app/[siteId]/[popId]/library/LayoutFinalComponentsModal"
import { LibrarySectionView } from "@/app/[siteId]/[popId]/library/LibrarySectionView"
import {
  getColorFoundationHeading,
} from "@/app/[siteId]/[popId]/library/color/ColorFoundationView"
import { isColorLibrarySection } from "@/app/[siteId]/[popId]/library/color/colorLibraryNav"
import {
  getLibraryNavGroup,
  LIBRARY_NAV_GROUPS,
  librarySectionHref,
  LibraryNav,
  LibraryPageHeader,
} from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  siteId: string
  popId: string
  sectionId: string
}

export function LibraryWorkspace({ siteId, popId, sectionId }: Props) {
  const router = useRouter()
  const [finalComponentsOpen, setFinalComponentsOpen] = useState(false)
  const [liveModalId, setLiveModalId] = useState<string | null>(null)
  const activeGroup = getLibraryNavGroup(sectionId)

  const navOptions = LIBRARY_NAV_GROUPS.flatMap((group) =>
    group.items.flatMap((item) => {
      if (item.children?.length) {
        return item.children.map((child) => ({
          id: child.id,
          label: child.label,
          groupLabel: `${group.label} · ${item.label}`,
        }))
      }
      return [
        {
          id: item.id,
          label: item.label,
          groupLabel: group.label,
        },
      ]
    }),
  )

  const breadcrumbLabel = isColorLibrarySection(sectionId)
    ? `Fundamentos · Color · ${getColorFoundationHeading(sectionId)}`
    : activeGroup?.label

  return (
    <>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-border/60 bg-muted/20 lg:block">
          <div className="sticky top-0 max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 py-6">
            <p className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Librería
            </p>
            <LibraryNav
              siteId={siteId}
              popId={popId}
              activeSectionId={sectionId}
              className="mt-4"
            />
          </div>
        </aside>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="lg:hidden">
              <Select
                value={sectionId}
                onValueChange={(value) =>
                  router.push(librarySectionHref(siteId, popId, value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Elegir sección" />
                </SelectTrigger>
                <SelectContent>
                  {navOptions.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.groupLabel} · {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <LibraryPageHeader
              title="Librería UI"
              description="Referencia del design system Rootsy — naturaleza viva, formularios, componentes y overlays."
              actions={
                <Button
                  type="button"
                  onClick={() => setFinalComponentsOpen(true)}
                >
                  Componentes finales
                </Button>
              }
            />

            {breadcrumbLabel ? (
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {breadcrumbLabel}
              </p>
            ) : null}

            <LibrarySectionView
              sectionId={sectionId}
              siteId={siteId}
              popId={popId}
              liveModalId={liveModalId}
              onLiveModalIdChange={setLiveModalId}
            />
          </div>
        </div>
      </div>

      <LayoutFinalComponentsModal
        open={finalComponentsOpen}
        onOpenChange={setFinalComponentsOpen}
      />
    </>
  )
}
