"use client"

import Image from "next/image"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LandingViewId } from "@/components/landing-backup/landingViews"

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "/login"

const heroPrimaryBtnClass =
  "h-12 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500 to-teal-500 px-10 text-base font-bold tracking-wide text-white shadow-[0_16px_48px_-12px_rgba(16,185,129,0.5),inset_0_1px_0_0_rgba(255,255,255,0.15)] transition hover:from-emerald-400 hover:to-teal-400"

type LandingInicioViewProps = {
  onRegister: () => void
  onGoToView: (id: LandingViewId) => void
}

export function LandingInicioView({
  onRegister,
  onGoToView,
}: LandingInicioViewProps) {
  return (
    <div
      className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-14 xl:gap-20"
      aria-label="Inicio"
    >
      <div className="flex flex-col gap-5 sm:gap-6">
        <p className="rootsy-hero-rise rootsy-hero-rise-d1 inline-flex w-fit items-center rounded-full border border-meadow/20 bg-meadow/8 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-meadow sm:text-[11px]">
          7 días gratis · sin tarjeta
        </p>
        <h1 className="rootsy-hero-rise rootsy-hero-rise-d2 text-balance text-[2rem] font-extrabold leading-[1.06] tracking-tight text-foreground sm:text-[2.75rem] lg:text-[3.5rem] lg:leading-[1.05]">
          Gestioná tu negocio{" "}
          <span className="bg-gradient-to-r from-meadow via-teal-200 to-emerald-300 bg-clip-text text-transparent">
            en minutos
          </span>
        </h1>
        <p className="rootsy-hero-rise rootsy-hero-rise-d3 max-w-lg text-pretty text-base leading-relaxed text-foreground/70 sm:text-lg">
          En la nube, desde el navegador. Sin instalar nada.
        </p>
        <div className="rootsy-hero-rise rootsy-hero-rise-d4 flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
          <button
            type="button"
            className={cn(buttonVariants({ size: "lg" }), heroPrimaryBtnClass)}
            onClick={onRegister}
          >
            Comenzar gratis
          </button>
          <button
            type="button"
            className={cn(
              buttonVariants({ size: "lg", variant: "ghost" }),
              "h-12 rounded-2xl px-6 text-foreground/60 hover:bg-white/5 hover:text-foreground",
            )}
            onClick={() => onGoToView("empezar")}
          >
            Ver los 3 pasos
          </button>
        </div>
        <p className="rootsy-hero-rise rootsy-hero-rise-d5 text-sm text-foreground/40">
          <Link
            href={LOGIN_URL}
            className="font-medium text-foreground/55 transition hover:text-meadow hover:underline"
          >
            Ya tengo cuenta → Ingresar
          </Link>
        </p>
      </div>

      <div className="rootsy-hero-slide-in-right relative flex justify-center lg:justify-end">
        <div className="relative aspect-square w-full max-w-[min(100%,380px)] sm:max-w-[400px] lg:max-w-[min(100%,460px)]">
          <Image
            src="/rootsy-mascot.png"
            alt="Rootsy, la guía de tu negocio"
            fill
            className="pointer-events-none -scale-x-100 object-contain object-bottom motion-safe:animate-[mascot-float_6.5s_ease-in-out_infinite]"
            sizes="(max-width: 1024px) 85vw, 460px"
            priority
            style={{
              filter:
                "drop-shadow(0 48px 64px rgba(0,0,0,0.55)) drop-shadow(0 0 56px rgba(52,211,153,0.2))",
            }}
          />
        </div>
      </div>
    </div>
  )
}
