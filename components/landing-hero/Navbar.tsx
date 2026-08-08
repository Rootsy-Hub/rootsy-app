import Image from "next/image"
import Link from "next/link"
import { PillButton } from "@/components/landing-hero/PillButton"
import { LANDING_NAV_ITEMS, LOGIN_URL } from "@/components/landing-hero/navConfig"

export function Navbar() {
  return (
    <header className="relative z-20 w-full">
      <div className="relative mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-12">
        <Link
          href="/"
          aria-label="Rootsy — inicio"
          className="inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080c0b]"
        >
          <Image
            src="/rootsy-logo.svg"
            alt="Rootsy"
            width={90}
            height={29}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <div className="ml-auto flex items-center gap-14">
          <nav
            aria-label="Navegación principal"
            className="hidden items-center gap-14 lg:flex"
          >
            {LANDING_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-sans text-sm font-medium leading-none tracking-[-0.04em] text-white/85 transition-colors duration-200 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <PillButton href={LOGIN_URL} variant="primary" size="lg">
            Iniciar sesión
          </PillButton>
        </div>
      </div>
    </header>
  )
}
