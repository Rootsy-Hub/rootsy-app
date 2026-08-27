"use client"

import { RootsIconButton } from "@/components/rootsy-button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { isDevModeEnabled } from "@/lib/devmode"
import {
  SALE_QUERY_SPEC,
  type SaleQuerySpecCall,
  type SaleQuerySpecDomain,
  type SaleQuerySpecMoment,
  type SaleQuerySpecPlace,
} from "@/lib/devmode/saleQuerySpec"
import { Bug, ChevronDown } from "lucide-react"
import { useState } from "react"

export function SaleDevtoolsPanel() {
  const [open, setOpen] = useState(false)

  if (!isDevModeEnabled()) return null

  return (
    <>
      <RootsIconButton
        label="Devmode"
        semantic="tertiary"
        atmosphere="eter"
        onClick={() => setOpen(true)}
      >
        <Bug aria-hidden />
      </RootsIconButton>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full gap-0 border-l border-[var(--rootsy-bruma-200)] bg-white p-0 text-[var(--rootsy-bruma-900)] sm:max-w-lg"
        >
          <SheetHeader className="border-b border-[var(--rootsy-bruma-100)]">
            <SheetTitle className="font-canopy text-sm font-bold text-[var(--rootsy-bruma-900)]">
              Devmode · Vender
            </SheetTitle>
            <SheetDescription className="font-canopy text-xs text-[var(--rootsy-bruma-600)]">
              Flujo de solicitudes a la API
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            <ol className="space-y-2 pb-4">
              {SALE_QUERY_SPEC.map((place) => (
                <SaleQuerySpecPlaceBlock
                  key={place.place}
                  place={place}
                />
              ))}
            </ol>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

function SaleQuerySpecPlaceBlock({
  place,
}: {
  place: SaleQuerySpecPlace
}) {
  return (
    <li>
      <details
        open
        className="group/place rounded-lg bg-[var(--rootsy-bruma-50)] px-2.5 py-2"
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 font-canopy text-sm font-bold text-[var(--rootsy-bruma-900)] [&::-webkit-details-marker]:hidden">
          <ChevronDown
            className="size-3.5 shrink-0 text-[var(--rootsy-bruma-400)] transition-transform group-open/place:rotate-180"
            aria-hidden
          />
          {place.place}
        </summary>
        <ol className="mt-2 space-y-1 border-t border-[var(--rootsy-bruma-100)] pt-2">
          {place.domains.map((domain) => (
            <SaleQuerySpecDomainBlock
              key={`${place.place}:${domain.domain}`}
              domain={domain}
            />
          ))}
        </ol>
      </details>
    </li>
  )
}

function SaleQuerySpecDomainBlock({
  domain,
}: {
  domain: SaleQuerySpecDomain
}) {
  return (
    <li>
      <details className="group/domain">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-canopy text-xs font-bold text-[var(--rootsy-bruma-900)] [&::-webkit-details-marker]:hidden">
          <ChevronDown
            className="size-3 shrink-0 text-[var(--rootsy-bruma-400)] transition-transform group-open/domain:rotate-180"
            aria-hidden
          />
          {domain.domain}
        </summary>
        <ol className="mt-2 ml-5 space-y-3">
          {domain.moments.map((moment) => (
            <SaleQuerySpecMomentBlock
              key={moment.title}
              moment={moment}
            />
          ))}
        </ol>
      </details>
    </li>
  )
}

function SaleQuerySpecMomentBlock({
  moment,
}: {
  moment: SaleQuerySpecMoment
}) {
  return (
    <li>
      <p className="font-canopy text-[11px] font-semibold text-[var(--rootsy-bruma-900)]">
        {moment.title}
      </p>
      <ol className="mt-1 space-y-1">
        {moment.calls.map((call) => (
          <SaleQuerySpecCallBlock
            key={`${moment.title}:${call.endpoint}`}
            call={call}
          />
        ))}
      </ol>
    </li>
  )
}

function SaleQuerySpecCallBlock({ call }: { call: SaleQuerySpecCall }) {
  return (
    <li>
      <details className="group/call">
        <summary className="flex cursor-pointer list-none items-start gap-2 [&::-webkit-details-marker]:hidden">
          <ChevronDown
            className="mt-0.5 size-3 shrink-0 text-[var(--rootsy-bruma-400)] transition-transform group-open/call:rotate-180"
            aria-hidden
          />
          <span className="min-w-0 break-all font-mono text-[11px] leading-4 text-[var(--rootsy-bruma-800)]">
            {call.endpoint}
          </span>
        </summary>
        <p className="mt-1 ml-5 font-canopy text-[11px] leading-4 text-[var(--rootsy-bruma-600)]">
          {call.detail}
        </p>
        <p className="mt-2 ml-5 font-canopy text-[11px] font-semibold text-[var(--rootsy-bruma-900)]">
          Cache
        </p>
        <p className="mt-0.5 ml-5 font-canopy text-[11px] leading-4 text-[var(--rootsy-bruma-600)]">
          {call.cache}
        </p>
      </details>
    </li>
  )
}
