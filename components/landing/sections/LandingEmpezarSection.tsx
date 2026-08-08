"use client"

import { CircleDollarSign, Sparkles, Store, type LucideIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { landingPrimaryCtaClass } from "@/components/landing/chrome/landingCtaClasses"
import { useLandingNavigation } from "@/components/landing/context/LandingNavigationProvider"
import { LANDING_VIEW_META } from "@/components/landing/landingViews"
import type { LandingSectionProps } from "@/components/landing/types"
import { cn } from "@/lib/utils"

const PASOS: ReadonlyArray<{
  title: string
  text: string
  icon: LucideIcon
}> = [
  {
    title: "Probá gratis",
    text: "Creá tu cuenta en un minuto. Sin tarjeta.",
    icon: Sparkles,
  },
  {
    title: "Tu punto de venta",
    text: "Nombre y rubro. Listo para operar.",
    icon: Store,
  },
  {
    title: "Primera venta",
    text: "Cobrá en mostrador. El resto cuando lo necesités.",
    icon: CircleDollarSign,
  },
]

export function LandingEmpezarSection({ viewId }: LandingSectionProps) {
  const meta = LANDING_VIEW_META[viewId]
  const { goRegister, goToChapter } = useLandingNavigation()

  return (
    <div
      className="mx-auto flex w-full min-w-0 max-w-5xl flex-col justify-center py-2 sm:py-6"
      aria-label={meta.label}
    >
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          {meta.title}
        </h1>
        {meta.tagline ? (
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-relaxed text-foreground/80 sm:text-xl">
            {meta.tagline}
          </p>
        ) : null}
      </header>

      <ol className="grid list-none gap-5 sm:grid-cols-3 sm:gap-6">
        {PASOS.map((paso, i) => {
          const Icon = paso.icon
          return (
            <li key={paso.title}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-rootsy-hairline/90 bg-card/25 px-5 py-6 sm:items-start sm:px-6 sm:py-7">
                <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-3">
                  <div
                    className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-meadow/12 ring-1 ring-meadow/25"
                    aria-hidden
                  >
                    <Icon
                      className="h-10 w-10 text-meadow"
                      strokeWidth={1.75}
                    />
                    <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-meadow/40 bg-background text-sm font-extrabold tabular-nums text-meadow shadow-sm">
                      {i + 1}
                    </span>
                  </div>
                  <span className="text-sm font-bold uppercase tracking-[0.12em] text-meadow sm:hidden">
                    Paso {i + 1}
                  </span>
                </div>
                <div className="sm:w-full">
                  <p className="mb-1 hidden text-sm font-bold uppercase tracking-[0.12em] text-meadow sm:block">
                    Paso {i + 1}
                  </p>
                  <h2 className="text-xl font-bold leading-snug text-foreground sm:text-2xl">
                    {paso.title}
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-foreground/80 sm:text-lg">
                    {paso.text}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-10 flex flex-col items-center gap-4 sm:mt-12">
        <button
          type="button"
          className={cn(buttonVariants({ size: "lg" }), landingPrimaryCtaClass)}
          onClick={goRegister}
        >
          Empezar prueba de 7 días
        </button>
        <p className="text-center text-sm text-foreground/60 sm:text-base">
          ¿Listo para más?{" "}
          <button
            type="button"
            className="font-semibold text-meadow hover:underline"
            onClick={() => goToChapter("rubros")}
          >
            Rubros
          </button>
          <span aria-hidden> · </span>
          <button
            type="button"
            className="font-semibold text-meadow hover:underline"
            onClick={() => goToChapter("precios")}
          >
            Precios
          </button>
        </p>
      </div>
    </div>
  )
}
