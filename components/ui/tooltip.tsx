'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import type { RootsButtonAtmosphere } from '@/components/rootsy-button/rootsButtonAtmosphere'
import { useRootsButtonAtmosphere } from '@/components/rootsy-button/rootsButtonAtmosphereContext'
import { rootsTooltipDarkClass } from '@/components/rootsy-tooltip/rootsTooltipAtmosphere'
import { cn } from '@/lib/utils'

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  delayDuration,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root> & {
  delayDuration?: number
}) {
  return (
    <TooltipProvider delayDuration={delayDuration ?? 0}>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  variant = 'default',
  atmosphere,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  variant?: 'default' | 'dark' | 'operar'
  /** Luz del handbook. Si no viene, hereda del provider o de variant dark/operar → sombra. */
  atmosphere?: RootsButtonAtmosphere
}) {
  const inheritedAtmosphere = useRootsButtonAtmosphere(atmosphere)
  const resolvedAtmosphere =
    inheritedAtmosphere ??
    (variant === 'dark' || variant === 'operar' ? 'sombra' : undefined)
  const skin = resolvedAtmosphere
    ? rootsTooltipDarkClass(resolvedAtmosphere)
    : null

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        data-rootsy-atmosphere={resolvedAtmosphere}
        sideOffset={sideOffset}
        className={cn(
          'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-[520] w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-pretty',
          skin ? skin.content : 'bg-foreground text-background',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={cn(
            'z-[520] size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]',
            skin ? skin.arrow : 'bg-foreground fill-foreground',
          )}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
