"use client"

import { LibrarySectionView } from "@/app/[siteId]/[popId]/library/LibrarySectionView"
import {
  getLibraryNavGroup,
  LibraryNav,
} from "@/app/[siteId]/[popId]/library/layoutLibraryShared"
import { useState } from "react"

type Props = {
  siteId: string
  popId: string
  sectionId: string
}

export function LibraryWorkspace({ siteId, popId, sectionId }: Props) {
  const [liveModalId, setLiveModalId] = useState<string | null>(null)
  const activeGroup = getLibraryNavGroup(sectionId)

  return (
    <>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-border/60 bg-muted/20 lg:block">
          <div className="sticky top-0 max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 py-6">
            <p className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
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
            {activeGroup ? (
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {activeGroup.label}
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
    </>
  )
}
