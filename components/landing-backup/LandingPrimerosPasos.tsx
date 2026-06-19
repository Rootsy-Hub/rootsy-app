import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { LandingViewId } from "@/components/landing-backup/landingViews"
import { cn } from "@/lib/utils"

const PASOS = [
  {
    n: "01",
    title: "Probá gratis",
    text: "Creá tu cuenta en un minuto. Sin tarjeta.",
  },
  {
    n: "02",
    title: "Tu punto de venta",
    text: "Nombre y rubro. Listo para operar.",
  },
  {
    n: "03",
    title: "Primera venta",
    text: "Cobrá en mostrador. El resto cuando lo necesités.",
  },
] as const

const REGISTER_URL = "/register"

type LandingPrimerosPasosProps = {
  onGoToView?: (id: LandingViewId) => void
}

export function LandingPrimerosPasos({ onGoToView }: LandingPrimerosPasosProps) {
  return (
    <div aria-label="Pasos para empezar">
      <ol className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {PASOS.map((paso, i) => (
          <li key={paso.n} className="relative">
            {i < PASOS.length - 1 ? (
              <span
                className="pointer-events-none absolute -right-1.5 top-10 z-10 hidden h-px w-3 bg-gradient-to-r from-meadow/50 to-transparent sm:block lg:w-5"
                aria-hidden
              />
            ) : null}
            <div
              className={cn(
                "flex h-full flex-col rounded-2xl border border-rootsy-hairline bg-card/40 p-4 sm:p-5",
                "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition duration-300",
                "hover:border-meadow/30 hover:bg-card/55 hover:shadow-[0_0_36px_-12px_rgba(16,185,129,0.35)]",
              )}
            >
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-meadow/80">
                {paso.n}
              </span>
              <p className="mt-2 text-base font-bold text-foreground sm:text-lg">
                {paso.title}
              </p>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {paso.text}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10">
        <Button
          size="lg"
          className="h-12 rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-emerald-500 to-teal-500 px-10 font-bold tracking-wide text-white shadow-[0_0_36px_-8px_rgba(16,185,129,0.55)] hover:from-emerald-400 hover:to-teal-400"
          asChild
        >
          <Link href={REGISTER_URL}>Empezar prueba de 7 días</Link>
        </Button>
        {onGoToView ? (
          <p className="text-xs text-muted-foreground">
            ¿Listo para más?{" "}
            <button
              type="button"
              className="font-semibold text-meadow hover:underline"
              onClick={() => onGoToView("rubros")}
            >
              Rubros
            </button>
            <span aria-hidden> · </span>
            <button
              type="button"
              className="font-semibold text-meadow hover:underline"
              onClick={() => onGoToView("precios")}
            >
              Precios
            </button>
          </p>
        ) : null}
      </div>
    </div>
  )
}
