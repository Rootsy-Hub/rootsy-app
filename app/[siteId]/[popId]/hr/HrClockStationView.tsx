"use client"

import {
  clockEmployeeByPin,
  fetchClockStation,
  rotateClockStationPin,
  unlockClockStation,
} from "@/lib/rootsyApi/hrClient"
import type { ClockByPinResult } from "@/app/[siteId]/[popId]/hr/hrTypes"
import {
  dataWorkspaceDetailCardClass,
  dataWorkspaceEntityCardEyebrowClass,
  dataWorkspaceEntityCardStatLabelClass,
  dataWorkspaceEntityCardStatValueLargeClass,
  dataWorkspaceEntityCardTitleClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsIconButton } from "@/components/rootsy-button"
import { cn } from "@/lib/utils"
import { ArrowLeft, Delete, RefreshCw } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

const PIN_LENGTH = 4
const RESET_MS = 2200
const PAD_KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "empty",
  "0",
  "back",
] as const

const padKeyClass = cn(
  "inline-flex h-16 items-center justify-center rounded-xl border border-[var(--rootsy-bruma-200)]",
  "bg-white font-canopy text-2xl font-semibold text-[var(--rootsy-bruma-900)]",
  "transition-colors hover:bg-[var(--rootsy-bruma-50)]",
  "disabled:pointer-events-none disabled:opacity-50",
)

type Phase = "idle" | "busy" | "ok" | "err"

type Props = {
  siteId: string
  popId: string
  stationLocked: boolean
  unlockOpen: boolean
  onUnlockCancel: () => void
  onUnlocked: () => void
}

function displayName(result: ClockByPinResult): string {
  return `${result.firstName} ${result.lastName}`.trim() || "Listo"
}

function PinDots({ filled }: { filled: number }) {
  return (
    <div className="mt-5 flex justify-center gap-3" aria-hidden>
      {Array.from({ length: PIN_LENGTH }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-3 rounded-full border",
            index < filled
              ? "border-[var(--rootsy-savia-600)] bg-[var(--rootsy-savia-600)]"
              : "border-[var(--rootsy-bruma-300)] bg-white",
          )}
        />
      ))}
    </div>
  )
}

function PinPad({
  disabled,
  onDigit,
  onBack,
}: {
  disabled?: boolean
  onDigit: (digit: string) => void
  onBack: () => void
}) {
  return (
    <div className="mt-8 grid grid-cols-3 gap-2.5">
      {PAD_KEYS.map((key) => {
        if (key === "empty") return <span key={key} aria-hidden />
        if (key === "back") {
          return (
            <button
              key={key}
              type="button"
              className={padKeyClass}
              disabled={disabled}
              onClick={onBack}
              aria-label="Borrar"
            >
              <Delete className="size-6" aria-hidden />
            </button>
          )
        }
        return (
          <button
            key={key}
            type="button"
            className={cn(padKeyClass, "font-numeric")}
            disabled={disabled}
            onClick={() => onDigit(key)}
          >
            {key}
          </button>
        )
      })}
    </div>
  )
}

