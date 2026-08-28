"use client"

import { HandbookDesignSystemNav } from "@/app/handbook/HandbookDesignSystemNav"
import {
  HANDBOOK_DESIGN_SYSTEM_BACK_HREF,
} from "@/app/handbook/handbookDesignSystem"
import { HandbookNav } from "@/app/handbook/layoutHandbookShared"
import { MenuSidebar } from "@/components/MenuSidebar"
import Image from "next/image"
import Link from "next/link"

export function HandbookSidebar({
  activeSectionId,
  designSystemPageId,
  isDesignSystem,
  onSelectSection,
  onSelectDesignSystemPage,
}: {
  activeSectionId: string
  designSystemPageId?: string
  isDesignSystem?: boolean
  onSelectSection?: (sectionId: string) => void
  onSelectDesignSystemPage?: (pageId: string) => void
}) {
  if (isDesignSystem) {
    return (
      <MenuSidebar
        backHref={HANDBOOK_DESIGN_SYSTEM_BACK_HREF}
        backLabel="Volver"
        onBack={() => onSelectSection?.("producto")}
        eyebrow="Sistema de diseño"
      >
        <HandbookDesignSystemNav
          activePageId={designSystemPageId ?? "overview"}
          onSelectPage={onSelectDesignSystemPage}
        />
      </MenuSidebar>
    )
  }

  return (
    <MenuSidebar
      brand={
        <Link
          href="/"
          aria-label="Rootsy — landing"
          className="mb-6 inline-flex px-2"
        >
          <Image
            src="/rootsy-logo.svg"
            alt="Rootsy"
            width={90}
            height={29}
            priority
            className="h-7 w-auto"
          />
        </Link>
      }
    >
      <HandbookNav activeSectionId={activeSectionId} onSelectSection={onSelectSection} />
    </MenuSidebar>
  )
}
