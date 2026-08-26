"use client"

import {
  RootsyEmptyState,
  ROOTSY_EMPTY_STATE_COPY,
  rootsyEmptyStateCatalogIdleCopy,
} from "@/components/rootsy-empty-state"
import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"

export function getSaleCatalogEmptyMascotCopy(
  hasSearch: boolean,
  categoryName?: string,
) {
  const copy = hasSearch
    ? ROOTSY_EMPTY_STATE_COPY.catalog.search
    : rootsyEmptyStateCatalogIdleCopy(categoryName)
  return {
    line1: copy.title,
    line2: copy.description,
  }
}

type Props = {
  hasSearch?: boolean
  categoryName?: string
  articlesHref?: string
  line1?: string
  line2?: string
  className?: string
}

function ArticlesInlineLink({ href }: { href: string }) {
  return (
    <>
      Activalos o agregalos en{" "}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="rootsy-empty-state__inline-link"
      >
        Artículos
        <ArrowUpRight aria-hidden />
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </a>
      .
    </>
  )
}

export function SaleCatalogEmptyMascot({
  hasSearch = false,
  categoryName,
  articlesHref,
  line1,
  line2,
  className,
}: Props) {
  const copy = getSaleCatalogEmptyMascotCopy(hasSearch, categoryName)
  const resolvedLine1 = line1 ?? copy.line1
  const resolvedLine2 = line2 ?? copy.line2
  const description =
    articlesHref && !hasSearch ? (
      <ArticlesInlineLink href={articlesHref} />
    ) : (
      resolvedLine2
    )

  return (
    <RootsyEmptyState
      slot="catalog"
      world="sombra"
      title={resolvedLine1}
      description={description}
      className={cn("h-full", className)}
    />
  )
}
