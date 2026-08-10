"use client"

import { forwardRef } from "react"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import {
  DROPDOWN_UI_DEMO_COPY,
  DROPDOWN_UI_PANEL_SPEC,
  getDropdownUiPanelSpecRows,
} from "@/app/library/ui-components/dropdownUiHardcodedSpec"
import { OverlaySurfaceSpecTable } from "@/app/library/ui-components/dialogUiDocShared"
import { COLOR_TOKENS } from "@/app/library/color/rootsyColorSystem"
import { rootsySpacePx } from "@/lib/design-system"
import {
  RootsDefaultButton,
  RootsIconButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownLabel,
  RootsDropdownMenu,
  RootsDropdownSeparator,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import type { DropdownDensityId, DropdownThemeId } from "@/components/rootsy-dropdown"
import { cn } from "@/lib/utils"
import { ChevronDown, Copy, MoreVertical, Pencil, Trash2 } from "lucide-react"

type TriggerId = "icon-button" | "button-default" | "button-subtle"
type PanelVariant = "grouped" | "sections" | "compact-actions"

function VariantCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-72 min-w-56 flex-col justify-start gap-2">
      {children}
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function VariantRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start gap-8">{children}</div>
}

function DarkStage({ children }: { children: ReactNode }) {
  return (
    <div
      className="inline-flex rounded-[12px]"
      style={{
        backgroundColor: COLOR_TOKENS.sombra700,
        padding: rootsySpacePx("200"),
        borderRadius: rootsySpacePx("150"),
      }}
    >
      {children}
    </div>
  )
}

const DropdownTriggerButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { trigger: TriggerId; theme?: DropdownThemeId }
>(function DropdownTriggerButton({ trigger, theme = "light", className, children, ...props }, ref) {
  const copy = DROPDOWN_UI_DEMO_COPY

  if (trigger === "icon-button") {
    return (
      <RootsIconButton
        ref={ref}
        label={copy.triggerLabels.actions}
        rowIntent="neutral"
        size="compact"
        tone={theme === "dark" ? "dark" : "light"}
        className={className}
        {...props}
      >
        <MoreVertical />
      </RootsIconButton>
    )
  }

  const Button = trigger === "button-default" ? RootsDefaultButton : RootsSubtleButton

  return (
    <Button ref={ref} className={cn("min-w-40 justify-between gap-2", className)} {...props}>
      <span>{copy.triggerLabels.section}</span>
      <ChevronDown className="size-4 shrink-0 opacity-70" aria-hidden />
      {children}
    </Button>
  )
})

function DropdownPanelItems({
  theme = "light",
  density = "default",
  variant = "grouped",
}: {
  theme?: DropdownThemeId
  density?: DropdownDensityId
  variant?: PanelVariant
}) {
  const copy = DROPDOWN_UI_DEMO_COPY

  if (variant === "sections") {
    return (
      <>
        {copy.sections.map((section, index) => (
          <RootsDropdownItem
            key={section}
            theme={theme}
            density={density}
            selected={index === 0}
            onSelect={(event) => event.preventDefault()}
          >
            <span className="min-w-0 flex-1 truncate">{section}</span>
          </RootsDropdownItem>
        ))}
      </>
    )
  }

  if (variant === "compact-actions") {
    return (
      <>
        <RootsDropdownItem theme={theme} density={density} onSelect={(e) => e.preventDefault()}>
          {copy.items.duplicate}
        </RootsDropdownItem>
        <RootsDropdownItem theme={theme} density={density} onSelect={(e) => e.preventDefault()}>
          {copy.items.edit}
        </RootsDropdownItem>
        <RootsDropdownSeparator theme={theme} />
        <RootsDropdownItem
          theme={theme}
          density={density}
          variant="destructive"
          onSelect={(e) => e.preventDefault()}
        >
          {copy.items.delete}
        </RootsDropdownItem>
      </>
    )
  }

  return (
    <>
      <RootsDropdownLabel theme={theme}>{copy.groupLabel}</RootsDropdownLabel>
      <RootsDropdownItem theme={theme} density={density} onSelect={(e) => e.preventDefault()}>
        <Pencil className="size-4" />
        {copy.items.edit}
      </RootsDropdownItem>
      <RootsDropdownItem theme={theme} density={density} onSelect={(e) => e.preventDefault()}>
        <Copy className="size-4" />
        {copy.items.duplicate}
      </RootsDropdownItem>
      <RootsDropdownItem theme={theme} density={density} onSelect={(e) => e.preventDefault()}>
        {copy.items.export}
      </RootsDropdownItem>
      <RootsDropdownSeparator theme={theme} />
      <RootsDropdownItem
        theme={theme}
        density={density}
        variant="destructive"
        onSelect={(e) => e.preventDefault()}
      >
        <Trash2 className="size-4" />
        {copy.items.delete}
      </RootsDropdownItem>
    </>
  )
}

