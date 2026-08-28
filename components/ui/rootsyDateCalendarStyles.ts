import { cn } from "@/lib/utils"

/** Popover contenedor del calendario — paleta bruma/savia. */
export const rootsyDatePopoverContentClass =
  "rootsy-app-light border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-blanco)] p-0 text-[var(--rootsy-bruma-900)] shadow-xl shadow-[color-mix(in_srgb,var(--rootsy-bruma-900)_8%,transparent)]"

/** Isla del calendario dentro del popover. */
export const rootsyDateCalendarIslandClass = cn(
  "rounded-xl border border-[var(--rootsy-bruma-100)] bg-[var(--rootsy-white)] p-1.5 shadow-inner shadow-[color-mix(in_srgb,var(--rootsy-bruma-900)_5%,transparent)]",
)

/** Overrides de días y cabecera — portales fuera del theme workspace. */
export const rootsyDateCalendarDayOverridesClass = cn(
  "[&_[data-slot=calendar]]:w-full [&_[data-slot=calendar]]:max-w-none",
  "[&_.rdp-root]:!w-full [&_.rdp-root]:max-w-none",
  "[&_.rdp-month]:w-full min-w-0",
  "[&_.rdp-month_grid]:w-full [&_.rdp-month_grid]:table-fixed",
  "[&_button[data-day]]:!text-[var(--rootsy-bruma-700)]",
  "[&_button[data-day]>span]:!opacity-100 [&_button[data-day]>span]:!text-inherit",
  "[&_button[data-day]:not([data-range-start=true]):not([data-range-end=true]):not([data-selected-single=true]):not([data-range-middle=true]):hover]:!bg-[var(--rootsy-bruma-50)]",
  "[&_button[data-day]:not([data-range-start=true]):not([data-range-end=true]):not([data-selected-single=true]):not([data-range-middle=true]):hover]:!text-[var(--rootsy-bruma-900)]",
  "[&_button[data-day][data-selected-single=true]]:!bg-[var(--rootsy-savia-600)] [&_button[data-day][data-selected-single=true]]:!text-[var(--rootsy-savia-50)]",
  "[&_button[data-day][data-range-start=true]]:!bg-[var(--rootsy-savia-600)] [&_button[data-day][data-range-start=true]]:!text-[var(--rootsy-savia-50)]",
  "[&_button[data-day][data-range-end=true]]:!bg-[var(--rootsy-savia-600)] [&_button[data-day][data-range-end=true]]:!text-[var(--rootsy-savia-50)]",
  "[&_button[data-day][data-selected-single=true]:hover]:!bg-[var(--rootsy-savia-700)] [&_button[data-day][data-selected-single=true]:hover]:!text-[var(--rootsy-savia-50)]",
  "[&_button[data-day][data-range-start=true]:hover]:!bg-[var(--rootsy-savia-700)] [&_button[data-day][data-range-start=true]:hover]:!text-[var(--rootsy-savia-50)]",
  "[&_button[data-day][data-range-end=true]:hover]:!bg-[var(--rootsy-savia-700)] [&_button[data-day][data-range-end=true]:hover]:!text-[var(--rootsy-savia-50)]",
  "[&_button[data-day][data-range-middle=true]]:!bg-[var(--rootsy-savia-100)] [&_button[data-day][data-range-middle=true]]:!text-[var(--rootsy-bruma-700)]",
  "[&_button[data-day][data-range-middle=true]:hover]:!bg-[var(--rootsy-savia-200)] [&_button[data-day][data-range-middle=true]:hover]:!text-[var(--rootsy-bruma-900)]",
  "[&_.rdp-button_previous]:!text-[var(--rootsy-bruma-600)] [&_.rdp-button_next]:!text-[var(--rootsy-bruma-600)]",
  "[&_.rdp-button_previous:hover]:!text-[var(--rootsy-bruma-900)] [&_.rdp-button_next:hover]:!text-[var(--rootsy-bruma-900)]",
  "[&_.rdp-weekday]:!text-[var(--rootsy-bruma-500)]",
  "[&_.rdp-caption_label]:!text-[var(--rootsy-bruma-900)]",
  "[&_td.rdp-outside_button[data-day]]:!text-[var(--rootsy-bruma-400)]",
  "[&_.rdp-outside_button[data-day]]:!text-[var(--rootsy-bruma-400)]",
  "[&_td.rdp-disabled_button[data-day]]:!text-[var(--rootsy-bruma-300)]",
)

/** Calendario completo para paneles claros y filtros de período. */
export const rootsyDateCalendarPanelClass = cn(
  rootsyDateCalendarIslandClass,
  rootsyDateCalendarDayOverridesClass,
)

/** Shell compacto para RootsFormDateField. */
export const rootsyDateCalendarCompactShellClass = cn(
  "w-fit bg-transparent px-2.5 py-2 [--cell-size:2rem]",
  "[&_button[data-day]]:!text-[var(--rootsy-bruma-700)]",
  "[&_button[data-day]:not([data-selected-single=true]):hover]:!bg-[var(--rootsy-bruma-50)] [&_button[data-day]:not([data-selected-single=true]):hover]:!text-[var(--rootsy-bruma-900)]",
  "[&_button[data-day][data-selected-single=true]]:!bg-[var(--rootsy-savia-600)] [&_button[data-day][data-selected-single=true]]:!text-[var(--rootsy-savia-50)]",
  "[&_button[data-day][data-selected-single=true]:hover]:!bg-[var(--rootsy-savia-700)]",
  "[&_button[data-day][data-selected-single=true]:hover]:!text-[var(--rootsy-savia-50)]",
  "[&_.rdp-outside_button[data-day]]:!text-[var(--rootsy-bruma-400)]",
  "[&_.rdp-outside_button[data-day]:not([data-selected-single=true]):hover]:!bg-transparent [&_.rdp-outside_button[data-day]:not([data-selected-single=true]):hover]:!text-[var(--rootsy-bruma-400)]",
)

export const rootsyDateCalendarClassNames = {
  root: "w-fit",
  months: "relative flex flex-col",
  month: "flex w-fit flex-col gap-1.5",
  month_caption: "flex h-7 w-full items-center justify-center px-8",
  caption_label:
    "select-none text-xs font-medium text-[var(--rootsy-bruma-900)]",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous: cn(
    "inline-flex size-7 items-center justify-center rounded-md bg-transparent text-[var(--rootsy-bruma-600)] hover:bg-[var(--rootsy-bruma-50)] hover:text-[var(--rootsy-bruma-900)]",
  ),
  button_next: cn(
    "inline-flex size-7 items-center justify-center rounded-md bg-transparent text-[var(--rootsy-bruma-600)] hover:bg-[var(--rootsy-bruma-50)] hover:text-[var(--rootsy-bruma-900)]",
  ),
  weekdays: "flex",
  weekday: cn(
    "flex size-(--cell-size) items-center justify-center text-[0.6875rem] font-normal lowercase text-[var(--rootsy-bruma-500)]",
  ),
  week: "mt-0.5 flex w-full",
  day: "aspect-square size-(--cell-size) p-0 text-center",
  outside: "opacity-60 aria-selected:opacity-60",
  disabled: "text-[var(--rootsy-bruma-300)] opacity-50",
}
