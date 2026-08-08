import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "/login"
const REGISTER_URL = "/register"

const PLANES = [
  {
    id: "esencial",
    nombre: "Esencial",
    descripcion: "Para arrancar con orden: un solo lugar para ventas y stock.",
    precio: "$ 9.900",
    periodo: "/ mes",
    notaPrecio: "+ impuestos · ejemplo",
    destacado: false,
    features: [
      "Hasta 2 usuarios",
      "1 sucursal o depósito",
      "Catálogo y stock en vivo",
      "Reportes básicos",
      "Soporte por correo",
    ],
    cta: "Empezar con Esencial",
    ctaVariant: "outline" as const,
  },
  {
    id: "profesional",
    nombre: "Profesional",
    descripcion: "El equilibrio entre potencia y simplicidad para el día a día.",
    precio: "$ 24.900",
    periodo: "/ mes",
    notaPrecio: "+ impuestos · ejemplo",
    destacado: true,
    features: [
      "Hasta 8 usuarios",
      "Varias sucursales",
      "Listas de precios y roles",
      "Reportes avanzados",
      "Soporte prioritario",
    ],
    cta: "Elegir Profesional",
    ctaVariant: "default" as const,
  },
  {
    id: "empresa",
    nombre: "Empresa",
    descripcion: "Multisede, integraciones y acompañamiento cuando escala todo.",
    precio: "A medida",
    periodo: "",
    notaPrecio: "Cotización según volumen",
    destacado: false,
    features: [
      "Usuarios y permisos a escala",
      "Varias razones sociales",
      "API e integraciones (según plan)",
      "Onboarding asistido",
      "Soporte dedicado",
    ],
    cta: "Hablar con ventas",
    ctaVariant: "outline" as const,
  },
] as const

export function PreciosSection() {
  return (
    <div id="precios">
      <p className="mb-6 text-sm text-muted-foreground">
        Valores de ejemplo para orientarte; el precio final puede variar según
        promociones, moneda y acuerdo comercial.
      </p>
      <ul className="grid list-none gap-5 lg:grid-cols-3 lg:gap-6">
        {PLANES.map((plan) => (
          <li
            key={plan.id}
            className={cn("flex", plan.destacado && "lg:-mt-1 lg:mb-1")}
          >
            <Card
              className={cn(
                "flex w-full flex-col border-rootsy-hairline bg-card/55 py-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
                plan.destacado &&
                  "border-meadow/30 ring-1 ring-meadow/25 shadow-[0_0_40px_-16px_rgba(16,185,129,0.35)]",
              )}
            >
              {plan.destacado ? (
                <div className="rounded-t-xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 px-6 py-2 text-center text-xs font-bold uppercase tracking-wider text-white">
                  Más elegido
                </div>
              ) : null}
              <CardHeader className="gap-3 pb-2 pt-6">
                <CardTitle className="text-xl font-bold text-foreground">
                  {plan.nombre}
                </CardTitle>
                <CardDescription className="text-pretty text-[0.9375rem] leading-relaxed">
                  {plan.descripcion}
                </CardDescription>
                <div className="pt-2">
                  <p className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground sm:text-[2rem]">
                      {plan.precio}
                    </span>
                    {plan.periodo ? (
                      <span className="text-base font-semibold text-muted-foreground">
                        {plan.periodo}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.notaPrecio}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4 pb-4 pt-2">
                <ul className="flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex gap-3 text-sm leading-snug text-muted-foreground"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-meadow/15 text-meadow">
                        <Check className="size-3.5 stroke-[2.5]" aria-hidden />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto flex-col gap-3 border-t border-rootsy-hairline pt-5 pb-6">
                <Button
                  size="lg"
                  variant={plan.ctaVariant}
                  className={cn(
                    "h-11 w-full rounded-xl font-semibold",
                    plan.destacado &&
                      "border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-900/20 hover:from-emerald-400 hover:to-teal-500",
                  )}
                  asChild
                >
                  <Link
                    href={plan.id === "empresa" ? LOGIN_URL : REGISTER_URL}
                  >
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
