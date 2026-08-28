"use client"

import { HomeHeaderUserCluster } from "@/app/home/HomeHeaderUserCluster"
import "@/app/[siteId]/[popId]/menu/menuHeaderEntity.css"
import { eterHeaderFocusRingClass } from "@/lib/eter/eterChrome"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

export type HomePageHeaderProps = {
  userId?: string
  loading?: boolean
}

export function HomePageHeader({ userId, loading }: HomePageHeaderProps) {
  return (
    <header className="relative z-20 w-full shrink-0 overflow-hidden pt-[env(safe-area-inset-top)]">
      <div aria-hidden className="menu-header-entity-atmosphere" />
      <div className="relative flex h-16 min-h-0 items-center justify-between px-4 md:h-20 md:px-8">
        <Link
          href="/"
          aria-label="Rootsy — landing"
          className={cn(
            "inline-flex shrink-0 items-center rounded-md transition-opacity hover:opacity-90",
            "focus-visible:outline-none",
            eterHeaderFocusRingClass,
            "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
          )}
        >
          <Image
            src="/rootsy-logo.svg"
            alt="Rootsy"
            width={90}
            height={29}
            priority
            className="h-8 w-auto md:h-10"
          />
        </Link>

        <HomeHeaderUserCluster userId={userId} loading={loading} />
      </div>
    </header>
  )
}
