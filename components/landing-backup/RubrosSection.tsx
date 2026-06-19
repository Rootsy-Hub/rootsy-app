"use client"

import { useCallback, useState } from "react"
import type { MouseEvent } from "react"
import Image from "next/image"
import {
  Briefcase,
  CalendarDays,
  ChevronDown,
  Store,
  UtensilsCrossed,
  Factory,
  Package,
  Clock,
  LineChart,
  Lightbulb,
  Wallet,
  FileText,
  Landmark,
  LayoutGrid,
} from "lucide-react"
import { cn } from "@/lib/utils"

const RUBROS = [
  {
    id: "tiendas",
    title: "Tiendas",
    imageSrc:
      "https://londonmanager.com/static/media/tiendas.8d61a24c.jpg",
    icon: Store,
    description:
      "Retail omnicanal: stock en tiempo real y ventas claras desde un solo lugar.",
    bullets: [
      "Punto de venta y tickets rápidos",
      "Stock por sucursal y variantes (talle, color, etc.)",
      "Clientes, listas de precios y promociones",
      "Varias empresas o locales bajo la misma cuenta",
    ],
  },
  {
    id: "gastronomicos",
    title: "Gastronómicos",
    imageSrc:
      "https://londonmanager.com/static/media/gastronomicos.b95a1646.jpg",
    icon: UtensilsCrossed,
    description:
      "Salón, barra y delivery coordinados con cocina y cuentas al día.",
    bullets: [
      "Mesas, comandas y tiempos de salida",
      "Recetas, costos y control de mermas",
      "Compras a proveedores e insumos",
      "Cuentas corrientes y cierres de caja",
    ],
  },
  {
    id: "fabricantes",
    title: "Fabricantes",
    imageSrc:
      "https://londonmanager.com/static/media/fabricantes.727cc79c.jpg",
    icon: Factory,
    description:
      "Producción, materiales y pedidos integrados para fabricar con orden.",
    bullets: [
      "Órdenes de producción y prioridades",
      "Materiales, BOM y trazabilidad básica",
      "Stock de insumos y producto terminado",
      "Compras y proveedores alineados a la planta",
    ],
  },
  {
    id: "servicios",
    title: "Servicios",
    imageSrc:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
    icon: Briefcase,
    description:
      "Estudios, consultorías y agencias: presupuestos, clientes y cobros sin depósito.",
    bullets: [
      "Presupuestos y órdenes de trabajo",
      "Clientes, cuentas corrientes y seguimiento",
      "Facturación y gastos del estudio",
      "Reportes para proyectar ingresos y margen",
    ],
  },
  {
    id: "reservas",
    title: "Reservas y turnos",
    imageSrc:
      "https://images.unsplash.com/photo-1516574187841-687cf121456c?w=1200&q=80",
    icon: CalendarDays,
    description:
      "Canchas, salud y belleza: agenda, cupos y cobro de cada turno en un solo lugar.",
    bullets: [
      "Agenda por profesional, cancha o consultorio",
      "Recordatorios y control de asistencia",
      "Clientes y historial de sesiones",
      "Pagos, facturas y cierres de caja",
    ],
  },
] as const

const CASA_EN_ORDEN_FEATURES = [
  {
    id: "stock",
    title: "Controlar tu Stock",
    description:
      "Controlá el stock de tus productos e insumos, en cuántos depósitos quieras. Además, podés tener listas de precios diferenciadas.",
    icon: Package,
  },
  {
    id: "tiempo",
    title: "Ahorrar tiempo y esfuerzo",
    description:
      "Administrá tu negocio al 100% desde un solo lugar. Con esto, vas a ahorrar mucho tiempo y esfuerzo. Adiós Excel y papeles.",
    icon: Clock,
  },
  {
    id: "ventas",
    title: "Proyectar tus Ventas",
    description:
      "Vas a poder saber fácilmente qué días y horarios se vende más, qué productos y de qué forma. Así podrás proyectarte en el tiempo.",
    icon: LineChart,
  },
  {
    id: "oportunidades",
    title: "Encontrar Oportunidades",
    description:
      "Con reportes estadísticos vas a poder saber qué es lo que más funciona, evitando riesgos y encontrando oportunidades.",
    icon: Lightbulb,
  },
  {
    id: "gastos",
    title: "Gestionar tus Gastos",
    description:
      "Llevá el control de tus gastos fijos y variables como nunca antes. Vos elegís cuándo y cómo pagarlos, sin que se te pase nada.",
    icon: Wallet,
  },
  {
    id: "facturar",
    title: "Facturar fácilmente",
    description:
      "Facturá tus ventas de una manera fácil y rápida. Vas a poder emitir todo tipo de comprobante avalados por la AFIP.",
    icon: FileText,
  },
  {
    id: "cuentas",
    title: "Administrar tus Cuentas",
    description:
      "Si tenés más de una cuenta bancaria y manejás efectivo, vas a poder tener el control de tu dinero como nunca antes.",
    icon: Landmark,
  },
  {
    id: "puntos-venta",
    title: "Controlar tus Puntos de Venta",
    description:
      "Como si estuvieras en Netflix, con tan solo un clic vas a poder entrar y operar desde el punto de venta que quieras.",
    icon: LayoutGrid,
  },
] as const

