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
import {
  readCachedMenuRootsyAdvice,
  writeCachedMenuRootsyAdvice,
} from "@/lib/menu/menuRootsyAdviceClientCache"
import { buildMenuRootsyRuleAdvice } from "@/lib/menu/menuRootsySuggestions"
import { buildMenuRootsyContext } from "@/lib/menu/menuRootsyContext"
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
  const [dataPending, setDataPending] = useState(false)
  const [aiPending, setAiPending] = useState(false)
  const hostRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const prefetchStartedRef = useRef(false)

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
  const loadingAdvice = open && dataPending && !advice
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
    if (disabled || !popAccess || !siteId || !popId) {
      prefetchStartedRef.current = false
      return
    }

    const cached = readCachedMenuRootsyAdvice(popId, popAccess)
    if (cached) {
      setAdvice(cached)
    }

    if (prefetchStartedRef.current) return
    prefetchStartedRef.current = true

    let cancelled = false
    const hadCachedAdvice = cached != null

    if (!hadCachedAdvice) {
      setDataPending(true)
    }
    setAiPending(false)

    void fetchMenuRootsyAdvice({
      popId,
      siteId,
      sectionKey: "operar",
      sectionTitle: "Operar",
      useAi: false,
    }).then((result) => {
      if (cancelled) return
      setDataPending(false)

      if (!result.success) {
        if (!hadCachedAdvice) {
          setAdvice(instantAdvice)
        }
        return
      }

      writeCachedMenuRootsyAdvice(popId, popAccess, result.advice)
      setAdvice(result.advice)

      setAiPending(true)
      void fetchMenuRootsyAdvice({
        popId,
        siteId,
        sectionKey: "operar",
        sectionTitle: "Operar",
        useAi: true,
      }).then((aiResult) => {
        if (cancelled) return
        setAiPending(false)
        if (!aiResult.success) return
        writeCachedMenuRootsyAdvice(popId, popAccess, aiResult.advice)
        setAdvice(aiResult.advice)
      })
    })

    return () => {
      cancelled = true
      setDataPending(false)
      setAiPending(false)
    }
  }, [
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

        {open ? (
          <div
            id={panelId}
            role="dialog"
            aria-label="Rootsy"
            className={menuRootsyPresencePanelClass}
          >
            <div className="px-4 py-4 sm:px-5 sm:py-4">
              {loadingAdvice ? (
                <p className={menuRootsyPresencePanelVoiceClass}>
                  Estoy revisando tus números…
                </p>
              ) : displayAdvice ? (
                <>
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
                </>
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