export function HrClockStationView({
  siteId,
  popId,
  stationLocked,
  unlockOpen,
  onUnlockCancel,
  onUnlocked,
}: Props) {
  const hrBasePath = `/${siteId}/${popId}/hr`
  const [digits, setDigits] = useState("")
  const [phase, setPhase] = useState<Phase>("idle")
  const [message, setMessage] = useState("Ingresá tu PIN")
  const [detail, setDetail] = useState<string | null>(null)
  const [canManageStation, setCanManageStation] = useState(false)
  const [stationPin, setStationPin] = useState<string | null>(null)
  const [stationPinBusy, setStationPinBusy] = useState(false)
  const [unlockDigits, setUnlockDigits] = useState("")
  const [unlockPhase, setUnlockPhase] = useState<Phase>("idle")
  const [unlockMessage, setUnlockMessage] = useState("PIN de estación")
  const resetTimer = useRef<number | null>(null)
  const submitting = useRef(false)
  const unlocking = useRef(false)

  const clearResetTimer = useCallback(() => {
    if (resetTimer.current != null) {
      window.clearTimeout(resetTimer.current)
      resetTimer.current = null
    }
  }, [])

  const resetPad = useCallback(() => {
    clearResetTimer()
    setDigits("")
    setPhase("idle")
    setMessage("Ingresá tu PIN")
    setDetail(null)
  }, [clearResetTimer])

  const resetUnlockPad = useCallback(() => {
    setUnlockDigits("")
    setUnlockPhase("idle")
    setUnlockMessage("PIN de estación")
  }, [])

  useEffect(() => {
    let cancelled = false
    void fetchClockStation(popId).then((res) => {
      if (cancelled || !res.success) return
      setCanManageStation(res.data.canManageStation)
      setStationPin(res.data.clockStationPin)
    })
    return () => {
      cancelled = true
    }
  }, [popId])

  const submitPin = useCallback(
    async (pin: string) => {
      if (submitting.current) return
      submitting.current = true
      setPhase("busy")
      setMessage("Fichando…")
      setDetail(null)
      const res = await clockEmployeeByPin(popId, pin)
      if (!res.success) {
        setPhase("err")
        setMessage(res.error || "PIN incorrecto.")
        setDetail(null)
        setDigits("")
        submitting.current = false
        clearResetTimer()
        resetTimer.current = window.setTimeout(resetPad, RESET_MS)
        return
      }
      setPhase("ok")
      setMessage(displayName(res.data))
      setDetail(res.data.action === "in" ? "Llegaste" : "Saliste")
      setDigits("")
      submitting.current = false
      clearResetTimer()
      resetTimer.current = window.setTimeout(resetPad, RESET_MS)
    },
    [clearResetTimer, popId, resetPad],
  )

  const submitUnlock = useCallback(
    async (pin: string) => {
      if (unlocking.current) return
      unlocking.current = true
      setUnlockPhase("busy")
      setUnlockMessage("Comprobando…")
      const res = await unlockClockStation(popId, pin)
      if (!res.success) {
        setUnlockPhase("err")
        setUnlockMessage(res.error || "PIN incorrecto.")
        setUnlockDigits("")
        unlocking.current = false
        window.setTimeout(() => {
          setUnlockPhase("idle")
          setUnlockMessage("PIN de estación")
        }, RESET_MS)
        return
      }
      unlocking.current = false
      resetUnlockPad()
      onUnlocked()
    },
    [onUnlocked, popId, resetUnlockPad],
  )

  const appendDigit = useCallback(
    (digit: string) => {
      if (phase === "busy") return
      setDigits((current) => {
        const base = phase === "idle" ? current : ""
        if (base.length >= PIN_LENGTH) return base
        return `${base}${digit}`
      })
      if (phase !== "idle") {
        setPhase("idle")
        setMessage("Ingresá tu PIN")
        setDetail(null)
      }
    },
    [phase],
  )

  const removeDigit = useCallback(() => {
    if (phase === "busy") return
    if (phase !== "idle") {
      resetPad()
      return
    }
    setDigits((current) => current.slice(0, -1))
  }, [phase, resetPad])

  const appendUnlockDigit = useCallback(
    (digit: string) => {
      if (unlockPhase === "busy") return
      setUnlockDigits((current) => {
        const base = unlockPhase === "idle" ? current : ""
        if (base.length >= PIN_LENGTH) return base
        return `${base}${digit}`
      })
      if (unlockPhase !== "idle") {
        setUnlockPhase("idle")
        setUnlockMessage("PIN de estación")
      }
    },
    [unlockPhase],
  )

  const removeUnlockDigit = useCallback(() => {
    if (unlockPhase === "busy") return
    if (unlockPhase !== "idle") {
      resetUnlockPad()
      return
    }
    setUnlockDigits((current) => current.slice(0, -1))
  }, [resetUnlockPad, unlockPhase])

  useEffect(() => {
    if (digits.length !== PIN_LENGTH || phase === "busy" || unlockOpen) return
    void submitPin(digits)
  }, [digits, phase, submitPin, unlockOpen])

  useEffect(() => {
    if (unlockDigits.length !== PIN_LENGTH || unlockPhase === "busy") return
    void submitUnlock(unlockDigits)
  }, [submitUnlock, unlockDigits, unlockPhase])

  useEffect(() => {
    if (!unlockOpen) resetUnlockPad()
  }, [resetUnlockPad, unlockOpen])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key >= "0" && event.key <= "9") {
        event.preventDefault()
        if (unlockOpen) appendUnlockDigit(event.key)
        else appendDigit(event.key)
        return
      }
      if (event.key === "Backspace") {
        event.preventDefault()
        if (unlockOpen) removeUnlockDigit()
        else removeDigit()
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        if (unlockOpen) {
          onUnlockCancel()
          return
        }
        if (stationLocked) return
        resetPad()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [
    appendDigit,
    appendUnlockDigit,
    onUnlockCancel,
    removeDigit,
    removeUnlockDigit,
    resetPad,
    stationLocked,
    unlockOpen,
  ])

  useEffect(() => () => clearResetTimer(), [clearResetTimer])

  async function handleRotateStationPin() {
    if (stationPinBusy) return
    setStationPinBusy(true)
    const res = await rotateClockStationPin(popId)
    setStationPinBusy(false)
    if (!res.success) return
    setStationPin(res.data.clockStationPin)
  }

  return (
    <div className="relative flex w-full min-h-full flex-1 flex-col">
      <div
        className={cn(
          "relative flex w-full min-h-full flex-1 flex-col items-center px-4 pb-10 sm:px-6 lg:px-8",
          stationLocked ? "justify-center pt-10" : "pt-6",
        )}
      >
        <article
          className={cn(
            dataWorkspaceDetailCardClass,
            "flex w-full max-w-sm flex-col px-6 py-6 sm:px-8 sm:py-8",
          )}
        >
          {stationLocked ? null : (
            <div className="mb-6 flex items-center gap-3">
              <RootsIconButton
                theme="workspace"
                emphasis="ghost"
                size="default"
                label="Volver a RRHH"
                href={hrBasePath}
                className="shrink-0"
              >
                <ArrowLeft aria-hidden />
              </RootsIconButton>
              <div className="min-w-0 flex-1">
                <p className={dataWorkspaceEntityCardEyebrowClass}>En el local</p>
                <h2 className={cn(dataWorkspaceEntityCardTitleClass, "text-lg")}>
                  Fichar
                </h2>
              </div>
            </div>
          )}

          {canManageStation && !stationLocked ? (
            <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] px-3 py-2.5">
              <div>
                <p className={dataWorkspaceEntityCardStatLabelClass}>
                  PIN de estación
                </p>
                <p
                  className={cn(
                    dataWorkspaceEntityCardStatValueLargeClass,
                    "mt-1 font-numeric tracking-[0.18em]",
                  )}
                >
                  {stationPin || "—"}
                </p>
              </div>
              <RootsIconButton
                theme="workspace"
                emphasis="ghost"
                size="compact"
                label="Nuevo PIN de estación"
                disabled={stationPinBusy}
                onClick={() => void handleRotateStationPin()}
              >
                <RefreshCw aria-hidden />
              </RootsIconButton>
            </div>
          ) : null}

          <p
            className={cn(
              "min-h-8 text-center font-canopy text-lg font-semibold",
              phase === "err"
                ? "text-[var(--color-status-danger)]"
                : "text-[var(--rootsy-bruma-900)]",
            )}
          >
            {message}
          </p>
          <p
            className={cn(
              "mt-1 min-h-6 text-center font-canopy text-sm",
              phase === "ok"
                ? "text-[var(--rootsy-savia-700)]"
                : "text-[var(--rootsy-bruma-500)]",
            )}
          >
            {detail ?? (phase === "idle" ? "Cuatro dígitos" : "\u00a0")}
          </p>

          <PinDots filled={digits.length} />
          <PinPad
            disabled={phase === "busy" || unlockOpen}
            onDigit={appendDigit}
            onBack={removeDigit}
          />
        </article>
      </div>

      {unlockOpen ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[color-mix(in_srgb,var(--rootsy-bruma-900)_35%,transparent)] px-4">
          <article
            className={cn(
              dataWorkspaceDetailCardClass,
              "flex w-full max-w-sm flex-col px-6 py-6 sm:px-8 sm:py-8",
            )}
          >
            <p className={dataWorkspaceEntityCardEyebrowClass}>Encargado</p>
            <h2 className={cn(dataWorkspaceEntityCardTitleClass, "mt-1 text-lg")}>
              Salir de la estación
            </h2>
            <p
              className={cn(
                "mt-5 min-h-8 text-center font-canopy text-lg font-semibold",
                unlockPhase === "err"
                  ? "text-[var(--color-status-danger)]"
                  : "text-[var(--rootsy-bruma-900)]",
              )}
            >
              {unlockMessage}
            </p>
            <p className="mt-1 min-h-6 text-center font-canopy text-sm text-[var(--rootsy-bruma-500)]">
              No es el PIN de la persona
            </p>
            <PinDots filled={unlockDigits.length} />
            <PinPad
              disabled={unlockPhase === "busy"}
              onDigit={appendUnlockDigit}
              onBack={removeUnlockDigit}
            />
            <button
              type="button"
              className="mt-5 font-canopy text-sm text-[var(--rootsy-bruma-500)] underline-offset-2 hover:underline"
              onClick={onUnlockCancel}
            >
              Seguir fichando
            </button>
          </article>
        </div>
      ) : null}
    </div>
  )
}
