"use client"

import {
  rootsFormControlTypographyClass,
  rootsFormPortalZClass,
  rootsFormSelectContentClassForTone,
  type RootsFormSelectTone,
} from "@/components/rootsy-form/rootsFormStyles"
import { cn } from "@/lib/utils"
import * as SelectPrimitive from "@radix-ui/react-select"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import type { ComponentProps } from "react"

type Props = ComponentProps<typeof SelectPrimitive.Content> & {
  tone?: RootsFormSelectTone
}

function RootsFormSelectScrollUpButton({ tone = "light" }: { tone?: RootsFormSelectTone }) {
  const isDark = tone === "dark"
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        isDark ? "text-[#78716c]" : "text-[var(--rootsy-bruma-500)]",
      )}
    >
      <ChevronUpIcon className="size-4" aria-hidden />
    </SelectPrimitive.ScrollUpButton>
  )
}

function RootsFormSelectScrollDownButton({ tone = "light" }: { tone?: RootsFormSelectTone }) {
  const isDark = tone === "dark"
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        isDark ? "text-[#78716c]" : "text-[var(--rootsy-bruma-500)]",
      )}
    >
      <ChevronDownIcon className="size-4" aria-hidden />
    </SelectPrimitive.ScrollDownButton>
  )
}

export function RootsFormSelectContent({
  className,
  children,
  position = "popper",
  side = "bottom",
  align = "start",
  sideOffset = 4,
  tone = "light",
  ...props
}: Props) {
  const isDark = tone === "dark"

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="roots-form-select-content"
        translate="no"
        className={cn(
          "relative max-h-(--radix-select-content-available-height) overflow-x-hidden overflow-y-auto",
          rootsFormPortalZClass,
          !isDark && "bg-white dark:bg-white",
          position === "popper" && "data-[side=bottom]:translate-y-1",
          !isDark && rootsFormControlTypographyClass,
          rootsFormSelectContentClassForTone(tone),
          className,
        )}
        position={position}
        side={side}
        align={align}
        sideOffset={sideOffset}
        {...props}
      >
        <RootsFormSelectScrollUpButton tone={tone} />
        <SelectPrimitive.Viewport
          className={cn(
            "p-0",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-(--radix-select-trigger-width) scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <RootsFormSelectScrollDownButton tone={tone} />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}
