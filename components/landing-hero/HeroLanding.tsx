import Image from "next/image"
import { Navbar } from "@/components/landing-hero/Navbar"
import { PillButton } from "@/components/landing-hero/PillButton"
import { REGISTER_URL } from "@/components/landing-hero/navConfig"
import { HeroPlanesSection } from "@/components/landing-hero/HeroPlanesSection"

const HERO_SUBTITLE =
  "Gestioná ventas, stock y caja desde la nube. Todo tu negocio en un solo lugar, en vivo y desde cualquier dispositivo."

export function HeroLanding() {
  return (
    <main className="relative min-h-dvh bg-[#080c0b] text-white">
      {/* Fondo del diseño (glow verde) */}
      <div className="pointer-events-none fixed inset-0 -z-0" aria-hidden>
        <Image
          src="/landing-background.png"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-60"
          sizes="100vw"
        />
      </div>

      <div className="relative z-10">
        <Navbar />

        <section
          id="inicio"
          className="flex min-h-[calc(100dvh-6rem)] flex-col items-center px-6 text-center"
        >
          <div className="flex flex-col items-center pt-10 sm:pt-14 lg:pt-[3rem]">
            <h1 className="text-balance font-sans font-bold tracking-[-0.03em] text-white text-[2.25rem] leading-[1.05] sm:text-[3rem] lg:text-[3.5rem]">
              Potenciamos tu éxito.
              <br />
              Transformamos tu entorno.
            </h1>

            <p className="mt-5 max-w-[39rem] text-pretty font-secondary text-[1.0625rem] font-normal leading-[1.587] tracking-[-0.03em] text-white sm:text-[1.1875rem] lg:text-xl">
              {HERO_SUBTITLE}
            </p>

            <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row">
              <PillButton href={REGISTER_URL} variant="primary" size="lg">
                Contratar
              </PillButton>
              <PillButton href="#planes" variant="outline" size="lg">
                Agendar una demo
              </PillButton>
            </div>
          </div>

          {/* Mockup del producto (asoma desde abajo, como en el diseño) */}
          <div className="relative mt-8 w-full max-w-244 translate-y-6 sm:mt-1 sm:translate-y-10">
            <div
              className="pointer-events-none absolute -inset-x-16 -top-24 bottom-0 -z-10 blur-3xl"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(52,211,153,0.32), transparent 72%)",
              }}
              aria-hidden
            />
            <Image
              src="/images/preview-rootsy.png"
              alt="Panel de Rootsy: gestión de ventas y stock en vivo"
              width={693}
              height={359}
              priority
              sizes="(max-width: 1024px) 94vw, 1024px"
              className="h-auto w-full [mask-image:linear-gradient(to_bottom,black_0%,black_40%,transparent_100%)]
    [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_40%,transparent_100%)]"
            />
          </div>
        </section>

        <section
          id="planes"
          className="scroll-mt-24 px-6 pb-24 pt-4 sm:px-10 lg:px-12"
          aria-label="Planes"
        >
          <HeroPlanesSection />
        </section>
      </div>
    </main>
  )
}
