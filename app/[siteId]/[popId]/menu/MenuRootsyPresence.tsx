"use client"

import { fetchMenuRootsyAdvice } from "@/app/[siteId]/[popId]/menu/menuRootsyActions"
import { MenuRootsySuggestionSheet } from "@/app/[siteId]/[popId]/menu/MenuRootsySuggestionSheet"
import "@/app/[siteId]/[popId]/menu/menuRootsyPresence.css"
import {
  menuRootsyPresenceGroundClass,
  menuRootsyPresenceHostClass,
  menuRootsyPresenceImageClass,
  menuRootsyPresencePanelClass,
  menuRootsyPresencePanelVoiceClass,
  menuRootsyPresenceStageClass,
  menuRootsyPresenceTriggerClass,
  menuRootsyPresenceVerMasClass,
} from "@/app/[siteId]/[popId]/menu/menuRootsyPresenceStyles"
import type { PopAccessCache } from "@/app/home/homeUserDataTypes"
import {
  readCachedMenuRootsyAdvice,
  writeCachedMenuRootsyAdvice,
} from "@/lib/menu/menuRootsyAdviceClientCache"
import { buildMenuRootsyContext } from "@/lib/menu/menuRootsyContext"
import { buildMenuRootsyRuleAdvice } from "@/lib/menu/menuRootsySuggestions"
import type { MenuRootsyAdvice } from "@/lib/menu/menuRootsyTypes"
import type { MenuSectionKey } from "@/lib/menuCatalog"
import { cn } from "@/lib/utils"
import Image from "next/image"
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

/** Rootsy habita el suelo del planeta — sugerencias rotativas para iniciados. */
export function MenuRootsyPresence({
  sectionKey,
  sectionTitle,
  siteId,
  popId,
  popAccess,
  disabled = false,
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [advice, setAdvice] = useState<MenuRootsyAdvice | null>(null)
  const [dataPending, setDataPending] = useState(false)
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
    if (!rootsyContext || !popAccess) return null
    return buildMenuRootsyRuleAdvice(rootsyContext, popAccess.enabledModules)
  }, [rootsyContext, popAccess])

  const displayAdvice = advice ?? instantAdvice
  const loadingAdvice = open && dataPending && !advice
  const catalogSuggestionId = displayAdvice?.catalogSuggestionId ?? null

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
    })

    return () => {
      cancelled = true
      setDataPending(false)
    }
  }, [disabled, popAccess, siteId, popId, instantAdvice])

  return (
    <>
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
                    Preparando una idea para vos…
                  </p>
                ) : displayAdvice ? (
                  <>
                    <p className={menuRootsyPresencePanelVoiceClass}>
                      {displayAdvice.lead}
                    </p>

                    {catalogSuggestionId ? (
                      <button
                        type="button"
                        className={menuRootsyPresenceVerMasClass}
                        onClick={() => {
                          setSheetOpen(true)
                        }}
                      >
                        Ver más
                      </button>
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
              src={open ? "/images/atento.png" : "/images/contento.png"}
              alt=""
              width={176}
              height={176}
              className={menuRootsyPresenceImageClass}
              priority
            />
          </button>
        </div>
      </div>

      <MenuRootsySuggestionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        suggestionId={catalogSuggestionId}
        popId={popId}
        siteId={siteId}
        sectionKey={sectionKey}
        sectionTitle={sectionTitle}
      />
    </>
  )
}
