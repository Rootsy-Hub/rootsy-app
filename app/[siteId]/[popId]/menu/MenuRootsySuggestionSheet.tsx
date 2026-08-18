"use client"

import { fetchMenuRootsySuggestionDetail } from "@/app/[siteId]/[popId]/menu/menuRootsyActions"
import {
  menuRootsyPresenceSheetBodyClass,
  menuRootsyPresenceSheetExamplesClass,
  menuRootsyPresenceSheetExplanationClass,
  menuRootsyPresenceVoiceLinkClass,
} from "@/app/[siteId]/[popId]/menu/menuRootsyPresenceStyles"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { usePopOptimisticNav } from "@/context/PopOptimisticNavContext"
import { useIsMobile } from "@/hooks/use-mobile"
import type { MenuRootsySuggestionDetail } from "@/lib/menu/menuRootsySuggestionCatalogTypes"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useState } from "react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  suggestionId: string | null
  popId: string
  siteId: string
  sectionKey: MenuSectionKey
  sectionTitle: string
}

export function MenuRootsySuggestionSheet({
  open,
  onOpenChange,
  suggestionId,
  popId,
  siteId,
  sectionKey,
  sectionTitle,
}: Props) {
  const isMobile = useIsMobile()
  const { start: startOptimisticNav } = usePopOptimisticNav()
  const [detail, setDetail] = useState<MenuRootsySuggestionDetail | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !suggestionId) {
      setDetail(null)
      setError(null)
      return
    }

    let cancelled = false
    setPending(true)
    setError(null)

    void fetchMenuRootsySuggestionDetail({
      popId,
      siteId,
      suggestionId,
      sectionKey,
      sectionTitle,
    }).then((result) => {
      if (cancelled) return
      setPending(false)
      if (!result.success) {
        setError(result.error)
        return
      }
      setDetail(result.detail)
    })

    return () => {
      cancelled = true
    }
  }, [open, suggestionId, popId, siteId, sectionKey, sectionTitle])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "gap-0 overflow-hidden border-[rgba(228,242,248,0.1)] bg-[linear-gradient(168deg,rgba(4,10,14,0.98)_0%,rgba(2,6,10,0.99)_100%)] p-0 text-white",
          "[&>button]:text-[rgba(196,230,248,0.75)] [&>button]:hover:text-white",
          isMobile
            ? "inset-x-0 h-[min(88vh,640px)] max-h-[88vh] w-full rounded-t-2xl border-t"
            : "w-full border-l sm:max-w-md",
        )}
      >
        <SheetHeader className="shrink-0 space-y-1 border-b border-[rgba(228,242,248,0.08)] px-5 py-4 pr-12 text-left">
          <SheetTitle className="text-lg font-semibold tracking-tight text-white">
            {pending ? "Rootsy" : detail?.title ?? "Rootsy"}
          </SheetTitle>
          <SheetDescription className="text-sm text-[rgba(196,230,248,0.65)]">
            Una idea para mejorar tu negocio, explicada simple.
          </SheetDescription>
        </SheetHeader>

        <div className={menuRootsyPresenceSheetBodyClass}>
          {pending ? (
            <p className={menuRootsyPresenceSheetExplanationClass}>
              Armo un ejemplo con tus números…
            </p>
          ) : error ? (
            <p className="text-sm text-[rgba(255,180,180,0.9)]">{error}</p>
          ) : detail ? (
            <div className="space-y-5">
              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(196,230,248,0.55)]">
                  Qué es
                </h3>
                <p className={menuRootsyPresenceSheetExplanationClass}>
                  {detail.explanation}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[rgba(196,230,248,0.55)]">
                  En tu negocio
                </h3>
                <p className={menuRootsyPresenceSheetExamplesClass}>
                  {detail.examples}
                </p>
              </section>

              {detail.cta ? (
                <Link
                  href={detail.cta.href}
                  onClick={(event) => {
                    if (
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    ) {
                      return
                    }
                    startOptimisticNav({
                      href: detail.cta!.href,
                      title: detail.cta!.label,
                    })
                    onOpenChange(false)
                  }}
                  className={cn(
                    menuRootsyPresenceVoiceLinkClass,
                    "inline-flex w-full justify-center rounded-xl border border-[rgba(228,242,248,0.14)] bg-[rgba(255,255,255,0.06)] px-4 py-2.5 no-underline",
                  )}
                >
                  Ir a {detail.cta.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
