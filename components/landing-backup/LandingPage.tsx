"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { ClientesSection } from "@/components/landing-backup/ClientesSection"
import { ControlNegocioSection } from "@/components/landing-backup/ControlNegocioSection"
import { LandingBackdrop } from "@/components/landing-backup/LandingBackdrop"
import { LandingHudDock, LandingHudTop } from "@/components/landing-backup/LandingHud"
import { LandingHudRail } from "@/components/landing-backup/LandingHudRail"
import { LandingInicioView } from "@/components/landing-backup/LandingInicioView"
import { LandingPrimerosPasos } from "@/components/landing-backup/LandingPrimerosPasos"
import { LandingScene } from "@/components/landing-backup/LandingScene"
import {
  LANDING_VIEW_META,
  landingAdjacentView,
  viewFromHash,
  type LandingViewId,
} from "@/components/landing-backup/landingViews"
import { PreguntasAnticipadasSection } from "@/components/landing-backup/PreguntasAnticipadasSection"
import { PreciosSection } from "@/components/landing-backup/PreciosSection"
import { RubrosSection } from "@/components/landing-backup/RubrosSection"
import { cn } from "@/lib/utils"

const REGISTER_URL = "/register"
const LANDING_BG = "#070a09"

function readInitialView(): LandingViewId {
  if (typeof window === "undefined") return "inicio"
  return viewFromHash(window.location.hash)
}

export function LandingPageBackup() {
  const router = useRouter()
  const sceneRef = useRef<HTMLElement>(null)
  const [view, setView] = useState<LandingViewId>("inicio")
  const [sceneKey, setSceneKey] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [glow, setGlow] = useState({ x: 72, y: 48 })

  useEffect(() => {
    setView(readInitialView())
    setHydrated(true)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtml = html.style.backgroundColor
    const prevBody = body.style.backgroundColor
    const prevOverflow = body.style.overflow
    html.style.backgroundColor = LANDING_BG
    body.style.backgroundColor = LANDING_BG
    body.style.overflow = "hidden"
    return () => {
      html.style.backgroundColor = prevHtml
      body.style.backgroundColor = prevBody
      body.style.overflow = prevOverflow
    }
  }, [])

  const goToView = useCallback((id: LandingViewId) => {
    if (id === view) return
    setView(id)
    setSceneKey((k) => k + 1)
    window.history.replaceState(null, "", `#${id}`)
    sceneRef.current?.scrollTo({ top: 0 })
  }, [view])

  useEffect(() => {
    if (!hydrated) return
    const onHashChange = () => {
      const next = viewFromHash(window.location.hash)
      if (next !== view) goToView(next)
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [hydrated, view, goToView])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
      const target = e.target
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return
      }
      e.preventDefault()
      goToView(landingAdjacentView(view, e.key === "ArrowLeft" ? -1 : 1))
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [view, goToView])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setGlow({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  const goRegister = useCallback(() => {
    router.push(REGISTER_URL)
  }, [router])

  const meta = LANDING_VIEW_META[view]
  const isHome = view === "inicio"

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden text-foreground">
      <LandingBackdrop
        interactive
        glowX={glow.x}
        glowY={glow.y}
        showParticles={isHome}
      />

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        <LandingHudTop active={view} onHome={() => goToView("inicio")} />

        <main
          ref={sceneRef}
          className={cn(
            "relative min-h-0 flex-1 lg:pr-[4.25rem]",
            isHome ? "flex overflow-hidden" : "rootsy-scroll-minimal overflow-y-auto overflow-x-hidden",
          )}
        >
          <div
            key={sceneKey}
            className={cn(
              "rootsy-landing-scene-in w-full",
              isHome
                ? "mx-auto flex h-full min-h-0 max-w-[90rem] flex-1 items-center px-4 py-4 sm:px-8 sm:py-6"
                : "mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8",
              meta.centered && !isHome && "flex min-h-full flex-col justify-center",
            )}
          >
            {isHome ? (
              <LandingInicioView onRegister={goRegister} onGoToView={goToView} />
            ) : null}
            {view === "empezar" ? (
              <LandingScene meta={meta}>
                <LandingPrimerosPasos onGoToView={goToView} />
              </LandingScene>
            ) : null}
            {view === "rubros" ? (
              <LandingScene meta={meta}>
                <RubrosSection />
              </LandingScene>
            ) : null}
            {view === "control" ? (
              <LandingScene meta={meta}>
                <ControlNegocioSection />
              </LandingScene>
            ) : null}
            {view === "clientes" ? (
              <LandingScene meta={meta}>
                <ClientesSection variant="dark" />
              </LandingScene>
            ) : null}
            {view === "faq" ? (
              <LandingScene meta={meta}>
                <PreguntasAnticipadasSection />
              </LandingScene>
            ) : null}
            {view === "precios" ? (
              <LandingScene meta={meta}>
                <PreciosSection />
              </LandingScene>
            ) : null}
          </div>
        </main>

        <LandingHudDock
          active={view}
          onSelect={goToView}
          isHome={isHome}
        />
      </div>

      <LandingHudRail active={view} onSelect={goToView} />
    </div>
  )
}
