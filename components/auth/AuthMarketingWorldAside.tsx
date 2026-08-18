import Image from "next/image"
import Link from "next/link"
import {
  authWorldAsideClass,
  authWorldAsideLeadClass,
  authWorldAsideNoteClass,
  authWorldAsideNoteContentClass,
  authWorldAsideTitleClass,
  authWorldAsideWorldLineClass,
} from "@/components/auth/authWorldAsideStyles"
import "@/components/auth/authWorldAside.css"
import { AUTH_SHELL_COPY } from "@/lib/auth/rootsyAuthUiCopy"
import { cn } from "@/lib/utils"

type Props = {
  worldLine?: string
  title?: string
  lead?: string
}

/** Nota de información del planeta — panel holográfico, no overlay de marketing. */
export function AuthMarketingWorldAside({
  worldLine = AUTH_SHELL_COPY.asideWorldLine,
  title = AUTH_SHELL_COPY.asideTitle,
  lead = AUTH_SHELL_COPY.asideLead,
}: Props) {
  return (
    <aside className={authWorldAsideClass}>
      <Link
        href="/"
        aria-label="Rootsy — inicio"
        className="relative z-[1] inline-flex w-fit rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rootsy-savia-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        <Image
          src="/rootsy-logo.svg"
          alt="Rootsy"
          width={120}
          height={38}
          priority
          className="h-9 w-auto drop-shadow-[0_2px_18px_rgba(7,10,9,0.45)]"
        />
      </Link>

      <div className={authWorldAsideNoteClass}>
        <div className={authWorldAsideNoteContentClass}>
          <p className={authWorldAsideWorldLineClass}>{worldLine}</p>
          <h2 className={cn("mt-2", authWorldAsideTitleClass)}>{title}</h2>
          <p className={cn("mt-3", authWorldAsideLeadClass)}>{lead}</p>
        </div>
      </div>
    </aside>
  )
}