const CARD_SUMMARY_BODY_H = "min-h-[50px]"
const CARD_DETAIL_BODY_H = "min-h-[200px]"

function RubroCard({
  rubro,
}: {
  rubro: (typeof RUBROS)[number]
}) {
  const [detalle, setDetalle] = useState(false)
  const Icon = rubro.icon

  const onCardMove = useCallback((e: MouseEvent<HTMLElement>) => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    const max = 8
    el.style.setProperty("--rx", `${-py * max}deg`)
    el.style.setProperty("--ry", `${px * max}deg`)
  }, [])

  const onCardLeave = useCallback((e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    el.style.setProperty("--rx", "0deg")
    el.style.setProperty("--ry", "0deg")
  }, [])

  return (
    <article
      onMouseMove={onCardMove}
      onMouseLeave={onCardLeave}
      className={cn(
        "group rootsy-card-tilt relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-2xl border border-rootsy-hairline bg-card/55 p-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
        "transition-[box-shadow,border-color] duration-300",
        "hover:border-meadow/25 hover:shadow-[0_0_40px_-14px_rgba(16,185,129,0.35)]",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl motion-reduce:hidden"
        aria-hidden
      >
        <div
          className={cn(
            "absolute top-0 h-full w-[55%] skew-x-[-16deg] bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-[left,opacity] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            "left-[-60%] group-hover:left-[125%] group-hover:opacity-90",
          )}
        />
      </div>

      {!detalle ? (
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
          <Image
            src={rubro.imageSrc}
            alt={rubro.title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4">
        {!detalle ? (
          <>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-meadow/15 text-meadow ring-1 ring-meadow/20">
              <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </div>
            <h3 className="mt-3 text-lg font-bold tracking-tight text-foreground">
              {rubro.title}
            </h3>
            <div className={cn("relative mt-2 min-h-0 flex-1", CARD_SUMMARY_BODY_H)}>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {rubro.description}
              </p>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              {rubro.title}
            </h3>
            <div className={cn("relative mt-3 min-h-0 flex-1", CARD_DETAIL_BODY_H)}>
            <ul className="space-y-2 text-sm leading-snug text-muted-foreground">
              {rubro.bullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_8px_rgba(16,185,129,0.45)]"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            </div>
          </>
        )}

      <button
        type="button"
        onClick={() => setDetalle((v) => !v)}
        className={cn(
          "relative z-[1] mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold tracking-wide text-white shadow-[0_8px_24px_-6px_rgba(16,185,129,0.35)]",
          "bg-gradient-to-br from-[#0f1a16] via-[#152820] to-[#0d1814] ring-1 ring-white/10 transition-[filter,transform] duration-200",
          "hover:brightness-110 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600/50",
        )}
      >
        {detalle ? "Volver" : "Ver más"}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200 motion-reduce:transition-none",
            detalle && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      </div>
    </article>
  )
}

export function RubrosSection() {
  return (
    <section id="soluciones" className="relative text-foreground">
      <div className="relative mx-auto max-w-6xl">
        <div className="grid auto-rows-fr gap-5 [perspective:1400px] sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
          {RUBROS.map((rubro) => (
            <RubroCard key={rubro.id} rubro={rubro} />
          ))}
        </div>

        <div className="mt-14 border-t border-rootsy-hairline pt-12 sm:mt-16 sm:pt-14">
          <h2 className="text-balance text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
            La casa en orden,{" "}
            <span className="rootsy-chrome-accent">como siempre quisiste.</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Estas son sólo algunas soluciones.
          </p>

          <ul className="mt-10 grid list-none gap-8 sm:grid-cols-2 sm:gap-x-10 lg:gap-y-10">
            {CASA_EN_ORDEN_FEATURES.map((item) => {
              const FeatIcon = item.icon
              return (
                <li key={item.id}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-meadow/15 text-meadow ring-1 ring-meadow/20">
                    <FeatIcon
                      className="h-5 w-5"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-3 text-base font-bold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