function DropdownVariant({
  label,
  theme = "light",
  density = "default",
  trigger = "button-default",
  panel = "grouped",
  align,
  contentClassName,
  wrapDark = false,
}: {
  label: string
  theme?: DropdownThemeId
  density?: DropdownDensityId
  trigger?: TriggerId
  panel?: PanelVariant
  align?: "start" | "end"
  contentClassName?: string
  wrapDark?: boolean
}) {
  const menu = (
    <RootsDropdownMenu>
      <RootsDropdownTrigger asChild>
        <DropdownTriggerButton trigger={trigger} theme={theme} />
      </RootsDropdownTrigger>
      <RootsDropdownContent
        theme={theme}
        density={density}
        align={align}
        className={contentClassName ?? (density === "compact" ? "w-44" : "w-56")}
      >
        <DropdownPanelItems theme={theme} density={density} variant={panel} />
      </RootsDropdownContent>
    </RootsDropdownMenu>
  )

  return (
    <VariantCell label={label}>
      {wrapDark ? <DarkStage>{menu}</DarkStage> : menu}
    </VariantCell>
  )
}

function RowContextMenu() {
  return (
    <VariantCell label="En fila · compact">
      <div className="flex max-w-sm items-center justify-between rounded-[12px] border border-[var(--rootsy-bruma-200)] bg-white px-4 py-3">
        <div>
          <p className="font-canopy text-sm font-medium text-[var(--rootsy-bruma-900)]">
            Café orgánico 250g
          </p>
          <p className="font-canopy text-xs text-[var(--rootsy-bruma-500)]">SKU · CAF-250</p>
        </div>
        <RootsDropdownMenu>
          <RootsDropdownTrigger asChild>
            <RootsIconButton label="Más acciones" rowIntent="neutral" size="compact">
              <MoreVertical />
            </RootsIconButton>
          </RootsDropdownTrigger>
          <RootsDropdownContent density="compact" className="w-44" align="end">
            <DropdownPanelItems density="compact" variant="compact-actions" />
          </RootsDropdownContent>
        </RootsDropdownMenu>
      </div>
    </VariantCell>
  )
}

function ItemStatesMenu() {
  const copy = DROPDOWN_UI_DEMO_COPY

  return (
    <VariantCell label="Estados de ítem">
      <RootsDropdownMenu>
        <RootsDropdownTrigger asChild>
          <RootsDefaultButton className="min-w-40 justify-between gap-2">
            <span>{copy.triggerLabels.section}</span>
            <ChevronDown className="size-4 shrink-0 opacity-70" aria-hidden />
          </RootsDefaultButton>
        </RootsDropdownTrigger>
        <RootsDropdownContent className="w-56">
          <RootsDropdownItem onSelect={(e) => e.preventDefault()}>{copy.items.edit}</RootsDropdownItem>
          <RootsDropdownItem selected onSelect={(e) => e.preventDefault()}>
            <span className="min-w-0 flex-1 truncate">{copy.items.duplicate}</span>
          </RootsDropdownItem>
          <RootsDropdownItem disabled>{copy.items.export}</RootsDropdownItem>
          <RootsDropdownSeparator />
          <RootsDropdownItem variant="destructive" onSelect={(e) => e.preventDefault()}>
            {copy.items.delete}
          </RootsDropdownItem>
        </RootsDropdownContent>
      </RootsDropdownMenu>
    </VariantCell>
  )
}

export function DropdownLiveGallery() {
  return (
    <div className="space-y-8">
      <OverlaySurfaceSpecTable
        title="Superficie panel · dropdown (producto)"
        description={DROPDOWN_UI_PANEL_SPEC.pairRule}
        rows={getDropdownUiPanelSpecRows("light")}
        pairNote="Sin scrim de viewport — panel anclado al trigger con gap space.100."
      />

      <VariantRow>
        <DropdownVariant label="Light · default" theme="light" density="default" panel="grouped" />
        <DropdownVariant
          label="Dark · default"
          theme="dark"
          density="default"
          panel="grouped"
          wrapDark
        />
      </VariantRow>

      <VariantRow>
        <DropdownVariant label="Light · compact" theme="light" density="compact" panel="compact-actions" />
        <DropdownVariant
          label="Dark · compact"
          theme="dark"
          density="compact"
          panel="compact-actions"
          wrapDark
        />
      </VariantRow>

      <VariantRow>
        <DropdownVariant label="Secciones · light" theme="light" panel="sections" />
        <DropdownVariant label="Secciones · dark" theme="dark" panel="sections" wrapDark />
      </VariantRow>

      <VariantRow>
        <DropdownVariant label="Trigger · default" trigger="button-default" />
        <DropdownVariant label="Trigger · subtle" trigger="button-subtle" />
        <DropdownVariant
          label="Trigger · icon"
          trigger="icon-button"
          panel="compact-actions"
          density="compact"
        />
      </VariantRow>

      <VariantRow>
        <ItemStatesMenu />
        <RowContextMenu />
      </VariantRow>
    </div>
  )
}
