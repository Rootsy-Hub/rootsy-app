export type MenuRootsyOperationalSignals = {
  dayOfWeek: string
  cashRegisterOpen: boolean | null
  openCashRegisterCount: number | null
  salesTodayCount: number | null
  lowStockCount: number | null
  outOfStockCount: number | null
}

export const MENU_ROOTSY_DAY_NAMES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
] as const

export function emptyMenuRootsyOperationalSignals(
  now: Date = new Date(),
): MenuRootsyOperationalSignals {
  return {
    dayOfWeek: MENU_ROOTSY_DAY_NAMES[now.getDay()] ?? "hoy",
    cashRegisterOpen: null,
    openCashRegisterCount: null,
    salesTodayCount: null,
    lowStockCount: null,
    outOfStockCount: null,
  }
}

export function menuRootsySignalsCacheFingerprint(
  signals: MenuRootsyOperationalSignals,
): string {
  const salesBucket =
    signals.salesTodayCount == null
      ? "na"
      : signals.salesTodayCount === 0
        ? "0"
        : signals.salesTodayCount <= 5
          ? "1-5"
          : signals.salesTodayCount <= 20
            ? "6-20"
            : "21+"

  const stockBucket =
    signals.lowStockCount == null && signals.outOfStockCount == null
      ? "na"
      : `${signals.lowStockCount ?? 0}:${signals.outOfStockCount ?? 0}`

  const cashBucket =
    signals.cashRegisterOpen == null
      ? "na"
      : signals.cashRegisterOpen
        ? "open"
        : "closed"

  return `${cashBucket}|${salesBucket}|${stockBucket}`
}
