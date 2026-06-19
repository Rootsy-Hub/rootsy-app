import { TestimoniosCarrusel } from "@/components/landing-backup/TestimoniosCarrusel"

const MARCAS_EJEMPLO = [
  "Distribuidora Lapacho",
  "Casa Norte Retail",
  "Gastronomía Central",
  "Textiles del Parque",
  "Ferretería 12",
  "Farmacia Modelo",
  "Panadería El Roble",
  "Indumentaria Sur",
  "Logística Verde",
  "Market del Jardín",
] as const

function MarcaChip({ nombre, dark }: { nombre: string; dark?: boolean }) {
  const iniciales = nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()

  return (
    <div
      className={
        dark
          ? "flex h-[4.25rem] shrink-0 items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.07] px-5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-white/[0.06] backdrop-blur-md"
          : "flex h-[4.25rem] shrink-0 items-center gap-3 rounded-2xl border border-[#0a120e]/[0.08] bg-white/90 px-5 py-3 shadow-[0_12px_40px_-20px_rgba(10,18,14,0.2),inset_0_1px_0_0_rgba(255,255,255,0.9)] ring-1 ring-white/80 backdrop-blur-sm"
      }
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/90 to-teal-600/90 text-xs font-bold tracking-tight text-white shadow-md shadow-emerald-950/40 ring-1 ring-white/25">
        {iniciales}
      </span>
      <span
        className={
          dark
            ? "max-w-[200px] text-left text-sm font-semibold leading-snug tracking-tight text-white/88"
            : "max-w-[200px] text-left text-sm font-semibold leading-snug tracking-tight text-[#0a120e]/85"
        }
      >
        {nombre}
      </span>
    </div>
  )
}

type ClientesSectionProps = {
  /** Misma banda oscura que Control negocio (shell PS5). */
  variant?: "light" | "dark"
}

export function ClientesSection({ variant = "light" }: ClientesSectionProps) {
  const pista = [...MARCAS_EJEMPLO, ...MARCAS_EJEMPLO]
  const dark = variant === "dark"

  return (
    <section id="clientes" className="relative text-foreground">
      <div className="relative mx-auto max-w-6xl">
        <p className="max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
          Estos son sólo algunos de los clientes que ya dieron el salto. Vos
          también podés vivir más tranquilo, como ellos.
        </p>

        <div className="relative mt-8 sm:mt-10">
          <p className="sr-only">
            Marcas de ejemplo en carrusel: {MARCAS_EJEMPLO.join(", ")}.
          </p>
          <div className="motion-reduce:hidden rootsy-marquee-fade overflow-hidden py-2">
            <div className="rootsy-marquee-logos flex gap-5">
              {pista.map((nombre, i) => (
                <MarcaChip key={`${nombre}-${i}`} nombre={nombre} dark={dark} />
              ))}
            </div>
          </div>
          <ul className="motion-reduce:flex hidden list-none flex-wrap justify-center gap-4 py-2">
            {MARCAS_EJEMPLO.map((nombre) => (
              <li key={nombre}>
                <MarcaChip nombre={nombre} dark={dark} />
              </li>
            ))}
          </ul>
        </div>

        <TestimoniosCarrusel dark={dark} />
      </div>
    </section>
  )
}
