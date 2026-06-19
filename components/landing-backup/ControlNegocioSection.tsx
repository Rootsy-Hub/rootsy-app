import Image from "next/image"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

const CONTROL_NEGOCIO_ITEMS = [
  "Operá desde el navegador, con conexión a internet.",
  "Seguí ventas y stock en tiempo real.",
  "Cuando crezcas, sumá reportes, equipos y más módulos.",
] as const

const CONTROL_NEGOCIO_IMAGE =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=960&q=80"

export function ControlNegocioSection() {
  return (
    <div className="relative mx-auto max-w-6xl lg:grid lg:grid-cols-[minmax(0,0.44fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
      <figure className="relative mx-auto flex max-w-[320px] justify-center sm:max-w-[380px] lg:mx-0 lg:max-w-none">
        <div
          className="relative aspect-square w-full max-w-[min(100%,380px)] lg:max-w-[400px]"
          style={{
            borderRadius: "45% 55% 52% 48% / 48% 45% 55% 52%",
          }}
        >
          <div
            className="absolute -inset-3 rounded-[inherit] border-[3px] border-emerald-500/25 bg-emerald-950/15 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_80px_-24px_rgba(16,185,129,0.25)] sm:-inset-4 sm:border-[4px]"
            aria-hidden
          />
          <div className="relative h-full overflow-hidden rounded-[inherit] ring-1 ring-white/10">
            <Image
              src={CONTROL_NEGOCIO_IMAGE}
              alt="Panel de métricas y negocio en un dispositivo móvil"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 90vw, 400px"
              unoptimized
            />
          </div>
        </div>
      </figure>

      <div className="mt-10 flex flex-col justify-center lg:mt-0">
        <ul className="space-y-4 text-[0.9375rem] leading-snug text-muted-foreground sm:text-base">
          {CONTROL_NEGOCIO_ITEMS.map((line) => (
            <li key={line} className="flex gap-3">
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-meadow"
                strokeWidth={2}
                aria-hidden
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <Button
          size="lg"
          className="mt-10 h-12 w-full rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500 to-teal-600 px-8 text-base font-semibold text-white shadow-[0_12px_40px_-12px_rgba(16,185,129,0.45)] transition hover:from-emerald-400 hover:to-teal-500 sm:w-auto sm:self-start"
          asChild
        >
          <Link href="/register">Solicitar prueba gratuita</Link>
        </Button>
      </div>
    </div>
  )
}
