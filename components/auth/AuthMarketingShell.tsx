"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AUTH_SHELL_COPY } from "@/lib/auth/rootsyAuthUiCopy"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  /** Ancho del bloque del formulario. Por defecto el del login. */
  cardWidthClassName?: string
  contentAlign?: "center" | "start"
  asideEyebrow?: string
  asideTitle?: string
  asideLead?: string
}

export function AuthMarketingShell({
  children,
  cardWidthClassName,
  contentAlign = "center",
  asideEyebrow = AUTH_SHELL_COPY.asideEyebrow,
  asideTitle = AUTH_SHELL_COPY.asideTitle,
  asideLead = AUTH_SHELL_COPY.asideLead,
}: Props) {
  return (
    <div
      className="rootsy-theme-landing min-h-dvh font-sans text-white"
      style={{
        ["--font-canopy" as string]:
          "var(--font-nunito-sans), 'Nunito Sans', sans-serif",
      }}
    >
      <div className="grid min-h-dvh lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-[var(--rootsy-sombra-800)] lg:block">
          <Image
            src="/login-mascota.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="50vw"
          />
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "linear-gradient(180deg, rgb(16 24 20 / 0.28) 0%, rgb(16 24 20 / 0.55) 72%, rgb(16 24 20 / 0.78) 100%)",
            }}
          />
          <div className="relative z-10 flex h-full min-h-dvh flex-col justify-between p-10 xl:p-14">
            <Link
              href="/"
              aria-label="Rootsy — inicio"
              className="inline-flex w-fit rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rootsy-savia-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--rootsy-sombra-800)]"
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
            <div className="max-w-md space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--rootsy-savia-400)]">
                {asideEyebrow}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-white xl:text-4xl">
                {asideTitle}
              </h2>
              <p className="text-base leading-relaxed text-[var(--rootsy-sombra-300)]">
                {asideLead}
              </p>
            </div>
          </div>
        </aside>

        <main
          className={cn(
            "relative flex min-h-dvh justify-center overflow-y-auto bg-[var(--rootsy-sombra-900)] px-5 py-12 sm:px-8",
            contentAlign === "start" ? "items-start" : "items-center",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "radial-gradient(ellipse 70% 50% at 80% 0%, color-mix(in srgb, var(--rootsy-savia-400) 22%, transparent), transparent 70%)",
            }}
          />

          <div className={cn("relative w-full max-w-[26rem]", cardWidthClassName)}>
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

            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-elevated)] p-7 shadow-[0_22px_70px_-18px_rgb(5_8_7/0.45)] sm:p-9">
              {children}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

export function AuthEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--rootsy-savia-400)]">
      {children}
    </p>
  )
}

export function AuthTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
      {children}
    </h1>
  )
}

export function AuthLead({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-[var(--rootsy-sombra-300)]">
      {children}
    </p>
  )
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
      className="font-semibold text-[var(--rootsy-savia-400)] underline-offset-2 transition-colors hover:text-[var(--rootsy-savia-300)] hover:underline"
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
      className="text-sm font-medium text-[var(--rootsy-sombra-300)] transition-colors hover:text-white"
    >
      {children}
    </Link>
  )
}

export function AuthOrDivider() {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-[var(--color-border)]" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--rootsy-sombra-300)]">
        o
      </span>
      <span className="h-px flex-1 bg-[var(--color-border)]" />
    </div>
  )
}
