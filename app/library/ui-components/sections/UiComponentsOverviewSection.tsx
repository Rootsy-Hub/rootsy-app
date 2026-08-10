"use client"

import {
  UI_COMPONENTS_LIBRARY_SUBITEMS,
  getUiComponentsPageMeta,
} from "@/app/library/ui-components/uiComponentsLibraryNav"
import { LibrarySection, librarySectionHref } from "@/app/library/layoutLibraryShared"
import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import Link from "next/link"

type Props = {
}

export function UiComponentsOverviewSection() {
  const meta = getUiComponentsPageMeta("ui-components")!

  return (
    <LibrarySection id={meta.id} title={meta.title} description={meta.description}>
      <ul className="space-y-2">
        {UI_COMPONENTS_LIBRARY_SUBITEMS.map((item) => (
          <li key={item.id}>
            <Link
              href={librarySectionHref(item.id)}
              className="font-canopy text-sm font-medium text-[var(--rootsy-savia-700)] hover:text-[var(--rootsy-savia-600)] hover:underline"
            >
              {item.label}
            </Link>
            <p className="font-canopy text-xs" style={{ color: COLOR_TOKENS.bruma500 }}>
              {getUiComponentsPageMeta(item.id)?.description}
            </p>
          </li>
        ))}
      </ul>
    </LibrarySection>
  )
}
