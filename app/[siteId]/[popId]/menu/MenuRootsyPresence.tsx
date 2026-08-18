"use client"

import { fetchMenuRootsyAdvice } from "@/app/[siteId]/[popId]/menu/menuRootsyActions"
import "@/app/[siteId]/[popId]/menu/menuRootsyPresence.css"
import {
  menuRootsyPresenceGroundClass,
  menuRootsyPresenceHostClass,
  menuRootsyPresenceImageClass,
  menuRootsyPresencePanelClass,
  menuRootsyPresencePanelVoiceClass,
  menuRootsyPresenceStageClass,
  menuRootsyPresenceThinkingClass,
  menuRootsyPresenceTriggerClass,
  menuRootsyPresenceVoiceLinkClass,
} from "@/app/[siteId]/[popId]/menu/menuRootsyPresenceStyles"
import type { PopAccessCache } from "@/app/home/homeUserDataTypes"
import { usePopOptimisticNav } from "@/context/PopOptimisticNavContext"
import { buildMenuRootsyContext } from "@/lib/menu/menuRootsyContext"
import { buildMenuRootsyAdviceCacheKey } from "@/lib/menu/menuRootsyCacheKey"
import { buildMenuRootsyRuleAdvice } from "@/lib/menu/menuRootsySuggestions"
import type { MenuRootsyAdvice, MenuRootsySuggestion } from "@/lib/menu/menuRootsyTypes"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useId, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react"

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
): string {
  return buildMenuRootsyAdviceCacheKey(
    buildMenuRootsyContext({
      popAccess,
      siteId,
      sectionKey: "operar",
      sectionTitle: "Operar",
    }),
  )
}

function resolvePrimaryCta(advice: MenuRootsyAdvice): MenuRootsySuggestion | null {
  return advice.primaryCta ?? advice.suggestions[0] ?? null
}

/** Rootsy habita el suelo del planeta — habla con voz propia. */
export function MenuRootsyPresence({
  sectionKey,
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

  const rootsyContext = useMemo(() => {
    if (!popAccess || !siteId || !popId) return null
    return buildMenuRootsyContext({
      popAccess,
      siteId,
      sectionKey: "operar",
      sectionTitle: "Operar",
    })
  }, [popAccess, siteId, popId])

  const instantAdvice = useMemo(() => {
    if (!rootsyContext) return null
    return buildMenuRootsyRuleAdvice(rootsyContext)
  }, [rootsyContext])

  const displayAdvice = advice ?? instantAdvice
  const primaryCta = displayAdvice ? resolvePrimaryCta(displayAdvice) : null
  const voiceAlreadyMentionsCta =
    primaryCta != null &&
    displayAdvice?.lead.toLowerCase().includes(primaryCta.label.toLowerCase())

  const handleSuggestionClick = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    suggestion: MenuRootsySuggestion,
  ) => {
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
  }

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
  }, [sectionKey])

  useEffect(() => {
    if (!open || disabled || !popAccess || !siteId || !popId) return

    const cacheKey = adviceCacheKey(popAccess, siteId)
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
      sectionKey: "operar",
      sectionTitle: "Operar",
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
    instantAdvice,
  ])

  return (
    <div ref={hostRef} className={cn(menuRootsyPresenceHostClass, className)}>
      <div className={menuRootsyPresenceStageClass}>
        <span aria-hidden className={menuRootsyPresenceGroundClass} />

        {open && displayAdvice ? (
          <div
            id={panelId}
            role="dialog"
            aria-label="Rootsy"
            className={menuRootsyPresencePanelClass}
          >
            <div className="px-4 py-4 sm:px-5 sm:py-4">
              <p className={menuRootsyPresencePanelVoiceClass}>
                {displayAdvice.lead}
                {aiPending ? (
                  <span className={menuRootsyPresenceThinkingClass}>
                    {" "}
                    …
                  </span>
                ) : null}
              </p>

              {primaryCta && !voiceAlreadyMentionsCta ? (
                <Link
                  href={primaryCta.href}
                  onClick={(event) => handleSuggestionClick(event, primaryCta)}
                  className={menuRootsyPresenceVoiceLinkClass}
                >
                  {primaryCta.label}
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-label={open ? "Cerrar Rootsy" : "Escuchar a Rootsy"}
          onClick={() => setOpen((value) => !value)}
          onMouseDown={(event) => event.preventDefault()}
          className={menuRootsyPresenceTriggerClass}
        >
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
