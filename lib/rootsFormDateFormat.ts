import { format, parseISO } from "date-fns"
import { es as esLocale } from "date-fns/locale"

export function parseRootsFormIsoDate(iso: string): Date | undefined {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return undefined
  const date = parseISO(iso.slice(0, 10))
  return Number.isNaN(date.getTime()) ? undefined : date
}

/** Ej.: 3 de agosto de 2026 */
export function formatRootsFormDisplayDate(date: Date): string {
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: esLocale })
}

/** Ej.: 11 ago 2026 — para paneles angostos. */
export function formatRootsFormDisplayDateCompact(date: Date): string {
  return format(date, "d MMM yyyy", { locale: esLocale })
}
