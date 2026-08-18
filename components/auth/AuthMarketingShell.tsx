"use client"

import Link from "next/link"
import { AuthMarketingBackdrop } from "@/components/auth/AuthMarketingBackdrop"
import { AuthMarketingWorldAside } from "@/components/auth/AuthMarketingWorldAside"
import { AuthPlanetEntity } from "@/components/auth/AuthPlanetEntity"
import {
  authPlanetEyebrowClass,
  authPlanetStarMutedClass,
  authPlanetStarlightClass,
} from "@/components/auth/authPlanetPanelStyles"
import Image from "next/image"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  /** Ancho del bloque del formulario. Por defecto el del login. */
  cardWidthClassName?: string
  contentAlign?: "center" | "start"
  /** Marketing del producto (columna izquierda). */
  asideKicker?: string
  asideTitle?: string
  asideLead?: string
  /** @deprecated Usar asideKicker */
  asideWorldLine?: string
  /** @deprecated Usar asideKicker */
  asideEyebrow?: string
}

export function AuthMarketingShell({
  children,
  cardWidthClassName,
  contentAlign = "center",
  asideKicker,
  asideTitle,
  asideLead,
  asideWorldLine,
  asideEyebrow,
}: Props) {
  return (
    <div
      className="rootsy-theme-landing relative min-h-dvh overflow-hidden font-sans text-white"
      style={{
        ["--font-canopy" as string]:
          "var(--font-nunito-sans), 'Nunito Sans', sans-serif",
      }}
    >
      <AuthMarketingBackdrop />

      <div className="relative z-10 flex min-h-dvh min-w-0 flex-col overflow-x-hidden lg:flex-row">
        <div className="relative hidden min-h-dvh min-w-0 flex-1 lg:block">
          <AuthMarketingWorldAside
            kicker={asideKicker ?? asideWorldLine ?? asideEyebrow}
            title={asideTitle}
            lead={asideLead}
          />
        </div>

        <main
          className={cn(
            "relative flex min-h-dvh min-w-0 flex-1 justify-center overflow-x-hidden overflow-y-auto px-5 py-12 sm:px-8",
            contentAlign === "start" ? "items-start" : "items-center",
          )}
        >
          <div className={cn("relative w-full min-w-0 max-w-[26rem]", cardWidthClassName)}>
            <Link
              href="/"
              aria-label="Rootsy — inicio"
              className="mb-8 flex justify-center lg:hidden"
            >
              <Image
                src="/rootsy-logo.svg"
                alt="Rootsy"
                width={120}
                height={38}
                priority
                className="h-9 w-auto"
              />
            </Link>

            <AuthPlanetEntity>{children}</AuthPlanetEntity>
          </div>
        </main>
      </div>
    </div>
  )
}

export function AuthEyebrow({ children }: { children: ReactNode }) {
  return <p className={authPlanetEyebrowClass}>{children}</p>
}

export function AuthTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className={cn("text-2xl font-semibold tracking-tight sm:text-[1.75rem]", authPlanetStarlightClass)}>
      {children}
    </h1>
  )
}

export function AuthLead({ children }: { children: ReactNode }) {
  return <p className={cn("text-sm leading-relaxed", authPlanetStarMutedClass)}>{children}</p>
}

export function AuthTextLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className="font-semibold text-[rgba(111,216,156,0.95)] underline-offset-2 transition-colors hover:text-[rgba(168,235,196,1)] hover:underline drop-shadow-[0_0_10px_rgba(36,173,106,0.28)]"
    >
      {children}
    </Link>
  )
}

export function AuthMutedLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors",
        authPlanetStarMutedClass,
        "hover:text-white",
      )}
    >
      {children}
    </Link>
  )
}

export function AuthOrDivider() {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(147,210,255,0.28),transparent)]" />
      <span className={cn("text-[11px] font-semibold uppercase tracking-[0.14em]", authPlanetStarMutedClass)}>
        o
      </span>
      <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(147,210,255,0.28),transparent)]" />
    </div>
  )
}
