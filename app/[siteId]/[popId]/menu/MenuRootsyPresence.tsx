"use client"

import { fetchMenuRootsyAdvice } from "@/app/[siteId]/[popId]/menu/menuRootsyActions"
import { MenuRootsySuggestionSheet } from "@/app/[siteId]/[popId]/menu/MenuRootsySuggestionSheet"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
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

function createRotationToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
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
  const [mobileAdviceOpen, setMobileAdviceOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [advice, setAdvice] = useState<MenuRootsyAdvice | null>(null)
  const [dataPending, setDataPending] = useState(false)
  const [rotationToken] = useState(createRotationToken)
  const hostRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

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
    return buildMenuRootsyRuleAdvice(
      rootsyContext,
      popAccess.enabledModules,
      rotationToken,
    )
  }, [rootsyContext, popAccess, rotationToken])

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
    setMobileAdviceOpen(false)
  }, [sectionKey])

  useEffect(() => {
    if (disabled || !popAccess || !siteId || !popId) {
      setAdvice(null)
      return
    }

    let cancelled = false
    setDataPending(true)
    setAdvice(null)

    void fetchMenuRootsyAdvice({
      popId,
      siteId,
      sectionKey: "operar",
      sectionTitle: "Operar",
      rotationToken,
    }).then((result) => {
      if (cancelled) return
      setDataPending(false)

      if (!result.success) {
        setAdvice(instantAdvice)
        return
      }

      setAdvice(result.advice)
    })

    return () => {
      cancelled = true
      setDataPending(false)
    }
  }, [disabled, popAccess, siteId, popId, rotationToken, instantAdvice])

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
            aria-expanded={open || mobileAdviceOpen}
            aria-controls={open ? panelId : undefined}
            aria-label={open || mobileAdviceOpen ? "Cerrar Rootsy" : "Escuchar a Rootsy"}
            onClick={() => {
              if (window.matchMedia("(max-width: 767px)").matches) {
                setOpen(false)
                setMobileAdviceOpen(true)
                return
              }
              setOpen((value) => !value)
            }}
            onMouseDown={(event) => event.preventDefault()}
            className={menuRootsyPresenceTriggerClass}
          >
            <Image
              src={open || mobileAdviceOpen ? "/images/atento.png" : "/images/contento.png"}
              alt=""
              width={176}
              height={176}
              className={menuRootsyPresenceImageClass}
              priority
            />
          </button>
        </div>
      </div>

      <Sheet open={mobileAdviceOpen} onOpenChange={setMobileAdviceOpen}>
        <SheetContent
          side="bottom"
          className={cn(
            "gap-0 border-t px-4 pt-3 text-white",
            "rounded-t-[22px] sm:max-w-none",
            "bg-[linear-gradient(168deg,rgba(4,10,14,0.98)_0%,rgba(2,6,10,0.99)_100%)]",
            "border-[rgba(228,242,248,0.14)]",
            "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
            "[&>button]:hidden",
          )}
        >
          <div
            aria-hidden
            className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/22"
          />
          <SheetTitle className="sr-only">Rootsy</SheetTitle>
          <SheetDescription className="sr-only">
            Sugerencia de Rootsy para este menú
          </SheetDescription>
          <div className="px-1 pb-1">
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
                      setMobileAdviceOpen(false)
                      setSheetOpen(true)
                    }}
                  >
                    Ver más
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

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
