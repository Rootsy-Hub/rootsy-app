"use client"

import { fetchMenuRootsyAdvice } from "@/app/[siteId]/[popId]/menu/menuRootsyActions"
import "@/app/[siteId]/[popId]/menu/menuRootsyPresence.css"
import {
  menuRootsyPresenceGroundClass,
  menuRootsyPresenceHostClass,
  menuRootsyPresenceImageClass,
  menuRootsyPresencePanelClass,
  menuRootsyPresencePanelLeadClass,
  menuRootsyPresencePanelTitleClass,
  menuRootsyPresenceStageClass,
  menuRootsyPresenceSuggestionClass,
  menuRootsyPresenceSuggestionsClass,
  menuRootsyPresenceTriggerClass,
} from "@/app/[siteId]/[popId]/menu/menuRootsyPresenceStyles"
import type { PopAccessCache } from "@/app/home/homeUserDataTypes"
import { usePopOptimisticNav } from "@/context/PopOptimisticNavContext"
import { buildMenuRootsyContext } from "@/lib/menu/menuRootsyContext"
import { buildMenuRootsyAdviceCacheKey } from "@/lib/menu/menuRootsyCache"
import { buildMenuRootsyRuleAdvice } from "@/lib/menu/menuRootsySuggestions"
import type { MenuRootsyAdvice } from "@/lib/menu/menuRootsyTypes"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useId, useMemo, useRef, useState } from "react"

type Props = {
  sectionKey: MenuSectionKey
  sectionTitle: string
  siteId: string
  popId: string
  popAccess: PopAccessCache | null | undefined
  disabled?: boolean
  className?: string
}

function adviceCacheKey(
  popAccess: PopAccessCache,
  siteId: string,
  sectionKey: MenuSectionKey,
  sectionTitle: string,
): string {
  return buildMenuRootsyAdviceCacheKey(
    buildMenuRootsyContext({
      popAccess,
      siteId,
      sectionKey,
      sectionTitle,
    }),
  )
}

/** Rootsy habita el suelo del planeta — sugerencias según tu rol y módulos. */
export function MenuRootsyPresence({
  sectionKey,
  sectionTitle,
  siteId,
  popId,
  popAccess,
  disabled = false,
  className,
}: Props) {
  const { start: startOptimisticNav } = usePopOptimisticNav()
  const [open, setOpen] = useState(false)
  const [advice, setAdvice] = useState<MenuRootsyAdvice | null>(null)
  const [aiPending, setAiPending] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const cacheRef = useRef<Map<string, MenuRootsyAdvice>>(new Map())

  const instantAdvice = useMemo(() => {
    if (!popAccess || !siteId || !popId) return null
    return buildMenuRootsyRuleAdvice(
      buildMenuRootsyContext({
        popAccess,
        siteId,
        sectionKey,
        sectionTitle,
      }),
    )
  }, [popAccess, siteId, popId, sectionKey, sectionTitle])

  const displayAdvice = advice ?? instantAdvice

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!hostRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
    setAdvice(null)
  }, [sectionKey])

  useEffect(() => {
    if (!open || disabled || !popAccess || !siteId || !popId) return

    const cacheKey = adviceCacheKey(popAccess, siteId, sectionKey, sectionTitle)
    const cached = cacheRef.current.get(cacheKey)
    if (cached) {
      setAdvice(cached)
      return
    }

    setAdvice(instantAdvice)
    let cancelled = false
    setAiPending(true)

    void fetchMenuRootsyAdvice({
      popId,
      siteId,
      sectionKey,
      sectionTitle,
      useAi: true,
    }).then((result) => {
      if (cancelled) return
      setAiPending(false)
      if (!result.success) return
      cacheRef.current.set(cacheKey, result.advice)
      setAdvice(result.advice)
    })

    return () => {
      cancelled = true
      setAiPending(false)
    }
  }, [
    open,
    disabled,
    popAccess,
    siteId,
    popId,
    sectionKey,
    sectionTitle,
    instantAdvice,
  ])

  return (
    <div ref={hostRef} className={cn(menuRootsyPresenceHostClass, className)}>
      <div className={menuRootsyPresenceStageClass}>
        {open && displayAdvice ? (
          <div
            id={panelId}
            role="dialog"
            aria-label="Sugerencias de Rootsy"
            className={menuRootsyPresencePanelClass}
          >
            <div className="px-4 py-3.5">
              <p className={menuRootsyPresencePanelTitleClass}>
                {displayAdvice.title}
                {aiPending ? (
                  <span className="ml-2 font-normal normal-case tracking-normal text-[rgba(255,255,255,0.28)]">
                    · pensando…
                  </span>
                ) : null}
              </p>
              <p className={menuRootsyPresencePanelLeadClass}>
                {displayAdvice.lead}
              </p>
              {displayAdvice.suggestions.length > 0 ? (
                <div className={menuRootsyPresenceSuggestionsClass}>
                  {displayAdvice.suggestions.map((suggestion) => (
                    <Link
                      key={suggestion.href}
                      href={suggestion.href}
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
                          href: suggestion.href,
                          title: suggestion.label,
                        })
                        setOpen(false)
                      }}
                      className={menuRootsyPresenceSuggestionClass}
                    >
                      {suggestion.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-label={
            open ? "Cerrar sugerencias de Rootsy" : "Abrir sugerencias de Rootsy"
          }
          onClick={() => setOpen((value) => !value)}
          className={menuRootsyPresenceTriggerClass}
        >
          <span aria-hidden className={menuRootsyPresenceGroundClass} />
          <Image
            src={
              open
                ? "/images/atento.png"
                : "/images/contento.png"
            }
            alt=""
            width={176}
            height={176}
            className={menuRootsyPresenceImageClass}
            priority
          />
        </button>
      </div>
    </div>
  )
}
