"use client"

import Link from "next/link"
import { Leaf } from "lucide-react"
import { cn } from "@/lib/utils"

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL ?? "/login"

const shellBase =
  "relative z-50 shrink-0 border-b border-rootsy-hairline/80 bg-background/80 backdrop-blur-xl backdrop-saturate-150"

type LandingTopBarProps = {
  onHome: () => void
  sticky?: boolean
}

export function LandingTopBar({ onHome, sticky = false }: LandingTopBarProps) {
  return (
    <header
      className={cn(
        shellBase,
        "flex h-14 items-center sm:h-15",
        sticky && "sticky top-0 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.65)]",
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-360 items-center justify-between gap-4 px-4 sm:px-8">
        <button
          type="button"
          onClick={onHome}
          className="group inline-flex h-11 max-w-[min(100%,16rem)] items-center gap-2.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-3"
          aria-label="Rootsy — inicio"
        >
          <span
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-11 sm:w-11",
              "bg-gradient-to-br from-emerald-500/20 to-teal-600/10",
              "ring-1 ring-meadow/30 transition duration-300 ease-out",
              "group-hover:ring-meadow/50 group-hover:shadow-[0_0_28px_-8px_rgba(52,211,153,0.45)]",
            )}
          >
            <Leaf className="h-5 w-5 text-meadow" aria-hidden />
          </span>
          <span className="truncate text-lg font-extrabold leading-none tracking-tight text-foreground sm:text-xl">
            Rootsy
          </span>
        </button>

        <Link
          href={LOGIN_URL}
          className={cn(
            "inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-rootsy-hairline bg-white/4 px-4 sm:h-11",
            "text-sm font-semibold leading-none text-foreground transition duration-200 ease-out",
            "hover:border-meadow/40 hover:bg-white/[0.07]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meadow/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          Ingresar
        </Link>
      </div>
    </header>
  )
}
